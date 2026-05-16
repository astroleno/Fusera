# Publish/Export Operation Inspection

Date: 2026-05-16

## Scope

This patch adds a read-only inspection layer for `publish_export_operations`.

It does not:

- execute external export;
- execute external publish;
- add waiver flows;
- add image/poster runtime;
- add canvas runtime;
- add partial-regeneration runtime.

## Query Contract

`GET /api/projects/:projectId/operations`

Optional query params:

- `type=publish`
- `type=export`
- `runId=<run id>`

The route returns the latest matching operation by `created_at desc`.

No operation:

```json
{
  "operation": null
}
```

Blocked operation:

```json
{
  "operation": {
    "id": "operation_01",
    "projectId": "project_01",
    "runId": "run_01",
    "operationType": "publish",
    "status": "blocked",
    "failureCode": "claim_ref_unknown_proof_ref",
    "failureReason": "ClaimRef points at missing ProofRef.",
    "diagnostics": [
      {
        "code": "claim_ref_unknown_proof_ref",
        "severity": "blocking",
        "operatorMessage": "A ClaimRef points at a missing ProofRef.",
        "remediation": "Add the referenced ProofRef or update the ClaimRef binding."
      }
    ]
  }
}
```

Ready operation:

```json
{
  "operation": {
    "operationType": "export",
    "status": "ready",
    "diagnostics": []
  }
}
```

## Diagnostic Copy

The API preserves machine-readable diagnostics and adds operator-facing copy:

- `operatorMessage`: short stable status text.
- `remediation`: suggested next action.

These strings are intentionally stable enough for UI/CLI display but do not alter gate behavior.

## Troubleshooting Flow

1. Query the latest publish operation:

   `GET /api/projects/:projectId/operations?type=publish`

2. If it is `blocked`, read `diagnostics[0].code` and `remediation`.

3. Fix the upstream artifact or regenerate the page.

4. Retry publish/export to create a new operation row.

## Repeated Requests

Each publish/export click can create a new operation row. The inspection endpoint intentionally reads the latest matching row and does not enforce idempotency yet.

Before external runtime is enabled, define an idempotency key or latest-operation reuse policy.
