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
  const page = await loadProjectPreview(projectId);

  return (
    <main className="project-page">
      <nav className="top-link" aria-label="Project navigation">
        <a href="/projects/new">New project</a>
      </nav>
      {page ? (
        <section className="project-preview-layout">
          <PagePreview page={page} />
          <MicroAdjustmentsPanel projectId={projectId} />
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
