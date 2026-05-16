import { z } from "zod";

export const commercialIntentEventTypes = [
  "publish_ready_viewed",
  "export_clicked",
  "publish_confirmed",
  "qa_failed_reason",
  "review_approved",
  "review_rejected",
  "revision_requested",
  "returned_to_modify",
] as const;

export const commercialIntentEventTypeSchema = z.enum(
  commercialIntentEventTypes,
);

export const recordCommercialIntentRequestSchema = z.object({
  eventType: commercialIntentEventTypeSchema,
  runId: z.string().uuid().optional(),
  pageSpecRef: z.string().min(1).optional(),
  qaReportRef: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).default({}),
}).strict();

export type CommercialIntentEventType = z.infer<
  typeof commercialIntentEventTypeSchema
>;

export type RecordCommercialIntentRequest = z.infer<
  typeof recordCommercialIntentRequestSchema
>;

export function reviewStateForIntentEvent(
  eventType: CommercialIntentEventType,
) {
  if (eventType === "review_approved") {
    return "approved";
  }

  if (eventType === "review_rejected") {
    return "rejected";
  }

  if (
    eventType === "revision_requested" ||
    eventType === "returned_to_modify"
  ) {
    return "needs_changes";
  }

  return null;
}
