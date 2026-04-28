# Run Lifecycle

Date: 2026-04-24  
Status: Background reference  
Purpose: Define the runtime state machine, repair budget, escalation path, and publish rollback behavior for Superpowers runs

Source-of-truth note: Current run lifecycle behavior lives under `superpowers/runner/`; current implementation rules live under `docs/superpowers/harness/` and `superpowers/`. This document is historical architecture background.

## 1. Decision Summary

Every generation run should move through an explicit state machine.

P0 lifecycle:

`queued -> assembling -> running -> verifying -> repairing -> approved -> publishing -> published`

Failure and escalation states:

- `needs_review`
- `failed`
- `canceled`

## 2. State Definitions

| State | Meaning |
|---|---|
| `queued` | run accepted but not yet prepared |
| `assembling` | resolver selects packs, checks capabilities, and hydrates artifacts |
| `running` | backend is executing the selected packs |
| `verifying` | deterministic checks and verifiers inspect outputs |
| `repairing` | bounded automated repair pass is running |
| `approved` | outputs passed QA and are ready for publish |
| `publishing` | publish job is creating a `PublishVersion` and switching pointers |
| `published` | publish completed successfully |
| `needs_review` | automated flow stopped and needs human judgment |
| `failed` | run cannot proceed automatically |
| `canceled` | run was intentionally stopped |

## 3. Transition Rules

- `queued -> assembling`: runner starts
- `assembling -> running`: required packs, inputs, artifacts, and capabilities are all available
- `assembling -> failed`: resolver cannot satisfy required routing or capability conditions
- `running -> verifying`: backend returns outputs
- `running -> failed`: backend execution exits without required outputs
- `verifying -> approved`: all required gates pass
- `verifying -> repairing`: gates fail, every blocking issue is machine-repairable, and retry budget remains
- `verifying -> needs_review`: gates fail and any blocking issue is manual-only, retry budget is exhausted, or an explicit human waiver is required
- `repairing -> running`: repair directives are generated and re-executed
- `approved -> publishing`: publish is requested
- `publishing -> published`: active version switch succeeds
- `publishing -> needs_review`: publish failed after approval and needs operator attention

The runner should implement these as explicit evented transitions:

| From | Event | To | Required condition |
|---|---|---|---|
| `queued` | `start_run` | `assembling` | request accepted |
| `assembling` | `resolution_ok` | `running` | packs, inputs, artifacts, and capabilities resolved |
| `assembling` | `resolution_failed` | `failed` | no valid resolution path |
| `running` | `outputs_ready` | `verifying` | required artifacts materialized |
| `running` | `outputs_missing` | `failed` | backend exited without required outputs |
| `verifying` | `qa_passed` | `approved` | latest `QAReport.verdict == pass` |
| `verifying` | `qa_failed_repairable` | `repairing` | every blocking issue is machine-repairable and budget remains |
| `verifying` | `qa_failed_review` | `needs_review` | any manual-only issue, exhausted budget, or waiver-required gate failure |
| `repairing` | `repair_plan_ready` | `running` | repair directives attached to rerun |
| `needs_review` | `waiver_granted` | `approved` | approval flow materializes a new `QAReport` with `verdict == waived`, all failed gates are waivable, approver role is allowed, and approver differs from run initiator |
| `needs_review` | `review_rejected` | `failed` | operator rejects publish or rerun path |
| `approved` | `publish_requested` | `publishing` | latest QA report is `pass` or `waived`, no failed non-waivable gates remain, `QAReport.page_spec_ref` matches the publish target, and `preview_build_ref` matches the verified preview build |
| `publishing` | `publish_succeeded` | `published` | immutable `PublishVersion` stored and pointer switched |
| `publishing` | `publish_failed` | `needs_review` | active pointer safety uncertain or downstream publish failed |

## 4. QAReport Contract For Lifecycle Decisions

`QAReport` is the control artifact for the verify and repair loop.

Minimum fields used by the runner:

- envelope `status`
- `page_spec_ref`
- `preview_build_ref`
- `verdict`
- `gate_results[]`
- `issues[]`
- `repair_directives[]`
- `evidence_refs[]`
- `waiver`

Field semantics:

- envelope `status` answers whether the `QAReport` artifact itself validated and can be consumed
- `page_spec_ref` binds the report to the exact `PageSpec` under review
- `preview_build_ref` binds the report to the exact compiled preview build under review
- payload `verdict` answers whether the verified output passed, failed, or was waived
- the runner must not make lifecycle decisions from a `QAReport` whose envelope `status` is not `validated`

Required issue fields:

- `issue_id`
- `severity`
- `category`
- `repairability`
- `blocking`
- `summary`

Allowed `repairability` values:

- `machine-repairable`
- `manual-only`

Runner decision rules:

- move to `repairing` only when every blocking issue is `machine-repairable`
- move to `needs_review` immediately when any blocking issue is `manual-only`
- reject empty `repair_directives[]` when the report claims issues are repairable
- reject a `pass` verdict if any blocking issue remains open
- reject a `waived` verdict unless waiver metadata is present
- reject any `QAReport` whose `page_spec_ref` does not match the current publish candidate
- reject any `QAReport` whose `preview_build_ref` does not match the verified preview build
- reject any waiver if a failed gate is marked non-waivable

## 5. Repair Budget

Recommended P0 defaults:

- maximum of 2 automated repair attempts per run
- each repair attempt must attach the prior `QAReport` and explicit repair directives
- the runner should not re-enter `repairing` if the new output is materially identical to the previous failed output

## 6. Stop Conditions

The runner should stop automatic progress when any of these occur:

- no valid pack resolution
- unsupported capability requirement
- missing required artifact for the stage
- verifier failure after repair budget exhaustion
- proof or claim failure that cannot be fixed mechanically
- publish failure that leaves deployment state ambiguous

Stop results:

- `failed` when there is no meaningful human choice left
- `needs_review` when a human can decide whether to waive, revise, or stop

## 7. Manual Review And Override

Manual review should be explicit.

Allowed actions from `needs_review`:

- approve with waiver
- reject and mark failed
- rerun from a named state with adjusted inputs

Requirements:

- every override records actor, timestamp, and reason
- waived QA must remain attached to the eventual `PublishVersion`
- waiver may cover only gates whose `waivable` flag is `true`
- P0 non-waivable gates are `artifact-binding`, `claims-proof`, and `publish-safety`
- the waiver approver must have role `release-approver` or `admin`
- the waiver approver must not be the same actor that initiated the publish request
- granting a waiver must materialize a new validated `QAReport` artifact with populated `waiver` metadata rather than mutating the original failed report in place

## 8. Publish Safety

Publish should be rollback-safe.

Rules:

- `PublishVersion` records are immutable
- publish creates a new version before switching the active pointer
- active pointer switches only after the new version is fully ready
- the previous active version must remain available for rollback
- rollback should not mutate historical `PublishVersion` records

Rollback flow should also be explicit:

- `published(active=n)` plus operator rollback request creates a new rollback action record
- active pointer switches back to `previous_active_pointer`
- the affected `PublishVersion` artifact is not rewritten
- the prior stable version becomes active again without mutating its historical record

Publish control-plane ownership:

- the active pointer belongs to a separate serving-layer control-plane record, not to `PublishVersion`
- publish should atomically create the immutable `PublishVersion` artifact and switch the serving pointer
- rollback should atomically switch the serving pointer back and append an audit record for the rollback action
- publish must fail closed if the `QAReport.page_spec_ref` or `QAReport.preview_build_ref` does not match the build being promoted

## 9. Run Log Requirements

P0 run logs should capture:

- selected packs
- selected backend
- capability checks
- input artifact refs
- output artifact refs
- verifier verdicts
- repair attempt count
- publish result
- waiver actor and reason when a waived QA report is approved

These logs are part of the harness contract, not just implementation diagnostics.
