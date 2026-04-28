---
name: deploy/publish-preview
kind: deploy
stage: publish-preview
---

# Publish Preview

## Inputs

- Validated `PageSpec`.
- Validated `QAReport` with verdict `pass` or `waived`.
- Exact `preview_build_ref` from `compiled/preview-build.json`.

## Allowed Outputs

- Preview-scoped `PublishVersion`.
- Run-local preview handoff metadata.

## Forbidden Outputs

- Must not create production serving pointers.
- Must not mutate prior publish versions.
- Must not publish if QA bindings do not match the PageSpec and preview build.

## Handoff Shape

```json
{
  "artifact_type": "PublishVersion",
  "schema_version": "1.0.0",
  "producer_stage": "publish-preview",
  "payload": {
    "publish_version_id": "",
    "page_spec_ref": "",
    "qa_report_ref": "",
    "preview_url": "",
    "published_at": "",
    "publish_target": "preview",
    "previous_active_pointer": null,
    "pointer_transaction_ref": ""
  }
}
```

## Failure Behavior

- Refuse publish on failed QA, mismatched bindings, or failed non-waivable gates.
- Leave active pointer state untouched; P0 preview publish only creates immutable handoff evidence.
