# Superpowers P0 Harness Implementation Plan

Date: 2026-04-25  
Status: Draft for implementation  
Purpose: Define the build order and work packages for implementing the harness subsystem under `superpowers/` and `.fusera/`

## 1. Decision Summary

The harness should now be implemented as its own subsystem.

This plan replaces the older “phase-1 harness pieces embedded inside the app plan” approach with a harness-first build order:

- build the harness contracts first
- build the pack registry and stage profiles second
- build the runner and adapter surface third
- build the stage packs and verifier/deploy packs fourth
- wire the app to consume the harness after the harness path is stable

The app plan remains useful for product delivery, but it is no longer the canonical harness implementation plan.

## 2. Scope

### 2.1 In Scope

- `superpowers/contracts/artifacts/*.schema.json`
- `superpowers/packs/registry.yaml`
- `superpowers/packs/stage-profiles.yaml`
- `superpowers/packs/tasks/*`
- `superpowers/packs/verifiers/publishable-page/SKILL.md`
- `superpowers/packs/deploy/publish-preview/SKILL.md`
- `superpowers/runner/*`
- `superpowers/adapters/codex/*`
- `.fusera/runs/` runtime layout
- root `AGENTS.md` routing updates needed for the harness

### 2.2 Out Of Scope

- production-serving pointer management
- equal-first-class `claude-code` implementation
- app UI polish or dashboard flows
- long-term skill marketplace or pack distribution

## 3. Source Of Truth

Implement against these documents in this order:

1. `docs/superpowers/harness/2026-04-25-harness-doc-map.md`
2. `docs/superpowers/harness/2026-04-25-p0-harness-spec.md`
3. `docs/superpowers/harness/2026-04-25-p0-harness-contracts.md`
4. `docs/superpowers/harness/2026-04-25-p0-harness-implementation-plan.md`

Use these as background only:

- `docs/superpowers/architecture/2026-04-24-superpowers-skill-guided-harness.md`
- `docs/superpowers/architecture/artifact-contracts.md`
- `docs/superpowers/architecture/run-lifecycle.md`
- `docs/superpowers/architecture/pack-manifest-schema.md`
- `docs/superpowers/architecture/backend-capability-matrix.md`
- `docs/superpowers/plans/2026-04-20-fusera-v1-phase-1-implementation-plan.md`

## 4. Work Packages

### 4.1 Work Package A: Artifact Schemas

Files:

- `superpowers/contracts/artifacts/product-brief.schema.json`
- `superpowers/contracts/artifacts/brand-profile.schema.json`
- `superpowers/contracts/artifacts/page-plan.schema.json`
- `superpowers/contracts/artifacts/section-graph.schema.json`
- `superpowers/contracts/artifacts/theme-tokens.schema.json`
- `superpowers/contracts/artifacts/page-spec.schema.json`
- `superpowers/contracts/artifacts/qa-report.schema.json`
- `superpowers/contracts/artifacts/publish-version.schema.json`

Deliverables:

- canonical envelope in every schema
- field-level payload minima for every stable artifact
- `QAReport` binding to exact `page_spec_ref` and `preview_build_ref`
- preview-scoped `PublishVersion`

Verification:

- schema validation accepts valid examples
- schema validation rejects missing required fields

### 4.2 Work Package B: Pack Registry And Stage Profiles

Files:

- `superpowers/packs/registry.yaml`
- `superpowers/packs/stage-profiles.yaml`

Deliverables:

- declared pack ids and paths
- declared stage map
- explicit primary task and auxiliary task rules
- explicit `default_backend`
- artifact consumability descriptors on required artifacts
- object-shaped `fallback_policy`

Verification:

- no stage has more than one primary task
- every stage declares `next_stage`
- every produced stable artifact has a single owning stage

### 4.3 Work Package C: Root Routing And Pack Skeletons

Files:

- `AGENTS.md`
- `superpowers/packs/tasks/generate-landing/SKILL.md`
- `superpowers/packs/tasks/normalize-input/SKILL.md`
- `superpowers/packs/tasks/product-brief/SKILL.md`
- `superpowers/packs/tasks/brand-profile/SKILL.md`
- `superpowers/packs/tasks/page-strategy/SKILL.md`
- `superpowers/packs/tasks/section-graph/SKILL.md`
- `superpowers/packs/tasks/design-pass/SKILL.md`
- `superpowers/packs/tasks/page-compile/SKILL.md`
- `superpowers/packs/verifiers/publishable-page/SKILL.md`
- `superpowers/packs/deploy/publish-preview/SKILL.md`

Deliverables:

- root routing into the canonical harness source tree
- task packs that declare stage intent without owning runner behavior
- verifier and deploy packs that align with the stable artifact spine

Verification:

- every pack id in the registry resolves to a file
- no task pack claims `QAReport` or `PublishVersion` unless it is the verifier or deploy pack

### 4.4 Work Package D: Runner Core

Files:

- `superpowers/runner/resolve-packs.ts`
- `superpowers/runner/assemble-context.ts`
- `superpowers/runner/compile-pack.ts`
- `superpowers/runner/invoke-backend.ts`
- `superpowers/runner/run-stage.ts`
- `superpowers/runner/validate-artifact.ts`
- `superpowers/runner/write-run-event.ts`

Deliverables:

- deterministic pack resolution
- adapter selection precedence
- artifact validation and rejection persistence
- append-only run events

Verification:

- resolver fails closed on unsupported artifacts or adapter mismatch
- invalid artifacts are persisted as rejected
- every stage emits run events

### 4.5 Work Package E: Compiler, Verifier, And Repair Loop

Files:

- `superpowers/runner/compile-page.ts`
- `superpowers/runner/verify-run.ts`
- `superpowers/runner/repair-run.ts`

Deliverables:

- deterministic `PageSpec` compilation
- exact `preview_build_ref` emission
- QA binding to `page_spec_ref` and `preview_build_ref`
- repair budget enforcement
- waiver path only through review

Verification:

- verifier cannot authorize a mismatched build
- repair attempts stop at 2
- non-waivable gates block waived publish

### 4.6 Work Package F: Preview Publish

Files:

- `superpowers/runner/publish-preview.ts`

Deliverables:

- immutable preview-scoped `PublishVersion`
- preview handoff metadata
- rollback-safe pointer handoff contract

Verification:

- publish fails closed on mismatched QA binding
- publish emits immutable artifact and run event

### 4.7 Work Package G: Codex Adapter

Files:

- `superpowers/adapters/codex/adapter.ts`
- `superpowers/adapters/codex/capabilities.ts`

Deliverables:

- concrete Codex adapter for the P0 path
- stable invocation bundle input
- stable invocation result shape
- persisted raw adapter output

Verification:

- adapter exposes declared P0 capabilities
- adapter failures distinguish invocation, extraction, validation, and missing-output failures

### 4.8 Work Package H: App Integration Crosswalk

This package is where the older app plan reconnects to the harness.

Integration rule:

- app code should call the harness runner or task entrypoints
- app code should not recreate artifact, resolver, or lifecycle logic inline under `src/lib/*`

Expected downstream consumers:

- Trigger.dev generation job
- intake route
- preview route
- publish-preview route

## 5. Crosswalk From The Older App Plan

| Older plan concern | New harness owner |
|---|---|
| inline artifact shapes in `src/lib/domain/page-artifacts.ts` | `superpowers/contracts/artifacts/*.schema.json` |
| inline generation object assembly in `src/lib/ai/page-strategy.ts` | stage task packs plus `superpowers/runner/run-stage.ts` |
| generation-run persistence logic | `superpowers/runner/validate-artifact.ts` and `write-run-event.ts` |
| preview QA logic | `superpowers/runner/verify-run.ts` |
| publish gating and preview handoff | `superpowers/runner/publish-preview.ts` |

The old plan should now be treated as the app-consumer plan, not the harness-construction plan.

## 6. Order Of Execution

Recommended order:

1. artifact schemas
2. registry and stage profiles
3. root routing and pack skeletons
4. runner core
5. Codex adapter
6. compiler, verifier, and repair loop
7. preview publish
8. app integration

Do not invert this order by building app-side generation helpers first.

## 7. Verification Checklist

Before calling the P0 harness ready, verify all of the following:

1. `superpowers/` exists as the canonical harness source tree
2. `.fusera/runs/` exists as runtime-only storage
3. the resolver can load `registry.yaml` and `stage-profiles.yaml`
4. every stable artifact validates against its schema
5. `QAReport` binds exact `page_spec_ref` and exact `preview_build_ref`
6. the lifecycle enforces repair budget and review-only waiver
7. preview publish emits immutable preview-scoped `PublishVersion`
8. app integration consumes harness outputs instead of reimplementing harness logic inline

## 8. Final Rule

When a harness concern can be implemented in:

- a schema
- a stage profile
- a registry entry
- a pack
- a runner validation step

it should not be implemented a second time in ad hoc app-layer helpers.
