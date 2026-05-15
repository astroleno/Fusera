# Pass 2 Scorecard Baseline

Date: 2026-05-16
Scope: landing-page runtime only
Baseline manifest: `superpowers/runner/fixtures/lead-icp/landing-page-baseline.json`
Scorecard source: `superpowers/runner/fixtures/lead-icp/landing-page-scorecards.json`

## Baseline Decision

`proof-source-details-pass-2` is the active seeded brief quality baseline.

It records the landing-only state after structured `productDetails`, `proofSources`, `ClaimRef`, `ProofRef`, and the QA proof-source binding gate were added.

## Current Metrics

| Metric | Pass 2 Baseline | Runtime Decision |
|---|---:|---|
| First-draft usable rate | 6 / 6 = 100% | Accept as landing-page quality baseline |
| Manual adjustment count | 8 / 6 = 1.33 avg | Accept as landing-page quality baseline |
| Draft-to-real export/publish rate | 0 / 6 = 0% | Still blocked |
| Commercial proof loop complete | No | Still blocked |

## Runtime Guardrail

This baseline does not unlock image/poster, canvas, or partial-regeneration runtime.

Next work should stay landing-only:

- add the `ClaimRef` / `ProofRef` contract skeleton;
- build the real publish/export control-plane;
- only revisit image/poster runtime after real export/publish can be measured.
