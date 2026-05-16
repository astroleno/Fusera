import { z } from "zod";

const nonEmptyString = z.string().min(1);

export const publishExportOperationTypeSchema = z.enum(["export", "publish"]);

export const publishExportOperationStatusSchema = z.enum([
  "requested",
  "blocked",
  "ready",
  "external_pending",
  "external_succeeded",
  "external_failed",
  "cancelled",
]);

export const publishExportRequestSchema = z
  .object({
    operationType: publishExportOperationTypeSchema.optional(),
    externalTarget: z.record(z.unknown()).optional(),
  })
  .strict();

export const publishExportOperationInsertSchema = z
  .object({
    project_id: nonEmptyString,
    run_id: nonEmptyString,
    operation_type: publishExportOperationTypeSchema,
    status: publishExportOperationStatusSchema,
    page_spec_ref: nonEmptyString,
    qa_report_ref: nonEmptyString,
    publish_version_ref: nonEmptyString.nullable(),
    preview_build_ref: nonEmptyString,
    failure_code: nonEmptyString.nullable(),
    failure_reason: nonEmptyString.nullable(),
    external_target: z.record(z.unknown()).nullable(),
    external_result: z.record(z.unknown()).nullable(),
  })
  .strict();

export type PublishExportOperationType = z.infer<
  typeof publishExportOperationTypeSchema
>;
export type PublishExportOperationStatus = z.infer<
  typeof publishExportOperationStatusSchema
>;
export type PublishExportRequest = z.infer<typeof publishExportRequestSchema>;
export type PublishExportOperationInsert = z.infer<
  typeof publishExportOperationInsertSchema
>;

export const publishExportAllowedTransitions: Record<
  PublishExportOperationStatus,
  PublishExportOperationStatus[]
> = {
  requested: ["blocked", "ready", "cancelled"],
  blocked: [],
  ready: ["external_pending", "cancelled"],
  external_pending: ["external_succeeded", "external_failed"],
  external_succeeded: [],
  external_failed: ["ready", "cancelled"],
  cancelled: [],
};

export function canTransitionPublishExportOperation(
  from: PublishExportOperationStatus,
  to: PublishExportOperationStatus,
) {
  return publishExportAllowedTransitions[from].includes(to);
}

export function assertPublishExportOperationTransition(
  from: PublishExportOperationStatus,
  to: PublishExportOperationStatus,
) {
  if (!canTransitionPublishExportOperation(from, to)) {
    throw new Error(`Invalid publish/export transition: ${from} -> ${to}`);
  }
}

export function initialExportStateForCompletedGeneration() {
  return "none" as const;
}

export function createReadyPublishExportOperation(params: {
  projectId: string;
  runId: string;
  operationType: PublishExportOperationType;
  pageSpecRef: string;
  qaReportRef: string;
  publishVersionRef: string | null;
  previewBuildRef: string;
  externalTarget?: Record<string, unknown>;
}): PublishExportOperationInsert {
  return publishExportOperationInsertSchema.parse({
    project_id: params.projectId,
    run_id: params.runId,
    operation_type: params.operationType,
    status: "ready",
    page_spec_ref: params.pageSpecRef,
    qa_report_ref: params.qaReportRef,
    publish_version_ref: params.publishVersionRef,
    preview_build_ref: params.previewBuildRef,
    failure_code: null,
    failure_reason: null,
    external_target: params.externalTarget ?? null,
    external_result: null,
  });
}
