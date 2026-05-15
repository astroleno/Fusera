import type {
  CompiledPage,
  CompiledPageSection,
} from "@/lib/page-spec/compile-page";
import type { CSSProperties } from "react";

function textProp(section: CompiledPageSection, key: string, fallback: string) {
  const value = section.props[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function listProp(section: CompiledPageSection, key: string) {
  const value = section.props[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export default function PagePreview({ page }: { page: CompiledPage }) {
  const themeStyle = {
    "--preview-bg": page.theme.colors.background,
    "--preview-surface": page.theme.colors.surface,
    "--preview-text": page.theme.colors.text,
    "--preview-accent": page.theme.colors.accent,
  } as CSSProperties;

  return (
    <div className="generated-preview" style={themeStyle}>
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

        if (section.sectionType === "problem") {
          const supportingPoints = listProp(section, "supporting_points");
          return (
            <section className="preview-section" key={section.key}>
              <h3>{textProp(section, "headline", section.title)}</h3>
              <p>
                {textProp(
                  section,
                  "body",
                  "Buyer context is ready for review.",
                )}
              </p>
              {supportingPoints.length > 0 ? (
                <ul>
                  {supportingPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        }

        if (section.sectionType === "proof") {
          const trustSignals = listProp(section, "trust_signals");
          const proofSources = listProp(section, "proof_source_labels");
          return (
            <section className="preview-section" key={section.key}>
              <h3>{section.title}</h3>
              {trustSignals.length > 0 || proofSources.length > 0 ? (
                <ul>
                  {trustSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                  {proofSources.map((source) => (
                    <li key={source}>{source}</li>
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

        if (section.sectionType === "faq") {
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

        return (
          <section className="preview-section" key={section.key}>
            <h3>{section.title}</h3>
          </section>
        );
      })}
    </div>
  );
}
