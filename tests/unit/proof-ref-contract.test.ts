import { describe, expect, it } from "vitest";
import {
  claimRefIdSchema,
  claimRefSchema,
  productBriefPayloadSchema,
  proofRefIdSchema,
  proofRefSchema,
  sectionGraphPayloadSchema,
} from "@/lib/domain/page-artifacts";
import productBriefContract from "../../superpowers/contracts/artifacts/product-brief.schema.json";
import sectionGraphContract from "../../superpowers/contracts/artifacts/section-graph.schema.json";
import { validateArtifactEnvelope } from "../../superpowers/runner/validate-artifact.ts";

describe("ClaimRef and ProofRef contracts", () => {
  it("defines reference-shaped zod contracts without requiring hard binding", () => {
    expect(proofRefIdSchema.safeParse("proof:review-export.1").success).toBe(true);
    expect(proofRefIdSchema.safeParse("review-export.1").success).toBe(false);
    expect(claimRefIdSchema.safeParse("claim:reviews.1").success).toBe(true);
    expect(claimRefIdSchema.safeParse("reviews.1").success).toBe(false);

    expect(
      proofRefSchema.safeParse({
        proof_ref: "proof:review-export.1",
        claim: "500+ reviews",
        source: "Review export supplied by brand",
        url: null,
      }).success,
    ).toBe(true);
    expect(
      claimRefSchema.safeParse({
        claim_ref: "claim:reviews.1",
        claim: "500+ reviews",
        proof_refs: ["proof:review-export.1"],
      }).success,
    ).toBe(true);

    expect(
      productBriefPayloadSchema.safeParse({
        product_name: "Atlas Bottle",
        audiences: ["Urban commuters"],
        core_problem: "Leak-proof",
        value_props: ["Leak-proof"],
        product_details: [],
        cta_goal: "Shop now",
        proof_inputs: ["500+ reviews"],
        proof_sources: [],
        claim_refs: [
          {
            claim_ref: "claim:reviews.1",
            claim: "500+ reviews",
            proof_refs: ["proof:external-review-export"],
          },
        ],
        claim_policy: "proof-required",
      }).success,
    ).toBe(true);
  });

  it("validates ClaimRef and ProofRef defs through canonical JSON schemas", () => {
    const productBrief = productBriefArtifact();
    const invalidProductBrief = {
      ...productBrief,
      payload: {
        ...productBrief.payload,
        proof_sources: [
          {
            proof_ref: "review-export.1",
            claim: "500+ reviews",
            source: "Review export supplied by brand",
            url: null,
          },
        ],
        claim_refs: [
          {
            claim_ref: "reviews.1",
            claim: "500+ reviews",
            proof_refs: ["review-export.1"],
          },
        ],
      },
    };

    expect(
      validateArtifactEnvelope(
        productBrief,
        productBriefContract as Record<string, unknown>,
      ),
    ).toEqual([]);
    expect(
      validateArtifactEnvelope(
        invalidProductBrief,
        productBriefContract as Record<string, unknown>,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("$.payload.proof_sources[0].proof_ref"),
        expect.stringContaining("$.payload.claim_refs[0].claim_ref"),
        expect.stringContaining("$.payload.claim_refs[0].proof_refs[0]"),
      ]),
    );
  });

  it("keeps SectionGraph proof bindings on ProofRef ids", () => {
    const sectionGraph = sectionGraphArtifact();
    const invalidSectionGraph = {
      ...sectionGraph,
      payload: {
        ...sectionGraph.payload,
        proof_bindings: [
          {
            section_id: "proof",
            proof_ref: "review-export.1",
          },
        ],
      },
    };

    expect(sectionGraphPayloadSchema.safeParse(sectionGraph.payload).success).toBe(
      true,
    );
    expect(
      sectionGraphPayloadSchema.safeParse(invalidSectionGraph.payload).success,
    ).toBe(false);
    expect(
      validateArtifactEnvelope(
        sectionGraph,
        sectionGraphContract as Record<string, unknown>,
      ),
    ).toEqual([]);
    expect(
      validateArtifactEnvelope(
        invalidSectionGraph,
        sectionGraphContract as Record<string, unknown>,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("$.payload.proof_bindings[0].proof_ref"),
      ]),
    );
  });
});

function productBriefArtifact() {
  return {
    artifact_type: "ProductBrief",
    schema_version: "1.0.0",
    artifact_id: "product-brief_test",
    run_id: "run_test",
    status: "draft",
    producer_stage: "product-and-brand-brief",
    input_refs: [],
    validation: { valid: false, errors: [] },
    payload: {
      product_name: "Atlas Bottle",
      audiences: ["Urban commuters"],
      core_problem: "Leak-proof",
      value_props: ["Leak-proof"],
      product_details: [],
      cta_goal: "Shop now",
      proof_inputs: ["500+ reviews"],
      proof_sources: [
        {
          proof_ref: "proof:review-export.1",
          claim: "500+ reviews",
          source: "Review export supplied by brand",
          url: null,
        },
      ],
      claim_refs: [
        {
          claim_ref: "claim:reviews.1",
          claim: "500+ reviews",
          proof_refs: ["proof:review-export.1"],
        },
      ],
      claim_policy: "proof-required",
    },
  };
}

function sectionGraphArtifact() {
  return {
    artifact_type: "SectionGraph",
    schema_version: "1.0.0",
    artifact_id: "section-graph_test",
    run_id: "run_test",
    status: "draft",
    producer_stage: "section-planning",
    input_refs: [],
    validation: { valid: false, errors: [] },
    payload: {
      nodes: [
        {
          section_id: "hero",
          section_type: "hero",
          title: "Atlas Bottle",
          props: {},
        },
        {
          section_id: "proof",
          section_type: "proof",
          title: "Proof points",
          props: {},
        },
      ],
      edges: [{ from: "hero", to: "proof", relationship: "substantiates" }],
      section_order: ["hero", "proof"],
      required_props: {},
      proof_bindings: [{ section_id: "proof", proof_ref: "proof:review-export.1" }],
      claim_policy: "proof-required",
    },
  };
}
