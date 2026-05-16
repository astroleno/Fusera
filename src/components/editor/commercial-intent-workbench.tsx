"use client";

import type { CommercialIntentEventType } from "@/lib/domain/commercial-intent";
import { useEffect, useRef, useState } from "react";

type CommercialIntentWorkbenchProps = {
  projectId: string;
  runId: string;
  pageSpecRef: string | null;
  qaReportRef: string | null;
  publishReady: boolean;
  qaFailureReason: string | null;
};

type IntentStatus = "idle" | "recording" | "recorded" | "error";

async function recordIntent(
  props: CommercialIntentWorkbenchProps,
  eventType: CommercialIntentEventType,
  metadata: Record<string, unknown> = {},
) {
  const reason =
    eventType === "qa_failed_reason" ? props.qaFailureReason ?? undefined : undefined;

  const response = await fetch(`/api/projects/${props.projectId}/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventType,
      runId: props.runId,
      pageSpecRef: props.pageSpecRef ?? undefined,
      qaReportRef: props.qaReportRef ?? undefined,
      reason,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error("Commercial intent event was not recorded.");
  }
}

export default function CommercialIntentWorkbench(
  props: CommercialIntentWorkbenchProps,
) {
  const [status, setStatus] = useState<IntentStatus>("idle");
  const automaticEventRecorded = useRef(false);

  useEffect(() => {
    if (automaticEventRecorded.current) {
      return;
    }

    automaticEventRecorded.current = true;
    const eventType = props.publishReady
      ? "publish_ready_viewed"
      : props.qaFailureReason
        ? "qa_failed_reason"
        : null;

    if (!eventType) {
      return;
    }

    void recordIntent(props, eventType, { source: "project-preview" }).catch(
      () => {
        automaticEventRecorded.current = false;
      },
    );
  }, [props]);

  async function handleIntent(eventType: CommercialIntentEventType) {
    setStatus("recording");

    try {
      await recordIntent(props, eventType, { source: "review-workbench" });
      setStatus("recorded");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="commercial-intent-panel" aria-label="Commercial intent">
      <p className="eyebrow">Review</p>
      <div className="intent-action-grid">
        <button type="button" onClick={() => handleIntent("review_approved")}>
          Approve draft
        </button>
        <button type="button" onClick={() => handleIntent("revision_requested")}>
          Needs changes
        </button>
        <button type="button" onClick={() => handleIntent("review_rejected")}>
          Reject draft
        </button>
      </div>
      <div className="intent-action-grid">
        <button
          disabled={!props.publishReady}
          type="button"
          onClick={() => handleIntent("export_clicked")}
        >
          Record export intent
        </button>
        <button
          disabled={!props.publishReady}
          type="button"
          onClick={() => handleIntent("publish_confirmed")}
        >
          Confirm publish intent
        </button>
      </div>
      {status !== "idle" ? (
        <p className={`intent-status ${status}`} role="status">
          {status === "recording"
            ? "Recording"
            : status === "recorded"
              ? "Recorded"
              : "Not recorded"}
        </p>
      ) : null}
    </section>
  );
}
