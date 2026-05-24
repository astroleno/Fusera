import type {
  PublishExportAdapter,
  PublishExportAdapterResult,
} from "@/lib/domain/publish-export-adapter";
import {
  transitionPublishExportOperation,
  type PublishExportOperationTransitionError,
  type PublishExportOperationTransitionInspection,
} from "./transition-publish-export-operation";

export type PublishExportAdapterRunResult =
  | {
      ok: true;
      phase: "completed";
      operation: PublishExportOperationTransitionInspection;
      adapterResult: PublishExportAdapterResult;
    }
  | {
      ok: false;
      phase: "start" | "complete";
      error: PublishExportOperationTransitionError;
      adapterResult?: PublishExportAdapterResult;
    };

type TransitionOperation = typeof transitionPublishExportOperation;

export async function runPublishExportAdapter(options: {
  projectId: string;
  operationId: string;
  adapter: PublishExportAdapter;
  transitionOperation?: TransitionOperation;
}): Promise<PublishExportAdapterRunResult> {
  const transitionOperation =
    options.transitionOperation ?? transitionPublishExportOperation;
  const context = {
    projectId: options.projectId,
    operationId: options.operationId,
    operationType: options.adapter.operationType,
  };
  const target = options.adapter.prepare(context);
  const start = await transitionOperation({
    projectId: options.projectId,
    operationId: options.operationId,
    request: {
      operationType: options.adapter.operationType,
      status: "external_pending",
      externalTarget: target,
    },
  });

  if (!start.ok) {
    return {
      ok: false,
      phase: "start",
      error: start.error,
    };
  }

  const adapterResult = await executeAndNormalizeAdapter(options.adapter, context, target);
  const completionStatus = adapterResult.ok
    ? "external_succeeded"
    : "external_failed";
  const completed = await transitionOperation({
    projectId: options.projectId,
    operationId: options.operationId,
    request: {
      operationType: options.adapter.operationType,
      status: completionStatus,
      externalResult: adapterResult,
    },
  });

  if (!completed.ok) {
    return {
      ok: false,
      phase: "complete",
      error: completed.error,
      adapterResult,
    };
  }

  return {
    ok: true,
    phase: "completed",
    operation: completed.operation,
    adapterResult,
  };
}

async function executeAndNormalizeAdapter(
  adapter: PublishExportAdapter,
  context: Parameters<PublishExportAdapter["execute"]>[0],
  target: Parameters<PublishExportAdapter["execute"]>[1],
): Promise<PublishExportAdapterResult> {
  try {
    const execution = await adapter.execute(context, target);

    try {
      return adapter.normalizeResult(execution);
    } catch (error) {
      return adapterExceptionResult(adapter, context, "normalizeResult", error);
    }
  } catch (error) {
    return adapterExceptionResult(adapter, context, "execute", error);
  }
}

function adapterExceptionResult(
  adapter: PublishExportAdapter,
  context: Parameters<PublishExportAdapter["execute"]>[0],
  phase: "execute" | "normalizeResult",
  error: unknown,
): PublishExportAdapterResult {
  const errorValue = error instanceof Error ? error : null;
  const message =
    errorValue?.message ??
    (typeof error === "string" ? error : "Publish/export adapter failed.");

  return {
    adapter: adapter.id,
    operationType: context.operationType,
    mode: "noop",
    ok: false,
    externalRuntimeImplemented: false,
    errorCode: `adapter_${phase}_exception`,
    message,
    details: {
      exception: true,
      phase,
      errorName: errorValue?.name ?? typeof error,
    },
  };
}
