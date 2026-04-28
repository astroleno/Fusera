---
name: tasks/normalize-input
kind: task
stage: normalize-input
---

# Normalize Input

## Inputs

- Raw landing-page request.
- Run metadata.

## Allowed Outputs

- Run-owned normalized input bundle under the current run directory.
- No stable artifacts.

## Forbidden Outputs

- Must not emit stable artifact envelopes.
- Must not invent downstream strategy, design, QA, or publish data.

## Handoff Shape

```json
{
  "bundle_type": "normalized_input_bundle",
  "payload": {}
}
```

## Failure Behavior

- Reject missing or unreadable raw input.
- Persist failure evidence in the run stage directory.
