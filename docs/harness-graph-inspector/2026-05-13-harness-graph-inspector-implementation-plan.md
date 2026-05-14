# Harness Graph Inspector Implementation Plan

Date: 2026-05-13
Status: Draft for implementation
Purpose: Add a read-only graph diagnostics layer for the Fusera harness, inspired by graphify-7, without changing P0 routing, artifact ownership, or backend authority.

## 1. Decision Summary

Fusera should borrow graphify-7's diagnostic pattern, not its execution authority.

The useful idea is a compact, queryable map of harness structure and run evidence:

- stage and artifact dependency graph
- central harness abstractions and cross-stage bridges
- surprising or risky relationships
- confidence labels for extracted versus inferred diagnostics
- human-readable report alongside machine-readable JSON

The graph inspector must remain read-only. It may explain, visualize, and flag relationships, but it must never decide stage transitions, select packs, validate stable artifacts, or override runner state.

## 2. Non-Negotiable Constraints

- `superpowers/` remains the canonical source for packs, contracts, runner logic, and adapters.
- `.fusera/` remains runtime output only.
- `superpowers/packs/registry.yaml` and `superpowers/packs/stage-profiles.yaml` remain the authority for routing and stage ownership.
- Stable artifacts remain canonical envelopes validated by `superpowers/contracts/artifacts/`.
- Downstream stages may consume only validated artifacts.
- Graph-derived `INFERRED` or `AMBIGUOUS` relationships are diagnostics only.
- P0 stays Codex-first; no implementation should introduce Claude-first behavior.
- The topology builder must reuse existing registry/stage-profile parsing and validation paths where possible. If resolver validation needs a graph-friendly shape, extract shared helpers rather than duplicating independent rules.

## 3. Target Shape

Add a runner-side inspector that can emit graph diagnostics for either:

- repository harness topology
- a specific run directory under `.fusera/runs/<run_id>/`

Proposed outputs:

```text
.fusera/
  runs/
    <run_id>/
      analysis/
        run-graph.json
        run-graph-report.md
```

For repository-level topology:

```text
.fusera/
  analysis/
    harness-graph.json
    harness-graph-report.md
```

These are runtime diagnostics, not canonical source.

## 4. Graph Model

### Node Types

- `stage`: stage profile entries from `stage-profiles.yaml`
- `pack`: pack entries from `registry.yaml`
- `artifact_type`: stable artifact types such as `ProductBrief`, `PageSpec`, `QAReport`
- `artifact_instance`: persisted artifact envelopes from a run
- `run_event`: event records from a run
- `adapter_attempt`: stage attempt evidence directories
- `compiled_output`: runner-owned outputs such as preview builds
- `status`: normalized run, stage, or adapter status values
- `terminal`: terminal workflow sentinels such as `end`
- `diagnostic`: derived warnings or observations

### Edge Types

- `primary_task`
- `allows_auxiliary_task`
- `uses_context_pack`
- `uses_verifier_pack`
- `requires_artifact`
- `produces_artifact`
- `stage_allows_output`
- `adapter_produced_candidate`
- `runner_persisted_artifact`
- `attempt_has_status`
- `next_stage`
- `validated_as`
- `rejected_as`
- `consumes`
- `resolves_input_ref`
- `references_run_file`
- `emits_event`
- `attempted_by`
- `compiled_from`
- `published_from`
- `diagnostic_relates_to`

### Confidence Labels

- `EXTRACTED`: directly read from registry, stage profiles, artifact envelopes, events, or attempt evidence
- `INFERRED`: derived from naming, missing references, event ordering, or cross-file joins
- `AMBIGUOUS`: potentially meaningful but not confirmed; requires human review

Edge confidence does not determine diagnostic severity by itself. Diagnostics must carry their own `severity` and `check_kind`.

Only checks supported entirely by `EXTRACTED` source facts may be `check_kind: "hard"`. Diagnostics that depend on inferred ordering, naming similarity, or incomplete evidence must be `check_kind: "soft"` or `check_kind: "info"` even when they are useful.

### Graph JSON Contract

Define the graph JSON contract in Phase 1. Do not leave the serialization shape implicit.

Required top-level fields:

- `schema_version`: start at `1.0.0`
- `graph_type`: `harness-topology` or `run-evidence`
- `generated_at`: ISO timestamp
- `source_refs`: run-relative or repo-relative files used to build the graph
- `nodes`: graph nodes
- `links`: directed graph edges
- `diagnostics`: normalized diagnostics also represented as `diagnostic` nodes

Required node fields:

- `id`: stable string id
- `type`: one of the node types above
- `label`: human-readable label
- `source_ref`: repo-relative or run-relative source path when available
- `metadata`: object for type-specific data

Required metadata conventions:

- `stage.metadata.allowed_outputs`: artifact types from the stage profile
- `adapter_attempt.metadata.status`: adapter result status, when present
- `adapter_attempt.metadata.usage_mode`: adapter usage mode, when present
- `adapter_attempt.metadata.failure_mode`: failure mode, when present
- `artifact_instance.metadata.status`: artifact envelope status
- `compiled_output.metadata.preview_build_ref`: preview build ref for preview builds
- `diagnostic.metadata.severity`: `critical`, `warning`, or `info`
- `diagnostic.metadata.check_kind`: `hard`, `soft`, or `info`

Required link fields:

- `source`: source node id
- `target`: target node id
- `relation`: one of the edge types above
- `confidence`: `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`
- `source_ref`: source file or evidence file supporting the edge
- `metadata`: object for relation-specific data

Stable id rules:

- stages: `stage:<stage-name>`
- packs: `pack:<pack-id>`
- artifact types: `artifact-type:<ArtifactType>`
- artifact instances: `artifact:<artifact_id>`
- run events: `event:<zero-based-ordinal>:<event_id-or-type>`
- adapter attempts: `attempt:<stage>:<attempt_id>`
- compiled outputs: `compiled:preview-build:<preview_build_ref>`
- status values: `status:<kind>:<value>`
- terminal sentinels: `terminal:end`
- diagnostics: `diagnostic:<stable-hash>`

Edges are always directed. If a renderer needs undirected traversal later, it should derive that view from this directed source rather than changing the persisted contract.

## 5. Implementation Phases

### Phase 1: Read-Only Topology Builder

Goal: Build a graph from canonical pack and stage configuration.

Tasks:

- Add a runner module that uses the existing resolver loading/parsing path for `superpowers/packs/registry.yaml` and `superpowers/packs/stage-profiles.yaml`.
- Reuse or extract resolver consistency checks from `resolve-packs.ts` so topology diagnostics do not drift from execution-time validation.
- Emit nodes for stages, packs, and artifact types.
- Emit edges for stage ownership, allowed outputs, required artifacts, and next-stage transitions.
- Represent allowed outputs with `stage_allows_output` edges from `stage:<stage>` to `artifact-type:<ArtifactType>`.
- Emit `terminal:end` as a legal terminal node when a stage profile uses `next_stage: end`.
- Add consistency diagnostics for:
  - pack declares outputs not allowed by its stage
  - stage allows an output with no producer pack
  - artifact type has multiple producer stages
  - stage transition points to an unknown stage other than the terminal `end` sentinel
  - registry pack path is missing
  - resolver validation emits registry/profile composition errors

Suggested module:

```text
superpowers/runner/harness-graph.ts
```

Development invocation:

```bash
node --experimental-strip-types superpowers/runner/cli.ts graph harness
```

The canonical user-facing command is `fusera graph harness`; raw `node --experimental-strip-types ...` invocations are for local runner development only.

### Phase 2: Run Evidence Graph

Goal: Build a graph from a specific `.fusera/runs/<run_id>/` directory.

Tasks:

- Read `run.json`.
- Read `events.ndjson`. Optionally fall back to `events.jsonl` only for compatibility with stale or hand-authored run fixtures.
- Read validated and rejected artifacts.
- Read stage attempt directories.
- Read `compiled/preview-build.json` and preview publish handoff when present.
- Link artifact instances to producer stages and input refs.
- Link attempts to adapter result status using `attempt_has_status` edges and adapter-produced candidate types using `adapter_produced_candidate` edges.
- Split adapter candidates from runner-owned persisted artifacts:
  - `adapter_produced_candidate` edges represent candidate objects returned by the adapter.
  - `runner_persisted_artifact` edges represent `PageSpec`, `QAReport`, `PublishVersion`, and any other runner-owned artifacts persisted by runner logic.
- Resolve `input_refs` by kind, not by artifact id alone. The resolver must index:
  - validated and rejected `artifacts/**/*.json` by `artifact_id`
  - `compiled/preview-build.json.preview_build_ref`
  - known run-relative file refs such as `stages/normalize-input/normalized-input.json`
  - preview publish handoff refs when present
- Flag evidence gaps:
  - completed stage missing expected artifact
  - artifact input ref not found in any indexed artifact, compiled output, or known run file
  - run state disagrees with final events
  - publish handoff missing after published state
  - rejected artifact lacks validation errors
  - `compiled/preview-build.json.page_spec_ref` does not match the persisted `PageSpec.artifact_id`
  - `QAReport.payload.page_spec_ref` does not match the persisted `PageSpec.artifact_id`
  - `QAReport.payload.preview_build_ref` does not match `compiled/preview-build.json.preview_build_ref`
  - `PublishVersion.payload.page_spec_ref` does not match the persisted `PageSpec.artifact_id`
  - `PublishVersion.payload.qa_report_ref` does not match the persisted `QAReport.artifact_id`
  - `previews/publish-handoff.json.publish_version_ref` does not match the persisted `PublishVersion.artifact_id`
  - `previews/publish-handoff.json.preview_build_ref` does not match `compiled/preview-build.json.preview_build_ref`

Binding mismatch diagnostics above are `check_kind: "hard"` because they compare direct values from persisted run files.

Development invocation:

```bash
node --experimental-strip-types superpowers/runner/cli.ts graph run .fusera/runs/<run_id>
```

The canonical user-facing command is `fusera graph run <run-dir>`; raw `node --experimental-strip-types ...` invocations are for local runner development only.

### Phase 3: Report Renderer

Goal: Produce a human-readable report similar in spirit to `GRAPH_REPORT.md`.

Report sections:

- Corpus summary: stages, packs, artifacts, attempts, events
- God nodes: most connected stages, packs, artifacts, or attempts
- Surprising connections: cross-stage links or evidence inconsistencies
- Diagnostics: hard failures and soft warnings
- Suggested questions: prompts that help debug the run

Report must clearly label:

- authoritative facts from source configuration or run evidence
- inferred observations
- ambiguous relationships needing human review

### Phase 4: Inspection Integration

Goal: Make graph diagnostics visible from existing inspection workflows.

Tasks:

- Add a short graph summary to `inspectRun()` output when graph diagnostics exist.
- Add commands that regenerate diagnostics on demand.
- Keep generation opt-in at first; do not make normal runs depend on it.

CLI contract:

```bash
fusera graph harness
fusera graph run <run-dir>
fusera inspect <run-dir> --graph
```

`graph harness` generates repository topology diagnostics under `.fusera/analysis/`.

`graph run <run-dir>` generates run evidence diagnostics under `<run-dir>/analysis/`.

`inspect <run-dir> --graph` reads and summarizes existing graph diagnostics. It should not regenerate diagnostics unless a later explicit flag, such as `--graph=refresh`, is added.

Wrapper requirement:

- Update `bin/fusera.mjs` argument normalization so `fusera graph run <run-dir>` resolves `<run-dir>` from the caller's invocation directory, matching the existing behavior for `inspect`, `continue`, and `resume`.
- `fusera graph harness` does not take a run path and should execute against the linked Fusera source root.

### Phase 5: CI Gate Candidates

Goal: Promote only deterministic topology checks into CI.

Candidate CI checks:

- no unknown stage references
- no duplicate artifact producers
- no registry/stage output mismatch
- no missing pack files
- no malformed next-stage chain

Do not promote run-specific inferred diagnostics into CI until they have stable false-positive behavior.

## 6. Out Of Scope

- Replacing `registry.yaml` or `stage-profiles.yaml` with graph routing
- Using graph centrality to select packs
- Allowing graph output to validate or reject stable artifacts
- Adding a general-purpose graph database
- Adding Neo4j, NetworkX, or Python runtime dependencies to P0
- Implementing multi-agent extraction like graphify semantic passes
- Implementing graphify-style `graph.html` or interactive visualization in the first version
- Writing canonical source files under `.fusera/`

## 7. Design Notes From graphify-7

Borrow:

- one human report plus one machine JSON output
- confidence labels on relationships
- god nodes and surprising connections as navigation aids
- incremental/cache thinking for expensive diagnostics
- end-to-end tests that assert report shape, not only unit behavior

Avoid:

- default HTML or interactive visualization output in the P0 implementation
- platform-wide install and hook complexity in the P0 path
- LLM-inferred relationships as execution input
- graph outputs becoming a second source of truth
- broad multi-agent extraction in the first implementation

## 8. Test Plan

Unit tests:

- topology builder emits expected stage, pack, and artifact nodes
- graph builder labels registry/profile relationships as `EXTRACTED`
- duplicate producer and missing pack diagnostics are emitted
- unknown next-stage transition is flagged, while `next_stage: end` is accepted as a terminal sentinel
- graph JSON obeys `schema_version`, stable id, `nodes`, `links`, direction, confidence, metadata, and diagnostic `severity` / `check_kind` rules
- renderer includes summary, god nodes, diagnostics, and suggested questions

Integration tests:

- generate topology graph from the real repository registry and stage profiles
- generate run graph from a fixture run
- parse run events from `events.ndjson`
- resolve `input_refs` that point to artifact ids, preview build refs, and known run-relative files
- represent runner-owned `PageSpec`, `QAReport`, and `PublishVersion` as runner-persisted artifacts, not adapter candidates
- represent stage allowed outputs through `stage_allows_output` links
- represent adapter attempt status through `attempt_has_status` links and `adapter_attempt.metadata.status`
- ensure rejected artifacts are represented with validation errors
- ensure QA and publish binding mismatches emit `check_kind: "hard"` diagnostics
- ensure graph generation does not mutate source files or stable artifacts

Regression tests:

- graph command must succeed when no run artifacts exist yet
- graph command must not fail if optional preview outputs are absent
- malformed run evidence should produce diagnostics rather than crashing when possible
- `inspect --graph` must summarize existing diagnostics without regenerating them
- `fusera graph run <relative-run-dir>` must normalize the run path through `bin/fusera.mjs`

## 9. Open Questions

- Should `graph harness` be part of `fusera doctor`, or remain a separate command?
- Should topology diagnostics be exported as an internal artifact envelope later, or stay outside the stable artifact spine?
- Should `inspect --graph` gain an explicit refresh mode later, or should graph regeneration remain exclusively under `fusera graph ...` commands?

## 10. Recommended First Patch

Start with the smallest useful slice:

1. Add `superpowers/runner/harness-graph.ts`.
2. Define and test the `1.0.0` graph JSON contract.
3. Implement repository topology graph only, using shared resolver loading and validation paths.
4. Emit JSON and Markdown under `.fusera/analysis/`.
5. Add a CLI command behind `graph harness`.
6. Add `bin/fusera.mjs` normalization for the future `graph run <run-dir>` command before adding the run graph command.
7. Add focused tests for registry/stage profile consistency, stable ids, `stage_allows_output`, and the `end` terminal sentinel.

This gives immediate value for maintainability without touching run execution, adapter behavior, or artifact validation.
