---
name: styles/designprompts-directions
kind: style
stage: design-system-pass
---

# Designprompts Directions

## Source Lineage

- Primary source: `reference/design/designprompts.dev`
- Landing pattern source: `superpowers/packs/styles/designprompts-directions/references/website-landing-agent-skills`
- Mined role: named visual directions and style vocabulary
- Harness role: composable style and landing-pattern context for `design-system-pass`

## Inputs

- Validated `BrandProfile.visual_directions`.
- Validated `ProductBrief.audiences`.
- Validated `PagePlan.page_goal` and section intent.

## Pack Role

Use this pack to translate brand and product signals into named, inspectable visual directions before `ThemeTokens` are produced.

The pack is a vocabulary, direction, and landing-pattern source. It does not require copying a source prompt verbatim, and it must not override artifact contracts.

## Direction Library

Initial mined directions:

- `saas`: structured, confident, design-forward SaaS with concentrated accent use.
- `professional`: editorial restraint, warm surfaces, typographic elegance, quiet trust.
- `bauhaus`: geometric construction, primary color blocking, hard edges, poster-like hierarchy.
- `industrial`: tactile controls, mechanical surfaces, strict lighting, restrained safety accents.
- `monochrome`: stark editorial contrast, typographic drama, line-based structure.
- `enterprise`: polished B2B trust language, dimensional depth, crisp hierarchy.
- `terminal`: dense command-line mood, dark surfaces, status-driven visual language.

## Landing Pattern Library

Use `superpowers/packs/styles/designprompts-directions/references/website-landing-agent-skills` when the run needs high-visual landing-page patterns, especially video heroes, scroll-driven layouts, GSAP/ScrollTrigger, CSS 3D illusions, or real Three.js/WebGL scenes.

Available reference surfaces:

- `kb/route_index.md`: map industry, visual style, interaction, implementation, and scope signals to prompt IDs.
- `kb/prompt_reuse_matrix.md`: select strong prompts and avoid `stub_or_empty` entries.
- `kb/tech_stack_routes.md`: decide when GSAP, Three.js, or GSAP + Three.js are warranted.
- `scripts/kb_router.py`: optional local router for ad hoc exploration of a raw brief.
- `skills/05-motion-video-interactions/SKILL.md`: video, scroll, parallax, CSS 3D, cursor, loader, and fallback rules.
- `skills/08-gsap-landing-motion/SKILL.md`: GSAP-specific guidance for complex timelines and ScrollTrigger.
- `skills/09-threejs-landing-visuals/SKILL.md`: real Three.js/WebGL guidance; do not use for CSS-only 3D.
- `skills/10-gsap-threejs-composer/SKILL.md`: GSAP-driven WebGL storytelling boundaries.

Selection rules:

- Pick at most one primary prompt pattern and up to three supporting patterns.
- Treat route/topic indexes as coverage for usable candidates, not for every source prompt. Some source prompts are intentionally retained only as `stub_or_empty` lineage records.
- Prefer `high_detail_spec` or `usable_spec` prompts; treat `thin_reference` as secondary only.
- Never use `stub_or_empty` prompts as primary references.
- Extract reusable patterns, not literal page requirements. The validated `ProductBrief`, `BrandProfile`, and `PagePlan` remain authoritative.
- Default to React/Tailwind/CSS or the existing project stack. Add GSAP only for pinned/scrubbed sections, complex timelines, or text/SVG effects that simple motion cannot cover.
- Add Three.js only for explicit WebGL, GLB/glTF, shader, particles, camera motion, or real model requirements. Do not add Three.js for CSS perspective, video backgrounds, static 3D-looking images, or generic "3D feel".
- Record external video/image/font assumptions as asset dependencies for downstream design/spec stages.

## Design Rules

- Pick at most one dominant direction for a P0 landing-page run.
- Use the selected direction to constrain `colors`, `typography`, `spacing`, `radii`, `shadows`, and `motion`.
- Normalize source vocabulary into Fusera `ThemeTokens`; do not introduce new stable artifact shapes.
- Reject direction choices that conflict with the validated `BrandProfile.do_not_use` list.
- Keep visual direction subordinate to content truth and claim policy.
- Translate selected landing patterns into token and motion intent only; do not emit implementation code from this context pack.

## Allowed Outputs

- Guidance for `ThemeTokens`.
- No stable artifacts.

## Forbidden Outputs

- Must not emit `ThemeTokens`, `DesignSpec`, or `PageSpec` directly.
- Must not hard-code a source palette when it conflicts with brand inputs or accessibility gates.
- Must not produce multiple layered styles in P0.

## Handoff Shape

This pack is compiled as style context for `tasks/design-pass`.

## Failure Behavior

- If no direction fits the brief, fall back to restrained professional tokens and record the uncertainty in the design-stage adapter output.
