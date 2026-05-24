---
name: base/web-design-engineer
kind: base
stage: design-system-pass
---

# Web Design Engineer Base

## Source Lineage

- Primary source: `reference/design/web-design-skill`
- Adopted role: portable design-forward web generation base pack
- Harness role: context pack for `design-system-pass`

## Inputs

- Validated `ProductBrief`.
- Validated `BrandProfile`.
- Validated `PagePlan`.
- `ThemeTokens` schema contract.

## Pack Role

Use this pack to raise the baseline for landing-page visual systems before `ThemeTokens` are emitted.

It provides design-engineering guidance only. It does not own stage execution, stable artifacts, deterministic compile behavior, QA verdicts, or publish decisions.

## Design Rules

- Ground the visual direction in the product, audience, and brand profile before choosing colors, type, spacing, or motion.
- Declare the design system as tokens before implementation decisions are made.
- Use brand-derived color systems and perceptual color choices rather than generic blue or purple defaults.
- Prefer responsive layout primitives that preserve hierarchy across mobile and desktop.
- Use honest placeholders for missing assets; do not fabricate logos, proof, testimonials, or user metrics.
- Avoid generic AI-page patterns such as purple-blue gradient heroes, oversized rounded card grids, icon spam, and decorative fake SVG complexity.
- Treat motion as communication; keep durations and easing compatible with the `motion` token contract.

## Allowed Outputs

- Guidance for `ThemeTokens`.
- No stable artifacts.

## Forbidden Outputs

- Must not emit `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, or `PublishVersion` directly.
- Must not bypass `tasks/design-pass`.
- Must not introduce visual requirements that conflict with validated upstream artifacts.

## Handoff Shape

This pack is compiled into the backend bundle as context. The selected primary task remains `tasks/design-pass`, and only that task may produce `ThemeTokens`.

## Failure Behavior

- If design context is insufficient, surface the missing input as a design-stage blocker.
- Do not silently invent brand strategy or proof to satisfy visual direction.
