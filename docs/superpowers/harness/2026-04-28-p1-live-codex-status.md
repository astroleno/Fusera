# P1 Live Codex Harness Status

Date: 2026-04-28  
Status: P1 live Codex artifacts to deterministic preview publish proof closed

## What Is Closed

The P1 harness now proves this path:

```text
live Codex model-owned artifacts
  -> deterministic PageSpec compile
  -> deterministic QAReport gate
  -> deterministic preview PublishVersion
```

Closed capabilities:

- real Codex adapter mode behind `FUSERA_CODEX_ADAPTER=real`
- run-level `adapter_mode` persistence and continue-time adapter-mode locking
- live `normalize-input` attachment extraction
- live stable artifact candidate extraction for `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, and `ThemeTokens`
- candidate route guards for current `run_id`, expected artifact type, duplicate artifact type, and schema validity
- immutable attempt-scoped raw evidence under `stages/<stage>/attempts/<attempt_id>/`
- runner-owned no-op backend evidence for `page-compile`, `verify-publishable-page`, and `publish-preview`
- deterministic `PageSpec`, `QAReport`, and preview-scoped `PublishVersion`
- live preview publish verification through `verify-live-preview-publish.ts`
- live artifact quality verification through `verify-live-codex-quality.ts`
- hard-isolated live quality baseline verification through `verify-live-codex-isolated-baseline.ts`
- P2 failed-run resume for retryable model-owned stage failures
- retry-budget fail-closed behavior with persisted retry decisions

## Supported CLI

Use `superpowers/runner/cli.ts` as the supported runner entrypoint:

```bash
node --experimental-strip-types superpowers/runner/cli.ts run mock-publish
node --experimental-strip-types superpowers/runner/cli.ts run live-publish
node --experimental-strip-types superpowers/runner/cli.ts run qa-failure
node --experimental-strip-types superpowers/runner/cli.ts proof design-system-pass --live
node --experimental-strip-types superpowers/runner/cli.ts continue .fusera/runs/<run_id> publish-preview [--live|--mock]
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
node --experimental-strip-types superpowers/runner/verify-live-codex-baseline.ts
node --experimental-strip-types superpowers/runner/verify-live-codex-isolated-baseline.ts
```

`run live-publish` drives the main flow. Verifier commands inspect evidence and must not be the only way to run the harness.

`verify-live-codex-baseline.ts` is the canonical live quality baseline entrypoint for the fixture matrix. It pins:

- `FUSERA_CODEX_COMMAND=codex`
- `FUSERA_CODEX_MODEL=gpt-5.4`
- `FUSERA_CODEX_REASONING_EFFORT=xhigh`
- `FUSERA_CODEX_TIMEOUT_MS=300000`
- `FUSERA_LIVE_TOOL_USE_POLICY=fail`
- `FUSERA_LIVE_MATRIX_RETRY_POLICY=retryable`

It clears ambient Codex args, workspace-inspection, Codex workdir, matrix path, case-selection, and target-stage overrides before running. Manual full-matrix runs call this entrypoint without arguments. Future scheduled CI jobs should call it the same way only after the live runner and Codex auth are proven in GitHub Actions. Ad hoc local subset runs may pass case ids and a target stage as CLI arguments.

Each baseline run writes a full matrix report under `.fusera/runs/live-quality-matrix_*.json` and updates the stable latest pointer:

```text
.fusera/runs/live-quality-baseline-latest.json
```

`verify-live-codex-isolated-baseline.ts` runs the same pinned baseline with `FUSERA_CODEX_WORKDIR` set to a newly created minimal temp directory outside the repo. It verifies that every model-owned stage used that directory, stayed under `workspace_inspection_policy: bundle-only`, observed no tool use, and left the isolated workdir empty. Its latest pointer is:

```text
.fusera/runs/live-quality-isolated-baseline-latest.json
```

Isolated runs clean up empty temporary workdirs by default. Set `FUSERA_LIVE_ISOLATED_WORKDIR_RETENTION=keep` to preserve the workdir for debugging, `delete-on-success` to keep all failure workdirs, or `delete` to remove it regardless of pass/fail. The default `delete-empty` keeps non-empty failure workdirs for inspection.

`ci mock` is the required development gate. It runs the deterministic P0 verifier and writes a runtime report under `.fusera/runs/ci-mock_*.json`.

`ci live` is an optional/manual live gate. It runs one fresh full live publish, then verifies preview publish and live artifact quality through the same report path used by `live-stability`.

When `ci live` or `live-stability` runs in real adapter mode, the runner applies the P1 canonical live defaults unless the environment already sets an explicit override:

- `FUSERA_CODEX_MODEL=gpt-5.2`
- `FUSERA_CODEX_REASONING_EFFORT=medium`
- `FUSERA_CODEX_TIMEOUT_MS=240000`

These defaults are recorded in the live stability report as `canonical_live_defaults`, and each real adapter attempt records the effective model, reasoning effort, and timeout in `adapter-result.json`.

`ci isolated-live` is the hard-isolation live gate. With no arguments it runs the full live quality fixture matrix through `verify-live-codex-isolated-baseline.ts`. Local subset runs may pass case ids and a target stage. GitHub Actions runs the full `all design-system-pass` gate manually through `workflow_dispatch`; scheduled live gates should be added only after the `fusera-live` runner and Codex auth are registered, monitored, and proven through downloadable workflow artifacts.

The live quality matrix retries retryable model-owned stage failures when `FUSERA_LIVE_MATRIX_RETRY_POLICY=retryable`. Reports record per-case retry evidence, retry recoveries, and timeout provenance. Recovered retries preserve the initial failure details in the case result instead of hiding the event.

`live-stability` runs repeated fresh publishes and writes both JSON and Markdown diagnostics:

```text
.fusera/runs/live-stability_<id>.json
.fusera/runs/live-stability_<id>.md
```

The stability report summarizes success rate, duration min/avg/p95/max, model-owned duration min/avg/p95/max, per-stage model-owned duration, stderr presence, tool-use observation, retry attempts, failure triage categories, accounting metadata, failure modes, and artifact score drift. Failed samples retain any available `run_id`, `run_dir`, final state, `run.json.failure_mode`, attempt diagnostics, and separate preview/quality verifier errors.

GitHub Actions wiring lives at `.github/workflows/harness.yml`:

- PR and `main` push run `ci mock` on `ubuntu-latest`; this is the required deterministic gate.
- Manual `workflow_dispatch` can run `ci-live`, `live-stability`, or `ci-isolated-live`.
- No scheduled live gates are enabled yet. Add `schedule` only after manual live gates prove the self-hosted runner, Codex auth, preflight report, and artifact upload path in GitHub Actions.
- Live gates require a self-hosted runner labeled `fusera-live` with Codex CLI installed and authenticated.
- Live jobs clean `.fusera/runs/` before running, then write `live-runner-preflight.json` from `check-live-runner.ts --strict-github-actions --auth-probe` before the selected gate.
- Mock and live jobs upload `.fusera/runs/**` with `if: always()` when they run, so failed gates preserve run evidence, raw adapter attempts, reports, and event ledgers as workflow artifacts.

`fusera-live` runner readiness requirements:

- GitHub self-hosted runner is registered on the target repository or organization with labels `self-hosted` and `fusera-live`.
- Codex CLI is installed in `PATH`, authenticated for non-interactive `codex exec`, and can run the preflight auth probe.
- Node 24 is available through `actions/setup-node`.
- The runner workspace permits deleting and recreating `.fusera/runs/`; that directory is runtime evidence only.
- Manual `ci-isolated-live`, `ci-live`, and `live-stability` artifacts should be downloadable from the GitHub Actions run before adding scheduled live gates.

`continue` locks adapter mode to the run. It reads `run.json.adapter_mode` first, then falls back to existing stage evidence for legacy runs. `--live` and `--mock` are explicit assertions; if the flag conflicts with the run's locked mode, the runner fails closed.

`resume` is for failed runs. It reads `failed_stage`, locks adapter mode the same way as `continue`, persists a retry decision under `stages/retrying/retry-decision.json`, and either retries from the failed model-owned stage or moves the run to `needs_review` when the failure is not retryable or the retry budget is exhausted. For proof runs, `resume` is capped at the original `proof_target_stage`; it must not continue into compile, QA, or preview publish unless the proof target itself is `publish-preview`.

## Evidence Rules

Each adapter invocation writes:

```text
stages/<stage>/attempts/<attempt_id>/bundle.json
stages/<stage>/attempts/<attempt_id>/adapter-raw-request.json
stages/<stage>/attempts/<attempt_id>/adapter-stdout.txt
stages/<stage>/attempts/<attempt_id>/adapter-stderr.txt
stages/<stage>/attempts/<attempt_id>/adapter-result.json
```

Stage-level `adapter-result.json`, `adapter-stdout.txt`, `adapter-stderr.txt`, and `adapter-raw-request.json` remain latest-attempt convenience files. Attempt directories are the audit source.

Runner-owned stages must show:

```json
{
  "usage": {
    "mode": "runner-owned-noop",
    "skipped_backend": true
  }
}
```

They must not call live Codex.

## Canonical Evidence

Canonical P1 live evidence:

```text
.fusera/runs/run_20260428011419_j81xac
```

This run was produced by:

```bash
FUSERA_CODEX_MODEL=gpt-5.2 \
FUSERA_CODEX_REASONING_EFFORT=medium \
FUSERA_CODEX_TIMEOUT_MS=240000 \
node --experimental-strip-types superpowers/runner/cli.ts run live-publish
```

Verification commands:

```bash
node --experimental-strip-types superpowers/runner/cli.ts verify live-preview .fusera/runs/run_20260428011419_j81xac
node --experimental-strip-types superpowers/runner/cli.ts verify live-quality .fusera/runs/run_20260428011419_j81xac design-system-pass
node --experimental-strip-types superpowers/runner/cli.ts inspect .fusera/runs/run_20260428011419_j81xac
```

Observed evidence:

- final state: `published`
- Codex command: `codex`
- Codex version: `0.124.0-alpha.2`
- configured model: `gpt-5.2`
- configured reasoning effort: `medium`
- timeout: `240000`
- live model-owned stages: `normalize-input`, `product-and-brand-brief`, `page-strategy`, `section-planning`, `design-system-pass`
- runner-owned no-op stages: `page-compile`, `verify-publishable-page`, `publish-preview`
- locked adapter mode: `real` inferred from stage evidence; this canonical run predates `run.json.adapter_mode` persistence
- preview build ref: `preview-build_da236780fa67`
- preview URL: `preview://run_20260428011419_j81xac/preview-build_da236780fa67`

Acceptance for canonical evidence:

- final run state is `published`
- all 8 stable artifacts are validated
- `QAReport.payload.verdict = pass`
- `PublishVersion.payload.publish_target = preview`
- `PublishVersion.payload.previous_active_pointer = null`
- preview handoff binds the same `preview_build_ref`
- model-owned stages have real adapter evidence
- runner-owned stages have no-op evidence
- every stage has at least one attempt directory
- continuing a live proof cannot silently fall back to mock adapter mode

## Fresh Stability Evidence

Fresh P2 live stability evidence after canonical live defaults were applied to bare `live-stability`:

```text
.fusera/runs/live-stability_20260428100021_afid4e.json
.fusera/runs/live-stability_20260428100021_afid4e.md
```

This report was produced by the bare command:

```bash
node --experimental-strip-types superpowers/runner/cli.ts live-stability --runs 3
```

Observed evidence:

- `canonical_live_defaults`: `gpt-5.2`, `medium`, `240000ms`
- success rate: `3/3`
- final states: `published`, `published`, `published`
- preview verification: `3/3`
- live quality verification: `3/3`
- tool-use observed: `0`
- retry attempts: `0`
- failure modes: none
- artifact score drift: `0` for all scored stable artifacts

## Isolated Baseline Evidence

Fresh isolated full-matrix baseline:

```text
.fusera/runs/live-quality-isolated-baseline_20260428104654_p5y1f5.json
.fusera/runs/live-quality-matrix_20260428104654_x6dnqg.json
.fusera/runs/live-quality-isolated-baseline-latest.json
```

This report was produced by:

```bash
node --experimental-strip-types superpowers/runner/cli.ts ci isolated-live
```

Observed evidence:

- selected cases: `proof-required-rich`, `low-proof-no-proof`, `no-claims-utility`, `bauhaus-visual-direction`, `industrial-visual-direction`
- target stage: `design-system-pass`
- baseline config: `gpt-5.4`, `xhigh`, `300000ms`
- matrix: `5/5` passed
- unexpected failures: `0`
- retry attempts: `0`
- timed-out stage failures: `0`
- tool-use observed: `0`
- isolation: workdir outside repo, all stage workdirs isolated, bundle-only policy on all stages
- isolated workdir cleanup: `delete-empty`, deleted
- matrix duration: `1329850ms`

## P2 Retry/Resume Semantics

Current P2 retry/resume rules:

- retryable stages are model-owned stages only: `normalize-input`, `product-and-brand-brief`, `page-strategy`, `section-planning`, `design-system-pass`
- retryable failure modes are `invocation_failure`, `extraction_failure`, `validation_failure`, and `missing_output`
- runner-owned stage failures do not retry through the backend path
- retry reassembles context from validated artifacts and does not mutate prior attempt evidence
- proof-run retry stops at the original `proof_target_stage`
- bad artifact candidates remain under `artifacts/rejected/`
- successful retry writes a new attempt directory and may create the canonical validated artifact
- exhausted retry budget writes `needs_review` and does not create another backend attempt

Verification is covered by `verify p0` checks:

- `failed-run-resume-retry`
- `failed-proof-resume-does-not-publish`
- `backend-retry-budget-exhausted`

## Boundary

This closes the P1 live Codex artifact-to-preview proof. It does not yet close:

- larger-sample live stability and real-failure retry statistics
- cost accounting beyond current usage metadata
- production pointer management
- Claude Code adapter compatibility

## Next Stage

Recommended P2 work:

1. configure and monitor the `fusera-live` self-hosted runner with Codex CLI auth
2. run `ci-isolated-live` and `live-stability` manually until runner health is proven
3. add nightly `ci-isolated-live` and weekly `live-stability --runs 3` only after manual GitHub Actions evidence is stable
4. review accumulated `live-stability --runs 3` samples before increasing sample size
5. improve cost accounting beyond current duration/model/timeout/accounting metadata if Codex CLI exposes token or billing fields
6. start `claude-code` adapter compatibility only after Codex-first live retry behavior remains stable
