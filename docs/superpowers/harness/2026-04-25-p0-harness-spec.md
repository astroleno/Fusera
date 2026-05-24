# Superpowers P0 Harness Spec

Date: 2026-04-25  
Status: Draft for implementation  
Purpose: Define the P0 harness shape, stage ownership model, canonical directories, runner surface, and preview-publish contract for the first deterministic landing-page workflow

## 1. Decision Summary

P0 should be implemented as a thin, artifact-driven harness with these locked decisions:

- canonical authoring source lives under `superpowers/`
- runtime state and generated outputs live under `.fusera/`
- the primary backend for P0 is `codex`
- `claude-code` is a compatibility target, not the primary shell or implementation target
- the landing-page path uses the stable artifact spine already defined in `docs/superpowers/architecture/artifact-contracts.md`
- stage ownership is explicit and enforced through stage profiles and task manifests
- preview publish is part of the first deterministic loop, so P0 needs a preview-scoped `PublishVersion`
- packs stay portable; runner and backend adapters absorb backend-specific behavior

This spec is part of the canonical implementation-facing harness doc set:

- `docs/superpowers/harness/2026-04-25-harness-doc-map.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`
- `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`

Background rationale still lives in:

- `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md`
- `docs/superpowers/architecture/artifact-contracts.md`
- `docs/superpowers/architecture/backend-capability-matrix.md`
- `docs/superpowers/architecture/pack-manifest-schema.md`
- `docs/superpowers/architecture/run-lifecycle.md`

## 2. Scope

### 2.1 In Scope

- root routing document shape
- canonical repository layout for harness source and runtime outputs
- required P0 pack locations
- required P0 artifact schemas
- required P0 stage map and stage profile contract
- required P0 runner entrypoints
- required Codex adapter contract
- run record layout under `.fusera/runs/`
- one end-to-end landing-page generation path
- one verifier path for publishability
- one preview publish path with immutable handoff artifact

### 2.2 Out Of Scope

- general-purpose multi-agent platform behavior
- parity implementation for all supported backends
- large agent catalogs or role hierarchies
- marketplace or external pack distribution
- long-term memory systems
- production-serving pointer management beyond the preview publish handoff

## 3. Canonical Repository Layout

P0 canonical shape:

```text
AGENTS.md
docs/
  superpowers/
    architecture/
    harness/
    research/
    specs/
superpowers/
  packs/
    registry.yaml
    stage-profiles.yaml
    tasks/
      generate-landing/
        SKILL.md
      normalize-input/
        SKILL.md
      product-brief/
        SKILL.md
      brand-profile/
        SKILL.md
      page-strategy/
        SKILL.md
      section-graph/
        SKILL.md
      design-pass/
        SKILL.md
      design-spec/
        SKILL.md
      page-compile/
        SKILL.md
    verifiers/
      publishable-page/
        SKILL.md
    deploy/
      publish-preview/
        SKILL.md
  contracts/
    artifacts/
      product-brief.schema.json
      brand-profile.schema.json
      page-plan.schema.json
      section-graph.schema.json
      theme-tokens.schema.json
      design-spec.schema.json
      page-spec.schema.json
      qa-report.schema.json
      publish-version.schema.json
  runner/
    resolve-packs.ts
    assemble-context.ts
    compile-pack.ts
    invoke-backend.ts
    run-stage.ts
    validate-artifact.ts
    compile-page.ts
    verify-run.ts
    repair-run.ts
    retry-policy.ts
    publish-preview.ts
    write-run-event.ts
    ci-gates.ts
    cli.ts
    inspect-run.ts
  adapters/
    codex/
    claude-code/
.fusera/
  runs/
```

Rules:

- `superpowers/` is the canonical source tree for harness logic, contracts, and packs
- `.fusera/` must not become a second source tree
- `.fusera/runs/` is append-only run storage for runtime records, materialized artifacts, verifier outputs, compiled outputs, and preview publish handoffs
- backend evidence is attempt-scoped under each stage so retries do not overwrite prior raw output
- any generated backend bundle or cache belongs under `.fusera/`, not `superpowers/`

## 4. Root Instruction Strategy

Root instruction surface:

- `AGENTS.md` is the only required root instruction file
- `AGENTS.md` should be a thin router with repo-wide constraints, source-of-truth pointers, and pack discovery rules
- detailed task behavior belongs in pack-local `SKILL.md` files under `superpowers/packs/`
- backend-specific execution behavior belongs in `superpowers/adapters/`, not in root instructions

P0 `AGENTS.md` responsibilities:

- explain that `superpowers/` is the canonical harness source
- define the repo-wide artifact discipline
- point to `superpowers/packs/registry.yaml`
- point to `superpowers/packs/stage-profiles.yaml`
- point to the stable artifact contracts
- state that `.fusera/` is runtime output only
- state that `codex` is the primary P0 adapter

## 5. P0 Backend Rule

P0 backend policy:

- `codex` is the only backend that must be concretely implemented for the first deterministic loop
- `claude-code` compatibility remains in scope at the manifest and adapter-contract level
- no P0 deliverable should require equal-first-class parity across both backends

Operational rule:

- packs declare portable capabilities
- the resolver selects a backend adapter
- backend-specific prompts, hook mappings, and tool conventions are adapter-owned
- artifact contracts, lifecycle transitions, and verifier semantics remain backend-neutral

## 6. Required P0 Artifacts

### 6.1 Stable Landing Generation Spine

P0 must use the landing-page stable artifact spine, not a reduced informal subset.

Required stable artifacts:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `DesignSpec`
- `PageSpec`
- `QAReport`

### 6.2 Preview Publish Handoff

P0 also requires:

- `PublishVersion`

P0 `PublishVersion` is preview-scoped only.

Required rule:

- `PublishVersion.payload.publish_target` must be `preview`

P0 does **not** require production-serving pointer management, but it does require a preview publish artifact so the publish gate, rollback semantics, and lifecycle contract close cleanly.

### 6.3 Stage Ownership Rule

Every stable artifact must have one declared producer stage.

Rules:

- workflow entry packs do not own stable artifacts
- each stage pack may create or replace only the artifacts listed in its `stage_outputs`
- each stage profile may allow only the outputs listed in `allowed_outputs`
- no artifact may be emitted by a stage that is not declared as its producer stage
- rejected artifacts remain persisted for traceability and repair analysis

## 7. Required P0 Artifact Schemas

Files required in `superpowers/contracts/artifacts/`:

- `product-brief.schema.json`
- `brand-profile.schema.json`
- `page-plan.schema.json`
- `section-graph.schema.json`
- `theme-tokens.schema.json`
- `design-spec.schema.json`
- `page-spec.schema.json`
- `qa-report.schema.json`
- `publish-version.schema.json`

Rules:

- every schema must wrap payloads in the canonical artifact envelope
- every schema must declare `artifact_type` and `schema_version`
- downstream stages may consume only validated artifacts
- schema ownership remains harness-owned, not backend-owned

## 8. P0 Stage Map

`tasks/generate-landing` is the user entry workflow only.

It is not the producer of any stable artifact.

P0 stage map:

| Stage | Primary executor | Allowed auxiliary tasks | Stable outputs | Default verifier | Default backend | Next stage |
|---|---|---|---|---|---|---|
| `normalize-input` | `tasks/normalize-input` | none | none; emits run-owned normalized input bundle only | none | `codex` | `product-and-brand-brief` |
| `product-and-brand-brief` | `tasks/product-brief` | `tasks/brand-profile` | `ProductBrief`, `BrandProfile` | none | `codex` | `page-strategy` |
| `page-strategy` | `tasks/page-strategy` | none | `PagePlan` | none | `codex` | `section-planning` |
| `section-planning` | `tasks/section-graph` | none | `SectionGraph` | none | `codex` | `design-system-pass` |
| `design-system-pass` | `tasks/design-pass` | none | `ThemeTokens` | none | `codex` | `design-spec-pass` |
| `design-spec-pass` | `tasks/design-spec` | none | `DesignSpec` | none | `codex` | `page-compile` |
| `page-compile` | `tasks/page-compile` | none | `PageSpec` | none | `codex` | `verify-publishable-page` |
| `verify-publishable-page` | `verifiers/publishable-page` | none | `QAReport` | `verifiers/publishable-page` | `codex` | `publish-preview` on pass, otherwise `repairing` or `needs_review` per lifecycle |
| `publish-preview` | `deploy/publish-preview` | none | `PublishVersion` | publish-safety gate inside deploy step | `codex` | end |

## 9. Required P0 Packs

### 9.1 Pack Registry

Required file:

- `superpowers/packs/registry.yaml`

P0 registry responsibilities:

- pack id to path mapping
- pack type classification
- declared capabilities
- preferred adapters
- accepted input artifact types
- produced output artifact types

### 9.2 Stage Profiles Contract

Required file:

- `superpowers/packs/stage-profiles.yaml`

Required fields:

- `stage`
- `primary_task`
- `allowed_auxiliary_tasks`
- `allowed_outputs`
- `default_verifier`
- `default_backend`
- `next_stage`

Stage profile rules:

- `primary_task` must name the only pack allowed to drive the stage
- `allowed_auxiliary_tasks` must be explicit, not inferred
- `allowed_outputs` must be the superset boundary for all task `stage_outputs` in that stage
- `default_verifier` may be `none` for non-boundary stages
- `next_stage` must be explicit even when the transition is terminal

### 9.3 Workflow Entry Pack

Required file:

- `superpowers/packs/tasks/generate-landing/SKILL.md`

This pack is the user entry and stage orchestrator. It should:

- resolve the requested run shape
- hand off into the declared stage map
- never claim ownership of stable artifacts
- stop and surface verifier or publish failures rather than silently skipping them

### 9.4 Stage Task Packs

Required files:

- `superpowers/packs/tasks/normalize-input/SKILL.md`
- `superpowers/packs/tasks/product-brief/SKILL.md`
- `superpowers/packs/tasks/brand-profile/SKILL.md`
- `superpowers/packs/tasks/page-strategy/SKILL.md`
- `superpowers/packs/tasks/section-graph/SKILL.md`
- `superpowers/packs/tasks/design-pass/SKILL.md`
- `superpowers/packs/tasks/page-compile/SKILL.md`

Stage task rules:

- each pack may emit only the stage-owned outputs declared by its manifest
- `tasks/page-compile` hands off to the deterministic compiler in `superpowers/runner/compile-page.ts`
- no task pack may emit `QAReport` or `PublishVersion`

### 9.5 Verifier Pack

Required file:

- `superpowers/packs/verifiers/publishable-page/SKILL.md`

This pack should:

- consume `PageSpec`
- verify the exact compiled preview build
- emit `QAReport`
- classify issues as `machine-repairable` or `manual-only`
- fail closed on blocking issues

### 9.6 Deploy Pack

Required file:

- `superpowers/packs/deploy/publish-preview/SKILL.md`

This pack should:

- consume only approved or waived `QAReport` outputs
- create immutable preview-scoped `PublishVersion`
- refuse publish when `page_spec_ref` or `preview_build_ref` do not match the verified candidate

## 10. Runner Responsibilities

Required P0 runner files:

- `superpowers/runner/resolve-packs.ts`
- `superpowers/runner/assemble-context.ts`
- `superpowers/runner/compile-pack.ts`
- `superpowers/runner/invoke-backend.ts`
- `superpowers/runner/run-stage.ts`
- `superpowers/runner/validate-artifact.ts`
- `superpowers/runner/compile-page.ts`
- `superpowers/runner/verify-run.ts`
- `superpowers/runner/repair-run.ts`
- `superpowers/runner/retry-policy.ts`
- `superpowers/runner/publish-preview.ts`
- `superpowers/runner/write-run-event.ts`
- `superpowers/runner/ci-gates.ts`
- `superpowers/runner/cli.ts`
- `superpowers/runner/inspect-run.ts`

P0 runner surface:

| File | Required responsibility |
|---|---|
| `resolve-packs.ts` | load registry and stage profiles; resolve the selected stage plan against the chosen adapter |
| `assemble-context.ts` | build the input bundle from validated artifacts, references, run metadata, and stage profile |
| `compile-pack.ts` | compile canonical pack sources into backend-specific invocation bundles |
| `invoke-backend.ts` | call the selected adapter and capture stdout, stderr, usage, attachments, and structured outputs |
| `run-stage.ts` | execute one stage from declared inputs to validated outputs |
| `validate-artifact.ts` | validate envelope and payload against schema and persist rejected artifacts |
| `compile-page.ts` | deterministically compile validated planning artifacts into `PageSpec` and `preview_build_ref` |
| `verify-run.ts` | execute verifier gates, bind `QAReport` to exact `page_spec_ref` and `preview_build_ref`, and choose lifecycle transition |
| `repair-run.ts` | enforce repair budget, attach prior `QAReport`, and generate rerun directives |
| `retry-policy.ts` | classify retryable backend/model-owned failures and enforce backend retry budget |
| `publish-preview.ts` | create immutable preview-scoped `PublishVersion` and persist preview handoff metadata |
| `write-run-event.ts` | append lifecycle and stage events to the run ledger |
| `ci-gates.ts` | provide required mock CI gate, optional live gate, repeated live stability runs, and JSON/Markdown diagnostics |
| `cli.ts` | provide the supported runner CLI for mock publish, live publish, proof, resume, inspect, verification, CI, and stability commands |
| `inspect-run.ts` | summarize run state, stages, attempts, artifacts, preview handoff, and recent events |

## 11. Codex Adapter Contract

P0 must define a concrete Codex adapter contract.

### 11.1 Capabilities

The Codex capability model is split by ownership:

- adapter runtime capabilities: `workspace.read`, `workspace.search`,
  `artifact.attach`, `image.inspect`, `screenshot.capture`
- runner-managed capabilities: `workspace.write`, `process.exec`
- experimental capabilities: `agent.spawn`

P0 runtime selection must treat `agent.spawn` as unavailable until bounded child
attempts and runner-owned join validation exist.

### 11.2 Input Bundle Shape

The adapter must accept a compiled invocation bundle containing at least:

- selected `stage`
- selected `pack ids`
- `stage_profile`
- chosen backend capabilities
- run metadata
- validated input artifact refs
- materialized input artifact bodies
- output contract refs
- optional repair directives

### 11.3 Invocation Result Shape

The adapter must return a structured result containing at least:

- `status`
- `stdout`
- `stderr`
- `usage`
- `attachments`
- `produced_artifact_candidates[]`
- `preview_build_ref` when a preview build is produced
- `failure_mode` when execution fails

### 11.4 Adapter Persistence Rules

- stdout and stderr must be captured into the run log
- raw adapter output must be persisted before artifact validation
- each adapter invocation must create immutable attempt evidence under `stages/<stage>/attempts/<attempt_id>/`
- artifact extraction must be deterministic and reviewable
- adapter failure must distinguish invocation failure, extraction failure, validation failure, and missing-output failure

## 12. Runtime Storage Layout

P0 runtime output under `.fusera/runs/` should look like this:

```text
.fusera/
  runs/
    run_<id>/
      run.json
      events.ndjson
      bundles/
      stages/
        normalize-input/
          attempts/
            attempt_<id>/
              adapter-raw-request.json
              adapter-stdout.txt
              adapter-stderr.txt
              adapter-result.json
        product-and-brand-brief/
        page-strategy/
        section-planning/
        design-system-pass/
        design-spec-pass/
        page-compile/
        verify-publishable-page/
        publish-preview/
        retrying/
          retry-decision.json
      artifacts/
        product-brief.json
        brand-profile.json
        page-plan.json
        section-graph.json
        theme-tokens.json
        design-spec.json
        page-spec.json
        qa-report.json
        publish-version.json
      compiled/
        preview-build.json
      previews/
      logs/
```

Rules:

- `.fusera/runs/` is runtime evidence, not source
- `run.json` records `backend` and `adapter_mode`; resumed runs must keep the same adapter mode
- rejected artifacts remain persisted
- failed-run resume decisions are persisted under `stages/retrying/retry-decision.json`
- failed proof runs resume only through the original `proof_target_stage`
- stage-level adapter evidence files may point at the latest attempt, but immutable attempt directories are the audit source
- run directories should be self-describing and resumable
- compiled outputs belong under the run that produced them
- the event ledger is append-only

## 13. P0 Acceptance Criteria

P0 is complete only if all of the following are true:

1. a landing-page run can be resolved through `superpowers/packs/registry.yaml`
2. the stage sequence can be resolved through `superpowers/packs/stage-profiles.yaml`
3. the runner executes the path against the `codex` adapter
4. every stable artifact is produced by its declared stage only
5. the run materializes validated instances of `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, and preview-scoped `PublishVersion`
6. the deterministic compiler consumes `DesignSpec` and emits `PageSpec` plus exact `preview_build_ref`
7. `QAReport` binds the exact `page_spec_ref` and `preview_build_ref`
8. failed QA transitions to `repairing` or `needs_review` according to `docs/superpowers/architecture/run-lifecycle.md`
9. the runner enforces a maximum of 2 repair attempts
10. preview publish creates immutable `PublishVersion` with `publish_target: preview`
11. retryable model-owned backend failures can resume from the failed stage without overwriting failed attempt evidence
12. exhausted backend retry budget transitions to `needs_review` without creating another backend attempt
13. failed proof-run resume cannot proceed beyond the original proof target
14. the run ledger is append-only and records resolution, verification, repair, retry, and preview publish events

## 14. Implementation Order

Recommended implementation order:

1. create `superpowers/contracts/artifacts/*.schema.json`
2. create `superpowers/packs/registry.yaml`
3. create `superpowers/packs/stage-profiles.yaml`
4. write root `AGENTS.md`
5. implement `superpowers/runner/validate-artifact.ts`
6. implement `superpowers/runner/resolve-packs.ts`
7. implement `superpowers/runner/assemble-context.ts`
8. implement `superpowers/runner/compile-pack.ts`
9. implement `superpowers/runner/invoke-backend.ts`
10. implement `superpowers/runner/write-run-event.ts`
11. implement `superpowers/adapters/codex/capabilities.ts`
12. implement `superpowers/adapters/codex/adapter.ts`
13. implement stage task packs
14. implement `superpowers/runner/compile-page.ts`
15. implement `superpowers/runner/verify-run.ts`
16. implement `superpowers/runner/repair-run.ts`
17. implement `superpowers/runner/retry-policy.ts`
18. implement `superpowers/runner/publish-preview.ts`
19. implement `superpowers/runner/ci-gates.ts`
20. implement `superpowers/runner/cli.ts` and `superpowers/runner/inspect-run.ts`

## 15. Final Rule

The harness should remain thin.

If a behavior can live in:

- a stable artifact contract
- a stage profile
- a pack manifest
- a runner validation step
- or a verifier gate

then it should not be promoted into a larger orchestrator prompt or a deeper agent hierarchy.
