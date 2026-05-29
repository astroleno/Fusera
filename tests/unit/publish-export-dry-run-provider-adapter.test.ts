import { describe, expect, it, vi } from "vitest";
import {
  createFixtureDryRunCredentialResolver,
  createStaticArtifactDeliveryFetcher,
  runDryRunProviderExecutionAdapter,
} from "@/lib/projects/run-dry-run-publish-export-adapter";
import type { PublishExportOperationTransitionInspection } from "@/lib/projects/transition-publish-export-operation";

const pageSpecArtifact = {
  kind: "page_spec" as const,
  ref: "page-spec_01",
  checksumSha256:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  mimeType: "application/json",
  sizeBytes: 2048,
};

const publishVersionArtifact = {
  kind: "publish_version" as const,
  ref: "publish-version_01",
  checksumSha256:
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  mimeType: "application/json",
  sizeBytes: 1024,
};

function deliveryPlan() {
  return {
    operationType: "publish" as const,
    idempotencyKey: "operation_01:dry-run-publish",
    artifacts: [publishVersionArtifact, pageSpecArtifact],
  };
}

function operation(
  status: PublishExportOperationTransitionInspection["status"],
  overrides: Partial<PublishExportOperationTransitionInspection> = {},
): PublishExportOperationTransitionInspection {
  return {
    id: "operation_01",
    operationType: "publish",
    status,
    externalTarget: null,
    externalResult: null,
    diagnostics: [],
    ...overrides,
  };
}

describe("dry-run provider execution adapter runner", () => {
  it("runs dry-run publish through the adapter state machine with provider envelope details", async () => {
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_succeeded"),
      });

    const result = await runDryRunProviderExecutionAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      operationType: "publish",
      deliveryPlan: deliveryPlan(),
      fetchArtifacts: createStaticArtifactDeliveryFetcher([
        publishVersionArtifact,
        pageSpecArtifact,
      ]),
      resolveCredential: createFixtureDryRunCredentialResolver(
        "fixture-token-should-not-persist",
      ),
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      adapterResult: {
        adapter: "dry-run-publish",
        operationType: "publish",
        mode: "dry-run",
        ok: true,
        externalRuntimeImplemented: false,
        details: {
          dryRun: true,
          externalRuntime: "not_implemented",
          providerExecution: {
            provider: "fake-provider",
            ok: true,
            externalRuntimeImplemented: false,
            idempotencyKey: "operation_01:dry-run-publish",
            providerOperationId:
              "fake-provider:publish:operation_01:dry-run-publish",
            credentialRef: {
              kind: "secret_ref",
              ref: "publish-export/publish/dry-run",
              scope: "runtime",
            },
            artifacts: [publishVersionArtifact, pageSpecArtifact],
          },
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(1, {
      projectId: "project_01",
      operationId: "operation_01",
      request: {
        operationType: "publish",
        status: "external_pending",
        externalTarget: {
          adapter: "dry-run-publish",
          operationType: "publish",
          mode: "dry-run",
          externalRuntimeImplemented: false,
          dryRun: true,
          providerConfig: {
            provider: "dry-run",
            credentialRef: {
              kind: "secret_ref",
              ref: "publish-export/publish/dry-run",
              scope: "runtime",
            },
          },
          idempotencyKey: "operation_01:dry-run-publish",
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          status: "external_succeeded",
          externalResult: expect.objectContaining({
            adapter: "dry-run-publish",
            ok: true,
          }),
        }),
      }),
    );
    expect(JSON.stringify(result)).not.toContain("fixture-token");
  });

  it("records artifact delivery mismatches as external_failed", async () => {
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed"),
      });

    const result = await runDryRunProviderExecutionAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      operationType: "publish",
      deliveryPlan: deliveryPlan(),
      fetchArtifacts: createStaticArtifactDeliveryFetcher([pageSpecArtifact]),
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      adapterResult: {
        ok: false,
        errorCode: "artifact_fetch_failed",
        details: {
          providerExecution: {
            failedStage: "artifact_fetch",
            errorCode: "artifact_fetch_failed",
          },
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          status: "external_failed",
        }),
      }),
    );
  });

  it("records credential resolution failures as external_failed without persisting secrets", async () => {
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed"),
      });

    const result = await runDryRunProviderExecutionAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      operationType: "publish",
      deliveryPlan: deliveryPlan(),
      fetchArtifacts: createStaticArtifactDeliveryFetcher([
        publishVersionArtifact,
        pageSpecArtifact,
      ]),
      resolveCredential: vi
        .fn()
        .mockRejectedValue(new Error("token=fixture-token")),
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      adapterResult: {
        ok: false,
        errorCode: "credential_resolve_failed",
        details: {
          providerExecution: {
            failedStage: "credential_resolve",
            errorCode: "credential_resolve_failed",
          },
        },
      },
    });
    expect(JSON.stringify(result)).not.toContain("fixture-token");
  });

  it("records provider call failures as external_failed with retry metadata", async () => {
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed"),
      });

    const result = await runDryRunProviderExecutionAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      operationType: "publish",
      deliveryPlan: deliveryPlan(),
      fetchArtifacts: createStaticArtifactDeliveryFetcher([
        publishVersionArtifact,
        pageSpecArtifact,
      ]),
      callProvider: vi
        .fn()
        .mockRejectedValue(new Error("provider secret=fixture-token")),
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      adapterResult: {
        ok: false,
        errorCode: "provider_call_failed",
        details: {
          providerExecution: {
            failedStage: "provider_call",
            errorCode: "provider_call_failed",
            retry: {
              classification: "retryable_same_idempotency_key",
              retryable: true,
            },
          },
        },
      },
    });
    expect(JSON.stringify(result)).not.toContain("fixture-token");
  });
});
