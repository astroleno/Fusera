---
name: tasks/design-pass
kind: task
stage: design-system-pass
---

# Design Pass

## Inputs

- Validated `ProductBrief`.
- Validated `BrandProfile`.
- Validated `PagePlan`.

## Allowed Outputs

- `ThemeTokens` only.

## Forbidden Outputs

- Must not emit section graph, design spec, page spec, QA, or publish artifacts.
- Must not reference unresolved token names.

## Handoff Shape

Emit one fenced artifact candidate block:

```fusera-artifact-json
{
  "artifact_id": "theme-tokens_<run-local-id>",
  "artifact_type": "ThemeTokens",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "draft",
  "producer_stage": "design-system-pass",
  "input_refs": [
    "<ProductBrief artifact_id>",
    "<BrandProfile artifact_id>",
    "<PagePlan artifact_id>"
  ],
  "validation": {
    "valid": false,
    "errors": []
  },
  "payload": {
    "colors": {},
    "typography": {},
    "spacing": {},
    "radii": {},
    "shadows": {},
    "motion": {}
  }
}
```

## Failure Behavior

- Reject incomplete token sets.
- Persist rejected token artifacts with validation errors.
