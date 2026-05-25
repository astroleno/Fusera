import { describe, expect, it, vi } from "vitest";
import {
  parsePublishExportArtifactDeliveryPlan,
  parsePublishExportProviderPreflightResult,
  runFakeProviderPreflight,
  type PublishExportArtifactDeliveryPlan,
} from "@/lib/domain/publish-export-provider-preflight";

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

function publishDeliveryPlan(
  overrides: Partial<PublishExportArtifactDeliveryPlan> = {},
): PublishExportArtifactDeliveryPlan {
  return {
    operationType: "publish",
    idempotencyKey: "operation_01:fake-provider",
    artifacts: [publishVersionArtifact, pageSpecArtifact],
    ...overrides,
  };
}

describe("publish/export provider preflight contract", () => {
  it("defines artifact delivery refs without embedding artifact payloads", () => {
    expect(parsePublishExportArtifactDeliveryPlan(publishDeliveryPlan())).toEqual(
      publishDeliveryPlan(),
    );
    expect(() =>
      parsePublishExportArtifactDeliveryPlan({
        ...publishDeliveryPlan(),
        artifacts: [
          {
            ...pageSpecArtifact,
            payload: {
              html: "<main>large payload</main>",
            },
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      parsePublishExportArtifactDeliveryPlan({
        ...publishDeliveryPlan(),
        artifacts: [
          {
            ...pageSpecArtifact,
            checksumSha256: "not-a-sha",
          },
        ],
      }),
    ).toThrow();
  });

  it("requires explicit delivery inputs for publish and export operations", () => {
    expect(() =>
      parsePublishExportArtifactDeliveryPlan({
        operationType: "publish",
        idempotencyKey: "operation_01:fake-provider",
        artifacts: [pageSpecArtifact],
      }),
    ).toThrow();
    expect(() =>
      parsePublishExportArtifactDeliveryPlan({
        operationType: "export",
        idempotencyKey: "operation_01:fake-provider",
        artifacts: [publishVersionArtifact],
      }),
    ).toThrow();
    expect(
      parsePublishExportArtifactDeliveryPlan({
        operationType: "export",
        idempotencyKey: "operation_01:fake-provider",
        artifacts: [pageSpecArtifact],
      }),
    ).toMatchObject({
      operationType: "export",
      artifacts: [pageSpecArtifact],
    });
  });

  it("uses resolved credentials only at runtime and keeps secrets out of results", async () => {
    const resolveCredential = vi.fn().mockResolvedValue({
      credentialRef,
      value: "provider-token-should-never-persist",
    });

    const result = await runFakeProviderPreflight({
      operationType: "publish",
      credentialRef,
      deliveryPlan: publishDeliveryPlan(),
      resolveCredential,
    });

    expect(resolveCredential).toHaveBeenCalledWith({
      operationType: "publish",
      credentialRef,
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
        policy: "same_operation_idempotency_key",
        retryable: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain("provider-token");
  });

  it("parses credential refs before calling the credential resolver", async () => {
    const resolveCredential = vi.fn();

    await expect(
      runFakeProviderPreflight({
        operationType: "publish",
        credentialRef: {
          kind: "plaintext",
          ref: "provider-token-should-never-cross-boundary",
          scope: "runtime",
        },
        deliveryPlan: publishDeliveryPlan(),
        resolveCredential,
      }),
    ).rejects.toThrow();
    expect(resolveCredential).not.toHaveBeenCalled();
  });

  it("returns deterministic fake provider results for the same idempotency key", async () => {
    const resolveCredential = vi.fn().mockResolvedValue({
      credentialRef,
      value: "provider-token-should-never-persist",
    });
    const first = await runFakeProviderPreflight({
      operationType: "publish",
      credentialRef,
      deliveryPlan: publishDeliveryPlan(),
      resolveCredential,
    });
    const second = await runFakeProviderPreflight({
      operationType: "publish",
      credentialRef,
      deliveryPlan: publishDeliveryPlan(),
      resolveCredential,
    });

    expect(second).toEqual(first);
  });

  it("validates preflight results and rejects secret-shaped persisted fields", () => {
    expect(() =>
      parsePublishExportProviderPreflightResult({
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
      }),
    ).toThrow();
  });
});
