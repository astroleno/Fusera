"use client";

type MicroAdjustmentsPanelProps = {
  projectId: string;
};

async function requestRegeneration(projectId: string, scope: string) {
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
}: MicroAdjustmentsPanelProps) {
  return (
    <aside className="adjustment-panel" aria-label="Micro adjustments">
      <div>
        <p className="eyebrow">Sections</p>
        <button type="button" onClick={() => requestRegeneration(projectId, "hero")}>
          Regenerate hero
        </button>
      </div>
      <div>
        <p className="eyebrow">Theme</p>
        <button type="button" onClick={() => requestRegeneration(projectId, "theme")}>
          Regenerate theme
        </button>
      </div>
    </aside>
  );
}
