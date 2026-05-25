import type { PublishExportOperationType } from "./publish-control-plane";
import {
  publishExportCredentialRefSchema,
  publishExportOperationTypeSchema,
  type PublishExportCredentialRef,
} from "./publish-export-adapter";
import { z } from "zod";

export const publishExportArtifactDeliveryKindSchema = z.enum([
  "publish_version",
  "page_spec",
  "artifact",
]);

export const publishExportArtifactDeliveryRefSchema = z
  .strictObject({
    kind: publishExportArtifactDeliveryKindSchema,
    ref: z.string().min(1),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().nonnegative(),
  });

export const publishExportArtifactDeliveryPlanSchema = z
  .strictObject({
    operationType: publishExportOperationTypeSchema,
    idempotencyKey: z.string().min(1),
    artifacts: z.array(publishExportArtifactDeliveryRefSchema).min(1),
  })
  .superRefine((plan, context) => {
    const artifactKinds = new Set(
      plan.artifacts.map((artifact) => artifact.kind),
    );
    if (plan.operationType === "publish") {
      if (!artifactKinds.has("publish_version")) {
        addSchemaIssue(
          context,
          ["artifacts"],
          "publish delivery requires a PublishVersion ref",
        );
      }

      if (!artifactKinds.has("page_spec")) {
        addSchemaIssue(
          context,
          ["artifacts"],
          "publish delivery requires a PageSpec ref",
        );
      }
    }

    if (plan.operationType === "export" && !artifactKinds.has("page_spec")) {
      addSchemaIssue(
        context,
        ["artifacts"],
        "export delivery requires a PageSpec ref",
      );
    }
  });

export const publishExportResolvedCredentialSchema = z
  .strictObject({
    credentialRef: publishExportCredentialRefSchema,
    value: z.string().min(1),
  });

export const publishExportProviderPreflightResultSchema = z
  .strictObject({
    provider: z.literal("fake-provider"),
    operationType: publishExportOperationTypeSchema,
    ok: z.boolean(),
    externalRuntimeImplemented: z.literal(false),
    idempotencyKey: z.string().min(1),
    providerOperationId: z.string().min(1),
    credentialRef: publishExportCredentialRefSchema,
    artifacts: z.array(publishExportArtifactDeliveryRefSchema).min(1),
    retry: z.strictObject({
      policy: z.literal("same_operation_idempotency_key"),
      retryable: z.boolean(),
    }),
  });

export type PublishExportArtifactDeliveryRef = z.infer<
  typeof publishExportArtifactDeliveryRefSchema
>;
export type PublishExportArtifactDeliveryPlan = z.infer<
  typeof publishExportArtifactDeliveryPlanSchema
>;
export type PublishExportResolvedCredential = z.infer<
  typeof publishExportResolvedCredentialSchema
>;
export type PublishExportProviderPreflightResult = z.infer<
  typeof publishExportProviderPreflightResultSchema
>;

export type PublishExportCredentialResolver = (options: {
  operationType: PublishExportOperationType;
  credentialRef: PublishExportCredentialRef;
}) => Promise<PublishExportResolvedCredential>;

export async function runFakeProviderPreflight(options: {
  operationType: PublishExportOperationType;
  credentialRef: PublishExportCredentialRef;
  deliveryPlan: PublishExportArtifactDeliveryPlan;
  resolveCredential: PublishExportCredentialResolver;
}): Promise<PublishExportProviderPreflightResult> {
  const deliveryPlan = parsePublishExportArtifactDeliveryPlan(
    options.deliveryPlan,
  );
  if (deliveryPlan.operationType !== options.operationType) {
    throw new Error(
      "Delivery plan operationType must match preflight operationType.",
    );
  }

  const credential = publishExportResolvedCredentialSchema.parse(
    await options.resolveCredential({
      operationType: options.operationType,
      credentialRef: options.credentialRef,
    }),
  );
  if (!sameCredentialRef(credential.credentialRef, options.credentialRef)) {
    throw new Error("Resolved credential must match requested credentialRef.");
  }

  return parsePublishExportProviderPreflightResult({
    provider: "fake-provider",
    operationType: options.operationType,
    ok: true,
    externalRuntimeImplemented: false,
    idempotencyKey: deliveryPlan.idempotencyKey,
    providerOperationId: `fake-provider:${options.operationType}:${deliveryPlan.idempotencyKey}`,
    credentialRef: options.credentialRef,
    artifacts: deliveryPlan.artifacts,
    retry: {
      policy: "same_operation_idempotency_key",
      retryable: false,
    },
  });
}

export function parsePublishExportArtifactDeliveryPlan(
  value: unknown,
): PublishExportArtifactDeliveryPlan {
  return publishExportArtifactDeliveryPlanSchema.parse(value);
}

export function parsePublishExportProviderPreflightResult(
  value: unknown,
): PublishExportProviderPreflightResult {
  return publishExportProviderPreflightResultSchema.parse(value);
}

function sameCredentialRef(
  left: PublishExportCredentialRef,
  right: PublishExportCredentialRef,
): boolean {
  return (
    left.kind === right.kind &&
    left.ref === right.ref &&
    left.scope === right.scope
  );
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
