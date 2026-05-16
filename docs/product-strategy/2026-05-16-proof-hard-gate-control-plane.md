# Proof Hard-Gate Control-Plane Binding

Date: 2026-05-16

## Scope

This patch connects the proof contract to the publish/export control-plane without enabling external publish/export.

The control-plane still requires the existing preview readiness checks:

- validated latest `PageSpec`;
- validated latest `QAReport`;
- `QAReport.verdict = pass`;
- no failed non-waivable QA gates;
- `QAReport.page_spec_ref` matches the latest PageSpec;
- `QAReport.preview_build_ref` matches the latest run preview build.

After that baseline passes, the route checks the proof spine:

- latest `ProductBrief` ref exists;
- latest `SectionGraph` ref exists;
- both artifacts are validated;
- both payloads parse against current schemas;
- `claim_policy = proof-required` has ClaimRefs and ProofRefs;
- every ClaimRef ProofRef resolves to a ProductBrief ProofRef;
- ClaimRef claim text matches the resolved ProofRef claim text;
- every ProductBrief ProofRef reaches a SectionGraph proof binding;
- every SectionGraph proof binding resolves to a ProductBrief ProofRef;
- every SectionGraph proof binding points to a known section.

## Control-Plane Behavior

If proof checks pass:

- create `publish_export_operations.status = ready`;
- return `*_control_plane_ready`;
- keep `externalExportImplemented = false`;
- keep `externalPublishingImplemented = false`.

If proof checks fail:

- create `publish_export_operations.status = blocked`;
- write `diagnostics` as a JSON array;
- set `failure_code` / `failure_reason` from the first blocking diagnostic;
- return `409` with `*_control_plane_blocked`;
- do not start external publish/export.

## Diagnostic Shape

Each diagnostic is machine-readable:

```json
{
  "code": "claim_ref_unknown_proof_ref",
  "severity": "blocking",
  "message": "ClaimRef claim:reviews.1 points at missing ProofRef proof:missing.",
  "artifactType": "ProductBrief",
  "artifactRef": "product-brief_01",
  "details": {
    "claimRef": "claim:reviews.1",
    "proofRef": "proof:missing"
  }
}
```

Initial diagnostic codes:

- `missing_product_brief_ref`
- `missing_section_graph_ref`
- `product_brief_artifact_missing`
- `section_graph_artifact_missing`
- `product_brief_artifact_not_validated`
- `section_graph_artifact_not_validated`
- `product_brief_payload_invalid`
- `section_graph_payload_invalid`
- `duplicate_proof_ref`
- `proof_required_without_proof_refs`
- `proof_required_without_claim_refs`
- `claim_ref_without_proof_refs`
- `claim_ref_unknown_proof_ref`
- `claim_proof_claim_mismatch`
- `proof_ref_not_bound_to_section_graph`
- `proof_binding_unknown_section`
- `section_graph_unknown_proof_ref`

## Non-Goals

- No external publish.
- No file export.
- No waiver publish flow.
- No image/poster runtime.
- No canvas runtime.
- No partial-regeneration runtime.
