# Seeded Brief Scoring Pass 1

Date: 2026-05-15
Scope: landing-page runtime only
Fixture source: `superpowers/runner/fixtures/lead-icp/landing-page-briefs.json`
Scorecard source: `superpowers/runner/fixtures/lead-icp/landing-page-scorecards.json`

## Change Under Review

The deterministic app path now adds a `buyer-fit` PageSpec section between hero and features.
It uses only supplied intake fields:

```text
targetAudience
sellingPoints
productName
```

No image, poster, canvas, or partial-regeneration runtime was introduced.

## Scoring Results

| Metric | Baseline | Pass 1 | Target | Status |
|---|---:|---:|---:|---|
| First-draft usable rate | 4 / 6 = 66.7% | 5 / 6 = 83.3% | >= 60% | Pass |
| Draft-to-real export/publish rate | 0 / 6 = 0% | 0 / 6 = 0% | >= 40% | Blocked |
| Manual adjustment count | 19 / 6 = 3.17 avg | 14 / 6 = 2.33 avg | <= 3 | Pass |
| Phase 2 runtime started | No | No | No | Pass |

## Interpretation

The landing-page draft quality moved in the right direction. The buyer/use-case gap was the easiest safe win because it can be filled from existing intake without inventing claims or proof.

This does not close the commercial proof loop. Export/publish remains intentionally blocked until real publish/export and proof attachment are implemented. Wellness and proof-heavy categories still need ClaimRef/ProofRef before they should be called publish-ready.

## Next Landing-Only Work

- Add proof-source capture to intake before hard-gating claims.
- Add structured product detail fields for dimensions, compatibility, and spec-sheet references.
- Keep image/poster runtime frozen until draft-to-export/publish can be measured against real user intent.
