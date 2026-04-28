# Codex Adapter Contract

Date: 2026-04-25  
Status: P1 implementation contract

## Scope

This contract covers the Codex-first P1 adapter. Claude Code compatibility is a later adapter target and should not be implemented inside this adapter.

The runner owns:

- stage routing
- context assembly
- pack compilation
- raw evidence persistence
- artifact validation
- lifecycle transitions
- QA, repair, and publish gates

The adapter owns:

- invoking Codex
- capturing stdout and stderr
- mapping process/API failures
- extracting artifact candidates from raw output
- returning `CodexInvocationResult`

## Runtime Configuration

Default mode remains deterministic mock:

```bash
node --experimental-strip-types superpowers/runner/cli.ts run mock-publish
```

Real Codex mode is opt-in:

```bash
node --experimental-strip-types superpowers/runner/cli.ts run live-publish
```

Environment variables:

- `FUSERA_CODEX_ADAPTER`: `mock` or `real`; only exact `real` enables live invocation.
- `FUSERA_CODEX_COMMAND`: command to run; default `codex`.
- `FUSERA_CODEX_ARGS_JSON`: JSON string array of process arguments. If absent, defaults to `["exec", "--skip-git-repo-check", "--sandbox", "read-only", "-"]`, with optional model and reasoning-effort flags from the variables below.
- `FUSERA_CODEX_MODEL`: optional Codex model override.
- `FUSERA_CODEX_REASONING_EFFORT`: optional Codex reasoning effort override.
- `FUSERA_CODEX_TIMEOUT_MS`: process timeout in milliseconds; default `120000`.
- `FUSERA_CODEX_WORKDIR`: optional Codex child-process working directory. The isolated live gate sets this to a repo-external temporary directory.
- `FUSERA_LIVE_MATRIX_RETRY_POLICY`: live quality matrix retry policy; `off` by default for direct matrix runs. Canonical baseline runs pin this to `retryable`.
- `FUSERA_LIVE_ISOLATED_WORKDIR_RETENTION`: isolated gate retention policy; `delete-empty` by default, also supports `delete-on-success`, `keep`, and `delete`.

Raw adapter invocation keeps its timeout default at `120000ms`. The supported live gates `ci live` and `live-stability` apply the P1 canonical live defaults before invoking the adapter when those variables are unset:

- `FUSERA_CODEX_MODEL=gpt-5.2`
- `FUSERA_CODEX_REASONING_EFFORT=medium`
- `FUSERA_CODEX_TIMEOUT_MS=240000`

Explicit environment values still win. Reports record these effective defaults under `canonical_live_defaults`, and adapter attempts record the effective model, reasoning effort, and timeout in `adapter-result.json`.

Supported runner CLI:

```bash
node --experimental-strip-types superpowers/runner/cli.ts run mock-publish
node --experimental-strip-types superpowers/runner/cli.ts run live-publish
node --experimental-strip-types superpowers/runner/cli.ts continue .fusera/runs/<run_id> <target-stage> [--live|--mock]
node --experimental-strip-types superpowers/runner/cli.ts resume .fusera/runs/<run_id> [--live|--mock]
node --experimental-strip-types superpowers/runner/cli.ts inspect .fusera/runs/<run_id>
node --experimental-strip-types superpowers/runner/cli.ts verify p0
node --experimental-strip-types superpowers/runner/cli.ts verify live-preview .fusera/runs/<run_id>
node --experimental-strip-types superpowers/runner/cli.ts verify live-quality .fusera/runs/<run_id> design-system-pass
node --experimental-strip-types superpowers/runner/cli.ts ci mock
node --experimental-strip-types superpowers/runner/cli.ts ci live
node --experimental-strip-types superpowers/runner/cli.ts ci isolated-live
node --experimental-strip-types superpowers/runner/cli.ts live-stability --runs 3
node --experimental-strip-types superpowers/runner/check-live-runner.ts --auth-probe
```

## Input Bundle

The adapter receives the compiled invocation bundle from `superpowers/runner/invoke-backend.ts`:

```json
{
  "stage": "page-strategy",
  "selected_pack_ids": ["tasks/page-strategy"],
  "stage_profile": {},
  "capabilities": [],
  "compiled_packs": [
    {
      "pack_id": "tasks/page-strategy",
      "backend": "codex",
      "manifest": {},
      "skill_source": ""
    }
  ],
  "run": {},
  "normalized_input_bundle": {},
  "input_artifact_refs": [],
  "materialized_artifacts": {},
  "output_contract_refs": [],
  "repair_directives": []
}
```

The runner persists the raw request under:

```text
.fusera/runs/<run_id>/stages/<stage>/adapter-raw-request.json
.fusera/runs/<run_id>/stages/<stage>/attempts/<attempt_id>/adapter-raw-request.json
```

The stage-level files are latest-attempt convenience pointers. The attempt directory is the immutable audit record.

## Adapter Mode Locking

Run records persist the selected Codex adapter mode:

```json
{
  "backend": "codex",
  "adapter_mode": "real"
}
```

Rules:

- `run mock-publish` creates runs with `adapter_mode: mock`.
- `run live-publish` and `proof --live` create runs with `adapter_mode: real`.
- `continue` must use the persisted run adapter mode.
- for legacy runs without `run.json.adapter_mode`, `continue` infers mode from existing stage `adapter-result.json` evidence.
- if persisted and inferred modes disagree, `continue` fails closed.
- if `continue --live` or `continue --mock` conflicts with the locked run mode, `continue` fails closed.

This prevents a partially completed live run from silently switching later model-owned stages back to the mock adapter.

## Retry And Resume

`resume` is supported only for runs in `state: failed`.

The runner reads:

- `run.json.failed_stage`
- `run.json.failure_mode`
- `run.json.max_backend_retry_attempts`
- existing attempt directories under `stages/<failed_stage>/attempts/`

Retry policy:

- retryable stages are the model-owned stages: `normalize-input`, `product-and-brand-brief`, `page-strategy`, `section-planning`, and `design-system-pass`
- retryable failure modes are `invocation_failure`, `extraction_failure`, `validation_failure`, and `missing_output`
- retries reuse the same run and reassemble context from already validated artifacts
- prior attempt directories remain immutable audit evidence
- rejected artifact candidates remain under `artifacts/rejected/`
- proof runs resume only through the original `proof_target_stage`
- if the stage is not retryable or the retry budget is exhausted, the runner writes `state: needs_review`

Each resume attempt persists:

```text
stages/retrying/retry-decision.json
```

The event ledger records `retry_decision_persisted`, then either `resume_failed_run` or `resume_failed_run_blocked`.

## Output Protocol

Real Codex output may emit stable artifact candidates and run-owned attachments.

Stable artifact candidates must use fenced blocks:

````markdown
```fusera-artifact-json
{
  "artifact_type": "ProductBrief",
  "schema_version": "1.0.0",
  "artifact_id": "product-brief_...",
  "run_id": "run_...",
  "status": "draft",
  "producer_stage": "product-and-brand-brief",
  "input_refs": [],
  "validation": {
    "valid": false,
    "errors": []
  },
  "payload": {}
}
```
````

Rules:

- The adapter must not write stable artifacts directly to `.fusera/runs/`.
- The adapter must not mark artifacts as validated.
- The adapter must emit candidate `run_id` equal to the current run id.
- The adapter must emit at most one candidate per expected stable artifact type.
- The runner validates, persists, rejects, and routes artifacts.

Run-owned attachments must use fenced blocks:

````markdown
```fusera-attachment-json
{
  "kind": "normalized_input_bundle",
  "file_name": "normalized-input.json",
  "body": {
    "bundle_type": "normalized_input_bundle",
    "payload": {}
  }
}
```
````

P1 requires `normalize-input` to return a `normalized_input_bundle` attachment. Missing this attachment is a `missing_output` failure.

## Raw Evidence

The runner persists:

```text
adapter-raw-request.json
adapter-stdout.txt
adapter-stderr.txt
adapter-result.json
```

Raw output must exist before candidate validation starts.

Each adapter invocation must persist immutable attempt-scoped evidence:

```text
stages/<stage>/attempts/<attempt_id>/bundle.json
stages/<stage>/attempts/<attempt_id>/adapter-raw-request.json
stages/<stage>/attempts/<attempt_id>/adapter-stdout.txt
stages/<stage>/attempts/<attempt_id>/adapter-stderr.txt
stages/<stage>/attempts/<attempt_id>/adapter-result.json
```

Runner-owned stages (`page-compile`, `verify-publishable-page`, `publish-preview`) use `usage.mode = runner-owned-noop` and still persist no-op attempt evidence. They must not invoke live Codex.

The real Codex adapter runs in read-only sandbox mode by default. Read-only inspection is allowed; writes are forbidden. `usage.tool_use_observed` records whether tool-use evidence appeared in the adapter transcript.

## Failure Modes

Adapter-owned failure modes:

- `invocation_failure`: process start failure, timeout, non-zero exit, or API transport failure.
- `extraction_failure`: raw output contains malformed artifact blocks and no extractable candidates.

Runner-owned failure modes:

- `validation_failure`: candidates exist but schema or route validation rejects them.
- `missing_output`: required adapter-owned artifacts are not present.

## Verification

Default deterministic verification:

```bash
node --experimental-strip-types superpowers/runner/verify-p0-harness.ts
```

This checks:

- positive publish run
- QA failure run
- schema validation
- compiled pack SKILL source
- adapter candidates
- design context packs
- capability rejection
- artifact status and schema version rejection
- stale and duplicate adapter candidate rejection
- artifact extractor success and malformed-output failure
- normalize-input attachment extraction
- real adapter local process missing-output and early-exit boundaries
- failed-run resume retry with bad attempt retention
- failed proof resume does not publish beyond the proof target
- retry-budget exhaustion without creating another backend attempt

Live preview publish verification:

```bash
node --experimental-strip-types superpowers/runner/cli.ts run live-publish
node --experimental-strip-types superpowers/runner/cli.ts verify live-preview .fusera/runs/<run_id>
node --experimental-strip-types superpowers/runner/cli.ts verify live-quality .fusera/runs/<run_id> design-system-pass
node --experimental-strip-types superpowers/runner/cli.ts ci live
node --experimental-strip-types superpowers/runner/cli.ts ci isolated-live
node --experimental-strip-types superpowers/runner/cli.ts live-stability --runs 3
```

`ci mock` is the required deterministic gate. `.github/workflows/harness.yml` runs it on pull requests and `main` pushes for changes under `superpowers/`, `docs/superpowers/harness/`, `AGENTS.md`, or the workflow itself. `ci live`, `ci isolated-live`, and `live-stability` are optional live gates on a self-hosted runner labeled `fusera-live` with Codex CLI installed and authenticated. The workflow exposes live gates through manual `workflow_dispatch` only; scheduled live gates should be added only after the self-hosted runner, Codex auth, preflight report, and artifact download path are proven in GitHub Actions. Live jobs clean `.fusera/runs/`, write `live-runner-preflight.json` from `check-live-runner.ts --strict-github-actions --auth-probe`, and then run the selected gate. Live gates write runtime diagnostics under `.fusera/runs/` and should be used for manual live checks rather than normal development blocking. The workflow uploads `.fusera/runs/**` with `if: always()` for both mock and live jobs when they run, preserving run evidence even when a gate fails. `ci live` and `live-stability` apply the P1 canonical live defaults above unless explicitly overridden. `ci isolated-live` runs the pinned live quality matrix with a repo-external Codex workdir and defaults to deleting empty temporary workdirs. Live stability reports must retain available run evidence, duration/accounting metadata, failure triage, and separate verifier errors instead of collapsing to a generic exception.
