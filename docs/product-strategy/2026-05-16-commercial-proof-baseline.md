# Commercial Proof Baseline 0

Date: 2026-05-16
Scope: landing-page runtime only
Baseline data: `superpowers/runner/fixtures/lead-icp/commercial-proof-baseline.json`
Real merchant input template: `superpowers/runner/fixtures/lead-icp/real-merchant-briefs.template.json`

## Boundary

P0 technical proof loop and P0.5 intent measurement are merged. This baseline records what is known now and leaves real merchant rows pending rather than fabricating commercial outcomes.

Phase 2 image/poster runtime remains frozen.

## Seeded Brief Results

| Brief | QA Pass | Proof Fail | First Draft Usable | Review Approved | Revision Requested | Export Clicked | Publish Confirmed | Manual Adjustments | Main Remaining Issue |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `beauty-serum-us` | Yes | No | Yes | No | Yes | No | No | 1 | Product image crop review |
| `consumer-electronics-tracker` | Yes | No | Yes | No | Yes | No | No | 1 | Exact companion app compatibility |
| `industrial-pump-b2b` | Yes | No | Yes | No | Yes | No | No | 1 | Real distributor spec table |
| `home-storage-kit` | Yes | No | Yes | No | Yes | No | No | 2 | Exact product dimensions |
| `fitness-compression-socks` | Yes | No | Yes | No | Yes | No | No | 1 | Performance claim tone review |
| `wellness-gummies` | Yes | No | Yes | No | Yes | No | No | 2 | Supplement compliance wording |

## Current Metrics

| Metric | Seeded | Real Merchant | Status |
|---|---:|---:|---|
| First-draft usable rate | 6 / 6 = 100% | Pending | Seeded pass only |
| QA pass rate | 6 / 6 = 100% | Pending | Seeded pass only |
| Proof fail rate | 0 / 6 = 0% | Pending | Seeded pass only |
| Draft-to-export/publish intent rate | 0 / 6 = 0% | Pending | No-go |
| Average manual adjustment count | 8 / 6 = 1.33 | Pending | Seeded pass |

## Go / No-Go

No-go for Phase 2.

The draft-to-export/publish intent threshold remains about 40%. Current real merchant intent rate is not measured yet, and seeded briefs have no real `export_clicked` or `publish_confirmed` events.

## Real Merchant Capture Requirement

Before revisiting Phase 2, capture at least 5 real merchant briefs using the template and record:

- QA pass/fail
- proof-source fail reason
- first-draft usable
- `review_approved`
- `revision_requested`
- `export_clicked`
- `publish_confirmed`
- return-to-modify count
- primary failure reason

Only measured real merchant behavior should count toward the commercial proof loop.
