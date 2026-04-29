const steps = [
  "Import product shots",
  "Generate page artifacts",
  "Review preview quality",
  "Publish approved draft",
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="intro">
          <p className="eyebrow">Fusera</p>
          <h1>Turn product images into a premium landing page</h1>
          <p className="lede">
            Create a structured product brief, generate a brand-forward draft,
            and keep every preview bound to validated artifacts.
          </p>
          <a className="primary-action" href="/projects/new">
            New project
          </a>
        </div>

        <div className="run-panel" aria-label="Generation workflow">
          <div className="panel-header">
            <span>Draft workflow</span>
            <strong>Ready</strong>
          </div>
          <ol className="step-list">
            {steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <aside className="preview-stage" aria-label="Landing page preview">
        <div className="preview-card">
          <div className="product-visual" />
          <div className="preview-copy">
            <p>Artifact-bound preview</p>
            <h2>Premium launch page draft</h2>
            <span>QA gate pending</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
