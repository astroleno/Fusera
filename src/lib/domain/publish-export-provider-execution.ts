import {
  parsePublishExportArtifactDeliveryPlan,
  publishExportArtifactDeliveryRefSchema,
  publishExportArtifactDeliveryPlanSchema,
  publishExportProviderPreflightResultSchema,
  publishExportResolvedCredentialSchema,
  type PublishExportArtifactDeliveryPlan,
  type PublishExportArtifactDeliveryRef,
  type PublishExportCredentialResolver,
  type PublishExportResolvedCredential,
} from "./publish-export-provider-preflight";
import {
  publishExportCredentialRefSchema,
  publishExportOperationTypeSchema,
} from "./publish-export-adapter";
import { z } from "zod";

export const publishExportProviderExecutionStageSchema = z.enum([
  "artifact_fetch",
  "credential_resolve",
  "provider_call",
  "result_normalize",
]);

export const publishExportProviderExecutionErrorCodeSchema = z.enum([
  "artifact_fetch_failed",
  "credential_resolve_failed",
  "provider_call_failed",
  "provider_result_invalid",
]);

export const publishExportProviderRetryClassificationSchema = z.enum([
  "not_retryable",
  "retryable_same_idempotency_key",
]);

export const publishExportProviderExecutionRequestSchema = z
  .strictObject({
    provider: z.literal("fake-provider"),
    operationType: publishExportOperationTypeSchema,
    idempotencyKey: z.string().min(1),
    credentialRef: publishExportCredentialRefSchema,
    deliveryPlan: z.unknown(),
  })
  .superRefine((request, context) => {
    const deliveryPlanResult = publishExportArtifactDeliveryPlanSchema.safeParse(
      request.deliveryPlan,
    );
    if (!deliveryPlanResult.success) {
      addSchemaIssue(
        context,
        ["deliveryPlan"],
        "deliveryPlan must match artifact delivery schema",
      );
      return;
    }

    const deliveryPlan = deliveryPlanResult.data;
    if (deliveryPlan.operationType !== request.operationType) {
      addSchemaIssue(
        context,
        ["deliveryPlan", "operationType"],
        "deliveryPlan operationType must match request operationType",
      );
    }

    if (deliveryPlan.idempotencyKey !== request.idempotencyKey) {
      addSchemaIssue(
        context,
        ["deliveryPlan", "idempotencyKey"],
        "deliveryPlan idempotencyKey must match request idempotencyKey",
      );
    }
  });

export const publishExportProviderExecutionSuccessSchema = z.strictObject({
  provider: z.literal("fake-provider"),
  operationType: publishExportOperationTypeSchema,
  ok: z.literal(true),
  externalRuntimeImplemented: z.literal(false),
  idempotencyKey: z.string().min(1),
  providerOperationId: z.string().min(1),
  credentialRef: publishExportCredentialRefSchema,
  artifacts: z.array(publishExportArtifactDeliveryRefSchema).min(1),
  retry: z.strictObject({
    classification: z.literal("not_retryable"),
    retryable: z.literal(false),
  }),
  stages: z
    .array(
      z.strictObject({
        stage: publishExportProviderExecutionStageSchema,
        ok: z.literal(true),
      }),
    )
    .min(4),
});

export const publishExportProviderExecutionFailureSchema = z.strictObject({
  provider: z.literal("fake-provider"),
  operationType: publishExportOperationTypeSchema,
  ok: z.literal(false),
  externalRuntimeImplemented: z.literal(false),
  idempotencyKey: z.string().min(1),
  failedStage: publishExportProviderExecutionStageSchema,
  errorCode: publishExportProviderExecutionErrorCodeSchema,
  message: z.string().min(1),
  diagnostics: z.strictObject({
    errorName: z.string().min(1).optional(),
  }),
  retry: z.strictObject({
    classification: publishExportProviderRetryClassificationSchema,
    retryable: z.boolean(),
  }),
  stages: z
    .array(
      z.strictObject({
        stage: publishExportProviderExecutionStageSchema,
        ok: z.boolean(),
      }),
    )
    .min(1),
});

export const publishExportProviderExecutionResultSchema = z.union([
  publishExportProviderExecutionSuccessSchema,
  publishExportProviderExecutionFailureSchema,
]);

export type PublishExportProviderExecutionStage = z.infer<
  typeof publishExportProviderExecutionStageSchema
>;
export type PublishExportProviderExecutionRequest = z.infer<
  typeof publishExportProviderExecutionRequestSchema
>;
export type PublishExportProviderExecutionResult = z.infer<
  typeof publishExportProviderExecutionResultSchema
>;

export type PublishExportArtifactFetcher = (options: {
  deliveryPlan: PublishExportArtifactDeliveryPlan;
}) => Promise<Array<PublishExportArtifactDeliveryRef>>;

export type FakeProviderCaller = (options: {
  operationType: PublishExportProviderExecutionRequest["operationType"];
  idempotencyKey: string;
  artifacts: Array<PublishExportArtifactDeliveryRef>;
  credential: PublishExportResolvedCredential;
}) => Promise<unknown>;

const PROVIDER_EXECUTION_ERROR_MESSAGE =
  "Publish/export provider execution failed before external completion.";

export async function runFakeProviderExecutionEnvelope(options: {
  request: unknown;
  fetchArtifacts: PublishExportArtifactFetcher;
  resolveCredential: PublishExportCredentialResolver;
  callProvider?: FakeProviderCaller;
}): Promise<PublishExportProviderExecutionResult> {
  const request = publishExportProviderExecutionRequestSchema.parse(
    options.request,
  );
  const deliveryPlan = parsePublishExportArtifactDeliveryPlan(
    request.deliveryPlan,
  );
  const stages: Array<{
    stage: PublishExportProviderExecutionStage;
    ok: boolean;
  }> = [];
  let artifacts: Array<PublishExportArtifactDeliveryRef>;
  let credential: PublishExportResolvedCredential;
  let rawProviderResult: unknown;

  try {
    artifacts = z
      .array(publishExportArtifactDeliveryRefSchema)
      .parse(await options.fetchArtifacts({ deliveryPlan }));
    stages.push({ stage: "artifact_fetch", ok: true });
  } catch (error) {
    stages.push({ stage: "artifact_fetch", ok: false });
    return providerExecutionFailure({
      request,
      failedStage: "artifact_fetch",
      errorCode: "artifact_fetch_failed",
      error,
      retryable: false,
      stages,
    });
  }

  try {
    credential = publishExportResolvedCredentialSchema.parse(
      await options.resolveCredential({
        operationType: request.operationType,
        credentialRef: request.credentialRef,
      }),
    );
    stages.push({ stage: "credential_resolve", ok: true });
  } catch (error) {
    stages.push({ stage: "credential_resolve", ok: false });
    return providerExecutionFailure({
      request,
      failedStage: "credential_resolve",
      errorCode: "credential_resolve_failed",
      error,
      retryable: false,
      stages,
    });
  }

  try {
    rawProviderResult = await (options.callProvider ?? fakeProviderCall)({
      operationType: request.operationType,
      idempotencyKey: request.idempotencyKey,
      artifacts,
      credential,
    });
    stages.push({ stage: "provider_call", ok: true });
  } catch (error) {
    stages.push({ stage: "provider_call", ok: false });
    return providerExecutionFailure({
      request,
      failedStage: "provider_call",
      errorCode: "provider_call_failed",
      error,
      retryable: true,
      stages,
    });
  }

  try {
    const normalized = publishExportProviderPreflightResultSchema.parse(
      rawProviderResult,
    );
    const result = parsePublishExportProviderExecutionResult({
      provider: "fake-provider",
      operationType: request.operationType,
      ok: true,
      externalRuntimeImplemented: false,
      idempotencyKey: request.idempotencyKey,
      providerOperationId: normalized.providerOperationId,
      credentialRef: request.credentialRef,
      artifacts,
      retry: {
        classification: "not_retryable",
        retryable: false,
      },
      stages: [...stages, { stage: "result_normalize", ok: true }],
    });
    return result;
  } catch (error) {
    return providerExecutionFailure({
      request,
      failedStage: "result_normalize",
      errorCode: "provider_result_invalid",
      error,
      retryable: false,
      stages: [...stages, { stage: "result_normalize", ok: false }],
    });
  }
}

export function parsePublishExportProviderExecutionRequest(
  value: unknown,
): PublishExportProviderExecutionRequest {
  return publishExportProviderExecutionRequestSchema.parse(value);
}

export function parsePublishExportProviderExecutionResult(
  value: unknown,
): PublishExportProviderExecutionResult {
  return publishExportProviderExecutionResultSchema.parse(value);
}

async function fakeProviderCall(options: {
  operationType: PublishExportProviderExecutionRequest["operationType"];
  idempotencyKey: string;
  artifacts: Array<PublishExportArtifactDeliveryRef>;
  credential: PublishExportResolvedCredential;
}) {
  return publishExportProviderPreflightResultSchema.parse({
    provider: "fake-provider",
    operationType: options.operationType,
    ok: true,
    externalRuntimeImplemented: false,
    idempotencyKey: options.idempotencyKey,
    providerOperationId: `fake-provider:${options.operationType}:${options.idempotencyKey}`,
    credentialRef: options.credential.credentialRef,
    artifacts: options.artifacts,
    retry: {
      policy: "same_operation_idempotency_key",
      retryable: false,
    },
  });
}

function providerExecutionFailure(options: {
  request: PublishExportProviderExecutionRequest;
  failedStage: PublishExportProviderExecutionStage;
  errorCode: z.infer<typeof publishExportProviderExecutionErrorCodeSchema>;
  error: unknown;
  retryable: boolean;
  stages: Array<{
    stage: PublishExportProviderExecutionStage;
    ok: boolean;
  }>;
}): PublishExportProviderExecutionResult {
  return parsePublishExportProviderExecutionResult({
    provider: "fake-provider",
    operationType: options.request.operationType,
    ok: false,
    externalRuntimeImplemented: false,
    idempotencyKey: options.request.idempotencyKey,
    failedStage: options.failedStage,
    errorCode: options.errorCode,
    message: PROVIDER_EXECUTION_ERROR_MESSAGE,
    diagnostics: sanitizedDiagnostics(options.error),
    retry: {
      classification: options.retryable
        ? "retryable_same_idempotency_key"
        : "not_retryable",
      retryable: options.retryable,
    },
    stages: options.stages,
  });
}

function sanitizedDiagnostics(error: unknown): { errorName?: string } {
  if (error instanceof Error) {
    return { errorName: error.name };
  }

  return {};
}

function addSchemaIssue(
  context: z.RefinementCtx,
  path: Array<string | number>,
  message: string,
) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    message,
    path,
  });
}
