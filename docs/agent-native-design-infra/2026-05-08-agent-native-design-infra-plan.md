# Agent-Native Design Infra Implementation Plan

Date: 2026-05-08
Status: Revised after document-review findings
Scope: Land the smallest verifiable agent-native design infra path for Fusera without breaking the existing landing-page harness or app preview path.

## 1. Decision Summary

The direction is still correct: agents should make design judgments, while code owns the stable rendering grammar and publish gates.

The plan is now explicitly split into:

- **PR1: harness-only `DesignSpec` proof.** No Supabase migration, no app preview changes, no product-visible promise.
- **PR1B: product-visible `DesignSpec`.** Only after PR1 proves runtime plumbing, add app schemas, deterministic builder support, DB refs, and loader/tests.
- **Phase 2A: preview validation proof.** Improve current registry/compiler reliability before adding component selection.
- **Phase 2B/C/D: shared catalog, `component_id` pilot, then motion.** Add these in slices, not as one large renderer rewrite.
- **Later: evidence-backed taste review.** Pre-compile taste is advisory forever; blocking taste belongs after compiled preview evidence and can block publish/promotion, not initial compile.

This keeps the architecture agent-native without pretending the whole platform exists on day one.

## 2. Product Principle

Fusera should not become a generic chat-based website builder. The external product remains:

```text
guided intake -> generated landing page -> bounded edits -> preview -> publish
```

The internal system becomes agent-native:

- Agents own intent interpretation, design direction, component selection, copy, critique, and repair.
- Code owns schemas, supported components, motion presets, compilation, validation, preview binding, and publish control.
- Artifacts are the contract between agent judgment and deterministic rendering.

The moat is controlled creative assembly with a taste layer and a reliable release path, not arbitrary model-written TSX.

## 3. Current Baseline

The current harness spine is:

```text
normalize-input
-> product-and-brand-brief
-> page-strategy
-> section-planning
-> design-system-pass
-> page-compile
-> verify-publishable-page
-> publish-preview
```

The current stable artifacts are:

```text
ProductBrief
BrandProfile
PagePlan
SectionGraph
ThemeTokens
PageSpec
QAReport
PublishVersion
```

The current app generation path is:

```text
buildPageArtifacts
-> generatePageTask
-> artifacts table
-> generation_runs.latest_*_ref
```

The current app preview path is:

```text
loadProjectPreview
-> load latest SectionGraph + ThemeTokens
-> compilePage
-> PagePreview
```

Important constraints:

- `PageSpec`, `QAReport`, and `PublishVersion` are runner-owned today.
- Other harness stage outputs are adapter/model-owned unless the runner is explicitly changed.
- The app-side deterministic builder currently produces only `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens`.
- `loadProjectPreview` currently reads `latest_section_graph_ref` and `latest_theme_tokens_ref`.
- Harness and app compilers can drift if they do not share the same section grammar.

## 4. PR1 Boundary: Harness-Only

PR1 must be harness-only.

It should prove:

- The harness can produce `DesignSpec`.
- The harness can validate and persist `DesignSpec`.
- Real adapter extraction can return a valid `DesignSpec`.
- Invalid `DesignSpec` candidates are persisted as rejected artifacts.
- Existing `ThemeTokens`, `PageSpec`, `QAReport`, and `PublishVersion` behavior remains compatible.

It should not:

- Add `latest_design_spec_ref`.
- Change app deterministic generation.
- Change `loadProjectPreview`.
- Change page compile inputs.
- Add `TasteReport`.
- Add `PageRecipe`.
- Add runtime catalog artifacts.

This avoids the half-product-visible state where `DesignSpec` exists in DB columns but does not affect generation, preview, or UI.

## 5. PR1 Harness Pipeline

Add one model-owned stage after the current `design-system-pass`:

```text
normalize-input
-> product-and-brand-brief
-> page-strategy
-> section-planning
-> design-system-pass
-> design-spec-pass
-> page-compile
-> verify-publishable-page
-> publish-preview
```

Why after `design-system-pass` first:

- It avoids changing `design-system-pass` into a multi-artifact stage immediately.
- It keeps current `ThemeTokens` behavior compatible.
- It lets PR1 prove `DesignSpec` validation and persistence without taking over compile.

Later, once `DesignSpec` is stable, `design-system-pass` can be refactored so `DesignSpec` informs `ThemeTokens`.

## 6. Runtime Ownership Model

Do not claim an artifact is runner-owned unless the runner actually owns it.

| Item | Phase | Runtime form | Owner |
| --- | --- | --- | --- |
| `DesignSpec` | PR1 | Stable artifact | Model-owned adapter output |
| `ThemeTokens` | Existing | Stable artifact | Current adapter/model path |
| Section catalog | Phase 2B | Shared source-code metadata | Code-owned, not runtime artifact |
| Motion preset catalog | Phase 2D | Shared source-code metadata | Code-owned, not runtime artifact |
| `SectionGraph.component_id` | Phase 2C | Optional canonical field | Model-owned section-planning output |
| `SectionGraph.motion_preset_id` | Phase 2D | Optional canonical field | Model-owned section-planning output |
| `TasteReport` | Later | Advisory artifact first | Model-owned, evidence-dependent |
| `PageRecipe` | Later | Stable artifact only if needed | Model-owned assembly artifact |

Do not add `catalog-materialization` as a normal `codex` stage in the MVV. If runtime catalog artifacts become necessary, first add explicit runner-owned materialization support or a per-stage ownership map.

## 7. DesignSpec Contract

`DesignSpec` is the structured version of a project-level design contract. It should not merely repeat `BrandProfile` or `ProductBrief`; it must translate those upstream artifacts into design directives that can be checked.

Producer stage: `design-spec-pass`

PR1 uses the same strict contract as the PR1 implementation plan. In PR1, `DesignSpec` is not allowed to loosen section coverage, substitute stricter claim policy with rationale, or rename token/anti-pattern fields; exact coverage and exact claim-policy alignment are runner-enforced.

Required upstream artifacts:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`

Minimum payload:

- `visual_thesis`
- `brand_alignment`
- `token_directives`
- `layout_directives`
- `motion_directives`
- `section_design_intents`
- `claim_and_proof_constraints`
- `anti_patterns`

Schema requirements:

- `visual_thesis` must be non-empty and concrete.
- `section_design_intents` must be non-empty.
- `section_design_intents[].section_id` must exactly cover the validated `SectionGraph.section_order` set.
- `section_design_intents[].section_id` must not contain duplicates.
- Each section intent must include layout, media, copy, proof, and motion guidance.
- `token_directives` must include color, typography, spacing, radii, and shadows guidance.
- `claim_and_proof_constraints` must include the upstream claim policy and proof handling rules.
- `anti_patterns` must contain non-empty `visual`, `copy`, and `proof` categories.

Runner invariants beyond JSON Schema:

- `section_design_intents[].section_id` must exactly match the validated `SectionGraph.section_order` set.
- No `section_design_intents[].section_id` may be duplicated.
- No `SectionGraph.section_order` section may be omitted.
- No unknown section id may be introduced.
- `claim_and_proof_constraints.claim_policy` must exactly match `ProductBrief.claim_policy` in PR1.
- `input_refs` must include the current validated `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens` artifact ids.
- `anti_patterns.visual`, `anti_patterns.copy`, and `anti_patterns.proof` must not be empty.

Example shape:

```json
{
  "visual_thesis": "Product-first landing page with restrained editorial polish and visible utility in the first viewport.",
  "brand_alignment": {
    "traits": ["precise", "confident"],
    "audience": "Urban commuters",
    "positioning": "A durable bottle for everyday carry"
  },
  "token_directives": {
    "color": {
      "base": "warm neutral",
      "accent": "deep green",
      "banned": ["neon gradients", "purple-blue AI glow"]
    },
    "typography": {
      "display": "distinctive sans",
      "body": "high-legibility sans",
      "banned": ["Inter default", "generic serif"]
    },
    "spacing": {
      "density": 4,
      "rules": ["first viewport must leave next section hinted"]
    },
    "radii": {
      "rules": ["controls at 8px or less unless product imagery needs softer framing"]
    },
    "shadows": {
      "rules": ["no neon outer glow", "use depth only for hierarchy"]
    }
  },
  "layout_directives": {
    "variance": 7,
    "rules": ["product visible in first viewport", "no generic 3-card feature row"]
  },
  "motion_directives": {
    "intensity": 5,
    "rules": ["transform and opacity only", "reduced-motion fallback required"]
  },
  "section_design_intents": [
    {
      "section_id": "hero",
      "layout": "asymmetric product poster with product image as primary signal",
      "media": "use supplied product image as inspectable foreground media",
      "copy": "headline should be product name or literal offer",
      "proof": "do not introduce quantified claims",
      "motion": "image-led reveal, no continuous motion required"
    }
  ],
  "claim_and_proof_constraints": {
    "claim_policy": "proof-required",
    "rules": ["bind proof claims to supplied trust signals", "avoid fake metrics"]
  },
  "anti_patterns": {
    "visual": ["purple-blue AI glow", "generic 3-card feature row"],
    "copy": ["AI copy cliches"],
    "proof": ["unsupported proof", "fake metrics"]
  }
}
```

## 8. PR1 Implementation

### 8.1 Stage Profile

Add:

```yaml
- stage: design-spec-pass
  primary_task: tasks/design-spec
  allowed_auxiliary_tasks: []
  allowed_outputs:
    - DesignSpec
  default_verifier: none
  default_backend: codex
  next_stage: page-compile
```

Update:

```yaml
- stage: design-system-pass
  next_stage: design-spec-pass
```

Do not change `page-compile` inputs in PR1.

### 8.2 Registry

Add `tasks/design-spec`.

Required artifacts:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`

Produced artifacts:

- `DesignSpec`

Do not add `verifiers/taste-review` in PR1.

### 8.3 Contracts And Runner Mapping

Add:

```text
superpowers/contracts/artifacts/design-spec.schema.json
```

Update:

```text
superpowers/runner/validate-artifact.ts
```

Add `DesignSpec` to:

- `ARTIFACT_FILE_NAMES`
- `SCHEMA_FILE_NAMES`

Add additional invariant validation where JSON Schema cannot express cross-artifact checks.

### 8.4 Adapter Updates

Both mock and real adapter paths must know how to produce `DesignSpec`.

Acceptance requires:

- Mock run materializes validated `DesignSpec`.
- Real adapter smoke produces a valid `DesignSpec`.
- Real adapter invalid-candidate smoke persists rejected `DesignSpec`.
- Existing publish flow still reaches `PublishVersion`.

## 9. PR1B: Product-Visible DesignSpec

PR1B is optional but should be separate from PR1.

Goal: make `DesignSpec` visible to app generation and storage without yet affecting preview compile.

Tasks:

- Add app-side `designSpecPayloadSchema`.
- Add `DesignSpecPayload` type.
- Update `buildPageArtifacts` to produce deterministic placeholder `DesignSpec`.
- Update `GeneratedPageArtifacts` tuple and `latestRefs`.
- Update `generatePageTask` DB insert.
- Add Supabase migration:

```sql
alter table generation_runs add column latest_design_spec_ref text;
```

- Update generation run update to write `latest_design_spec_ref`.
- Update tests for app deterministic generation and persistence.

Loader behavior:

- `loadProjectPreview` may optionally load `DesignSpec` for diagnostics or future renderer hints.
- It must still compile from `SectionGraph + ThemeTokens`.
- Missing `DesignSpec` must not break legacy previews.

Done when:

- App unit tests pass.
- Existing preview still works.
- `latest_design_spec_ref` is written for new completed app-side generation runs.

## 10. Phase 2A: Registry Validation And Browser Proof

Goal: make the current preview path more reliable before adding component selection.

Tasks:

- Add required-prop validation to the existing registry/compiler path.
- Make unsupported section types and missing required props fail before render.
- Keep `PagePreview` rendering structure unchanged unless a tiny extraction is needed for testability.
- Add app unit tests for missing props and unsupported section types.
- Add or strengthen browser proof for generated preview.

Browser proof should verify:

- Preview renders on desktop.
- Preview renders on mobile.
- Hero and CTA are visible.
- Product image renders when supplied.
- No horizontal overflow on mobile.

Done when:

- Current preview path is safer without introducing `component_id`.
- No app/harness contract changes are required.

## 11. Phase 2B: Shared Section Grammar

Goal: create one catalog grammar shared by app preview compile and harness `PageSpec` compile.

The catalog must not fork between `src` and `superpowers`.

Recommended structure:

```text
src/lib/page-spec/catalog/
  section-catalog.ts
  prop-schemas.ts
```

Rules for shared catalog modules:

- Pure TypeScript only.
- No React imports.
- No Next.js imports.
- No browser-only APIs.
- No `@/` imports inside the catalog modules if the harness imports them by relative path.

Harness compiler should import the same catalog source or a generated artifact from it. Do not hardcode a second component map in `superpowers/runner/compile-page.ts`.

If importing from `src` into harness becomes awkward, create a dedicated shared directory and update `tsconfig.json`/app imports deliberately. Do not silently duplicate catalog metadata.

Done when:

- App compile and harness compile resolve section/component metadata from one source of truth.
- A test fails if the app and harness supported section lists drift.

## 12. Phase 2C: Hero Component Selection Pilot

Goal: prove `component_id` with the smallest useful surface.

Canonical contract decision:

- If `component_id` is emitted by model-owned `SectionGraph`, update the canonical harness schema.
- Do not make this an app-only hidden field while calling it model-owned.

Required updates:

- `superpowers/contracts/artifacts/section-graph.schema.json`
- `src/lib/domain/page-artifacts.ts`
- `superpowers/packs/tasks/section-graph/SKILL.md`
- mock adapter SectionGraph output
- real adapter prompt expectations
- app compiler
- harness compiler

Pilot scope:

- Only hero needs model-selected `component_id` first.
- Other sections fall back to defaults.
- Use `component_id` everywhere.
- Do not introduce `variant_id` in new contracts.

Example:

```json
{
  "section_id": "hero",
  "section_type": "hero",
  "component_id": "hero.poster-product",
  "title": "Atlas Bottle",
  "props": {}
}
```

Done when:

- Legacy SectionGraph without `component_id` still compiles.
- Hero with known `component_id` compiles.
- Unknown `component_id` is rejected before render.
- App and harness compilers agree on the selected hero component.

## 13. Phase 2D: Motion Preset Pilot

Add motion after component selection proves useful.

Tasks:

- Add shared `motion-presets.ts`.
- Add optional canonical `motion_preset_id` to `SectionGraph.nodes[]`.
- Pilot on hero only.
- Use CSS-first motion.
- Add `prefers-reduced-motion` behavior.

Do not add Framer Motion or GLB in this phase.

Done when:

- Known hero `motion_preset_id` resolves.
- Unknown motion preset fails before render.
- Motion has reduced-motion fallback.
- Browser proof still passes.

## 14. Phase 3: PageRecipe Decision

Do not introduce `PageRecipe` by default.

First test whether extended `SectionGraph` is enough:

- It already owns section ids, types, order, props, proof bindings, and claim policy.
- Adding `component_id` and `motion_preset_id` may cover the first assembly use case.
- Avoid duplicating section id, type, props, token refs, and proof refs in a new artifact until a real consumer needs it.

Add `PageRecipe` only if one of these becomes true:

- Scoped regeneration needs a separate render assembly artifact.
- Multiple render targets need different assemblies from the same `SectionGraph`.
- The app needs to compare several component/motion assemblies for the same narrative.
- Taste repair needs to patch render choices without touching narrative structure.

If introduced later, `PageRecipe` should reference `SectionGraph` rather than duplicate it.

## 15. Taste Review And Evidence Chain

### 15.1 Pre-Compile Taste

Pre-compile taste is always advisory.

Before screenshots or DOM/layout evidence exists, a reviewer can inspect:

- `DesignSpec`
- `SectionGraph`
- shared component metadata
- planned component and motion choices

That can catch obvious planning issues, but it cannot prove visual quality. It must not stop compile.

### 15.2 Evidence-Backed Taste

Evidence-backed taste runs after compiled preview evidence exists.

Evidence can include:

- Desktop screenshot.
- Mobile screenshot.
- DOM/layout evidence from the compiled preview.
- Browser smoke evidence proving no overflow, missing media, or broken hierarchy.

Evidence-backed `TasteReport` can block publish or promotion. It should not be described as stopping the initial compile, because its evidence depends on compiled output.

### 15.3 Transition Rules

```text
pre-compile advisory finding -> compile continues
evidence-backed pass -> publish/promotion may continue
evidence-backed needs-repair -> route to repair or require approval
evidence-backed blocked -> block publish/promotion
repair failed -> halt with needs_review
missing evidence -> advisory only
```

Repair targets:

- Component issue: patch `SectionGraph.component_id`.
- Motion issue: patch `SectionGraph.motion_preset_id`.
- Brand/tone issue: rerun `design-spec-pass`.
- Copy/claim issue: rerun section planning or scoped copy generation.
- Visual evidence issue: rerun assembly or mark `needs_review`.

Do not merge `TasteReport` into `QAReport`. `QAReport` remains the publish control gate.

## 16. Agent Roles By Phase

### PR1

Active role:

- `Brand Spec Agent`: produces `DesignSpec` from existing upstream artifacts.

Deferred:

- `Taste Reviewer`
- `Repair Agent`
- `Design Director`
- `Release Agent` changes

### Phase 2A

Active role:

- none required; this is compiler hardening.

### Phase 2B/C/D

Active role:

- `Design Director`, first as deterministic defaults, then as model-selected hero `component_id`.

Catalog materialization is code-owned source metadata, not a runtime agent.

### Later

Add:

- `Taste Reviewer`
- `Repair Agent`
- `Copy Agent` as a separate role if copy quality requires it

Keep agent roles internal. They are workflow responsibilities, not user-facing personas.

## 17. Implementation Phases

### Phase 0: Fusera Design Standard

Goal: create the human-readable taste standard without touching runtime.

This is an independent docs-only PR0 candidate. It is not required before PR1, must not be bundled into PR1, and the PR1 `tasks/design-spec` pack must remain self-contained without depending on a root `DESIGN.md`.

Tasks:

- Add root `DESIGN.md`.
- Encode Fusera's design bans, motion rules, typography rules, and section composition principles.
- Keep it as documentation only.

Done when:

- The design standard can be used as prompt context for `DesignSpec`.

### PR1: Harness-Only DesignSpec Runtime Proof

Goal: add one new harness artifact and prove it does not break the current harness pipeline.

Tasks:

- Add `design-spec.schema.json`.
- Add `tasks/design-spec/SKILL.md`.
- Add `design-spec-pass` stage.
- Update `registry.yaml`.
- Update `validate-artifact.ts` mappings.
- Update mock adapter to produce `DesignSpec`.
- Update real adapter extraction expectations for `DesignSpec`.
- Add tests for valid and rejected `DesignSpec`.
- Add real-adapter smoke for valid and rejected candidates.

Done when:

- `ci mock` passes.
- Existing publish flow still reaches `PublishVersion`.
- Mock run persists validated `DesignSpec`.
- Invalid mock `DesignSpec` is persisted as rejected.
- Real adapter smoke can produce a valid `DesignSpec`.
- Real adapter invalid-candidate smoke persists rejected `DesignSpec`.

### PR1B: Product-Visible DesignSpec

Goal: add app persistence and latest refs after harness proof.

Tasks:

- Add app domain schema and type.
- Add deterministic app-side `DesignSpec` builder.
- Persist `DesignSpec` through `generatePageTask`.
- Add `latest_design_spec_ref`.
- Keep preview compile unchanged.

Done when:

- App generation stores `DesignSpec`.
- Loader remains backward compatible.
- Existing preview tests still pass.

### Phase 2A: Compiler Validation Proof

Goal: make current preview generation safer before adding new fields.

Tasks:

- Add required-prop validation.
- Add unsupported-section rejection.
- Add unit tests.
- Add/strengthen browser preview proof.

Done when:

- Broken section props fail early.
- Current generated pages still render.

### Phase 2B: Shared Catalog Grammar

Goal: one component grammar for app and harness.

Tasks:

- Add pure shared catalog module.
- Update app compiler and harness compiler to consume it.
- Add drift test.

Done when:

- App and harness supported section/component lists cannot drift silently.

### Phase 2C: Hero Component Selection

Goal: prove canonical `component_id` on one section type.

Tasks:

- Update canonical `SectionGraph` schema.
- Update app schema.
- Update section-planning pack and adapters.
- Support hero `component_id`.

Done when:

- Hero component selection works across app and harness.
- Legacy artifacts still work.

### Phase 2D: Hero Motion Preset

Goal: prove canonical `motion_preset_id` after component selection.

Tasks:

- Add shared motion preset metadata.
- Update canonical `SectionGraph` schema.
- Support hero `motion_preset_id`.
- Add reduced-motion behavior.

Done when:

- Known motion preset resolves.
- Unknown preset rejects.
- Browser proof passes.

### Phase 3: PageRecipe Decision

Goal: decide with evidence whether a separate assembly artifact is needed.

Tasks:

- Try scoped regeneration using extended `SectionGraph`.
- Measure whether repair/variant workflows need separate assembly state.
- Add `PageRecipe` only with a concrete consumer.

Done when:

- The team has evidence for or against `PageRecipe`.

### Phase 4: Evidence-Backed Taste Review

Goal: introduce taste review after preview evidence exists.

Tasks:

- Add screenshot or DOM/layout evidence.
- Add `taste-report.schema.json`.
- Add `verifiers/taste-review/SKILL.md`.
- Keep early mode advisory.
- Add publish/promotion blocking only with evidence.

Done when:

- Taste findings cite concrete evidence.
- Blocking mode can route repair or `needs_review`.

### Phase 5: Publish Hardening

Goal: turn the preview/publish skeleton into a real hosted release path.

Tasks:

- Persist publish records.
- Add hosted preview URL integration.
- Add publish version history.
- Add rollback.
- Keep `QAReport` binding as the final publish control gate.

Done when:

- A generated page can be published to a real hosted preview.
- Publish requires exact `QAReport` to `PageSpec` and preview build binding.
- A previous publish version can be restored.

## 18. Test Strategy

Harness tests:

- `ci mock` still passes.
- New `DesignSpec` schema validates happy path and rejects invalid artifacts.
- Stage sequence resolves with `design-spec-pass`.
- Rejected `DesignSpec` remains persisted.
- Existing `PageSpec`, `QAReport`, and `PublishVersion` behavior remains unchanged.
- Real-adapter smoke covers valid and rejected `DesignSpec` candidates.

App unit tests:

- Existing deterministic generation still produces current artifacts before PR1B.
- PR1B app generation persists `DesignSpec`.
- Required-prop validation fails before render.
- Unknown `component_id` rejection after Phase 2C.
- Legacy `SectionGraph` fallback after Phase 2C.
- Motion preset fallback after Phase 2D.

Browser tests:

- Intake to preview still renders.
- Generated preview shows hero and CTA.
- Product image renders when supplied.
- Mobile viewport has no horizontal overflow.
- Motion does not block interaction after Phase 2D.

Later taste tests:

- Findings cite screenshot or DOM evidence.
- Missing evidence keeps report advisory.
- Unsupported claims are flagged.
- Blocking findings block publish/promotion and route to repair or `needs_review`.

## 19. Risks And Mitigations

### Risk: Harness-only proof is mistaken for product-visible behavior

Mitigation: PR1 explicitly avoids Supabase refs and app preview changes. PR1B is the product-visible step.

### Risk: Runtime ownership mismatch

Mitigation: Do not introduce runner-owned catalog artifacts until the runner has explicit ownership support.

### Risk: DesignSpec validates empty taste language

Mitigation: Require section-specific design intents, token-facing directives, claim/proof constraints, and anti-pattern categories.

### Risk: App and harness catalogs drift

Mitigation: Use one shared pure TypeScript catalog source or a generated derivative, with a drift test.

### Risk: PageRecipe duplicates SectionGraph

Mitigation: Extend `SectionGraph` first. Add `PageRecipe` only when a real consumer requires separate assembly state.

### Risk: Taste gate blocks before evidence exists

Mitigation: Pre-compile taste is advisory. Evidence-backed taste can block publish/promotion only after compiled preview evidence exists.

### Risk: Terminology drift

Mitigation: Use `component_id` everywhere. Do not use `variant_id` in new contracts.

## 20. Recommended First Runtime PR

The first runtime PR is harness-only `DesignSpec`.

Files to add:

- `superpowers/contracts/artifacts/design-spec.schema.json`
- `superpowers/packs/tasks/design-spec/SKILL.md`

Files to update:

- `superpowers/packs/stage-profiles.yaml`
- `superpowers/packs/registry.yaml`
- `superpowers/runner/validate-artifact.ts`
- `superpowers/adapters/codex/adapter.ts`
- `superpowers/adapters/codex/extract-artifacts.ts` if extraction requires explicit type handling
- relevant harness tests

Explicitly not included:

- Supabase migration
- root `DESIGN.md`
- app deterministic `DesignSpec`
- `TasteReport`
- `PageRecipe`
- runtime `SectionCatalog`
- runtime `MotionPresetCatalog`
- blocking taste gate
- publish behavior changes

Acceptance:

- `node --experimental-strip-types superpowers/runner/cli.ts ci mock` passes.
- Mock run materializes validated `DesignSpec`.
- Rejected `DesignSpec` candidates persist under rejected artifacts.
- Real-adapter smoke can produce valid `DesignSpec`.
- Real-adapter invalid-candidate smoke persists rejected `DesignSpec`.
- Existing publish flow still works.

## 21. Open Decisions

### Decision 1: Is root `DESIGN.md` part of PR1?

Closed: no. PR1 is harness-only and the `tasks/design-spec` pack must be self-contained. Root `DESIGN.md` can be a separate PR0 docs-only change before or after PR1.

### Decision 2: Should PR1B make `DesignSpec` visible in UI?

Recommended: persist the ref first; display/debug UI can come later.

### Decision 3: Should `DesignSpec` eventually feed `ThemeTokens`?

Recommended: yes, but not in PR1. First prove that `DesignSpec` can be generated and validated.

### Decision 4: Where should shared catalog metadata live?

Recommended: one pure TypeScript source shared by app and harness. Choose `src/lib/page-spec/catalog` only if harness imports stay clean; otherwise move to a deliberate shared directory and update `tsconfig.json`.

### Decision 5: Should `TasteReport` ever block compile?

Recommended: no. Pre-compile taste is advisory; evidence-backed taste can block publish/promotion.

### Decision 6: Should `PageRecipe` exist?

Recommended: decide after Phase 2C/2D. Extended `SectionGraph` may be enough for the first component and motion assembly path.
