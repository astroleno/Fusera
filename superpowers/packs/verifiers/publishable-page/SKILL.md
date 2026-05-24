---
name: verifiers/publishable-page
kind: verifier
stage: verify-publishable-page
---

# Publishable Page Verifier

## Inputs

- Validated `PageSpec`.
- Exact `compiled/preview-build.json`.

## Allowed Outputs

- `QAReport` only.

## Forbidden Outputs

- Must not emit planning, design, compile, or publish artifacts.
- Must not pass a report whose `page_spec_ref` or `preview_build_ref` does not match the candidate.
- Must not waive non-waivable gates.

## Handoff Shape

This is a runner-owned verifier stage. The backend must not emit a `QAReport`;
the runner persists an envelope shaped like:

```fusera-artifact-json
{
  "artifact_id": "qa-report_<run-local-id>",
  "artifact_type": "QAReport",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "validated",
  "producer_stage": "verify-publishable-page",
  "input_refs": [
    "<PageSpec artifact_id>",
    "<compiled preview_build_ref>"
  ],
  "validation": {
    "valid": true,
    "errors": []
  },
  "payload": {
    "page_spec_ref": "",
    "preview_build_ref": "",
    "verdict": "pass",
    "gate_results": [],
    "issues": [],
    "repair_directives": [],
    "evidence_refs": [],
    "waiver": null
  }
}
```

## Failure Behavior

- Fail closed on blocking issues.
- Classify each issue as `machine-repairable` or `manual-only`.
- Route to repair only when all blocking issues are machine-repairable and repair budget remains.
