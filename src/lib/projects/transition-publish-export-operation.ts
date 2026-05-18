import { createDbClient } from "@/lib/db";
import {
  canTransitionPublishExportOperation,
  publishExportOperationStatusSchema,
  publishExportOperationTypeSchema,
  type PublishExportOperationStatus,
  type PublishExportOperationTransitionRequest,
  type PublishExportOperationType,
} from "@/lib/domain/publish-control-plane";

export type PublishExportOperationTransitionInspection = {
  id: string;
  operationType: PublishExportOperationType;
  status: PublishExportOperationStatus;
  externalTarget: Record<string, unknown> | null;
  externalResult: Record<string, unknown> | null;
  diagnostics: unknown[];
};

export type PublishExportOperationTransitionError = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type PublishExportOperationTransitionResult =
  | {
      ok: true;
      operation: PublishExportOperationTransitionInspection;
    }
  | {
      ok: false;
      error: PublishExportOperationTransitionError;
    };

type PublishExportOperationRecord = {
  id: string;
  operation_type: string;
  status: string;
  external_target: unknown;
  external_result: unknown;
  diagnostics: unknown;
};

type PublishExportOperationReadQuery = {
  select(columns: string): PublishExportOperationReadQuery;
  eq(column: string, value: string): PublishExportOperationReadQuery;
  maybeSingle(): Promise<{ data: unknown; error: unknown }>;
};

type PublishExportOperationUpdateQuery = {
  eq(column: string, value: string): PublishExportOperationUpdateQuery;
  select(columns: string): {
    maybeSingle(): Promise<{ data: unknown; error: unknown }>;
  };
};

type PublishExportOperationTable = {
  select(columns: string): PublishExportOperationReadQuery;
  update(values: Record<string, unknown>): PublishExportOperationUpdateQuery;
};

type PublishExportOperationDb = {
  from(table: "publish_export_operations"): PublishExportOperationTable;
};

const operationColumns = [
  "id",
  "operation_type",
  "status",
  "external_target",
  "external_result",
  "diagnostics",
].join(", ");

export async function transitionPublishExportOperation(options: {
  projectId: string;
  operationId: string;
  request: PublishExportOperationTransitionRequest;
}): Promise<PublishExportOperationTransitionResult> {
  let db: PublishExportOperationDb;

  try {
    db = (await createDbClient()) as unknown as PublishExportOperationDb;
  } catch {
    return failure(
      500,
      "db_client_error",
      "Failed to create the database client.",
    );
  }

  const { data: currentOperation, error: readError } = await db
    .from("publish_export_operations")
    .select(operationColumns)
    .eq("id", options.operationId)
    .eq("project_id", options.projectId)
    .maybeSingle();

  if (readError) {
    return failure(
      500,
      "operation_read_failed",
      errorMessage(readError) ?? "Publish/export operation could not be read.",
    );
  }

  if (!currentOperation) {
    return failure(
      404,
      "operation_not_found",
      "Publish/export operation was not found.",
    );
  }

  const current = operationRecordToTransitionInspection(
    currentOperation as unknown as PublishExportOperationRecord,
  );

  if (!current) {
    return failure(
      500,
      "malformed_operation",
      "Publish/export operation row is malformed.",
    );
  }

  if (
    options.request.operationType &&
    options.request.operationType !== current.operationType
  ) {
    return failure(
      409,
      "operation_type_mismatch",
      "Operation type does not match the requested transition.",
      {
        expected: options.request.operationType,
        actual: current.operationType,
      },
    );
  }

  if (!canTransitionPublishExportOperation(current.status, options.request.status)) {
    return failure(
      409,
      "invalid_transition",
      `Invalid publish/export transition: ${current.status} -> ${options.request.status}`,
      {
        from: current.status,
        to: options.request.status,
      },
    );
  }

  const update = transitionUpdate(options.request);
  const { data: updatedOperation, error: updateError } = await db
    .from("publish_export_operations")
    .update(update)
    .eq("id", options.operationId)
    .eq("project_id", options.projectId)
    .eq("status", current.status)
    .select(operationColumns)
    .maybeSingle();

  if (updateError) {
    return failure(
      500,
      "transition_update_failed",
      errorMessage(updateError) ?? "Publish/export operation transition failed.",
    );
  }

  if (!updatedOperation) {
    return failure(
      409,
      "operation_state_changed",
      "Publish/export operation changed before the transition could be recorded.",
      {
        expectedStatus: current.status,
        requestedStatus: options.request.status,
      },
    );
  }

  const operation = operationRecordToTransitionInspection(
    updatedOperation as unknown as PublishExportOperationRecord,
  );

  if (!operation) {
    return failure(
      500,
      "malformed_operation",
      "Updated publish/export operation row is malformed.",
    );
  }

  return { ok: true, operation };
}

function transitionUpdate(
  request: PublishExportOperationTransitionRequest,
): Record<string, unknown> {
  const update: Record<string, unknown> = {
    status: request.status,
    updated_at: new Date().toISOString(),
  };

  if ("externalTarget" in request) {
    update.external_target = request.externalTarget ?? null;
  }

  if ("externalResult" in request) {
    update.external_result = request.externalResult ?? null;
  }

  return update;
}

function operationRecordToTransitionInspection(
  record: PublishExportOperationRecord,
): PublishExportOperationTransitionInspection | null {
  const operationType = publishExportOperationTypeSchema.safeParse(
    record.operation_type,
  );
  const status = publishExportOperationStatusSchema.safeParse(record.status);

  if (!operationType.success || !status.success) {
    return null;
  }

  return {
    id: record.id,
    operationType: operationType.data,
    status: status.data,
    externalTarget: isRecord(record.external_target) ? record.external_target : null,
    externalResult: isRecord(record.external_result) ? record.external_result : null,
    diagnostics: Array.isArray(record.diagnostics) ? record.diagnostics : [],
  };
}

function failure(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
): PublishExportOperationTransitionResult {
  return {
    ok: false,
    error: {
      status,
      code,
      message,
      details,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorMessage(error: unknown) {
  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return null;
}
