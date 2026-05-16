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

- Must not emit `BrandProfile`, `PagePlan`, `SectionGraph`, `ThemeTokens`, `PageSpec`, `QAReport`, or `PublishVersion`.
- Must not output unenveloped JSON.

## Handoff Shape

```json
{
  "artifact_type": "ProductBrief",
  "schema_version": "1.0.0",
  "producer_stage": "product-and-brand-brief",
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
