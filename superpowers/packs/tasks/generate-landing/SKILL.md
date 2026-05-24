---
name: tasks/generate-landing
kind: task
stage: workflow-entry
---

# Generate Landing

## Inputs

- Raw landing-page request.
- Requested output mode: `landing-page`.
- Stage map from `superpowers/packs/stage-profiles.yaml`.

## Allowed Outputs

- Run orchestration handoff only.
- Selected stage sequence and backend choice.
- No stable artifacts.

## Forbidden Outputs

- Must not emit `ProductBrief`, `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not bypass stage profiles or infer producer ownership from prose.

## Handoff Shape

```json
{
  "workflow": "generate-landing",
  "output_mode": "landing-page",
  "backend": "codex",
  "first_stage": "normalize-input"
}
```

## Failure Behavior

- Fail closed if `registry.yaml` or `stage-profiles.yaml` cannot resolve the workflow.
- Surface verifier and publish failures instead of skipping them.
