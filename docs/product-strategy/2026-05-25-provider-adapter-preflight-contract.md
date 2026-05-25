# Provider Adapter Preflight Contract

Date: 2026-05-25

## Scope

This patch defines the preflight contract for future provider adapters without
enabling real external publish/export runtime.

It adds:

- artifact delivery refs for provider-bound publish/export work;
- a credential resolver interface;
- a deterministic fake provider preflight fixture;
- runtime schemas and tests for delivery, credentials, idempotency, and result
  persistence boundaries.

It does not:

- register a real provider adapter;
- call a provider API;
- write files to an external destination;
- persist plaintext credentials;
- persist artifact payloads inside `external_target` or `external_result`;
- enable image/poster, canvas, or partial-regeneration runtime.

## Artifact Delivery

Provider adapters must consume references, not large payloads. A delivery ref
contains only:

- `kind`: `publish_version`, `page_spec`, or `artifact`;
- `ref`: stable artifact/version reference;
- `checksumSha256`: lowercase SHA-256 checksum;
- `mimeType`: media type of the artifact payload;
- `sizeBytes`: byte size.

Publish delivery requires both `PublishVersion` and `PageSpec` refs. Export
delivery requires a `PageSpec` ref. Future provider-specific adapters may
require additional artifact refs, but must keep this reference-only boundary.

## Credentials

The credential resolver accepts a `credentialRef` and returns a runtime-only
credential value. The resolved secret may be used by the adapter process, but it
must not be written to:

- `external_target`;
- `external_result`;
- operation diagnostics;
- provider preflight result rows;
- logs or stable reports.

Persisted provider metadata may include the `credentialRef`, never the resolved
secret value.

## Fake Provider Fixture

`runFakeProviderPreflight()` proves the provider-facing contract without
performing external work. It:

- validates the artifact delivery plan;
- resolves a credential through the supplied resolver;
- checks the resolved credential matches the requested `credentialRef`;
- returns deterministic provider metadata using the operation idempotency key;
- marks `externalRuntimeImplemented: false`.

The fake provider result is intentionally small and deterministic. Re-running
the same operation with the same delivery plan and idempotency key returns the
same provider operation id.

## Retry And Idempotency

The preflight result declares:

```json
{
  "retry": {
    "policy": "same_operation_idempotency_key",
    "retryable": false
  }
}
```

Future real adapters may decide which provider failures are retryable, but they
must preserve the same operation-scoped idempotency key across retries unless a
new operation is created.

## Runtime Boundary

This is still a control-plane contract only. Real external publish/export stays
blocked until a provider-specific adapter defines credential lookup, artifact
fetching, delivery semantics, retry classification, result normalization, and
provider failure handling.
