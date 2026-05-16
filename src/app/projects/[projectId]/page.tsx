import CommercialIntentWorkbench from "@/components/editor/commercial-intent-workbench";
import MicroAdjustmentsPanel from "@/components/editor/micro-adjustments-panel";
import PagePreview from "@/components/editor/page-preview";
import { loadProjectPreview } from "@/lib/projects/load-project-preview";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const preview = await loadProjectPreview(projectId);

  return (
    <main className="project-page">
      <nav className="top-link" aria-label="Project navigation">
        <a href="/projects/new">New project</a>
      </nav>
      {preview ? (
        <section className="project-preview-layout">
          <div className="preview-stack">
            <div className="preview-state-bar">
              <span>
                {preview.mode === "page-spec" ? "PageSpec preview" : "Legacy preview"}
              </span>
              <strong data-ready={preview.publishReady}>
                {preview.publishReady ? "Publish-ready" : "Preview only"}
              </strong>
            </div>
            {preview.legacyReason ? (
              <p className="preview-note">{preview.legacyReason}</p>
            ) : null}
            <PagePreview page={preview.page} />
          </div>
          <aside className="project-side-panel">
            <CommercialIntentWorkbench
              projectId={projectId}
              runId={preview.runId}
              pageSpecRef={preview.pageSpecRef}
              qaReportRef={preview.qaReportRef}
              publishReady={preview.publishReady}
              qaFailureReason={preview.qaFailureReason}
            />
            <MicroAdjustmentsPanel projectId={projectId} runId={preview.runId} />
          </aside>
        </section>
      ) : (
        <section className="empty-preview">
          <p className="eyebrow">Preview pending</p>
          <h1>Generation has not finished yet</h1>
          <p className="lede">Start generation, then refresh this preview.</p>
        </section>
      )}
    </main>
  );
}
