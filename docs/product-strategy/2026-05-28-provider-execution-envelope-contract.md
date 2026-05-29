# Provider Execution Envelope Contract

Date: 2026-05-28

## Scope

This patch defines a provider execution envelope for future publish/export
adapters. It still does not enable real external provider runtime.

It adds:

- `ProviderExecutionRequest` and `ProviderExecutionResult` runtime schemas;
- explicit execution stages: artifact fetch, credential resolve, provider call,
  and result normalize;
- stable error codes and retry classification for each failure point;
- a fake provider envelope runner that proves the stage contract without
  calling a real provider.

It does not:

- register a real provider adapter;
- call any external provider API;
- write export files to an external destination;
- persist artifact payloads;
- persist plaintext credentials;
- start retry workers or webhooks;
- enable image/poster, canvas, or partial-regeneration runtime.

## Request

The execution request binds:

- `provider`: currently only `fake-provider`;
- `operationType`: `publish` or `export`;
- `idempotencyKey`: operation-scoped key;
- `credentialRef`: reference to a credential, never the value;
- `deliveryPlan`: reference-only artifact delivery plan.

The request schema verifies that the delivery plan operation type and
idempotency key match the request before any execution stage starts.

## Stages

The execution envelope has four ordered stages:

1. `artifact_fetch`
2. `credential_resolve`
3. `provider_call`
4. `result_normalize`

Stage outputs that are persisted must stay reference-shaped. Artifact fetch may
load payloads at runtime in a future adapter, but payloads must not be copied
into the execution result. Credential resolve may load a secret at runtime, but
the secret must not be copied into the execution result.

## Errors

Stable error codes:

- `artifact_fetch_failed`
- `credential_resolve_failed`
- `provider_call_failed`
- `provider_result_invalid`

Persisted diagnostics are sanitized. They may include an error class name, but
must not include raw provider messages, credential values, response bodies, or
artifact payloads.

Retry classification:

- artifact and credential failures are `not_retryable` by this envelope;
- provider call failures are `retryable_same_idempotency_key`;
- result normalization failures are `not_retryable`.

Real adapters may refine provider-specific retry rules later, but must preserve
the same operation-scoped idempotency key across retries unless a new operation
is created.

## Fake Provider

The fake provider returns deterministic metadata:

- provider operation id is derived from provider, operation type, and
  idempotency key;
- `externalRuntimeImplemented` remains `false`;
- persisted artifacts are delivery refs only;
- persisted credential data is the `credentialRef` only.

This proves the envelope shape and failure handling before any real provider is
allowed into the registry.

## Dry-Run Adapter Integration

The dry-run provider execution adapter runner connects the fake provider
envelope to the existing publish/export adapter state machine:

1. `runPublishExportAdapter()` records `ready -> external_pending` with the
   dry-run `external_target`.
2. The dry-run execution path calls the fake provider envelope.
3. A successful envelope result becomes a dry-run `external_succeeded` adapter
   result.
4. Artifact, credential, provider, or normalization failures become dry-run
   `external_failed` adapter results.

The persisted adapter result stores only the provider execution summary:

- operation type and idempotency key;
- stage statuses and retry classification;
- artifact delivery refs;
- credential refs;
- provider operation id for successful fake executions;
- sanitized failure diagnostics for failed fake executions.

It must not persist artifact payloads, raw provider responses, plaintext
credentials, or raw provider error messages. The fixture credential resolver
returns a runtime-only fake secret and tests assert that the secret does not
enter the adapter result.

This integration still does not enable real external publish/export. It proves
that a provider-style execution envelope can be consumed by the adapter
state-machine before any real provider registry entry is added.
