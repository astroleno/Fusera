# Publish/Export Operation Transitions

Date: 2026-05-18

## Scope

This patch adds a small lifecycle transition API for `publish_export_operations`.

It does not:

- execute external export;
- execute external publish;
- add export/publish adapters;
- add waiver flows;
- add image/poster runtime;
- add canvas runtime;
- add partial-regeneration runtime.

## Transition Contract

`PATCH /api/projects/:projectId/operations/:operationId`

Request body:

```json
{
  "operationType": "publish",
  "status": "external_pending",
  "externalTarget": {
    "adapter": "noop-publish"
  }
}
```

`operationType` is optional, but when present it must match the stored operation
type. This lets callers keep publish and export control-plane flows separate even
though they share the same operation table.

Allowed transitions continue to be owned by the domain contract:

- `requested -> blocked | ready | cancelled`
- `ready -> external_pending | cancelled`
- `external_pending -> external_succeeded | external_failed`
- `external_failed -> ready | cancelled`

Terminal states remain immutable:

- `blocked`
- `external_succeeded`
- `cancelled`

## Audit Fields

The transition route can write:

- `external_target` when moving toward an external attempt;
- `external_result` when recording the no-op/mock result;
- `updated_at` on every accepted transition.

The operation inspection API now returns `externalTarget` and `externalResult`
so operators can read back the latest control-plane state without inspecting the
database directly.

## Runtime Boundary

`external_pending`, `external_succeeded`, and `external_failed` are control-plane
states only. They do not prove that Fusera executed a real external publish or
file export. Real adapters must be introduced behind a later hard gate.
