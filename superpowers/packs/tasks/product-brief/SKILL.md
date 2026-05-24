---
name: tasks/product-brief
kind: task
stage: product-and-brand-brief
---

# Product Brief

## Inputs

- Normalized input bundle.
- Run metadata.
- `ProductBrief` schema contract.

## Allowed Outputs

- `ProductBrief` only.

## Forbidden Outputs

- Must not emit `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `DesignSpec`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not output unenveloped JSON.

## Handoff Shape

Emit one fenced artifact candidate block:

```fusera-artifact-json
{
  "artifact_id": "product-brief_<run-local-id>",
  "artifact_type": "ProductBrief",
  "schema_version": "1.0.0",
  "run_id": "<run_id>",
  "status": "draft",
  "producer_stage": "product-and-brand-brief",
  "input_refs": ["stages/normalize-input/normalized-input.json"],
  "validation": {
    "valid": false,
    "errors": []
  },
  "payload": {
    "product_name": "",
    "audiences": [],
    "core_problem": "",
    "value_props": [],
    "product_details": [],
    "cta_goal": "",
    "proof_inputs": [],
    "proof_sources": [],
    "claim_refs": [],
    "claim_policy": "proof-required"
  }
}
```

## ClaimRef / ProofRef Contract

- `proof_sources` contains `ProofRef` objects.
- `claim_refs` contains `ClaimRef` objects.
- `ProofRef.proof_ref` ids must use the `proof:<stable-id>` form.
- `ClaimRef.claim_ref` ids must use the `claim:<stable-id>` form.
- `ClaimRef.proof_refs` stores only `proof:<stable-id>` references.
- The example below is a payload excerpt only, not a complete artifact handoff.
- This is a reference-shape contract only. It does not make a page publishable by itself.
- Publish/export approval still belongs to downstream QA and publish control-plane checks.

```json
{
  "proof_sources": [
    {
      "proof_ref": "proof:review-export.1",
      "claim": "500+ reviews",
      "source": "Review export supplied by brand",
      "url": null
    }
  ],
  "claim_refs": [
    {
      "claim_ref": "claim:reviews.1",
      "claim": "500+ reviews",
      "proof_refs": ["proof:review-export.1"]
    }
  ]
}
```

## Failure Behavior

- Persist rejected candidates with validation errors.
- Do not infer missing proof inputs silently; use an empty array only when explicitly absent.
