---
name: tasks/section-graph
kind: task
stage: section-planning
---

# Section Graph

## Inputs

- Validated `PagePlan`.
- Claim policy context from validated upstream artifacts.

## Allowed Outputs

- `SectionGraph` only.

## Forbidden Outputs

- Must not emit `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not use unknown section types.
- Must not leave proof bindings empty when claim policy is `proof-required`.

## Handoff Shape

Emit one fenced artifact candidate block:

```fusera-artifact-json
{
  "artifact_id": "section-graph_<run-local-id>",
  "artifact_type": "SectionGraph",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "draft",
  "producer_stage": "section-planning",
  "input_refs": ["<PagePlan artifact_id>"],
  "validation": {
    "valid": false,
    "errors": []
  },
  "payload": {
    "nodes": [],
    "edges": [],
    "section_order": [],
    "required_props": {},
    "proof_bindings": [],
    "claim_policy": "proof-required"
  }
}
```

## Failure Behavior

- Reject missing nodes, unresolved section order, and invalid proof bindings.
- Stop before design pass when graph invariants fail.
