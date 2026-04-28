---
name: tasks/brand-profile
kind: task
stage: product-and-brand-brief
---

# Brand Profile

## Inputs

- Normalized input bundle.
- Run metadata.
- `BrandProfile` schema contract.

## Allowed Outputs

- `BrandProfile` only.

## Forbidden Outputs

- Must not emit product, strategy, section, token, QA, or publish artifacts.
- Must not override `ProductBrief`.

## Handoff Shape

```json
{
  "artifact_type": "BrandProfile",
  "schema_version": "1.0.0",
  "producer_stage": "product-and-brand-brief",
  "payload": {
    "brand_traits": [],
    "tone_keywords": [],
    "visual_directions": [],
    "positioning": "",
    "do_not_use": []
  }
}
```

## Failure Behavior

- Persist rejected candidates with validation errors.
- Stop if required brand fields are missing after normalization.
