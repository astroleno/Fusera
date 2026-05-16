import { createDbClient } from "@/lib/db";
import {
  recordCommercialIntentRequestSchema,
  reviewStateForIntentEvent,
} from "@/lib/domain/commercial-intent";

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const body: unknown = await request.json();
  const parsed = recordCommercialIntentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = await createDbClient();
  const metadata = {
    ...parsed.data.metadata,
    pageSpecRef: parsed.data.pageSpecRef ?? null,
    qaReportRef: parsed.data.qaReportRef ?? null,
    reason: parsed.data.reason ?? null,
  };
  const { error: insertError } = await db.from("project_intent_events").insert({
    project_id: projectId,
    run_id: parsed.data.runId ?? null,
    event_type: parsed.data.eventType,
    metadata,
  });

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  const nextReviewState = reviewStateForIntentEvent(parsed.data.eventType);

  if (nextReviewState && parsed.data.runId) {
    const { error: updateError } = await db
      .from("generation_runs")
      .update({ review_state: nextReviewState })
      .eq("id", parsed.data.runId)
      .eq("project_id", projectId);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }
  }

  return Response.json(
    {
      status: "recorded",
      eventType: parsed.data.eventType,
      reviewState: nextReviewState,
    },
    { status: 201 },
  );
}
