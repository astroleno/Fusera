---
name: modifiers/anti-slop
kind: modifier
stage: design-system-pass
---

# Anti Slop Modifier

## Source Lineage

- Primary sources: `reference/design/impeccable`, `reference/design/web-design-skill`
- Mined role: anti-pattern catalog and quality-hardening modifier
- Harness role: composable guardrail for `design-system-pass`

## Inputs

- Validated upstream planning artifacts.
- Candidate design-system guidance from selected base and style packs.
- `ThemeTokens` schema contract.

## Pack Role

Use this pack to prevent common generic AI frontend failures before theme tokens reach the compiler.

It is a quality modifier, not a producer. The selected primary task remains responsible for emitting `ThemeTokens`.

## Guardrails

- No purple-blue gradient defaulting.
- No gradient text as a primary hierarchy device.
- No side-stripe accent cards or repeated icon-card grids.
- No fake customer logos, testimonials, usage numbers, or proof.
- No nested cards.
- No overuse of generic fonts or one-size-fits-all type scales.
- No gray text on colored backgrounds.
- No pure black or pure white unless a selected style direction explicitly requires stark editorial contrast.
- No hover-only functionality.
- No cramped touch targets below 44px where interactive controls are expected.

## Quality Checks

- Typography uses a deliberate hierarchy with few, clearly separated sizes.
- Color tokens include readable contrast and brand-tinted neutrals.
- Spacing uses a coherent scale and varied rhythm.
- Motion tokens include reduced-motion compatibility.
- Responsive behavior is planned at the component or section level, not only at the viewport level.

## Allowed Outputs

- Constraints and quality notes for `ThemeTokens`.
- No stable artifacts.

## Forbidden Outputs

- Must not emit `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not mutate upstream artifacts.
- Must not loosen artifact validation or verifier gates.

## Handoff Shape

This pack is compiled as modifier context for `tasks/design-pass`.

## Failure Behavior

- If a proposed direction depends on a banned pattern, reject the direction and force a replacement before `ThemeTokens` are accepted.
