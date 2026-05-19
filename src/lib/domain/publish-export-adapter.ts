import type { PublishExportOperationType } from "./publish-control-plane";

export type PublishExportAdapterId = "noop-export" | "noop-publish";

export type PublishExportAdapterContext = {
  projectId: string;
  operationId: string;
  operationType: PublishExportOperationType;
};

export type PublishExportAdapterTarget = {
  adapter: PublishExportAdapterId;
  operationType: PublishExportOperationType;
  mode: "noop";
  externalRuntimeImplemented: false;
};

export type PublishExportAdapterExecution =
  | {
      ok: true;
      details?: Record<string, unknown>;
    }
  | {
      ok: false;
      errorCode: string;
      message: string;
      details?: Record<string, unknown>;
    };

export type PublishExportAdapterResult = {
  adapter: PublishExportAdapterId;
  operationType: PublishExportOperationType;
  mode: "noop";
  ok: boolean;
  externalRuntimeImplemented: false;
  errorCode?: string;
  message?: string;
  details: Record<string, unknown>;
};

export type PublishExportAdapter = {
  id: PublishExportAdapterId;
  operationType: PublishExportOperationType;
  prepare(context: PublishExportAdapterContext): PublishExportAdapterTarget;
  execute(
    context: PublishExportAdapterContext,
    target: PublishExportAdapterTarget,
  ): Promise<PublishExportAdapterExecution>;
  normalizeResult(
    execution: PublishExportAdapterExecution,
  ): PublishExportAdapterResult;
};

export const noopExportAdapter = createNoopPublishExportAdapter(
  "noop-export",
  "export",
);

export const noopPublishAdapter = createNoopPublishExportAdapter(
  "noop-publish",
  "publish",
);

export function noopAdapterForOperationType(
  operationType: PublishExportOperationType,
) {
  return operationType === "export" ? noopExportAdapter : noopPublishAdapter;
}

function createNoopPublishExportAdapter(
  id: PublishExportAdapterId,
  operationType: PublishExportOperationType,
): PublishExportAdapter {
  return {
    id,
    operationType,
    prepare() {
      return {
        adapter: id,
        operationType,
        mode: "noop",
        externalRuntimeImplemented: false,
      };
    },
    async execute() {
      return {
        ok: true,
        details: {
          externalRuntime: "not_implemented",
        },
      };
    },
    normalizeResult(execution) {
      return {
        adapter: id,
        operationType,
        mode: "noop",
        ok: execution.ok,
        externalRuntimeImplemented: false,
        ...(execution.ok
          ? {}
          : {
              errorCode: execution.errorCode,
              message: execution.message,
            }),
        details: execution.details ?? {},
      };
    },
  };
}
