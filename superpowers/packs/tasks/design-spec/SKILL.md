---
name: tasks/design-spec
kind: task
stage: design-spec-pass
---

# Design Spec Pass

## Inputs

- Validated `ProductBrief`.
- Validated `BrandProfile`.
- Validated `PagePlan`.
- Validated `SectionGraph`.
- Validated `ThemeTokens`.

## Allowed Outputs

- `DesignSpec` only.

## Forbidden Outputs

- Must not emit `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not introduce product-visible preview, compile, publish, database, or app-loader behavior.
- Must not invent section ids that are absent from `SectionGraph.section_order`.
- Must not omit planned sections from `section_design_intents`.

## Design Rules

- Translate upstream artifacts into checkable design directives, not generic inspiration text.
- Treat `DesignSpec` as a project-level design contract for the current run.
- Keep `claim_and_proof_constraints.claim_policy` exactly aligned with `ProductBrief.claim_policy`.
- Cover every section id from `SectionGraph.section_order` exactly once in `section_design_intents`.
- Use `ThemeTokens` to constrain token directives for color, typography, spacing, radii, and shadows.
- Record visual, copy, and proof anti-patterns as concrete guardrails.

## Handoff Shape

Emit one fenced artifact block:

```fusera-artifact-json
{
  "artifact_type": "DesignSpec",
  "schema_version": "1.0.0",
  "producer_stage": "design-spec-pass",
  "input_refs": [
    "<ProductBrief artifact_id>",
    "<BrandProfile artifact_id>",
    "<PagePlan artifact_id>",
    "<SectionGraph artifact_id>",
    "<ThemeTokens artifact_id>"
  ],
  "payload": {
    "visual_thesis": "Product-specific design thesis.",
    "brand_alignment": {
      "traits": ["precise"],
      "audience": "Specific audience",
      "positioning": "Specific positioning"
    },
    "token_directives": {
      "color": {},
      "typography": {},
      "spacing": {},
      "radii": {},
      "shadows": {}
    },
    "layout_directives": {
      "variance": 5,
      "rules": ["Use section-specific hierarchy."]
    },
    "motion_directives": {
      "intensity": 3,
      "rules": ["Use restrained reveal motion."]
    },
    "section_design_intents": [
      {
        "section_id": "hero",
        "layout": "Section-specific layout directive.",
        "media": "Section-specific media directive.",
        "copy": "Section-specific copy directive.",
        "proof": "Section-specific proof directive.",
        "motion": "Section-specific motion directive."
      }
    ],
    "claim_and_proof_constraints": {
      "claim_policy": "proof-required",
      "rules": ["Bind claims to supplied proof inputs."]
    },
    "anti_patterns": {
      "visual": ["generic purple-blue AI glow"],
      "copy": ["unsupported AI cliches"],
      "proof": ["fake metrics"]
    }
  }
}
```

## Failure Behavior

- Fail closed when upstream artifacts are insufficient.
- Fail closed when section ids cannot be addressed exactly.
- Persist rejected `DesignSpec` candidates with validation errors instead of emitting a weaker contract.
