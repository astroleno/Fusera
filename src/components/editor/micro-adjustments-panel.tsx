"use client";

type MicroAdjustmentsPanelProps = {
  projectId: string;
  runId?: string;
};

async function recordReturnedToModify(projectId: string, runId: string | undefined, scope: string) {
  await fetch(`/api/projects/${projectId}/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventType: "returned_to_modify",
      runId,
      metadata: {
        scope,
        source: "micro-adjustments",
      },
    }),
  });
}

async function requestRegeneration(
  projectId: string,
  runId: string | undefined,
  scope: string,
) {
  await recordReturnedToModify(projectId, runId, scope).catch(() => undefined);
  await fetch(`/api/projects/${projectId}/regenerate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scope }),
  });
}

export default function MicroAdjustmentsPanel({
  projectId,
  runId,
}: MicroAdjustmentsPanelProps) {
  return (
    <section className="adjustment-panel" aria-label="Micro adjustments">
      <div>
        <p className="eyebrow">Sections</p>
        <button
          type="button"
          onClick={() => requestRegeneration(projectId, runId, "hero")}
        >
          Regenerate hero
        </button>
      </div>
      <div>
        <p className="eyebrow">Theme</p>
        <button
          type="button"
          onClick={() => requestRegeneration(projectId, runId, "theme")}
        >
          Regenerate theme
        </button>
      </div>
    </section>
  );
}
