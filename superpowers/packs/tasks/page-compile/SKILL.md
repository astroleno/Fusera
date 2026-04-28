---
name: tasks/page-compile
kind: task
stage: page-compile
---

# Page Compile

## Inputs

- Validated `SectionGraph`.
- Validated `ThemeTokens`.
- Deterministic compiler at `superpowers/runner/compile-page.ts`.

## Allowed Outputs

- `PageSpec`.
- Run-local `compiled/preview-build.json`.

## Forbidden Outputs

- Must not emit `QAReport` or `PublishVersion`.
- Must not call a backend to decide compiled structure.

## Handoff Shape

```json
{
  "artifact_type": "PageSpec",
  "schema_version": "1.0.0",
  "producer_stage": "page-compile",
  "payload": {
    "route_id": "",
    "sections": [],
    "token_refs": {},
    "asset_refs": [],
    "compile_targets": ["preview"]
  }
}
```

## Failure Behavior

- Reject unresolved section ids, token refs, or component refs.
- Persist rejected `PageSpec` candidates and stop before QA.
