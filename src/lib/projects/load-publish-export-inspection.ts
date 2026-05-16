import { createDbClient } from "@/lib/db";
import {
  inspectPublishExportDiagnostic,
  publishExportOperationStatusSchema,
  publishExportOperationTypeSchema,
  type PublishExportDiagnosticInspection,
  type PublishExportOperationDiagnostic,
  type PublishExportOperationStatus,
  type PublishExportOperationType,
} from "@/lib/domain/publish-control-plane";

export type PublishExportOperationInspection = {
  id: string;
  projectId: string;
  runId: string;
  operationType: PublishExportOperationType;
  status: PublishExportOperationStatus;
  pageSpecRef: string;
  qaReportRef: string;
  publishVersionRef: string | null;
  previewBuildRef: string;
  failureCode: string | null;
  failureReason: string | null;
  diagnostics: PublishExportDiagnosticInspection[];
  createdAt: string;
  updatedAt: string;
};

type PublishExportOperationRecord = {
  id: string;
  project_id: string;
  run_id: string;
  operation_type: string;
  status: string;
  page_spec_ref: string;
  qa_report_ref: string;
  publish_version_ref: string | null;
  preview_build_ref: string;
  failure_code: string | null;
  failure_reason: string | null;
  diagnostics: unknown;
  created_at: string;
  updated_at: string;
};

type PublishExportOperationQuery = {
  select(columns: string): PublishExportOperationQuery;
  eq(column: string, value: string): PublishExportOperationQuery;
  order(
    column: string,
    options: { ascending: boolean },
  ): PublishExportOperationQuery;
  limit(count: number): PublishExportOperationQuery;
  single(): Promise<{ data: unknown; error: unknown }>;
};

type PublishExportOperationDb = {
  from(table: "publish_export_operations"): PublishExportOperationQuery;
};

export async function loadLatestPublishExportOperation(options: {
  projectId: string;
  runId?: string;
  operationType?: PublishExportOperationType;
}): Promise<PublishExportOperationInspection | null> {
  let db: PublishExportOperationDb;

  try {
    db = (await createDbClient()) as unknown as PublishExportOperationDb;
  } catch {
    return null;
  }

  let query = db
    .from("publish_export_operations")
    .select(
      [
        "id",
        "project_id",
        "run_id",
        "operation_type",
        "status",
        "page_spec_ref",
        "qa_report_ref",
        "publish_version_ref",
        "preview_build_ref",
        "failure_code",
        "failure_reason",
        "diagnostics",
        "created_at",
        "updated_at",
      ].join(", "),
    )
    .eq("project_id", options.projectId);

  if (options.runId) {
    query = query.eq("run_id", options.runId);
  }

  if (options.operationType) {
    query = query.eq("operation_type", options.operationType);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return operationRecordToInspection(data as unknown as PublishExportOperationRecord);
}

export function operationRecordToInspection(
  record: PublishExportOperationRecord,
): PublishExportOperationInspection | null {
  const operationType = publishExportOperationTypeSchema.safeParse(
    record.operation_type,
  );
  const status = publishExportOperationStatusSchema.safeParse(record.status);

  if (!operationType.success || !status.success) {
    return null;
  }

  const diagnostics = Array.isArray(record.diagnostics)
    ? record.diagnostics.flatMap((diagnostic) => {
        const normalized = normalizeDiagnostic(diagnostic);

        return normalized ? [inspectPublishExportDiagnostic(normalized)] : [];
      })
    : [];

  return {
    id: record.id,
    projectId: record.project_id,
    runId: record.run_id,
    operationType: operationType.data,
    status: status.data,
    pageSpecRef: record.page_spec_ref,
    qaReportRef: record.qa_report_ref,
    publishVersionRef: record.publish_version_ref,
    previewBuildRef: record.preview_build_ref,
    failureCode: record.failure_code,
    failureReason: record.failure_reason,
    diagnostics,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function normalizeDiagnostic(
  diagnostic: unknown,
): PublishExportOperationDiagnostic | null {
  if (!isRecord(diagnostic)) {
    return null;
  }

  const {
    code,
    severity,
    message,
    artifactType,
    artifactRef,
    details,
  } = diagnostic;

  if (
    typeof code !== "string" ||
    code.length === 0 ||
    severity !== "blocking" ||
    typeof message !== "string" ||
    message.length === 0 ||
    typeof artifactType !== "string" ||
    artifactType.length === 0 ||
    !(typeof artifactRef === "string" || artifactRef === null)
  ) {
    return null;
  }

  return {
    code,
    severity,
    message,
    artifactType,
    artifactRef,
    details: isRecord(details) ? details : {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
