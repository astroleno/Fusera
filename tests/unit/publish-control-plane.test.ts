import { describe, expect, it } from "vitest";
import {
  assertPublishExportOperationTransition,
  canTransitionPublishExportOperation,
  createBlockedPublishExportOperation,
  createReadyPublishExportOperation,
  evaluateProofHardGate,
  initialExportStateForCompletedGeneration,
  publishExportOperationInsertSchema,
  publishExportRequestSchema,
} from "@/lib/domain/publish-control-plane";

describe("publish/export control-plane contract", () => {
  it("parses explicit publish/export requests without external runtime fields", () => {
    expect(
      publishExportRequestSchema.safeParse({
        operationType: "publish",
        externalTarget: { channel: "shopify" },
      }).success,
    ).toBe(true);
    expect(
      publishExportRequestSchema.safeParse({
        operationType: "poster",
      }).success,
    ).toBe(false);
  });

  it("creates ready operation inserts from validated artifact refs", () => {
    const operation = createReadyPublishExportOperation({
      projectId: "project_01",
      runId: "run_01",
      operationType: "export",
      pageSpecRef: "page-spec_01",
      qaReportRef: "qa-report_01",
      publishVersionRef: "publish-version_01",
      previewBuildRef: "preview:run_01",
      externalTarget: { format: "html" },
    });

    expect(publishExportOperationInsertSchema.safeParse(operation).success).toBe(
      true,
    );
    expect(operation).toMatchObject({
      operation_type: "export",
      status: "ready",
      page_spec_ref: "page-spec_01",
      qa_report_ref: "qa-report_01",
      preview_build_ref: "preview:run_01",
      diagnostics: [],
      external_target: { format: "html" },
      external_result: null,
    });
  });

  it("creates blocked operation inserts with machine-readable diagnostics", () => {
    const operation = createBlockedPublishExportOperation({
      projectId: "project_01",
      runId: "run_01",
      operationType: "publish",
      pageSpecRef: "page-spec_01",
      qaReportRef: "qa-report_01",
      publishVersionRef: null,
      previewBuildRef: "preview:run_01",
      diagnostics: [
        {
          code: "claim_ref_unknown_proof_ref",
          severity: "blocking",
          message: "ClaimRef points at missing ProofRef.",
          artifactType: "ProductBrief",
          artifactRef: "product-brief_01",
          details: { proofRef: "proof:missing" },
        },
      ],
    });

    expect(publishExportOperationInsertSchema.safeParse(operation).success).toBe(
      true,
    );
    expect(operation).toMatchObject({
      operation_type: "publish",
      status: "blocked",
      failure_code: "claim_ref_unknown_proof_ref",
      failure_reason: "ClaimRef points at missing ProofRef.",
      diagnostics: [
        expect.objectContaining({
          code: "claim_ref_unknown_proof_ref",
          severity: "blocking",
        }),
      ],
    });
  });

  it("blocks missing and inconsistent ClaimRef/ProofRef bindings", () => {
    const diagnostics = evaluateProofHardGate({
      productBriefRef: "product-brief_01",
      sectionGraphRef: "section-graph_01",
      productBriefPayload: {
        ...validProductBriefPayload,
        proof_sources: [
          {
            proof_ref: "proof:reviews.1",
            claim: "Different proof claim",
            source: "Review export supplied by brand",
            url: null,
          },
        ],
        claim_refs: [
          {
            claim_ref: "claim:reviews.1",
            claim: "500+ reviews",
            proof_refs: ["proof:reviews.1", "proof:missing"],
          },
        ],
      },
      sectionGraphPayload: {
        ...validSectionGraphPayload,
        proof_bindings: [
          { section_id: "proof", proof_ref: "proof:missing" },
          { section_id: "ghost", proof_ref: "proof:reviews.1" },
        ],
      },
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "claim_ref_unknown_proof_ref" }),
        expect.objectContaining({ code: "claim_proof_claim_mismatch" }),
        expect.objectContaining({ code: "section_graph_unknown_proof_ref" }),
        expect.objectContaining({ code: "proof_binding_unknown_section" }),
      ]),
    );
  });

  it("passes complete ClaimRef/ProofRef bindings", () => {
    expect(
      evaluateProofHardGate({
        productBriefRef: "product-brief_01",
        sectionGraphRef: "section-graph_01",
        productBriefPayload: validProductBriefPayload,
        sectionGraphPayload: validSectionGraphPayload,
      }),
    ).toEqual([]);
  });

  it("blocks ProofRefs that never reach SectionGraph bindings", () => {
    expect(
      evaluateProofHardGate({
        productBriefRef: "product-brief_01",
        sectionGraphRef: "section-graph_01",
        productBriefPayload: validProductBriefPayload,
        sectionGraphPayload: {
          ...validSectionGraphPayload,
          proof_bindings: [],
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "proof_ref_not_bound_to_section_graph" }),
      ]),
    );
  });

  it("keeps generated runs out of export-ready state until control-plane action", () => {
    expect(initialExportStateForCompletedGeneration()).toBe("none");
  });

  it("allows only explicit control-plane status transitions", () => {
    expect(canTransitionPublishExportOperation("requested", "ready")).toBe(true);
    expect(canTransitionPublishExportOperation("ready", "external_pending")).toBe(
      true,
    );
    expect(
      canTransitionPublishExportOperation(
        "external_pending",
        "external_succeeded",
      ),
    ).toBe(true);
    expect(canTransitionPublishExportOperation("ready", "external_succeeded")).toBe(
      false,
    );
    expect(() =>
      assertPublishExportOperationTransition("external_succeeded", "ready"),
    ).toThrow("Invalid publish/export transition");
  });
});

const validProductBriefPayload = {
  product_name: "Atlas Bottle",
  audiences: ["Urban commuters"],
  core_problem: "Leak-proof daily carry",
  value_props: ["Leak-proof", "Insulated"],
  product_details: [{ label: "Capacity", value: "24 oz" }],
  cta_goal: "Shop now",
  proof_inputs: ["500+ reviews"],
  proof_sources: [
    {
      proof_ref: "proof:reviews.1",
      claim: "500+ reviews",
      source: "Review export supplied by brand",
      url: null,
    },
  ],
  claim_refs: [
    {
      claim_ref: "claim:reviews.1",
      claim: "500+ reviews",
      proof_refs: ["proof:reviews.1"],
    },
  ],
  claim_policy: "proof-required",
};

const validSectionGraphPayload = {
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
      title: "Loved by commuters",
      props: {},
    },
  ],
  edges: [{ from: "hero", to: "proof", relationship: "supports" }],
  section_order: ["hero", "proof"],
  required_props: {},
  proof_bindings: [{ section_id: "proof", proof_ref: "proof:reviews.1" }],
  claim_policy: "proof-required",
};
