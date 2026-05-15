# Proof Source + Product Details Pass

Date: 2026-05-15
Scope: landing-page runtime only
Fixture source: `superpowers/runner/fixtures/lead-icp/landing-page-briefs.json`
Scorecard source: `superpowers/runner/fixtures/lead-icp/landing-page-scorecards.json`

## Change Under Review

This pass keeps Phase 2 image/poster runtime frozen and tightens the landing-page proof loop:

```text
intake proofSources/productDetails
-> ProductBrief ProofRef / ClaimRef
-> PageSpec details + proof source props
-> QAReport proof-source-binding gate
-> pass-only PublishVersion
```

Trust signals without a matching ProofRef now fail QA and do not produce a `PublishVersion`.

## Scoring Results

| Metric | Pass 1 | Pass 2 | Target | Status |
|---|---:|---:|---:|---|
| First-draft usable rate | 5 / 6 = 83.3% | 6 / 6 = 100% | >= 60% | Pass |
| Draft-to-real export/publish rate | 0 / 6 = 0% | 0 / 6 = 0% | >= 40% | Blocked |
| Manual adjustment count | 14 / 6 = 2.33 avg | 8 / 6 = 1.33 avg | <= 3 | Pass |
| Phase 2 runtime started | No | No | No | Pass |

## Interpretation

The main quality gain came from moving proof and specs out of vague copy review and into structured intake/artifacts. This makes first drafts safer to review, but it still does not prove real commercial intent because no merchant has exported or published a real page from the flow.

## Next Landing-Only Work

- Run the seeded briefs through a reviewer or merchant-like manual scoring pass.
- Record real draft-to-export/publish intent once export/publish UX is available.
- Keep image/poster runtime frozen until landing pages show reliable draft-to-export/publish lift.
