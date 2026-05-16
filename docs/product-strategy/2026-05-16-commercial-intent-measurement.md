# Commercial Intent Measurement Loop

Date: 2026-05-16
Scope: P0.5 landing-page commercial validation

## Boundary

P0 landing-page technical proof loop is closed. This pass does not unfreeze image, poster, canvas, or partial-regeneration runtime.

## Measurement Events

The app now records the first commercial validation signals:

```text
publish_ready_viewed
export_clicked
publish_confirmed
qa_failed_reason
review_approved
review_rejected
revision_requested
returned_to_modify
```

These events are stored in `project_intent_events` with `project_id`, optional `run_id`, event type, timestamp, and metadata.

## Review State

The minimal review workbench maps customer review decisions back onto the latest run:

| Event | `generation_runs.review_state` |
|---|---|
| `review_approved` | `approved` |
| `review_rejected` | `rejected` |
| `revision_requested` | `needs_changes` |
| `returned_to_modify` | `needs_changes` |

Export and publish remain intent events only. They do not imply real external export or real publishing.

## Next Baseline

Run at least:

- 6 seeded lead ICP briefs
- 5 real merchant briefs

Track:

- first-draft usable
- QA pass/fail and proof fail reason
- publish-ready views
- export intent
- publish intent
- return-to-modify count

Phase 2 remains frozen until these landing-page signals show enough export/publish intent to justify expanding runtime scope.
