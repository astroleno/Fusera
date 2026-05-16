# ClaimRef / ProofRef Contract Skeleton

Date: 2026-05-16
Scope: contract/schema/test/docs only

## Decision

Add a named `ClaimRef` / `ProofRef` skeleton without changing publish readiness.

The goal is to move proof from loose text signals toward referenceable evidence objects:

```text
proofSources
-> ProofRef(proof:<stable-id>)
-> ClaimRef(claim:<stable-id>, proof_refs[])
-> downstream QA/publish checks later
```

## Contract Shape

`ProofRef`:

```json
{
  "proof_ref": "proof:review-export.1",
  "claim": "500+ reviews",
  "source": "Review export supplied by brand",
  "url": null
}
```

`ClaimRef`:

```json
{
  "claim_ref": "claim:reviews.1",
  "claim": "500+ reviews",
  "proof_refs": ["proof:review-export.1"]
}
```

## Guardrails

- This does not unlock image/poster, canvas, or partial-regeneration runtime.
- This does not make `PublishVersion` more permissive.
- This does not add a new publish/export hard gate.
- Cross-reference completeness remains a downstream QA concern until the real publish/export control-plane exists.

## Follow-Up

Next small PR should move from skeleton to control-plane design:

- decide where durable ProofRef evidence is stored;
- decide how publish/export consumes proof evidence;
- keep preview-only `PublishVersion` semantics narrow until real export/publish exists.
