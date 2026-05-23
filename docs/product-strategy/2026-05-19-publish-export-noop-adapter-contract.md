# Publish/Export Noop Adapter Contract

Date: 2026-05-19

## Scope

This patch defines the external publish/export adapter seam without enabling a
real external runtime.

It adds:

- a minimal `PublishExportAdapter` interface;
- stable `noop-export` and `noop-publish` adapters;
- an adapter runner that can only move operation state through the existing
  transition helper.

It does not:

- publish to a real external service;
- export files to a real destination;
- add credentials, provider configuration, or webhooks;
- add image/poster runtime;
- add canvas runtime;
- add partial-regeneration runtime.

## Contract

Adapters expose three operations:

- `prepare(context)`: returns stable `external_target` metadata.
- `execute(context, target)`: performs the adapter action.
- `normalizeResult(execution)`: returns stable `external_result` metadata.

The noop target shape is:

```json
{
  "adapter": "noop-export",
  "operationType": "export",
  "mode": "noop",
  "externalRuntimeImplemented": false
}
```

The noop success result shape is:

```json
{
  "adapter": "noop-export",
  "operationType": "export",
  "mode": "noop",
  "ok": true,
  "externalRuntimeImplemented": false,
  "details": {
    "externalRuntime": "not_implemented"
  }
}
```

## State Ownership

Adapters must not write the database directly.

`runPublishExportAdapter()` owns the state sequence:

1. `ready -> external_pending` with `external_target`.
2. adapter `execute()`.
3. `external_pending -> external_succeeded` with normalized result on success.
4. `external_pending -> external_failed` with normalized result on failure.

If the first transition fails, the adapter is not executed. This keeps blocked,
terminal, or stale operations from starting external work.

If adapter execution or result normalization throws, the runner records a stable
failed `external_result` and transitions the operation to `external_failed`.
Operations must not remain indefinitely in `external_pending` because a provider
call raised.

If adapter preparation throws, the runner returns a stable `start` error without
starting a transition or executing the adapter.

Adapter exception messages are sanitized before persistence. Stable operator
copy may include adapter id, operation type, phase, and error type, but not raw
provider messages that could contain credentials or tokens.

## Runtime Boundary

The noop adapters are contract fixtures. They prove the control-plane state
machine and result shape, not real publishing/exporting. Real adapters stay
blocked until provider-specific safety, credentials, retries, and artifact
delivery semantics are designed.
