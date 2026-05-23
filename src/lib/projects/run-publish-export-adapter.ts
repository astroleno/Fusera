import type {
  PublishExportAdapter,
  PublishExportAdapterExecution,
  PublishExportAdapterResult,
  PublishExportAdapterTarget,
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

const ADAPTER_EXCEPTION_MESSAGE =
  "Publish/export adapter failed before external completion.";

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
  let target: PublishExportAdapterTarget;

  try {
    target = options.adapter.prepare(context);
  } catch (error) {
    return {
      ok: false,
      phase: "start",
      error: adapterStartError({
        adapter: options.adapter,
        error,
        code: "adapter_prepare_exception",
      }),
    };
  }

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

  let adapterResult: PublishExportAdapterResult | null = null;
  let execution: PublishExportAdapterExecution | null = null;

  try {
    execution = await options.adapter.execute(context, target);
  } catch (error) {
    adapterResult = failedAdapterResult({
      adapter: options.adapter,
      error,
      phase: "execute",
    });
  }

  if (!adapterResult) {
    if (execution === null) {
      adapterResult = failedAdapterResult({
        adapter: options.adapter,
        error: new Error("Publish/export adapter returned no execution result."),
        phase: "execute",
      });
    } else {
      try {
        adapterResult = options.adapter.normalizeResult(execution);
      } catch (error) {
        adapterResult = failedAdapterResult({
          adapter: options.adapter,
          error,
          phase: "normalize",
        });
      }
    }
  }

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

function failedAdapterResult(options: {
  adapter: PublishExportAdapter;
  error: unknown;
  phase: "execute" | "normalize";
}): PublishExportAdapterResult {
  const details: Record<string, unknown> = {
    phase: options.phase,
  };

  if (options.error instanceof Error) {
    details.errorName = options.error.name;
  }

  return {
    adapter: options.adapter.id,
    operationType: options.adapter.operationType,
    mode: "noop",
    ok: false,
    externalRuntimeImplemented: false,
    errorCode: `adapter_${options.phase}_exception`,
    message: ADAPTER_EXCEPTION_MESSAGE,
    details,
  };
}

function adapterStartError(options: {
  adapter: PublishExportAdapter;
  error: unknown;
  code: string;
}): PublishExportOperationTransitionError {
  const details: Record<string, unknown> = {
    adapter: options.adapter.id,
    operationType: options.adapter.operationType,
  };

  if (options.error instanceof Error) {
    details.errorName = options.error.name;
  }

  return {
    status: 500,
    code: options.code,
    message: ADAPTER_EXCEPTION_MESSAGE,
    details,
  };
}
