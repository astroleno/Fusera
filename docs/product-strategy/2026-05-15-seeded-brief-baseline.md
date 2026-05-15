# Seeded Landing-Page Brief Baseline

Date: 2026-05-15
Scope: P0 landing-page proof loop only
Fixture source: `superpowers/runner/fixtures/lead-icp/landing-page-briefs.json`

## Method

The seeded briefs were reviewed against the current deterministic app path:

```text
ProjectInput
-> ProductBrief
-> BrandProfile
-> PagePlan
-> SectionGraph
-> ThemeTokens
-> DesignSpec
-> PageSpec
-> QAReport
-> PublishVersion preview candidate, only when QAReport is pass
```

This baseline records manual review of the generated artifact/preview contract. It does not count real publish because `/publish` is intentionally fail-closed and returns `publish_ready` only after a passing `QAReport`.

## Baseline Results

| Fixture | Direction | First Draft Usable | Draft To Real Export/Publish | Manual Adjustment Count | Notes |
|---|---|---:|---:|---:|---|
| `beauty-serum-us` | `premium-editorial` | Yes | No | 2 | Needs product image crop and proof wording review before external handoff. |
| `consumer-electronics-tracker` | `marketplace-clean` | Yes | No | 3 | Good benefit hierarchy; needs device compatibility detail and app proof source. |
| `industrial-pump-b2b` | `marketplace-clean` | Yes | No | 3 | Needs spec table/source attachment before distributor-ready publish. |
| `home-storage-kit` | `social-commerce` | No | No | 4 | Needs stronger lifestyle use-case section and more concrete product dimensions. |
| `fitness-compression-socks` | `performance-ad` | Yes | No | 3 | CTA and benefits are usable; needs claim-safe performance wording. |
| `wellness-gummies` | `premium-editorial` | No | No | 4 | Wellness claims need stricter proof handling before publish/export. |

## Metrics

| Metric | Baseline | Target | Status |
|---|---:|---:|---|
| First-draft usable rate | 4 / 6 = 66.7% | >= 60% | Pass |
| Draft-to-real export/publish rate | 0 / 6 = 0% | >= 40% | Blocked by intentionally unimplemented publish/export |
| Manual adjustment count | 19 / 6 = 3.17 avg | <= 3 | Miss |
| QAReport pass rate | 6 / 6 = 100% | Internal baseline | Pass |
| Claim hard-gate readiness | Not measured | 100% after ClaimRef/ProofRef | Not started |

## Decision

Do not start image/poster runtime from this baseline. The first-draft usable rate is barely over target, but real export/publish is still intentionally unavailable and manual adjustment count is above threshold. Next investment should stay in landing-page intake, proof source capture, DesignSpec/PageSpec quality, and QA findings.
