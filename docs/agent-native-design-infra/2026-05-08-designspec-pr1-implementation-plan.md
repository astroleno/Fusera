# DesignSpec PR1 Implementation Plan

Date: 2026-05-08
Status: Ready for implementation planning
Parent plan: `docs/agent-native-design-infra/2026-05-08-agent-native-design-infra-plan.md`
Scope: Harness-only `DesignSpec` proof. No Supabase migration, no app preview changes, no product-visible behavior.

## 1. Goal

Add `DesignSpec` as a new model-owned stable artifact in the harness and prove it can be produced, validated, rejected, inspected, and carried through the existing harness publish pipeline without changing app-side generation, preview behavior, or product-visible publish semantics.

PR1 succeeds when:

- `design-spec-pass` runs after `design-system-pass`.
- Mock adapter produces a validated `DesignSpec`.
- Real adapter smoke can produce a validated `DesignSpec`.
- Invalid `DesignSpec` candidates persist under `artifacts/rejected/`.
- Existing `ThemeTokens -> PageSpec -> QAReport -> PublishVersion` behavior remains compatible.
- `node --experimental-strip-types superpowers/runner/cli.ts ci mock` passes.

## 2. Non-Goals

PR1 must not include:

- Supabase migration.
- `latest_design_spec_ref`.
- app-side `DesignSpecPayload`.
- deterministic app `buildPageArtifacts` changes.
- `loadProjectPreview` changes.
- `TasteReport`.
- `PageRecipe`.
- `SectionCatalog` or `MotionPresetCatalog` runtime artifacts.
- `component_id` or `motion_preset_id`.
- root `DESIGN.md`.
- product-visible publish semantics changes.

The `tasks/design-spec` pack must be self-contained in PR1. A root `DESIGN.md` can land before or after PR1, but PR1 should not depend on it.

## 3. Files

Add:

- `superpowers/contracts/artifacts/design-spec.schema.json`
- `superpowers/packs/tasks/design-spec/SKILL.md`

Update:

- `superpowers/packs/stage-profiles.yaml`
- `superpowers/packs/registry.yaml`
- `superpowers/runner/validate-artifact.ts`
- `superpowers/adapters/codex/adapter.ts`
- `superpowers/runner/verify-p0-harness.ts`
- `superpowers/runner/verify-live-codex-quality.ts`
- `superpowers/runner/verify-live-codex-matrix.ts`
- Any fixture or expected artifact-count checks that assume exactly 8 stable artifacts.

Possibly update:

- `superpowers/adapters/codex/extract-artifacts.ts` only if explicit type filtering is added. Current generic fenced JSON extraction should already support `DesignSpec`.
- `superpowers/runner/inspect-run.ts` if rejected artifact visibility is added in PR1. At minimum, the verifier must report the rejected `DesignSpec` path when invalid-candidate checks pass.

## 4. Dependency Map

```text
DesignSpec schema
  -> validate-artifact mappings
  -> mock adapter makeDesignSpec
  -> stage profile + registry
  -> artifact count / quality verifier updates
  -> real adapter smoke fixtures
  -> ci mock
```

Critical path:

```text
schema -> mappings -> stage/registry -> mock adapter -> ci mock
```

Parallelizable after schema shape is stable:

- Pack `SKILL.md`
- `verify-live-codex-quality` scoring update
- `verify-p0-harness` real adapter smoke update

## 5. Implementation Tasks

| Task | Effort | Owner | Depends On | Done Criteria |
| --- | --- | --- | --- | --- |
| Confirm baseline | 0.5h | implementer | none | `git status --short` reviewed; optional current `ci mock` baseline recorded |
| Add schema | 2-3h | implementer | none | `design-spec.schema.json` validates the target envelope and payload shape |
| Register artifact type | 0.5h | implementer | schema | `DesignSpec` maps to `design-spec.json` and schema file in `validate-artifact.ts` |
| Add invariant checks | 1-2h | implementer | schema | `validateArtifactInvariants` rejects weak `DesignSpec` payloads that schema cannot fully guard |
| Add design-spec pack | 1h | implementer | schema | `tasks/design-spec/SKILL.md` states inputs, outputs, forbidden outputs, and fenced artifact shape |
| Wire stage profile | 0.5h | implementer | pack | `design-system-pass.next_stage = design-spec-pass`; new stage outputs only `DesignSpec` |
| Wire registry | 1-2h | implementer | pack | `tasks/design-spec` resolves with required upstream artifacts and output contract |
| Update mock adapter | 2h | implementer | schema | `produceMockArtifactCandidates` returns `DesignSpec` for `design-spec-pass` |
| Update verifier expectations | 2-4h | implementer | stage + mock | `verify-p0-harness` and live quality tools expect/scoring include `DesignSpec` where applicable |
| Add real adapter smoke | 2-4h | implementer | schema + registry | positive and invalid real adapter scripts cover `DesignSpec` candidate extraction and rejection |
| Run verification | 1-2h | implementer | all | unit/harness commands pass or failures are documented |

Expected total: 12-20 focused engineering hours.

## 6. DesignSpec Schema

Schema file:

```text
superpowers/contracts/artifacts/design-spec.schema.json
```

Envelope requirements should match existing stable artifacts:

- `artifact_type = "DesignSpec"`
- `schema_version`
- `artifact_id`
- `run_id`
- `status`
- `producer_stage = "design-spec-pass"`
- `input_refs`
- `validation`
- `payload`

Payload requirements:

- `visual_thesis`: string, non-empty.
- `brand_alignment`: object with `traits`, `audience`, and `positioning`.
- `token_directives`: object with `color`, `typography`, `spacing`, `radii`, and `shadows`.
- `layout_directives`: object with `variance` and `rules`.
- `motion_directives`: object with `intensity` and `rules`.
- `section_design_intents`: non-empty array.
- `claim_and_proof_constraints`: object with `claim_policy` and `rules`.
- `anti_patterns`: object with `visual`, `copy`, and `proof`.

Recommended strictness:

- Use `additionalProperties: false` at top-level payload objects where practical.
- Keep arrays `minItems: 1` for design directives and anti-pattern categories.
- Use existing claim policies: `proof-required`, `low-proof`, `no-claims`.
- Keep section intent fields required: `section_id`, `layout`, `media`, `copy`, `proof`, `motion`.

Supported schema keyword subset:

- The current local validator in `superpowers/runner/validate-artifact.ts` is not a full JSON Schema implementation.
- Use only supported keywords unless PR1 also adds validator support.
- Safe keywords today: `const`, `enum`, `type`, `minLength`, `minItems`, `items`, `required`, `properties`, `additionalProperties`, and `anyOf`.
- Do not rely on unsupported keywords such as `pattern`, `maxItems`, `uniqueItems`, `allOf`, `oneOf`, `not`, `contains`, `dependentRequired`, `if/then/else`, `minimum`, or `maximum` unless support is explicitly implemented and tested.

Schema cannot fully prove that `section_id` exists in the upstream `SectionGraph`. PR1 should still require a runner-side invariant for this before the artifact is accepted.

## 7. Runner Invariants

Update:

```text
superpowers/runner/validate-artifact.ts
```

Minimum local invariants in `validateArtifactInvariants`:

- `DesignSpec.payload.section_design_intents` must not be empty.
- `DesignSpec.payload.anti_patterns.visual` must not be empty.
- `DesignSpec.payload.anti_patterns.copy` must not be empty.
- `DesignSpec.payload.anti_patterns.proof` must not be empty.
- `DesignSpec.payload.claim_and_proof_constraints.claim_policy` must be one of the supported claim policies.

Cross-artifact invariants:

- `section_design_intents[].section_id` must exactly match the validated upstream `SectionGraph.section_order` set.
- No `section_design_intents[].section_id` may be duplicated.
- No `SectionGraph.section_order` section may be omitted.
- No unknown section id may be introduced.
- `claim_and_proof_constraints.claim_policy` must exactly match upstream `ProductBrief.claim_policy` in PR1.
- `input_refs` must include the current validated `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens` artifact ids.

Implementation option for cross-artifact checks:

- Add a helper near `persistAdapterArtifactCandidates` in `superpowers/runner/run-stage.ts`, because that path has access to `runDir`, `stage`, and the candidate being persisted.
- Use `readValidatedArtifact(runDir, "ProductBrief")`, `readValidatedArtifact(runDir, "BrandProfile")`, `readValidatedArtifact(runDir, "PagePlan")`, `readValidatedArtifact(runDir, "SectionGraph")`, and `readValidatedArtifact(runDir, "ThemeTokens")` only when candidate `artifact_type === "DesignSpec"`.
- Pass any resulting errors into `validateAndPersistArtifact({ additionalErrors })`.

Do not silently accept cross-artifact mismatches and defer them to later QA. `DesignSpec` is meant to be a design contract, so invalid section references should be rejected immediately.

## 8. Pack Definition

Add:

```text
superpowers/packs/tasks/design-spec/SKILL.md
```

Required content:

- Stage: `design-spec-pass`.
- Inputs: validated `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`.
- Allowed output: `DesignSpec` only.
- Forbidden outputs: all other stable artifacts.
- Design rules: translate upstream artifacts into checkable design directives, not generic inspiration text.
- Fenced output shape: `fusera-artifact-json`.
- Failure behavior: fail closed when upstream artifacts are insufficient or section ids cannot be addressed.

Important instruction:

The pack should require `section_design_intents` to cover actual planned sections. It should not permit an empty section intent list.

## 9. Stage Profile

Update:

```text
superpowers/packs/stage-profiles.yaml
```

Change:

```yaml
- stage: design-system-pass
  next_stage: design-spec-pass
```

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

Do not change `page-compile` required inputs in PR1.

## 10. Registry

Update:

```text
superpowers/packs/registry.yaml
```

Add a `tasks/design-spec` pack entry:

- `id: tasks/design-spec`
- `path: superpowers/packs/tasks/design-spec/SKILL.md`
- `kind: task`
- `stage: design-spec-pass`
- `output_modes: [landing-page]`
- `capabilities_required: [workspace.read, workspace.write]`
- `required_inputs: [normalized_input_bundle]`
- `produces_artifacts: [DesignSpec]`
- `stage_outputs: [DesignSpec]`
- `output_contract: superpowers/contracts/artifacts/design-spec.schema.json`
- `parallelism_policy.mode: serial`
- `fallback_policy.mode: fail`

Use the existing registry `required_artifacts` object shape:

```yaml
required_artifacts:
  - artifact_type: ProductBrief
    allowed_statuses:
      - validated
    version_range: ^1.0.0
  - artifact_type: BrandProfile
    allowed_statuses:
      - validated
    version_range: ^1.0.0
  - artifact_type: PagePlan
    allowed_statuses:
      - validated
    version_range: ^1.0.0
  - artifact_type: SectionGraph
    allowed_statuses:
      - validated
    version_range: ^1.0.0
  - artifact_type: ThemeTokens
    allowed_statuses:
      - validated
    version_range: ^1.0.0
```

Do not write `required_artifacts` as a list of artifact names. `assembleContext` expects the object shape above.

Keep it single-output. Do not make `design-system-pass` emit both `ThemeTokens` and `DesignSpec` in this PR.

## 11. Mock Adapter

Update:

```text
superpowers/adapters/codex/adapter.ts
```

Add:

- `if (bundle.stage === "design-spec-pass") return [makeDesignSpec(bundle)]`
- `makeDesignSpec(bundle)`

`makeDesignSpec` should consume:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`

Mock payload should be boring but valid:

- At least one section intent for each section in `SectionGraph.section_order`.
- Claim policy aligned to `ProductBrief.claim_policy`.
- Non-empty visual, copy, and proof anti-patterns.
- Token directives that mention current token categories.

Do not improve existing `ThemeTokens` quality in this PR. That is separate from proving `DesignSpec` plumbing.

## 12. Real Adapter Smoke

Current real adapter smoke patterns live in:

```text
superpowers/runner/verify-p0-harness.ts
```

PR1 should add two smoke checks:

Before adding new smoke checks, extend the shared `writePositiveRealAdapterScript()` helper so the full publish positive path can handle `bundle.stage === "design-spec-pass"`. The existing positive path reuses that script; if the shared script does not emit a `DesignSpec` candidate, the full publish verifier will fail as soon as `design-spec-pass` enters the stage sequence.

### 12.1 Positive DesignSpec real adapter smoke

Goal:

- Run stage proof through `design-spec-pass` with `FUSERA_CODEX_ADAPTER=real` and a scripted local command.
- Script emits a valid fenced `DesignSpec` artifact.
- Verify the artifact is persisted as `artifacts/design-spec.json`.

Checks:

- final state is compatible with stage proof.
- `design-spec.json.status === "validated"`.
- real adapter result includes `DesignSpec` in produced artifact candidates.
- existing upstream artifacts are still validated.

### 12.2 Invalid DesignSpec real adapter smoke

Goal:

- Run or continue to `design-spec-pass` with a scripted local command that emits an invalid `DesignSpec`.
- Verify the candidate persists under `artifacts/rejected/`.
- Verify canonical `artifacts/design-spec.json` is not created.
- Verify run fails closed with validation failure.

Invalid candidates to test:

- Empty `section_design_intents`.
- Unknown `section_id`.
- Missing `anti_patterns.copy` or `anti_patterns.proof`.
- Missing one required upstream artifact id in `input_refs`.

Prefer one focused invalid candidate first. Add more if the helper is small.

## 13. Verify P0 Harness Updates

Update:

```text
superpowers/runner/verify-p0-harness.ts
```

Likely changes:

- `checkArtifactsValidate(publishRun.run_dir, 8)` becomes `9`.
- Publish run artifact list includes `design-spec.json`.
- Stage proof tests may need adjustment because `design-spec-pass` now sits before `page-compile`.
- Real adapter positive path should read `artifacts/design-spec.json`.
- New real adapter smoke checks should be added to the checks list.
- `writePositiveRealAdapterScript()` must include a `design-spec-pass` branch so existing full publish real-adapter checks continue to pass.

Be careful with proof behavior:

- A proof target of `design-system-pass` should not automatically prove `design-spec-pass`.
- A proof target of `design-spec-pass` should stop before `page-compile`.
- Continuing a run from `design-system-pass` to `design-spec-pass` should not re-run upstream stages.

## 14. Live Quality Updates

Update:

```text
superpowers/runner/verify-live-codex-quality.ts
superpowers/runner/verify-live-codex-matrix.ts
```

Needed changes:

- Add `DesignSpec` file mapping.
- Add `design-spec-pass` to model-owned stage list.
- Add `DesignSpec` to expected artifacts for target stage `design-spec-pass`.
- Add scoring function for `DesignSpec`.
- Keep existing `design-system-pass` target behavior stable unless intentionally expanding it.

DesignSpec scoring should check:

- Artifact present and validated.
- Non-empty visual thesis.
- Section intents exactly cover all planned sections.
- Token directives include color, typography, spacing, radii, shadows.
- Claim policy exactly matches the upstream `ProductBrief`.
- Anti-pattern categories are non-empty.

Do not make live quality target `design-system-pass` require `DesignSpec` unless the target stage is explicitly changed to `design-spec-pass`.

## 15. Resume, Retry, And Evidence Stage Lists

Several runner helpers currently keep hardcoded model-owned stage lists. PR1 must update them or make them dynamic.

Check at least:

- `superpowers/runner/run-stage.ts` `inferAdapterModeFromEvidence`.
- `superpowers/runner/retry-policy.ts` model-owned retry boundary.
- `superpowers/runner/ci-gates.ts` model-owned stage accounting.
- `superpowers/runner/inspect-run.ts` model-owned stage ordering.

Preferred fix:

- Derive model-owned stage lists from resolved stage profiles and `RUNNER_OWNED_ARTIFACTS`.

Acceptable PR1 fix:

- Add `design-spec-pass` to each hardcoded list.
- Add tests or verifier checks showing continue/resume adapter-mode locking observes `design-spec-pass` evidence.

Do not leave `design-spec-pass` out of adapter evidence inference. Otherwise a failed or resumed run can mis-detect adapter mode in edge cases.

## 16. Inspect And Rejected Artifact Visibility

PR1 explicitly relies on rejected `DesignSpec` candidates for invalid-candidate proof.

Preferred:

- Update `inspect-run` to summarize `artifacts/rejected/*.json`.
- Include artifact type, status, validation errors, and file name.

Minimum acceptable:

- Add verifier details that print the rejected artifact path and validation errors for invalid `DesignSpec` smoke checks.
- Track `inspect-run` rejected artifact visibility as a follow-up before broader artifact debugging work.

## 17. CLI And Verification Commands

Run before implementation if time allows:

```bash
git status --short
node --experimental-strip-types superpowers/runner/cli.ts ci mock
```

Run during implementation:

```bash
node --experimental-strip-types superpowers/runner/cli.ts verify p0
node --experimental-strip-types superpowers/runner/cli.ts run mock-publish
node --experimental-strip-types superpowers/runner/cli.ts proof design-spec-pass
```

Run app checks to prove no product-visible behavior changed:

```bash
npm run test
npm run build
```

Optional if browser evidence is quick:

```bash
npm run test:e2e
```

Real adapter smoke should run through the harness verifier, not by manually inspecting stdout only.

## 18. Milestones

| # | Milestone | Success Criteria |
| --- | --- | --- |
| 1 | Contract Registered | `DesignSpec` schema loads and `validate-artifact.ts` recognizes the type |
| 2 | Mock Stage Works | `mock-publish` produces validated `design-spec.json` |
| 3 | Publish Compatibility | existing mock publish still reaches `PublishVersion` |
| 4 | Rejection Path Works | invalid `DesignSpec` candidate persists rejected and blocks canonical artifact |
| 5 | Real Adapter Smoke Works | scripted real adapter positive and invalid paths pass |
| 6 | No App Regression | `npm run test` and `npm run build` pass |

## 19. Rollback Plan

If PR1 breaks publish flow:

- Revert `stage-profiles.yaml` `design-system-pass.next_stage` back to `page-compile`.
- Keep schema/pack files if harmless, but remove `DesignSpec` from registry and artifact mappings if verifier failures persist.
- Re-run `ci mock` to confirm the original 8-artifact flow returns.

Full rollback checklist:

- Remove `design-spec-pass` from `superpowers/packs/stage-profiles.yaml`.
- Restore `design-system-pass.next_stage` to `page-compile`.
- Remove `tasks/design-spec` from `superpowers/packs/registry.yaml`.
- Remove `DesignSpec` from `ARTIFACT_FILE_NAMES` and `SCHEMA_FILE_NAMES`.
- Remove the `design-spec-pass` branch and `makeDesignSpec` helper from the mock adapter.
- Remove the `design-spec-pass` branch from `writePositiveRealAdapterScript()`.
- Restore verifier artifact counts from 9 to 8 where they were changed.
- Remove `DesignSpec` file mappings and scoring from live quality/matrix verifiers.
- Remove `design-spec-pass` from hardcoded model-owned stage lists if the dynamic derivation was not implemented.
- Remove `DesignSpec` rejected-artifact visibility additions from `inspect-run` if they were added only for PR1 proof.
- Remove new real-adapter smoke checks for `DesignSpec`.
- Remove any `proof --mock` CLI/usage change if it landed solely to document PR1 verification ergonomics.
- Confirm `node --experimental-strip-types superpowers/runner/cli.ts ci mock` passes on the restored 8-artifact flow.

If only real adapter smoke fails:

- Keep mock path and schema changes.
- Mark real adapter smoke as blocking before merge unless the failure is in the scripted test harness, not adapter extraction.

## 20. Implementation Order

Recommended order:

1. Add schema.
2. Add artifact mappings.
3. Add pack file.
4. Add stage profile and registry.
5. Add mock adapter output.
6. Run `mock-publish` and inspect artifacts.
7. Update artifact count and verifier expectations.
8. Add rejected candidate checks.
9. Add real adapter smoke.
10. Run full `ci mock`.
11. Run app tests/build.

This order gives fast feedback before the verifier updates get noisy.

## 21. PR Description Draft

```markdown
## Summary

- Add `DesignSpec` as a harness-only stable artifact.
- Insert `design-spec-pass` after `design-system-pass`.
- Teach mock/real adapter verification paths to produce and reject `DesignSpec`.
- Keep existing page compile, QA, product-visible publish semantics, and app preview behavior unchanged.

## Verification

- `node --experimental-strip-types superpowers/runner/cli.ts ci mock`
- `npm run test`
- `npm run build`
```
