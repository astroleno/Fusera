---
name: tasks/product-brief
kind: task
stage: product-and-brand-brief
---

# Product Brief

## Inputs

- Normalized input bundle.
- Run metadata.
- `ProductBrief` schema contract.

## Allowed Outputs

- `ProductBrief` only.

## Forbidden Outputs

- Must not emit `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not output unenveloped JSON.

## Handoff Shape

```json
{
  "artifact_type": "ProductBrief",
  "schema_version": "1.0.0",
  "producer_stage": "product-and-brand-brief",
  "payload": {
    "product_name": "",
    "audiences": [],
    "core_problem": "",
    "value_props": [],
    "product_details": [],
    "cta_goal": "",
    "proof_inputs": [],
    "proof_sources": [],
    "claim_refs": [],
    "claim_policy": "proof-required"
  }
}
```

## Failure Behavior

- Persist rejected candidates with validation errors.
- Do not infer missing proof inputs silently; use an empty array only when explicitly absent.
