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

```json
{
  "artifact_type": "QAReport",
  "schema_version": "1.0.0",
  "producer_stage": "verify-publishable-page",
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
