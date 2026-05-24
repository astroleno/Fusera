---
name: tasks/page-compile
kind: task
stage: page-compile
---

# Page Compile

## Inputs

- Validated `SectionGraph`.
- Validated `ThemeTokens`.
- Validated `DesignSpec`.
- Deterministic compiler at `superpowers/runner/compile-page.ts`.

## Allowed Outputs

- `PageSpec`.
- Run-local `compiled/preview-build.json`.

## Forbidden Outputs

- Must not emit `DesignSpec`, `QAReport` or `PublishVersion`.
- Must not call a backend to decide compiled structure.

## Handoff Shape

This is a runner-owned stage. The backend must not emit a `PageSpec`; the
runner persists an envelope shaped like:

```fusera-artifact-json
{
  "artifact_id": "page-spec_<run-local-id>",
  "artifact_type": "PageSpec",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "validated",
  "producer_stage": "page-compile",
  "input_refs": [
    "<SectionGraph artifact_id>",
    "<ThemeTokens artifact_id>",
    "<DesignSpec artifact_id>"
  ],
  "validation": {
    "valid": true,
    "errors": []
  },
  "payload": {
    "route_id": "",
    "sections": [
      {
        "section_id": "",
        "section_type": "",
        "component": "",
        "props": {},
        "design_intent": {}
      }
    ],
    "token_refs": {
      "theme_tokens_ref": "",
      "design_spec_ref": ""
    },
    "asset_refs": [],
    "compile_targets": ["preview"]
  }
}
```

## Failure Behavior

- Reject unresolved section ids, token refs, or component refs.
- Persist rejected `PageSpec` candidates and stop before QA.
