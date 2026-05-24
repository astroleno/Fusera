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

- Must not emit product, strategy, section, token, design-spec, QA, or publish artifacts.
- Must not override `ProductBrief`.

## Handoff Shape

Emit one fenced artifact candidate block:

```fusera-artifact-json
{
  "artifact_id": "brand-profile_<run-local-id>",
  "artifact_type": "BrandProfile",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "draft",
  "producer_stage": "product-and-brand-brief",
  "input_refs": ["stages/normalize-input/normalized-input.json"],
  "validation": {
    "valid": false,
    "errors": []
  },
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
