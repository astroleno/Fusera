---
name: styles/designprompts-directions
kind: style
stage: design-system-pass
---

# Designprompts Directions

## Source Lineage

- Primary source: `reference/design/designprompts.dev`
- Mined role: named visual directions and style vocabulary
- Harness role: composable style context for `design-system-pass`

## Inputs

- Validated `BrandProfile.visual_directions`.
- Validated `ProductBrief.audiences`.
- Validated `PagePlan.page_goal` and section intent.

## Pack Role

Use this pack to translate brand and product signals into named, inspectable visual directions before `ThemeTokens` are produced.

The pack is a vocabulary and direction source. It does not require copying a designprompts.dev prompt verbatim, and it must not override artifact contracts.

## Direction Library

Initial mined directions:

- `saas`: structured, confident, design-forward SaaS with concentrated accent use.
- `professional`: editorial restraint, warm surfaces, typographic elegance, quiet trust.
- `bauhaus`: geometric construction, primary color blocking, hard edges, poster-like hierarchy.
- `industrial`: tactile controls, mechanical surfaces, strict lighting, restrained safety accents.
- `monochrome`: stark editorial contrast, typographic drama, line-based structure.
- `enterprise`: polished B2B trust language, dimensional depth, crisp hierarchy.
- `terminal`: dense command-line mood, dark surfaces, status-driven visual language.

## Design Rules

- Pick at most one dominant direction for a P0 landing-page run.
- Use the selected direction to constrain `colors`, `typography`, `spacing`, `radii`, `shadows`, and `motion`.
- Normalize source vocabulary into Fusera `ThemeTokens`; do not introduce new stable artifact shapes.
- Reject direction choices that conflict with the validated `BrandProfile.do_not_use` list.
- Keep visual direction subordinate to content truth and claim policy.

## Allowed Outputs

- Guidance for `ThemeTokens`.
- No stable artifacts.

## Forbidden Outputs

- Must not emit `ThemeTokens` directly.
- Must not hard-code a source palette when it conflicts with brand inputs or accessibility gates.
- Must not produce multiple layered styles in P0.

## Handoff Shape

This pack is compiled as style context for `tasks/design-pass`.

## Failure Behavior

- If no direction fits the brief, fall back to restrained professional tokens and record the uncertainty in the design-stage adapter output.
