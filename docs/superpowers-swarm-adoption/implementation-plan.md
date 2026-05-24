# Superpowers Swarm-Orchestration Adoption Implementation Plan

Date: 2026-05-23
Status: Draft implementation plan
Scope: Adopt useful orchestration patterns from `orchestrating-swarms` into
Fusera's Superpowers harness without turning P0 into a general-purpose
multi-agent runtime.

Related notes:

- `adoption-points.md` maps swarm concepts to concrete Fusera landing surfaces.
- This implementation plan sequences those landing points into v0 and future
  milestones.

## 1. Decision

Fusera should adopt swarm orchestration as a declarative harness capability, not
as a persistent teammate system.

Adoption v0 is intentionally narrow. It includes:

- typed stage/run coordination event vocabulary
- pack handoff hardening
- capability truthfulness
- artifact-spine cleanup needed before coordination features can be trusted

Adoption v0 does not include:

- persisted `StageTask` records
- minimal stage DAG execution
- bounded fan-out
- child worker spawning
- review fragment schemas

The rule is: if a swarm concept is adopted, it must be represented in one of
these existing Superpowers surfaces:

- `superpowers/packs/stage-profiles.yaml`
- `superpowers/packs/registry.yaml`
- `superpowers/contracts/artifacts/`
- `.fusera/runs/<run>/events.ndjson`
- `.fusera/runs/<run>/stages/<stage>/attempts/<attempt>/`
- runner validation, verification, merge, retry, or publish gates

It should not become a new root-level orchestration prompt.

## 2. Current Findings

### 2.1 Strong Foundations Already Present

- Stage ownership is explicit in `superpowers/packs/stage-profiles.yaml`.
- Pack selection and artifact requirements are declared in
  `superpowers/packs/registry.yaml`.
- Adapter evidence is persisted under
  `.fusera/runs/<run>/stages/<stage>/attempts/<attempt>/`.
- Lifecycle decisions are runner-owned through `run-stage.ts`, `verify-run.ts`,
  `repair-run.ts`, `retry-policy.ts`, and `publish-preview.ts`.
- Rejected artifacts remain persisted through `validate-artifact.ts`.

### 2.2 Risks To Resolve Before Scheduling Work

1. `DesignSpec` is present in the implementation but not closed as a source of
   truth.
2. Capability declarations are broader than real runtime behavior.
3. Pack handoff examples can imply payload-only JSON is sufficient.
4. Backend support metadata can imply more parity than exists.
5. The stage map is linear; adding DAG or fan-out before contracts are explicit
   would turn the adoption into a scheduler project.

## 3. Workstream A: Artifact Spine Cleanup

Goal: remove ambiguity before adding coordination features.

This is a prerequisite, not a swarm feature.

Adoption v0 decision: promote `DesignSpec` into the canonical stable spine.
`page-compile` must consume validated `DesignSpec` alongside `SectionGraph` and
`ThemeTokens`, and `PageSpec.sections[]` must carry section-level
`design_intent` derived from `DesignSpec.section_design_intents`.

Tasks:

1. Decide the status of `DesignSpec`.
   - Option A: promote it into the canonical stable spine.
   - Option B: downgrade it to optional design context and remove it from the
     required stage chain.

2. If promoted:
   - update harness docs to include `DesignSpec`
   - update `tasks/page-compile` required artifacts to include validated
     `DesignSpec`
   - update `compile-page.ts` so compile behavior consumes design intents, not
     only `SectionGraph` and `ThemeTokens`
   - update verification checks that count expected artifacts

3. If downgraded:
   - remove `design-spec-pass` from `stage-profiles.yaml`
   - remove or reclassify `tasks/design-spec` in `registry.yaml`
   - update verify, retry, CI, and topology checks that currently assume the
     stage exists
   - keep design-spec material as optional context only

Acceptance criteria:

- There is exactly one documented truth for whether `DesignSpec` is stable.
- The stage spine and page compiler consume the same stable artifacts.
- Harness topology and verification pass after the decision.

## 4. Workstream B: Pack Handoff Hardening

Goal: make every stable artifact pack teach the same protocol the adapter
enforces.

Implementation surface:

- Artifact-producing pack `SKILL.md` files under `superpowers/packs/` show
  envelope-wrapped `fusera-artifact-json` examples.
- Runner-owned artifact packs label their handoff as runner-persisted so they
  do not instruct adapters to emit `PageSpec`, `QAReport`, or `PublishVersion`.

Tasks:

1. Update stable artifact `SKILL.md` files to show canonical envelope examples
   or explicitly label examples as payload excerpts.
2. Use `fusera-artifact-json` in artifact-producing pack examples.
3. Include these required envelope fields in examples:
   - `artifact_id`
   - `artifact_type`
   - `schema_version`
   - `run_id`
   - `producer_stage`
   - `status`
   - `input_refs`
   - `payload`
   - `validation`
4. Keep task ownership boundaries visible in each pack:
   - allowed outputs
   - forbidden outputs
   - downstream validation rule

Acceptance criteria:

- No artifact-producing pack implies that payload-only JSON is sufficient.
- Adapter protocol and pack-local instructions do not contradict each other.
- Rejected artifact persistence remains runner-owned, not prompt-owned.

## 5. Workstream C: Capability Truthfulness

Goal: ensure pack routing does not claim capabilities the selected adapter
cannot actually provide.

Implementation surface:

- `superpowers/adapters/codex/capabilities.ts` separates adapter runtime,
  runner-managed, and experimental capability groups.
- `superpowers/packs/registry.yaml` declares `claude-code` only under
  `instruction_only_adapters`.
- Artifact-producing model-owned packs require `artifact.attach` rather than
  unrestricted `workspace.write`.

Tasks:

1. Split capabilities into:
   - `adapter_runtime_capabilities`
   - `runner_managed_capabilities`
   - `experimental_capabilities`

   Target metadata shape:

   ```json
   {
     "adapter_runtime_capabilities": [
       "workspace.read",
       "workspace.search",
       "artifact.attach"
     ],
     "runner_managed_capabilities": [
       "workspace.write",
       "process.exec"
     ],
     "experimental_capabilities": [
       "agent.spawn"
     ]
   }
   ```

   The adapter API should expose the normalized capability groups. Registry
   metadata may continue to declare `capabilities_required`, but the resolver
   should compare those requirements against the normalized runtime model
   instead of a single flat `CODEX_CAPABILITIES` list.

2. Treat `agent.spawn` as unavailable for runtime selection until bounded child
   attempts exist.

3. Clarify `workspace.write`.
   - Artifact-producing stages should not require free workspace writes.
   - The adapter returns candidates.
   - The runner writes validated outputs.
   - Most packs need `artifact.attach`, not unrestricted workspace mutation.

4. Clarify `process.exec`.
   - The runner may invoke Codex as a process.
   - Packs should not automatically receive unrestricted shell semantics.

5. Separate runtime support from instruction-only support.
   - Runtime-supported adapter: `codex`.
   - Instruction-only compatibility target: `claude-code`.
   - Pack metadata should not imply Claude Code runtime parity.

Acceptance criteria:

- Resolver rejects packs requiring unavailable runtime capabilities.
- `agent.spawn` cannot be selected for correctness-critical stages until
  implemented.
- Startup distribution metadata remains consistent with registry behavior.

## 6. Workstream D: Typed Coordination Events

Goal: adopt inspectable swarm-style status without adding a task runtime.

Implementation surface:

- `superpowers/runner/run-event-types.ts` defines the canonical `RunEventType`
  vocabulary, status (`implemented`, `adoption-v0`, `future`), required fields,
  v0 data-field shape checks, and event-only versus runner-decision authority.
- `superpowers/runner/write-run-event.ts` validates event types and known data
  field shapes before appending to `events.ndjson`.
- `run-stage.ts` emits `stage_join_ready` after a stage has materialized all
  allowed stable outputs and before the runner advances.
- `run-stage.ts` emits `stage_blocked` when a stage is stopped into
  `needs_review`, and emits `stage_unblocked` when retry policy clears a failed
  stage for retry.

Adoption v0 stage/run events:

- `stage_blocked`
- `stage_unblocked`
- `stage_join_ready`
- `agent_message`

Required v0 fields:

| Event type | Required fields | Meaning |
|---|---|---|
| `stage_blocked` | `type`, `stage`, `data.reason` | Stage cannot advance; event is inspectable status only. |
| `stage_unblocked` | `type`, `stage`, `data.reason` | Previous blocker no longer applies; artifact validation still decides consumption. |
| `stage_join_ready` | `type`, `stage`, `data.required_artifacts`, `data.validated_artifact_refs` | Runner observed the stage's required outputs as validated. |
| `agent_message` | `type`, `data.message` | Run-scoped coordination note; never artifact authority. |

Future worker events:

- `worker_started`
- `worker_completed`
- `worker_blocked`
- `worker_failed`
- `worker_idle`
- `worker_joined`

Tasks:

1. Define a `RunEventType` vocabulary or JSON schema.
2. Document required fields for each event type.
3. Keep `events.ndjson` append-only.
4. State that events can reference artifacts and attempts but are not artifact
   authority.
5. Use the same event names in adoption docs, implementation docs, and future
   runner code.
6. Keep future worker events documented but non-implementing in v0, so v0 does
   not imply worker lifecycle support.

Acceptance criteria:

- The event vocabulary is consistent across this directory.
- v0 event types do not require child worker spawning.
- Future worker event types are clearly marked as future.
- Existing run events remain valid.

## 7. Adoption v0 Done Definition

Adoption v0 is complete when:

- `DesignSpec` is either fully integrated into the stable spine or removed from
  the required path.
- Pack handoff examples match the adapter artifact protocol.
- Capability declarations match actual runtime behavior.
- `agent.spawn` is marked experimental or unavailable for runtime routing until
  implemented.
- Typed stage/run coordination events are documented with one canonical
  vocabulary.
- No new canonical source lives outside `superpowers/` and `.fusera/runs/`.

Adoption v0 is complete without:

- a scheduler
- a minimal DAG
- persisted `StageTask` records
- child worker execution
- review fragment schemas
- bounded fan-out

## 8. Future Workstream E: Non-Authoritative StageTask Evidence

This is not part of adoption v0.

Goal: add run-scoped task evidence only if derived inspect views from events and
artifacts are insufficient.

Rules:

- `StageTask` is non-authoritative evidence, not a TaskList runtime.
- `StageTask` must live under `.fusera/runs/<run>/coordination/`.
- `owner` must be a pack id or child worker id, not a long-lived identity.
- `expected_outputs` must be allowed by the stage profile.
- `output_refs` do not become authoritative until runner validation passes.

Acceptance criteria:

- Inspect can explain task status without reading global state.
- Removing `StageTask` evidence does not invalidate stable artifacts.
- Runner validation remains the authority for output acceptance.

## 9. Future Workstream F: Child Attempt Contracts

This is not part of adoption v0.

Goal: define child execution contracts before bounded fan-out.

### ChildInvocationBundle

Required fields:

- `child_id`
- `parent_stage`
- `parent_attempt_id`
- `task_pack_id`
- `expected_outputs`
- `input_artifact_refs`
- `output_contract_refs`
- `allowed_capabilities`

### ChildAttemptResult

Required fields:

- `child_id`
- `terminal_status`: `completed`, `failed`, `blocked`, or `partial`
- `adapter_status`: adapter-level `ok` or `failed`
- `outputs`
- `blocked_reason`
- `retryable`
- `partial`
- `resume_from`

Each output entry is scoped to one expected artifact or fragment:

```json
{
  "artifact_type": "ProductBrief",
  "status": "validated",
  "candidate_ref": "children/child_product_brief/candidates/product-brief.json",
  "output_ref": "ProductBrief:product-brief_run_..."
}
```

Allowed output statuses:

- `validated`
- `rejected`
- `missing`
- `not_applicable`

Rules:

- Adapter success does not equal task completion.
- Task completion does not equal artifact validation.
- A child can be blocked without failing the whole stage immediately.
- Retryability must be explicit.

## 10. Future Workstream G: Bounded Fan-Out

This is not part of adoption v0.

Goal: introduce swarm-style parallel specialists safely, using runner-owned
evidence.

Initial fan-out target:

- `product-and-brand-brief`
  - child worker A produces `ProductBrief`
  - child worker B produces `BrandProfile`
  - runner joins when both child outputs validate

Policy shape:

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

Child evidence shape:

```text
.fusera/runs/<run>/stages/<stage>/attempts/<attempt>/children/<child_id>/
  child-request.json
  child-stdout.txt
  child-stderr.txt
  child-result.json
```

Rules:

- Serial fallback must be implemented first.
- Parallel and serial fallback must produce the same validated artifacts.
- Child expected outputs are disjoint unless the child emits non-stable review
  fragments.
- Failed child outputs must not overwrite sibling evidence.
- Join decisions are made by the runner, not by child worker prose.

Acceptance criteria:

- Child invocation bundles and results are persisted.
- `children.expected_outputs` controls per-child validation.
- The runner records a join decision with accepted and rejected child outputs.
- No child writes stable artifacts directly to final artifact paths.

## 11. Future Workstream H: Review Fragments

This is not part of adoption v0.

Goal: enable review and QA fan-out without letting multiple workers write
`QAReport` directly.

Before implementation, define a run-scoped fragment schema with:

- `schema_version`
- `fragment_id`
- `producer_child_id`
- `stage`
- `review_role`
- `status`
- `input_refs`
- `findings`
- `recommended_verdict`
- `validation`
- `errors`

Also define a merge decision record with:

- accepted fragments
- rejected fragments
- merge rationale
- final `QAReport` ref

Rules:

- Review fragments are not stable artifacts unless promoted through a separate
  schema decision.
- The stable `QAReport` remains runner/verifier-owned.

## 12. Future Workstream I: Minimal Stage DAG

This is not part of adoption v0.

Goal: adopt swarm-style dependency unblocking without introducing a TaskList
runtime.

Use one field name consistently:

```yaml
requires_stages:
  - product-and-brand-brief
requires_artifacts:
  - ProductBrief
  - BrandProfile
join_policy:
  mode: all
parallel_group: brief-generation
```

Rules:

- Keep `next_stage` for the default linear path.
- Add topology validation before scheduling behavior.
- Validate no cycles.
- Validate every `requires_stages` entry exists.
- Validate every `requires_artifacts` entry has exactly one producer stage.
- Validate `join_policy: all` requires all dependencies to validate before
  execution.

Acceptance criteria:

- Existing linear run behavior is unchanged.
- Topology graph shows dependency edges beyond `next_stage`.
- A blocked stage cannot run until required artifacts are validated.

## 13. Validation Commands

Run these after code-bearing implementation workstreams:

```bash
npm run harness:topology
npm run harness:verify
npm run test:node
```

Run these after adapter or live-runner changes:

```bash
npm run harness:mock
npm run harness:startup
```

Run full app checks only when UI or Supabase paths are touched:

```bash
npm run test
npm run build
```

Documentation-only updates do not require test execution.

## 14. Non-Goals

- Do not implement a general teammate runtime.
- Do not persist canonical orchestration state under `~/.codex`.
- Do not add long-lived worker identities.
- Do not let child workers write stable artifacts directly to final artifact
  paths.
- Do not claim Claude Code runtime parity through pack metadata.
- Do not make `events.ndjson` replace artifact contracts.
- Do not make adoption v0 depend on DAG or fan-out delivery.
