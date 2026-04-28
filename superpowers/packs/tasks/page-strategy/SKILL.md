---
name: tasks/page-strategy
kind: task
stage: page-strategy
---

# Page Strategy

## Inputs

- Validated `ProductBrief`.
- Validated `BrandProfile`.
- Normalized input bundle.

## Allowed Outputs

- `PagePlan` only.

## Forbidden Outputs

- Must not emit `SectionGraph`, `ThemeTokens`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not consume rejected or draft artifacts.

## Handoff Shape

```json
{
  "artifact_type": "PagePlan",
  "schema_version": "1.0.0",
  "producer_stage": "page-strategy",
  "payload": {
    "page_goal": "",
    "narrative_arc": "",
    "section_intents": [],
    "cta_strategy": "",
    "proof_strategy": ""
  }
}
```

## Failure Behavior

- Reject conflicting section intent and CTA strategy.
- Persist validation errors and stop before section planning.
