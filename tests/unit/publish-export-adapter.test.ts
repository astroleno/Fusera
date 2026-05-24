import { describe, expect, it, vi } from "vitest";
import {
  PUBLISH_EXPORT_ADAPTER_REGISTRY,
  dryRunAdapterForOperationType,
  dryRunExportAdapter,
  noopAdapterForOperationType,
  noopExportAdapter,
  noopPublishAdapter,
  parsePublishExportAdapterResult,
  parsePublishExportAdapterTarget,
  publishExportCredentialRefSchema,
  type PublishExportAdapter,
} from "@/lib/domain/publish-export-adapter";
import { runPublishExportAdapter } from "@/lib/projects/run-publish-export-adapter";
import type { PublishExportOperationTransitionInspection } from "@/lib/projects/transition-publish-export-operation";

function operation(
  status: PublishExportOperationTransitionInspection["status"],
  operationType: PublishExportOperationTransitionInspection["operationType"],
  overrides: Partial<PublishExportOperationTransitionInspection> = {},
): PublishExportOperationTransitionInspection {
  return {
    id: "operation_01",
    operationType,
    status,
    externalTarget: null,
    externalResult: null,
    diagnostics: [],
    ...overrides,
  };
}

describe("publish/export external adapter contract", () => {
  it("defines stable noop publish/export adapter target and result shapes", async () => {
    const exportContext = {
      projectId: "project_01",
      operationId: "operation_01",
      operationType: "export" as const,
    };
    const exportTarget = noopExportAdapter.prepare(exportContext);
    const exportExecution = await noopExportAdapter.execute(
      exportContext,
      exportTarget,
    );

    expect(exportTarget).toEqual({
      adapter: "noop-export",
      operationType: "export",
      mode: "noop",
      externalRuntimeImplemented: false,
    });
    expect(noopExportAdapter.normalizeResult(exportExecution)).toEqual({
      adapter: "noop-export",
      operationType: "export",
      mode: "noop",
      ok: true,
      externalRuntimeImplemented: false,
      details: {
        externalRuntime: "not_implemented",
      },
    });
    expect(noopAdapterForOperationType("publish")).toBe(noopPublishAdapter);
    expect(noopAdapterForOperationType("export")).toBe(noopExportAdapter);
  });

  it("registers only explicit noop and dry-run adapters", () => {
    expect(Object.keys(PUBLISH_EXPORT_ADAPTER_REGISTRY).sort()).toEqual([
      "dry-run-export",
      "dry-run-publish",
      "noop-export",
      "noop-publish",
    ]);
    expect(dryRunAdapterForOperationType("export")).toBe(dryRunExportAdapter);
    expect(dryRunAdapterForOperationType("publish").id).toBe(
      "dry-run-publish",
    );
  });

  it("defines provider config and credential refs without plaintext secrets", () => {
    expect(
      publishExportCredentialRefSchema.parse({
        kind: "secret_ref",
        ref: "publish-export/export/dry-run",
        scope: "runtime",
      }),
    ).toEqual({
      kind: "secret_ref",
      ref: "publish-export/export/dry-run",
      scope: "runtime",
    });
    expect(() =>
      publishExportCredentialRefSchema.parse({
        kind: "plaintext",
        ref: "secret-token",
        scope: "runtime",
      }),
    ).toThrow();
  });

  it("validates dry-run target and result shapes at runtime", async () => {
    const context = {
      projectId: "project_01",
      operationId: "operation_01",
      operationType: "export" as const,
    };
    const target = dryRunExportAdapter.prepare(context);
    const execution = await dryRunExportAdapter.execute(context, target);
    const result = dryRunExportAdapter.normalizeResult(execution);

    expect(parsePublishExportAdapterTarget(target)).toEqual({
      adapter: "dry-run-export",
      operationType: "export",
      mode: "dry-run",
      externalRuntimeImplemented: false,
      dryRun: true,
      providerConfig: {
        provider: "dry-run",
        credentialRef: {
          kind: "secret_ref",
          ref: "publish-export/export/dry-run",
          scope: "runtime",
        },
      },
      idempotencyKey: "operation_01:dry-run-export",
    });
    expect(parsePublishExportAdapterResult(result)).toMatchObject({
      adapter: "dry-run-export",
      operationType: "export",
      mode: "dry-run",
      ok: true,
      externalRuntimeImplemented: false,
      details: {
        dryRun: true,
        externalRuntime: "not_implemented",
      },
    });
    expect(() =>
      parsePublishExportAdapterTarget({
        ...target,
        operationType: "publish",
      }),
    ).toThrow();
    expect(() =>
      parsePublishExportAdapterResult({
        ...result,
        ok: false,
        errorCode: undefined,
      }),
    ).toThrow();
  });

  it("runs noop publish through ready -> external_pending -> external_succeeded", async () => {
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending", "publish", {
          externalTarget: {
            adapter: "noop-publish",
            operationType: "publish",
            mode: "noop",
            externalRuntimeImplemented: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_succeeded", "publish", {
          externalResult: {
            adapter: "noop-publish",
            operationType: "publish",
            mode: "noop",
            ok: true,
            externalRuntimeImplemented: false,
            details: { externalRuntime: "not_implemented" },
          },
        }),
      });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter: noopPublishAdapter,
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      operation: {
        status: "external_succeeded",
        operationType: "publish",
      },
      adapterResult: {
        adapter: "noop-publish",
        operationType: "publish",
        ok: true,
        externalRuntimeImplemented: false,
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(1, {
      projectId: "project_01",
      operationId: "operation_01",
      request: {
        operationType: "publish",
        status: "external_pending",
        externalTarget: {
          adapter: "noop-publish",
          operationType: "publish",
          mode: "noop",
          externalRuntimeImplemented: false,
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(2, {
      projectId: "project_01",
      operationId: "operation_01",
      request: {
        operationType: "publish",
        status: "external_succeeded",
        externalResult: {
          adapter: "noop-publish",
          operationType: "publish",
          mode: "noop",
          ok: true,
          externalRuntimeImplemented: false,
          details: {
            externalRuntime: "not_implemented",
          },
        },
      },
    });
  });

  it("records adapter failures as external_failed through the transition helper", async () => {
    const failingAdapter: PublishExportAdapter = {
      ...noopExportAdapter,
      execute: vi.fn().mockResolvedValue({
        ok: false,
        errorCode: "noop_adapter_failed",
        message: "Noop adapter failure fixture.",
        details: { fixture: true },
      }),
    };
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending", "export"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed", "export", {
          externalResult: {
            adapter: "noop-export",
            operationType: "export",
            mode: "noop",
            ok: false,
            externalRuntimeImplemented: false,
            errorCode: "noop_adapter_failed",
            message: "Noop adapter failure fixture.",
            details: { fixture: true },
          },
        }),
      });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter: failingAdapter,
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      operation: {
        status: "external_failed",
      },
      adapterResult: {
        ok: false,
        errorCode: "noop_adapter_failed",
        message: "Noop adapter failure fixture.",
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          status: "external_failed",
          externalResult: expect.objectContaining({
            ok: false,
            errorCode: "noop_adapter_failed",
          }),
        }),
      }),
    );
  });

  it("records execute exceptions as external_failed through the transition helper", async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error("token=secret-provider-token"));
    const throwingAdapter: PublishExportAdapter = {
      ...noopExportAdapter,
      execute,
    };
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending", "export"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed", "export"),
      });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter: throwingAdapter,
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      operation: {
        status: "external_failed",
      },
      adapterResult: {
        adapter: "noop-export",
        operationType: "export",
        ok: false,
        errorCode: "adapter_execute_exception",
        message: "Publish/export adapter failed before external completion.",
        details: {
          phase: "execute",
          errorName: "Error",
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          status: "external_failed",
          externalResult: expect.objectContaining({
            errorCode: "adapter_execute_exception",
            details: expect.objectContaining({
              phase: "execute",
            }),
          }),
        }),
      }),
    );
  });

  it("records normalize exceptions as external_failed through the transition helper", async () => {
    const normalizeResult = vi.fn(() => {
      throw new TypeError("provider response included secret=abc123");
    });
    const throwingAdapter: PublishExportAdapter = {
      ...noopPublishAdapter,
      normalizeResult,
    };
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending", "publish"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed", "publish"),
      });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter: throwingAdapter,
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      operation: {
        status: "external_failed",
      },
      adapterResult: {
        adapter: "noop-publish",
        operationType: "publish",
        ok: false,
        errorCode: "adapter_normalize_exception",
        message: "Publish/export adapter failed before external completion.",
        details: {
          phase: "normalize",
          errorName: "TypeError",
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          status: "external_failed",
          externalResult: expect.objectContaining({
            errorCode: "adapter_normalize_exception",
            details: expect.objectContaining({
              phase: "normalize",
            }),
          }),
        }),
      }),
    );
  });

  it("returns a stable start error when prepare throws without starting a transition", async () => {
    const prepare = vi.fn(() => {
      throw new Error("credential token=secret-provider-token");
    });
    const execute = vi.fn();
    const adapter: PublishExportAdapter = {
      ...noopPublishAdapter,
      prepare,
      execute,
    };
    const transitionOperation = vi.fn();

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter,
      transitionOperation,
    });

    expect(result).toEqual({
      ok: false,
      phase: "start",
      error: {
        status: 500,
        code: "adapter_prepare_exception",
        message: "Publish/export adapter failed before external completion.",
        details: {
          adapter: "noop-publish",
          operationType: "publish",
          errorName: "Error",
        },
      },
    });
    expect(transitionOperation).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns a stable start error when prepare returns an invalid target", async () => {
    const adapter: PublishExportAdapter = {
      ...noopExportAdapter,
      prepare: vi.fn(() => ({
        adapter: "noop-export",
        operationType: "publish",
        mode: "noop",
        externalRuntimeImplemented: false,
      }) as never),
      execute: vi.fn(),
    };
    const transitionOperation = vi.fn();

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter,
      transitionOperation,
    });

    expect(result).toEqual({
      ok: false,
      phase: "start",
      error: {
        status: 500,
        code: "adapter_target_invalid",
        message: "Publish/export adapter failed before external completion.",
        details: {
          adapter: "noop-export",
          operationType: "export",
          errorName: "ZodError",
        },
      },
    });
    expect(transitionOperation).not.toHaveBeenCalled();
    expect(adapter.execute).not.toHaveBeenCalled();
  });

  it("does not execute adapters when the operation is not ready", async () => {
    const execute = vi.fn();
    const adapter: PublishExportAdapter = {
      ...noopPublishAdapter,
      execute,
    };
    const transitionOperation = vi.fn().mockResolvedValueOnce({
      ok: false,
      error: {
        status: 409,
        code: "invalid_transition",
        message: "Invalid publish/export transition: blocked -> external_pending",
        details: {
          from: "blocked",
          to: "external_pending",
        },
      },
    });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter,
      transitionOperation,
    });

    expect(result).toEqual({
      ok: false,
      phase: "start",
      error: {
        status: 409,
        code: "invalid_transition",
        message: "Invalid publish/export transition: blocked -> external_pending",
        details: {
          from: "blocked",
          to: "external_pending",
        },
      },
    });
    expect(execute).not.toHaveBeenCalled();
    expect(transitionOperation).toHaveBeenCalledTimes(1);
  });

  it("surfaces completion transition failures with the normalized adapter result", async () => {
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending", "export"),
      })
      .mockResolvedValueOnce({
        ok: false,
        error: {
          status: 409,
          code: "operation_state_changed",
          message:
            "Publish/export operation changed before the transition could be recorded.",
          details: {
            expectedStatus: "external_pending",
            requestedStatus: "external_succeeded",
          },
        },
      });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter: noopExportAdapter,
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: false,
      phase: "complete",
      error: {
        code: "operation_state_changed",
      },
      adapterResult: {
        adapter: "noop-export",
        operationType: "export",
        ok: true,
      },
    });
  });

  it("records invalid normalized results as external_failed", async () => {
    const adapter: PublishExportAdapter = {
      ...noopExportAdapter,
      normalizeResult: vi.fn(() => ({
        adapter: "noop-export",
        operationType: "publish",
        mode: "noop",
        ok: true,
        externalRuntimeImplemented: false,
        details: {},
      }) as never),
    };
    const transitionOperation = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_pending", "export"),
      })
      .mockResolvedValueOnce({
        ok: true,
        operation: operation("external_failed", "export"),
      });

    const result = await runPublishExportAdapter({
      projectId: "project_01",
      operationId: "operation_01",
      adapter,
      transitionOperation,
    });

    expect(result).toMatchObject({
      ok: true,
      phase: "completed",
      operation: {
        status: "external_failed",
      },
      adapterResult: {
        adapter: "noop-export",
        operationType: "export",
        ok: false,
        errorCode: "adapter_normalize_exception",
        message: "Publish/export adapter failed before external completion.",
        details: {
          phase: "normalize",
          errorName: "ZodError",
        },
      },
    });
    expect(transitionOperation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        request: expect.objectContaining({
          status: "external_failed",
          externalResult: expect.objectContaining({
            errorCode: "adapter_normalize_exception",
          }),
        }),
      }),
    );
  });
});
