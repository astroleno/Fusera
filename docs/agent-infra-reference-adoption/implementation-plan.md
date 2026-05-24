# Agent Infra Reference Adoption Implementation Plan

Date: 2026-05-19
Status: Draft thin implementation plan, baseline restore required before feature work
Scope: Borrow only the useful infrastructure patterns from `carocut` and `OpenMontage` while keeping Fusera focused on agent infrastructure for website generation.

## 1. Decision

Do not re-architect Fusera around video-style production workflows.

Fusera already has the right core shape:

- `superpowers/` is canonical source.
- `.fusera/runs/` is runtime evidence.
- `stage-profiles.yaml` owns stage transitions and allowed outputs.
- artifact schemas own stable boundaries.
- runner-owned stages own compile, QA, and publish handoff.
- adapters absorb backend-specific behavior.

Conclusion: this thin layer is worth landing, but not from the current plan order. The direction is green; the current worktree baseline is yellow. Restore the runnable harness baseline first, then land the thin reporting, metadata, handoff, inspection, and event layers.

Adopt only small patterns that strengthen this harness:

- capability and preflight reporting
- run inspection for artifacts and evidence
- stage-level review criteria
- external preview handoff
- amendment request events

## 2. Non-Goals

Do not adopt:

- Remotion Studio or preview proxy infrastructure from `carocut`
- video/timeline/render-runtime concepts from `OpenMontage`
- multi-agent role hierarchies as canonical Fusera architecture
- `progress.yaml` as runtime state
- provider-zoo routing before website generation needs it
- backend parity claims beyond the implemented Codex path
- partial rerun orchestration in this round
- impact-map driven repair planning before the impact map is deterministic

## 3. Implementation Shape

### Phase 0. Baseline Restore And Smoke

Goal: make the current harness load and prove the existing P0 surface still works before adding new behavior.

Current blockers to restore or verify:

- `superpowers/runner/cli.ts` imports `inspect-run.ts`, but the file is missing in the current worktree.
- `resolve-packs.ts`, several `verify-live-*` modules, pack `SKILL.md` files, and fixtures are expected by the harness surface.
- `validate-artifact.ts` requires schemas for `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, and `PublishVersion`, while the current contracts directory is incomplete.
- preview, QA, and publish cannot be treated as reliable until those artifact contracts exist.

Suggested files:

- `superpowers/runner/cli.ts`
- `superpowers/runner/inspect-run.ts`
- `superpowers/runner/resolve-packs.ts`
- `superpowers/runner/verify-p0-harness.ts`
- `superpowers/runner/verify-live-*.ts`
- `superpowers/contracts/artifacts/*.schema.json`
- `superpowers/packs/**/SKILL.md`
- P0 fixtures under the existing harness fixture location

Acceptance:

- `node --experimental-strip-types superpowers/runner/cli.ts help` exits 0.
- `node --experimental-strip-types superpowers/runner/cli.ts doctor --json` returns `ok: true`.
- `node --experimental-strip-types superpowers/runner/cli.ts ci topology --json` returns `ok: true`.
- mock preview publish returns `final_state: "published"`.
- mock preview publish writes and validates `.fusera/runs/<run>/artifacts/page-spec.json`, `.fusera/runs/<run>/artifacts/qa-report.json`, and `.fusera/runs/<run>/artifacts/publish-version.json`.
- mock preview publish writes `.fusera/runs/<run>/previews/publish-handoff.json`, and the handoff is bound to the same run, page spec, QA report, and preview build.
- artifact validation can resolve every schema required by P0 stage outputs.
- rejected artifacts remain persisted with validation errors.

No adoption work starts until this phase passes.

### Phase 1. Capability Preflight Report

Goal: make each run start with an honest capability snapshot.

Add a runner-owned report with explicit layers:

- `declared_adapter_capabilities`: static adapter declarations such as `CODEX_CAPABILITIES`.
- `runner_managed_capabilities`: capabilities the runner itself can provide or guard, such as run directory creation and artifact validation.
- `probe_results`: runtime checks such as writable paths, external preview availability, screenshot/browser availability, publish target availability, and network-dependent checks when configured.
- `required_by_stage`: capabilities required by the resolved stage registry.
- `missing_required`: required capabilities absent after declarations and probes are reconciled.

Do not report static adapter declarations as proven runtime facts. For example, `workspace.write` and `agent.spawn` may be declared by an adapter, but the report must show whether the current runner mode can actually provide or probe them.

The report is written in two passes:

- `pre_resolution`: create the run directory, run probes that do not require pack resolution, and persist the partial report.
- `post_resolution`: after loading the registry and stage profiles, append `required_by_stage` and `missing_required`.

If the resolver fails closed, the final report must still be persisted with the missing requirements that caused the failure.

Suggested files:

- `superpowers/runner/ci-gates.ts` or a small new `superpowers/runner/capability-report.ts`
- `superpowers/adapters/codex/capabilities.ts`
- `superpowers/runner/cli.ts`

Keep it read-only. It should not configure anything.

Acceptance:

- `node --experimental-strip-types superpowers/runner/cli.ts capability-report --json [--run <run-dir>]` prints a JSON capability report.
- a run is created before pack resolution when needed so `.fusera/runs/<run>/logs/capability-report.json` can be persisted.
- resolver fails closed only for capabilities required by the registry and missing from the reconciled report.
- the JSON report includes declared adapter capabilities, runner-managed capabilities, probe results, required capabilities, and missing required capabilities.

### Phase 2. Run Inspection Surface

Goal: make `.fusera/runs/<run>` understandable without reading raw files.

Restore first, then extend inspection around:

- stable artifacts
- rejected artifacts and validation errors
- stage attempts
- backend raw output
- QA report
- preview handoff
- recent lifecycle events
- capability report

Suggested files:

- `superpowers/runner/inspect-run.ts`
- `superpowers/runner/cli.ts`

Acceptance:

- `fusera inspect <run> --json` includes stable artifact summaries, rejected artifact summaries, lifecycle events, and capability report metadata when present.
- text inspect shows preview URL and QA verdict when present.
- no UI is required for this phase.

### Phase 3. Stage Review Criteria

Goal: make stage success readable without changing the runner model.

Add optional metadata to `stage-profiles.yaml` only:

```yaml
review_focus:
  - "PagePlan uses validated ProductBrief and BrandProfile claims."
success_criteria:
  - "All declared outputs validate against canonical schemas."
```

Suggested files:

- `superpowers/packs/stage-profiles.yaml`
- `superpowers/runner/resolve-packs.ts`
- `superpowers/runner/verify-p0-harness.ts`

Acceptance:

- criteria are included in compiled backend context.
- P0 verification checks `review_focus` and `success_criteria` are arrays of strings when present.
- inspect output may surface these fields later through the compiled bundle, but that is not required for this phase.

### Phase 4. External Preview Handoff Normalization

Goal: support external website preview without embedding a local preview server.

Keep preview as a handoff contract and tighten binding checks. This phase normalizes the runner-owned sidecar and evidence shape only; provider adapters are future extensions and are not Phase 4 deliverables.

- runner compiles exact `PageSpec`
- preview handoff sidecar records the URL or deployment reference returned by whatever preview mechanism is already configured
- `QAReport` binds the exact `page_spec_ref` and `preview_build_ref`
- `PublishVersion` records preview target and URL
- preview handoff sidecar stores provider-specific metadata

Suggested files:

- `superpowers/runner/publish-preview.ts`
- `superpowers/contracts/artifacts/publish-version.schema.json`
- `docs/superpowers/architecture/frontend-output-modes.md`

Thin rule: add schema fields only when the runner uses them. Keep provider metadata in the handoff sidecar instead of expanding the stable artifact too early.

Acceptance:

- no local proxy is required for a successful preview publish.
- `PublishVersion.payload.publish_target` remains `preview`.
- `preview_build_ref`, `page_spec_ref`, and `run_id` are non-empty.
- preview handoff refuses to publish when the build ref, page spec ref, or run id do not match the validated artifacts and current run.
- no new provider adapter interface is required for this phase.

### Phase 5. Amendment Request Event

Goal: record user change requests without turning P0 into a general workflow engine.

Represent user changes as run-scoped events first:

```json
{
  "type": "amendment_requested",
  "data": {
    "request": "Make the hero more restrained.",
    "affected_artifact_hints": ["DesignSpec", "ThemeTokens", "PageSpec"]
  }
}
```

Suggested files:

- `superpowers/runner/write-run-event.ts`
- event readers that already summarize run evidence

Acceptance:

- typed `amendment_requested` events are persisted.
- affected artifact hints are optional metadata on the event, not a rerun contract.
- the runner does not consume `affected_artifact_hints` for invalidation or rerun decisions.
- no impact map or automatic partial rerun is added in this round.

## 4. Sequence

Implement in this order:

1. Phase 0: restore and smoke the runnable baseline.
2. Phase 1: capability preflight report.
3. Phase 2: run inspection surface.
4. Phase 3: stage review criteria metadata.
5. Phase 4: external preview handoff normalization.
6. Phase 5: typed amendment request event.

Stop after Phase 4 if product pressure is only preview/publish reliability. Do not include partial rerun behavior in this implementation round.

## 5. Guardrails

- Keep the runner thin.
- Add metadata before adding orchestration logic.
- Prefer artifact contracts over prompts.
- Prefer run events over hidden state.
- Keep provider adapters outside this phase; Phase 4 owns only preview handoff normalization and binding checks.
- Keep provider-specific preview metadata in sidecars until stable artifact fields are used by the runner.
- Treat UI as optional inspection, not canonical runtime.
- Treat declared adapter capabilities as declarations, not proof of runtime availability.
