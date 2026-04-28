---
name: base/interface-design
kind: base
stage: design-system-pass
---

# Interface Design Base

## Source Lineage

- Primary source: `reference/design/claude-design-skill/repos/interface-design`
- Adopted role: app UI and tool-surface consistency base pack
- Harness role: reserved base pack for `app-ui-design` and operational UI design stages

## Inputs

- Product and audience context.
- Existing design system context when present.
- Validated upstream planning artifacts for the stage that selects this pack.

## Pack Role

Use this pack when the requested surface is an application, dashboard, admin tool, workflow UI, or other repeated-use product interface.

It emphasizes craft, memory, and consistency:

- establish durable spacing, depth, surface, and component decisions
- keep components aligned with those decisions across a run
- prevent button, card, density, and elevation drift

## Design Rules

- Prefer utilitarian density, scanability, and repeated-use ergonomics for operational surfaces.
- Define component-level decisions before expanding the screen set.
- Use a small spacing scale and consistent depth model.
- Keep cards at shallow radii and avoid nested cards.
- Match existing UI vocabulary when the codebase already has one.
- Record reusable decisions as design-system guidance for future token export.

## Allowed Outputs

- Guidance for app UI design-system passes.
- No stable artifacts.

## Forbidden Outputs

- Must not be selected as the default base for generic marketing landing pages.
- Must not emit stable artifacts directly.
- Must not replace `tasks/design-pass` or deterministic compile steps.

## Handoff Shape

This pack is compiled into a backend bundle only when a stage profile or future resolver mode explicitly selects it.

## Failure Behavior

- If an app surface lacks audience, workflow, or existing-system context, stop and request those inputs before design work.
