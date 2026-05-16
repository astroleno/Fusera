# Publish/Export Control-Plane Skeleton

Date: 2026-05-16

## Scope

This patch introduces a small control-plane skeleton for real export/publish work:

- a `publish_export_operations` table;
- `export` / `publish` operation types;
- explicit operation statuses and allowed transitions;
- fail-closed API validation before an operation can become `ready`;
- route responses that say external export/publishing is still not implemented.

It does not add external publishing, file export, image/poster runtime, canvas runtime, or partial regeneration runtime.

## Boundary

Preview readiness means:

- latest completed run has a validated `PageSpec`;
- latest completed run has a validated passing `QAReport`;
- the `QAReport` binds the same `PageSpec`;
- the `QAReport.preview_build_ref` binds the current run preview build.

Export/publish readiness means:

- the preview readiness checks passed;
- a `publish_export_operations` record was created with status `ready`;
- no external action has started yet.

`PublishVersion` remains preview-scoped. It can be copied into `publish_version_ref` as source context, but it does not prove that an external publish/export happened.

## Status Model

Allowed operation statuses:

- `requested`
- `blocked`
- `ready`
- `external_pending`
- `external_succeeded`
- `external_failed`
- `cancelled`

Allowed transitions:

- `requested -> blocked | ready | cancelled`
- `ready -> external_pending | cancelled`
- `external_pending -> external_succeeded | external_failed`
- `external_failed -> ready | cancelled`

Terminal states:

- `blocked`
- `external_succeeded`
- `cancelled`

`generation_runs.export_state` is now treated as a legacy rollup. Newly completed generation runs stay at `export_state = none`; the control-plane table owns future export/publish lifecycle state.

## API Contract

`POST /api/projects/:projectId/publish`

- creates a `publish` control-plane operation only after fail-closed checks pass;
- returns `publish_control_plane_ready`;
- returns `externalPublishingImplemented: false`.

`POST /api/projects/:projectId/export`

- creates an `export` control-plane operation only after fail-closed checks pass;
- returns `export_control_plane_ready`;
- returns `externalExportImplemented: false`.

Both routes reject:

- missing completed run;
- missing `PageSpec` or `QAReport` refs;
- missing, rejected, or invalid `QAReport`;
- `QAReport.verdict != pass`;
- failed non-waivable gates;
- stale `page_spec_ref`;
- stale `preview_build_ref`;
- missing, rejected, or invalid `PageSpec`.

## Non-Goals

- No real external publish.
- No real file export.
- No new hard proof gate beyond the existing QA gate.
- No new output mode runtime.
