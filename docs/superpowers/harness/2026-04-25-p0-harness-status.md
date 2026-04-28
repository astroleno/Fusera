# P0 Harness Status

Date: 2026-04-25  
Status: Superseded by `docs/superpowers/harness/2026-04-28-p1-live-codex-status.md`

This document records the P0 deterministic closure. Current P1 live Codex status now lives in:

- `docs/superpowers/harness/2026-04-28-p1-live-codex-status.md`

## What Is Closed

The P0 deterministic harness now has a complete executable loop:

- contract schemas under `superpowers/contracts/artifacts/`
- stage routing through `superpowers/packs/stage-profiles.yaml`
- pack registry through `superpowers/packs/registry.yaml`
- pack compilation with SKILL source in backend bundles
- Codex adapter contract and mock adapter result persistence
- adapter artifact candidates flowing through validation and persistence
- deterministic `PageSpec` compile boundary
- QA pass and QA failure paths
- repair decision persistence
- preview-scoped `PublishVersion`
- append-only run event ledger under `.fusera/runs/`

Run the closed-loop verifier:

```bash
node --experimental-strip-types superpowers/runner/verify-p0-harness.ts
```

The verifier creates one positive publish run and one negative QA run, then checks schema validity, preview binding, compiled pack SKILL source, adapter candidates, design context packs, repair decision persistence, publish blocking on QA failure, capability rejection, artifact status/version rejection, stale and duplicate adapter candidate rejection, artifact and attachment extraction, and local real-adapter process boundaries.

## Boundary

This is a P0 deterministic harness closed loop, not yet a real backend execution loop.

Current backend behavior is still implemented by `MockCodexAdapter` in `superpowers/adapters/codex/adapter.ts`. It proves the harness boundary and artifact discipline, but it does not yet prove live Codex CLI/API invocation, raw output extraction, usage accounting, retry behavior, or external process failure handling.

## Next Stage

The next stage is `P1 Real Codex Adapter + Verification Harness`.

Primary goal:

- replace the mock adapter path with a real Codex CLI/API invocation adapter while preserving the existing bundle, candidate extraction, validation, QA, repair, and preview publish contracts.

Do not move business artifact ownership back into the runner. The runner should continue to assemble context, invoke the adapter, persist raw output, validate candidates, and enforce lifecycle gates.
