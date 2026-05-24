# Superpowers P0 Harness Contracts

Date: 2026-04-25  
Status: Draft for implementation  
Purpose: Adapt the architecture-layer contracts into the canonical P0 harness contract set for `superpowers/`, `.fusera/`, and the first deterministic landing-page workflow

## 1. Decision Summary

P0 harness implementation should treat the following as locked:

- the harness is artifact-driven
- the harness is stage-owned
- the harness is `codex`-first in P0
- the harness validates artifact consumability, not just artifact existence
- QA must bind to the exact `PageSpec` and exact preview build
- waiver is a manual release action, not an automatic verifier outcome
- preview publish is closed only through an immutable preview-scoped `PublishVersion`

This document is the implementation-facing contract summary for the harness.

It pulls together the constraints that were previously spread across:

- `docs/superpowers/architecture/artifact-contracts.md`
- `docs/superpowers/architecture/run-lifecycle.md`
- `docs/superpowers/architecture/pack-manifest-schema.md`
- `docs/superpowers/architecture/backend-capability-matrix.md`

## 2. Stable Artifact Contract

P0 harness stable artifacts:

- `ProductBrief`
- `BrandProfile`
- `PagePlan`
- `SectionGraph`
- `ThemeTokens`
- `DesignSpec`
- `PageSpec`
- `QAReport`
- `PublishVersion`

Rules:

- every stable artifact is persisted as an envelope-wrapped artifact
- every stable artifact has one declared producer stage
- downstream stages consume only validated artifacts
- rejected artifacts remain persisted for traceability
- `generation_runs` store refs to stable artifacts, not evolving inline payload copies

## 3. Artifact Envelope Rule

Every stable artifact emitted by the harness must carry:

- `artifact_type`
- `schema_version`
- `artifact_id`
- `run_id`
- `status`
- `producer_stage`
- `input_refs`
- `validation`
- `payload`

P0 consumption rule:

- planning and compile stages consume only `validated`
- `page-compile` consumes validated `SectionGraph`, `ThemeTokens`, and `DesignSpec`
- publish consumes only a validated `QAReport` that binds the exact publish candidate

## 4. Required P0 Payload Minima

| Artifact | Required payload fields |
|---|---|
| `ProductBrief` | `product_name`, `audiences[]`, `core_problem`, `value_props[]`, `cta_goal`, `proof_inputs[]`, `claim_policy` |
| `BrandProfile` | `brand_traits[]`, `tone_keywords[]`, `visual_directions[]`, `positioning`, `do_not_use[]` |
| `PagePlan` | `page_goal`, `narrative_arc`, `section_intents[]`, `cta_strategy`, `proof_strategy` |
| `SectionGraph` | `nodes[]`, `edges[]`, `section_order[]`, `required_props`, `proof_bindings[]`, `claim_policy` |
| `ThemeTokens` | `colors`, `typography`, `spacing`, `radii`, `shadows`, `motion` |
| `DesignSpec` | `visual_thesis`, `brand_alignment`, `token_directives`, `layout_directives`, `motion_directives`, `section_design_intents[]`, `claim_and_proof_constraints`, `anti_patterns` |
| `PageSpec` | `route_id`, `sections[]` with `design_intent`, `token_refs`, `asset_refs`, `compile_targets[]` |
| `QAReport` | `page_spec_ref`, `preview_build_ref`, `verdict`, `gate_results[]`, `issues[]`, `repair_directives[]`, `evidence_refs[]`, `waiver` |
| `PublishVersion` | `publish_version_id`, `page_spec_ref`, `qa_report_ref`, `preview_url`, `published_at`, `publish_target`, `previous_active_pointer`, `pointer_transaction_ref` |

Proof rule:

- `claim_policy` is one of `proof-required`, `low-proof`, or `no-claims`
- `proof_bindings[]` may be empty only when `claim_policy` is `low-proof` or `no-claims`

## 5. QAReport Contract

`QAReport` is the publish-control artifact for the harness.

Required binding fields:

- `page_spec_ref`
- `preview_build_ref`

Required decision fields:

- `verdict`
- `gate_results[]`
- `issues[]`
- `repair_directives[]`
- `evidence_refs[]`
- `waiver`

Each `issues[]` entry must include:

- `issue_id`
- `severity`
- `category`
- `repairability`
- `blocking`
- `location_ref`
- `summary`

Allowed `repairability` values:

- `machine-repairable`
- `manual-only`

Each `gate_results[]` entry must include:

- `gate_id`
- `result`
- `blocking`
- `waivable`
- `evidence_refs[]`

Allowed `gate_results[].result` values:

- `pass`
- `fail`
- `waived`

## 6. Waiver Boundary

Waiver is not an automatic verifier state transition.

Rules:

- a failed verifier result moves the run to `needs_review` when repair is not allowed or not sufficient
- a waiver may be granted only from `needs_review`
- granting a waiver must materialize a new validated `QAReport` artifact with populated `waiver` metadata
- the original failed `QAReport` is not mutated in place
- a waiver may cover only gates whose `waivable` flag is `true`

P0 non-waivable gates:

- `artifact-binding`
- `claims-proof`
- `publish-safety`

P0 waiver approval requirements:

- approver role is `release-approver` or `admin`
- approver differs from the actor that initiated the publish request
- actor, timestamp, and reason are recorded

## 7. PublishVersion Contract

`PublishVersion` is immutable.

P0 publish rule:

- `publish_target` must be `preview`

Publish gate rule:

- publish may proceed only when the latest validated `QAReport` has `verdict` equal to `pass`, or `waived` with no failed non-waivable gates
- `QAReport.page_spec_ref` must match the `PageSpec` being promoted
- `QAReport.preview_build_ref` must match the preview build being promoted

Rollback rule:

- rollback mutates the serving-layer pointer or preview pointer record
- rollback does not mutate historical `PublishVersion` artifacts

## 8. Lifecycle Contract

P0 lifecycle:

`queued -> assembling -> running -> verifying -> repairing -> approved -> publishing -> published`

Escalation states:

- `needs_review`
- `failed`
- `canceled`

Required lifecycle rules:

- `verifying -> repairing` only when every blocking issue is `machine-repairable` and repair budget remains
- `verifying -> needs_review` when any blocking issue is `manual-only`, repair budget is exhausted, or a waiver would be required
- `needs_review -> approved` only through an explicit review action such as waiver or rerun success
- `approved -> publishing` only when the latest `QAReport` is bound to the same `PageSpec` and preview build being promoted
- `publishing -> published` only after immutable `PublishVersion` creation and successful pointer handoff

P0 repair limit:

- maximum 2 automated repair attempts per run

## 9. Resolver Contract

The harness resolver must use:

- `superpowers/packs/registry.yaml`
- `superpowers/packs/stage-profiles.yaml`

P0 adapter selection precedence:

1. explicit request override if compatible
2. stage-profile `default_backend` if compatible
3. first common adapter from remaining candidate packs' ordered `preferred_adapters`
4. P0 primary backend `codex`
5. otherwise fail closed

Runtime support is codex-first. `claude-code` may appear only as an
instruction-only compatibility target until a concrete adapter exists.

Capability matching uses the normalized Codex capability groups:

- adapter runtime capabilities: `workspace.read`, `workspace.search`,
  `artifact.attach`, `image.inspect`, `screenshot.capture`
- runner-managed capabilities: `workspace.write`, `process.exec`
- experimental capabilities: `agent.spawn`

`agent.spawn` is not selectable for correctness-critical stages in P0.

P0 artifact filtering rule:

- `required_artifacts` are not satisfied by type existence alone
- each required artifact descriptor must include:
  - `artifact_type`
  - `allowed_statuses`
  - `version_range`

A candidate pack is ineligible if a required artifact:

- does not exist
- is not in an allowed status
- falls outside the accepted schema version range

P0 `fallback_policy` shape is object-only:

```yaml
fallback_policy:
  mode: fail
```

Allowed modes:

- `fail`
- `use-default`
- `defer-to-human`

If `mode` is `use-default`, `pack_name` is required.

## 10. Runtime Persistence Contract

Harness runtime evidence belongs under:

- `.fusera/runs/run_<id>/`

Required persisted categories:

- run metadata
- append-only events ledger
- compiled invocation bundles
- raw adapter outputs
- validated and rejected artifacts
- compiled preview build metadata
- verifier evidence
- preview publish handoff artifacts

Rules:

- `.fusera/` is runtime output only
- `superpowers/` is canonical harness source
- rejected artifacts must remain available for inspection
- the event ledger is append-only

## 11. Harness Acceptance Gates

The P0 harness contract is satisfied only if:

1. every stable artifact is emitted only by its declared stage
2. every artifact is validated against the harness-owned schema
3. verifier output binds exact `page_spec_ref` and `preview_build_ref`
4. repair attempts never exceed the configured budget
5. waived publish cannot bypass non-waivable gates
6. preview publish emits an immutable preview-scoped `PublishVersion`
7. all runtime evidence is persisted under `.fusera/runs/`
