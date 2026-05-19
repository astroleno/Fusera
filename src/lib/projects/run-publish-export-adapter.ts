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

  const execution = await options.adapter.execute(context, target);
  const adapterResult = options.adapter.normalizeResult(execution);
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
