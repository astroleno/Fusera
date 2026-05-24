# Swarm Adoption Landing Points

Date: 2026-05-23
Status: Draft adoption notes
Scope: Concrete landing points for borrowing useful orchestration patterns from
`orchestrating-swarms` into Fusera's Superpowers harness.

## 1. Summary

Fusera should borrow the protocol shape from swarm orchestration, not the
runtime substrate.

The useful shape is:

- a leader owns coordination
- work items have status, owners, dependencies, and completion signals
- workers produce structured evidence
- messages are typed and inspectable
- fan-out is bounded
- join and shutdown decisions are explicit

The Fusera translation is:

- leader -> runner plus stage profile
- team -> future run-scoped coordination group
- teammate -> future child attempt or bounded adapter worker
- task -> derived work item; future `StageTask` only if kept non-authoritative
- inbox -> typed run event or run-scoped message record
- dependency -> stage/artifact requirement
- completion -> validated artifact, join event, or future review fragment
- cleanup -> runner-owned finalization and immutable evidence

## 2. Adoption Levels

Adoption v0 is intentionally small:

- resolve the artifact spine cleanup prerequisite by promoting `DesignSpec`
  into the stable spine
- define a typed coordination event vocabulary
- harden pack handoff examples against the canonical artifact envelope
- make capability declarations truthful, especially `agent.spawn` and
  `workspace.write`
- keep coordination inspectable through existing run events and artifact refs

Adoption v0 does not include:

- persisted `StageTask` records
- a minimal stage DAG
- bounded fan-out
- child worker spawning
- review fragment schemas

Those belong to later milestones after the artifact spine and adapter capability
contracts are cleaned up.

## 3. Adoptable Concepts

| Swarm concept | Adopt into Fusera as | Landing surface | Status |
|---|---|---|---|
| Leader | runner-owned orchestration decisions | `run-stage.ts`, `stage-profiles.yaml` | already aligned |
| Team | run-scoped coordination group | `.fusera/runs/<run>/coordination/` | future v1/v2 |
| Teammate | child attempt or bounded worker | `stages/<stage>/attempts/<attempt>/children/<child_id>/` | future v2 |
| Task | derived inspect view; optional non-authoritative `StageTask` | events, artifact refs, optional coordination record | future v1 |
| Task dependencies | validated artifact requirements; optional stage DAG later | `registry.yaml`, `stage-profiles.yaml`, `resolve-packs.ts` | partially present |
| Inbox message | typed run event or message artifact | `events.ndjson`, optional `coordination/messages/*.json` | partially present |
| Task completion | validated output ref or future review fragment ref | artifact envelope, `worker_completed`, `worker_joined` | future v1/v2 |
| Worker lifecycle | bounded child status events | `worker_started`, `worker_blocked`, `worker_failed`, `worker_idle`, `worker_joined` | future v2 |
| Graceful shutdown | runner finalization | stage completion, retry decision, repair decision | partially present |

## 4. First Landing Point: Typed Coordination Events

The lowest-risk adoption is to add typed run events before adding any new
parallel execution.

Adoption v0 stage/run events:

- `stage_blocked`
- `stage_unblocked`
- `stage_join_ready`
- `agent_message`

Canonical source:

- `superpowers/runner/run-event-types.ts` owns the typed vocabulary, required
  field metadata, and v0 data-field type checks.
- `superpowers/runner/write-run-event.ts` validates event types and known data
  field shapes before append.
- `stage_join_ready` is emitted by the serial runner when a stage's allowed
  stable outputs have all validated; it is evidence for inspection, not
  artifact authority.
- `stage_blocked` is emitted when retry policy or runner stage-stop handling
  leaves a stage in `needs_review`.
- `stage_unblocked` is emitted when retry policy allows a failed stage to enter
  `retrying`.

Future worker events:

- `worker_started`
- `worker_completed`
- `worker_blocked`
- `worker_failed`
- `worker_idle`
- `worker_joined`

Rules:

- Events are append-only.
- Events are not artifact authority.
- Events may reference artifacts, attempts, and worker ids.
- Stable downstream consumption still requires validated artifacts.
- The same event vocabulary must be used by all adoption documents.
- Adoption v0 should define a `RunEventType` vocabulary or JSON schema. The first
  implementation may be doc-only, but future runner code should avoid
  unrestricted event strings.

Example:

```json
{
  "type": "stage_join_ready",
  "stage": "product-and-brand-brief",
  "data": {
    "required_artifacts": ["ProductBrief", "BrandProfile"],
    "validated_artifact_refs": [
      "ProductBrief:product-brief_run_...",
      "BrandProfile:brand-profile_run_..."
    ],
    "next_stage": "page-strategy"
  }
}
```

## 5. Second Landing Point: Derived Work Items First

For adoption v0, do not persist `StageTask` records. Build inspect views from
existing stage events, attempt evidence, and artifact refs.

Persisted `StageTask` records are a future milestone only if derived views are
not enough.

## 6. Future Landing Point: Non-Authoritative StageTask Evidence

Do not use global `~/.codex/tasks`. If Fusera needs swarm-style task state, keep
it under the run directory:

```text
.fusera/runs/<run>/coordination/tasks/<task_id>.json
```

Suggested `StageTask` shape:

```json
{
  "task_id": "task_product_brief",
  "stage": "product-and-brand-brief",
  "role": "primary",
  "owner": "product-brief",
  "status": "pending",
  "blocked_by": [],
  "input_refs": ["stages/normalize-input/normalized-input.json"],
  "expected_outputs": ["ProductBrief"],
  "output_refs": [],
  "attempt_refs": [],
  "failure_policy": "fail-stage",
  "merge_policy": "runner-owned"
}
```

Rules:

- `task_id` is run-scoped, not global.
- `owner` is a pack id or worker id, not a long-lived identity.
- `StageTask` is non-authoritative run evidence, not a TaskList runtime.
- `expected_outputs` must be allowed by the stage profile.
- `output_refs` are not authoritative until validated by the runner.
- Merge decisions remain runner-owned.
- Adoption v0 is complete without this record.

## 7. Future Landing Point: Bounded Fan-Out

Start with serial fallback and deterministic evidence shape. Parallel execution
can come later.

Do not start this before child invocation, child output, child result, and join
validation semantics are defined.

Recommended first target:

- stage: `product-and-brand-brief`
- child A: `tasks/product-brief`
- child B: `tasks/brand-profile`
- join policy: `all_validated`
- fallback: `serial`

Suggested policy:

```yaml
parallelism_policy:
  mode: bounded-fanout
  max_workers: 2
  join_policy: all_validated
  fallback: serial
  children:
    - task: tasks/product-brief
      expected_outputs:
        - ProductBrief
    - task: tasks/brand-profile
      expected_outputs:
        - BrandProfile
```

Rules:

- Bounded fan-out is allowed only when each child has disjoint expected stable
  outputs or emits non-stable review fragments.
- A child must not write final artifact files directly.
- The runner persists child evidence and validates candidate outputs.
- The runner performs the join.
- Serial and parallel modes must produce the same final artifacts.

Required child invocation fields:

- `child_id`
- `parent_stage`
- `parent_attempt_id`
- `task_pack_id`
- `expected_outputs`
- `input_artifact_refs`
- `output_contract_refs`
- `allowed_capabilities`

Required child result fields:

- `child_id`
- `terminal_status`
- `adapter_status`
- `outputs`
- `blocked_reason`
- `retryable`
- `partial`
- `resume_from`

The `outputs` field is per output, not a single stage-level status:

```json
{
  "outputs": [
    {
      "artifact_type": "ProductBrief",
      "status": "validated",
      "candidate_ref": "children/child_product_brief/candidates/product-brief.json",
      "output_ref": "ProductBrief:product-brief_run_..."
    }
  ]
}
```

## 8. Future Note: Review Fragments

For review and QA fan-out, avoid letting multiple workers write `QAReport`
directly.

Review fragments are not part of adoption v0. If pursued, define a run-scoped
schema before implementation. Use non-stable review fragments first:

```json
{
  "fragment_type": "review-fragment",
  "schema_version": "0.1.0",
  "fragment_id": "review_claims_01",
  "stage": "verify-publishable-page",
  "producer_child_id": "child_claims_review_01",
  "review_role": "claims-proof",
  "status": "candidate",
  "input_refs": ["PageSpec:page-spec_run_..."],
  "findings": [
    {
      "severity": "blocker",
      "code": "claim_without_proof",
      "message": "A trust claim lacks a matching ProofRef.",
      "refs": ["claim:reviews.1"]
    }
  ],
  "recommended_verdict": "fail",
  "validation": {
    "valid": false,
    "checked_at": "2026-05-23T00:00:00.000Z"
  },
  "errors": [
    {
      "code": "claim_without_proof",
      "message": "A trust claim lacks a matching ProofRef."
    }
  ]
}
```

Then merge fragments into the stable `QAReport` in a runner-owned verifier step.
Persist a merge decision record that names accepted and rejected fragments.

Good first review roles:

- `claims-proof`
- `artifact-binding`
- `visual-quality`
- `responsive-layout`
- `publish-safety`

## 9. Future Landing Point: Harness Graph Extensions

The harness graph already models stages, packs, artifacts, attempts, events, and
diagnostics. Swarm adoption should extend that graph before introducing opaque
worker behavior.

Recommended new relation names:

- `task_owned_by`
- `task_blocked_by`
- `worker_attempted`
- `worker_emitted_event`
- `worker_produced_candidate`
- `message_to`
- `joined_into`
- `fragment_merged_into`

Graph validation should answer:

- Which worker produced each candidate?
- Which task owned each output?
- Which join decision accepted or rejected sibling outputs?
- Did every fan-out child have immutable evidence?
- Did a failed child leave enough evidence for retry or manual review?

## 10. Things Not To Adopt

Do not adopt these from `orchestrating-swarms` as canonical Fusera behavior:

- global team config under `~/.codex/teams`
- global task queue under `~/.codex/tasks`
- teammate inbox files as artifact authority
- tmux or iTerm2 as required execution backends
- long-lived worker identities
- self-organizing worker pools for stable artifact production
- Claude Code runtime parity claims before the Codex path implements equivalent
  behavior

## 11. Implementation Order

Adoption v0:

1. Align the artifact spine, especially the status of `DesignSpec`.
2. Harden pack handoff examples so they match canonical artifact envelopes.
3. Make capability declarations truthful, especially `agent.spawn`.
4. Define typed coordination events.

Future milestones:

5. Add derived inspect views for coordination.
6. Add optional non-authoritative `StageTask` records only if needed.
7. Define child invocation and `ChildAttemptResult` contracts.
8. Add serial fallback for bounded fan-out.
9. Enable real parallel child attempts only after evidence and join semantics are
   stable.
10. Extend harness graph diagnostics for worker and merge edges.

## 12. Acceptance Bar

Swarm adoption is useful only if these remain true:

- `superpowers/` remains the canonical source tree.
- `.fusera/runs/` remains runtime evidence.
- Stable artifacts are still validated through canonical schemas.
- Rejected outputs remain persisted.
- Runner decisions are auditable.
- Serial fallback is available before any real fan-out path ships.
- The harness remains thin.

Adoption v0 is complete without a scheduler, stage DAG, persisted `StageTask`
records, review fragments, or bounded fan-out.
