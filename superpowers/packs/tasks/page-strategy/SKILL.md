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

- Must not emit `SectionGraph`, `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not consume rejected or draft artifacts.

## Handoff Shape

Emit one fenced artifact candidate block:

```fusera-artifact-json
{
  "artifact_id": "page-plan_<run-local-id>",
  "artifact_type": "PagePlan",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "draft",
  "producer_stage": "page-strategy",
  "input_refs": [
    "<ProductBrief artifact_id>",
    "<BrandProfile artifact_id>"
  ],
  "validation": {
    "valid": false,
    "errors": []
  },
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
