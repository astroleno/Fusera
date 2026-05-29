import {
  dryRunAdapterForOperationType,
  parsePublishExportAdapterResult,
  publishExportCredentialRefSchema,
  type PublishExportAdapter,
  type PublishExportAdapterExecution,
} from "@/lib/domain/publish-export-adapter";
import {
  parsePublishExportArtifactDeliveryPlan,
  publishExportArtifactDeliveryRefSchema,
  publishExportResolvedCredentialSchema,
  type PublishExportArtifactDeliveryPlan,
  type PublishExportArtifactDeliveryRef,
  type PublishExportCredentialResolver,
  type PublishExportResolvedCredential,
} from "@/lib/domain/publish-export-provider-preflight";
import {
  runFakeProviderExecutionEnvelope,
  type FakeProviderCaller,
  type PublishExportArtifactFetcher,
  type PublishExportProviderExecutionResult,
} from "@/lib/domain/publish-export-provider-execution";
import type { PublishExportOperationType } from "@/lib/domain/publish-control-plane";
import {
  runPublishExportAdapter,
  type PublishExportAdapterRunResult,
} from "./run-publish-export-adapter";
import type { transitionPublishExportOperation } from "./transition-publish-export-operation";
import { z } from "zod";

export type DryRunProviderExecutionAdapterOptions = {
  projectId: string;
  operationId: string;
  operationType: PublishExportOperationType;
  deliveryPlan: unknown;
  fetchArtifacts: PublishExportArtifactFetcher;
  resolveCredential?: PublishExportCredentialResolver;
  callProvider?: FakeProviderCaller;
  transitionOperation?: typeof transitionPublishExportOperation;
};

const DRY_RUN_PROVIDER_FAILURE_MESSAGE =
  "Dry-run provider execution failed before external completion.";

export async function runDryRunProviderExecutionAdapter(
  options: DryRunProviderExecutionAdapterOptions,
): Promise<PublishExportAdapterRunResult> {
  const adapter = dryRunProviderExecutionAdapterForOperationType({
    operationType: options.operationType,
    deliveryPlan: options.deliveryPlan,
    fetchArtifacts: options.fetchArtifacts,
    resolveCredential:
      options.resolveCredential ?? createFixtureDryRunCredentialResolver(),
    callProvider: options.callProvider,
  });

  return runPublishExportAdapter({
    projectId: options.projectId,
    operationId: options.operationId,
    adapter,
    transitionOperation: options.transitionOperation,
  });
}

export function createStaticArtifactDeliveryFetcher(
  artifacts: Array<PublishExportArtifactDeliveryRef>,
): PublishExportArtifactFetcher {
  const refs = z.array(publishExportArtifactDeliveryRefSchema).parse(artifacts);

  return async () => refs;
}

export function createFixtureDryRunCredentialResolver(
  value = "dry-run-runtime-secret",
): PublishExportCredentialResolver {
  return async ({ credentialRef }) =>
    publishExportResolvedCredentialSchema.parse({
      credentialRef,
      value,
    });
}

function dryRunProviderExecutionAdapterForOperationType(options: {
  operationType: PublishExportOperationType;
  deliveryPlan: unknown;
  fetchArtifacts: PublishExportArtifactFetcher;
  resolveCredential: PublishExportCredentialResolver;
  callProvider?: FakeProviderCaller;
}): PublishExportAdapter {
  const adapter = dryRunAdapterForOperationType(options.operationType);

  return {
    ...adapter,
    async execute(context, target): Promise<PublishExportAdapterExecution> {
      const deliveryPlan = parsePublishExportArtifactDeliveryPlan(
        options.deliveryPlan,
      );
      const credentialRef = publishExportCredentialRefSchema.parse(
        target.providerConfig?.credentialRef,
      );
      const idempotencyKey = z.string().min(1).parse(target.idempotencyKey);
      const providerResult = await runFakeProviderExecutionEnvelope({
        request: {
          provider: "fake-provider",
          operationType: context.operationType,
          idempotencyKey,
          credentialRef,
          deliveryPlan,
        },
        fetchArtifacts: options.fetchArtifacts,
        resolveCredential: options.resolveCredential,
        callProvider: options.callProvider,
      });

      if (providerResult.ok) {
        return {
          ok: true,
          details: {
            providerExecution: providerExecutionSummary(providerResult),
          },
        };
      }

      return {
        ok: false,
        errorCode: providerResult.errorCode,
        message: DRY_RUN_PROVIDER_FAILURE_MESSAGE,
        details: {
          providerExecution: providerExecutionSummary(providerResult),
        },
      };
    },
    normalizeResult(execution) {
      const result = adapter.normalizeResult(execution);

      return parsePublishExportAdapterResult({
        ...result,
        details: {
          dryRun: true,
          externalRuntime: "not_implemented",
          providerExecution: execution.details?.providerExecution,
        },
      });
    },
  };
}

function providerExecutionSummary(
  result: PublishExportProviderExecutionResult,
): Record<string, unknown> {
  const base = {
    provider: result.provider,
    operationType: result.operationType,
    ok: result.ok,
    externalRuntimeImplemented: result.externalRuntimeImplemented,
    idempotencyKey: result.idempotencyKey,
    retry: result.retry,
    stages: result.stages,
  };

  if (result.ok) {
    return {
      ...base,
      providerOperationId: result.providerOperationId,
      credentialRef: result.credentialRef,
      artifacts: result.artifacts,
    };
  }

  return {
    ...base,
    failedStage: result.failedStage,
    errorCode: result.errorCode,
    diagnostics: result.diagnostics,
  };
}
