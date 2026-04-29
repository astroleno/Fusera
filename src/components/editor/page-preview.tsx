import type {
  CompiledPage,
  CompiledPageSection,
} from "@/lib/page-spec/compile-page";

function textProp(section: CompiledPageSection, key: string, fallback: string) {
  const value = section.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function listProp(section: CompiledPageSection, key: string) {
  const value = section.props[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export default function PagePreview({ page }: { page: CompiledPage }) {
  return (
    <div className="generated-preview">
      {page.sections.map((section) => {
        if (section.sectionType === "hero") {
          return (
            <section className="preview-section preview-hero" key={section.key}>
              <p className="eyebrow">
                {textProp(section, "eyebrow", "Generated page")}
              </p>
              <h2>{textProp(section, "headline", section.title)}</h2>
              <p>
                {textProp(
                  section,
                  "subhead",
                  "Product benefits ready for review.",
                )}
              </p>
              <button type="button">
                {textProp(section, "cta_label", "Review page")}
              </button>
            </section>
          );
        }

        if (section.sectionType === "features") {
          const items = listProp(section, "items");
          return (
            <section className="preview-section" key={section.key}>
              <h3>{section.title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          );
        }

        if (section.sectionType === "proof") {
          const trustSignals = listProp(section, "trust_signals");
          return (
            <section className="preview-section" key={section.key}>
              <h3>{section.title}</h3>
              {trustSignals.length > 0 ? (
                <ul>
                  {trustSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              ) : (
                <p>No proof claims added yet.</p>
              )}
            </section>
          );
        }

        if (section.sectionType === "cta") {
          return (
            <section className="preview-section preview-cta" key={section.key}>
              <h3>{section.title}</h3>
              <button type="button">
                {textProp(section, "cta_label", "Continue")}
              </button>
            </section>
          );
        }

        return (
          <section className="preview-section" key={section.key}>
            <h3>{section.title}</h3>
          </section>
        );
      })}
    </div>
  );
}
