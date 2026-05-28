import { describe, expect, it, vi } from "vitest";
import {
  parsePublishExportProviderExecutionRequest,
  parsePublishExportProviderExecutionResult,
  runFakeProviderExecutionEnvelope,
  type PublishExportArtifactFetcher,
  type FakeProviderCaller,
} from "@/lib/domain/publish-export-provider-execution";
import type { PublishExportCredentialResolver } from "@/lib/domain/publish-export-provider-preflight";

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

const credentialRef = {
  kind: "secret_ref" as const,
  ref: "publish-export/fake-provider/runtime",
  scope: "runtime" as const,
};

function deliveryPlan() {
  return {
    operationType: "publish" as const,
    idempotencyKey: "operation_01:fake-provider",
    artifacts: [publishVersionArtifact, pageSpecArtifact],
  };
}

function request() {
  return {
    provider: "fake-provider" as const,
    operationType: "publish" as const,
    idempotencyKey: "operation_01:fake-provider",
    credentialRef,
    deliveryPlan: deliveryPlan(),
  };
}

function fetchArtifacts(): PublishExportArtifactFetcher {
  return vi.fn().mockResolvedValue([publishVersionArtifact, pageSpecArtifact]);
}

function resolveCredential(): PublishExportCredentialResolver {
  return vi.fn().mockResolvedValue({
    credentialRef,
    value: "provider-token-should-never-persist",
  });
}

describe("publish/export provider execution envelope", () => {
  it("runs fake provider through explicit stages without persisting payloads or secrets", async () => {
    const result = await runFakeProviderExecutionEnvelope({
      request: request(),
      fetchArtifacts: fetchArtifacts(),
      resolveCredential: resolveCredential(),
    });

    expect(result).toMatchObject({
      provider: "fake-provider",
      operationType: "publish",
      ok: true,
      externalRuntimeImplemented: false,
      idempotencyKey: "operation_01:fake-provider",
      providerOperationId: "fake-provider:publish:operation_01:fake-provider",
      credentialRef,
      artifacts: [publishVersionArtifact, pageSpecArtifact],
      retry: {
        classification: "not_retryable",
        retryable: false,
      },
      stages: [
        { stage: "artifact_fetch", ok: true },
        { stage: "credential_resolve", ok: true },
        { stage: "provider_call", ok: true },
        { stage: "result_normalize", ok: true },
      ],
    });
    expect(JSON.stringify(result)).not.toContain("provider-token");
    expect(JSON.stringify(result)).not.toContain("<main>");
  });

  it("validates request delivery binding before execution stages", () => {
    expect(() =>
      parsePublishExportProviderExecutionRequest({
        ...request(),
        idempotencyKey: "operation_02:fake-provider",
      }),
    ).toThrow();
    expect(() =>
      parsePublishExportProviderExecutionRequest({
        ...request(),
        deliveryPlan: {
          ...deliveryPlan(),
          operationType: "export",
        },
      }),
    ).toThrow();
    expect(() =>
      parsePublishExportProviderExecutionRequest({
        ...request(),
        deliveryPlan: {
          ...deliveryPlan(),
          artifacts: [
            {
              ...pageSpecArtifact,
              payload: "<main>large payload</main>",
            },
          ],
        },
      }),
    ).toThrow();
  });

  it("stops before credential resolution when artifact fetch fails", async () => {
    const resolve = resolveCredential();
    const callProvider = vi.fn();
    const result = await runFakeProviderExecutionEnvelope({
      request: request(),
      fetchArtifacts: vi.fn().mockRejectedValue(new Error("artifact payload leaked")),
      resolveCredential: resolve,
      callProvider,
    });

    expect(result).toMatchObject({
      ok: false,
      failedStage: "artifact_fetch",
      errorCode: "artifact_fetch_failed",
      retry: {
        classification: "not_retryable",
        retryable: false,
      },
      diagnostics: {
        errorName: "Error",
      },
      stages: [{ stage: "artifact_fetch", ok: false }],
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(callProvider).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("artifact payload leaked");
  });

  it("sanitizes credential resolver failures and does not call provider", async () => {
    const callProvider = vi.fn();
    const result = await runFakeProviderExecutionEnvelope({
      request: request(),
      fetchArtifacts: fetchArtifacts(),
      resolveCredential: vi
        .fn()
        .mockRejectedValue(new Error("token=provider-token")),
      callProvider,
    });

    expect(result).toMatchObject({
      ok: false,
      failedStage: "credential_resolve",
      errorCode: "credential_resolve_failed",
      retry: {
        classification: "not_retryable",
        retryable: false,
      },
      stages: [
        { stage: "artifact_fetch", ok: true },
        { stage: "credential_resolve", ok: false },
      ],
    });
    expect(callProvider).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("provider-token");
  });

  it("classifies provider call failures as retryable with the same idempotency key", async () => {
    const result = await runFakeProviderExecutionEnvelope({
      request: request(),
      fetchArtifacts: fetchArtifacts(),
      resolveCredential: resolveCredential(),
      callProvider: vi
        .fn()
        .mockRejectedValue(new TypeError("provider secret=abc123")),
    });

    expect(result).toMatchObject({
      ok: false,
      failedStage: "provider_call",
      errorCode: "provider_call_failed",
      idempotencyKey: "operation_01:fake-provider",
      retry: {
        classification: "retryable_same_idempotency_key",
        retryable: true,
      },
      diagnostics: {
        errorName: "TypeError",
      },
    });
    expect(JSON.stringify(result)).not.toContain("secret=abc123");
  });

  it("rejects invalid provider responses during result normalization", async () => {
    const callProvider: FakeProviderCaller = vi.fn().mockResolvedValue({
      provider: "fake-provider",
      operationType: "publish",
      ok: true,
      externalRuntimeImplemented: false,
      idempotencyKey: "operation_01:fake-provider",
      providerOperationId: "fake-provider:publish:operation_01:fake-provider",
      credentialRef,
      artifacts: [publishVersionArtifact, pageSpecArtifact],
      retry: {
        policy: "same_operation_idempotency_key",
        retryable: false,
      },
      token: "provider-token-should-never-persist",
    });

    const result = await runFakeProviderExecutionEnvelope({
      request: request(),
      fetchArtifacts: fetchArtifacts(),
      resolveCredential: resolveCredential(),
      callProvider,
    });

    expect(result).toMatchObject({
      ok: false,
      failedStage: "result_normalize",
      errorCode: "provider_result_invalid",
      retry: {
        classification: "not_retryable",
        retryable: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain("provider-token");
  });

  it("keeps persisted result schema strict", () => {
    expect(() =>
      parsePublishExportProviderExecutionResult({
        provider: "fake-provider",
        operationType: "publish",
        ok: true,
        externalRuntimeImplemented: false,
        idempotencyKey: "operation_01:fake-provider",
        providerOperationId: "fake-provider:publish:operation_01:fake-provider",
        credentialRef,
        artifacts: [publishVersionArtifact, pageSpecArtifact],
        retry: {
          classification: "not_retryable",
          retryable: false,
        },
        stages: [
          { stage: "artifact_fetch", ok: true },
          { stage: "credential_resolve", ok: true },
          { stage: "provider_call", ok: true },
          { stage: "result_normalize", ok: true },
        ],
        payload: "<main>large payload</main>",
      }),
    ).toThrow();
  });
});
