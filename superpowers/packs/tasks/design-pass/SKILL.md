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

- Must not emit section graph, page spec, QA, or publish artifacts.
- Must not reference unresolved token names.

## Handoff Shape

```json
{
  "artifact_type": "ThemeTokens",
  "schema_version": "1.0.0",
  "producer_stage": "design-system-pass",
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
