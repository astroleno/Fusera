import ProjectIntakeForm from "@/components/intake/project-intake-form";

const readinessItems = [
  "Structured product input",
  "Canonical artifact targets",
  "Preview gate handoff",
];

export default function NewProjectPage() {
  return (
    <main className="intake-page">
      <nav className="top-link" aria-label="Project navigation">
        <a href="/">Fusera</a>
      </nav>

      <section className="intake-layout">
        <div className="intake-main">
          <p className="eyebrow">New project</p>
          <h1>Start a new landing page</h1>
          <p className="lede">
            Product facts become the source record for brief, strategy, sections,
            tokens, preview, and publish gates.
          </p>
          <ProjectIntakeForm />
        </div>

        <aside className="readiness-panel" aria-label="Run readiness">
          <div className="panel-header">
            <span>Run readiness</span>
            <strong>Draft</strong>
          </div>
          <ol className="step-list single-column">
            {readinessItems.map((item, index) => (
              <li key={item}>
                <span>{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}
