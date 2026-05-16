import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { POST as exportPost } from "@/app/api/projects/[projectId]/export/route";
import { POST as publishPost } from "@/app/api/projects/[projectId]/publish/route";

function runQuery(data: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

function artifactQuery(data: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

function operationQuery(data: unknown) {
  const single = vi.fn().mockResolvedValue({ data, error: null });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });

  return {
    insert,
    select,
    single,
  };
}

const passingQaReportPayload = {
  page_spec_ref: "page-spec_01",
  preview_build_ref: "preview:run_01",
  verdict: "pass",
  gate_results: [
    {
      gate_id: "artifact-binding",
      result: "pass",
      blocking: true,
      waivable: false,
      evidence_refs: ["page-spec_01"],
    },
  ],
  issues: [],
  repair_directives: [],
  evidence_refs: ["page-spec_01"],
  waiver: null,
};

const pageSpecPayload = {
  route_id: "landing-page:run_01",
  sections: [
    {
      section_id: "hero",
      section_type: "hero",
      component: "landing.hero",
      props: {
        headline: "Atlas Bottle",
        cta_label: "Shop now",
      },
    },
  ],
  token_refs: {
    theme_tokens_ref: "theme-tokens_01",
    design_spec_ref: "design-spec_01",
  },
  asset_refs: [],
  compile_targets: ["preview"],
};

const productBriefPayload = {
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
      url: "https://example.com/reviews",
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

const sectionGraphPayload = {
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

const failingQaReportPayload = {
  ...passingQaReportPayload,
  verdict: "fail",
  issues: [
    {
      issue_id: "landing-cta-missing",
      severity: "high",
      category: "conversion",
      repairability: "machine-repairable",
      blocking: true,
      location_ref: "section:hero",
      summary: "Landing page has no clear hero or closing CTA.",
    },
  ],
};

const waivedQaReportPayload = {
  ...passingQaReportPayload,
  verdict: "waived",
  gate_results: [
    {
      gate_id: "manual-approval",
      result: "waived",
      blocking: true,
      waivable: true,
      evidence_refs: ["page-spec_01"],
    },
  ],
  waiver: {
    actor: "release@example.com",
    role: "release-approver",
    reason: "Manual approval flow fixture.",
    approved_at: "2026-05-15T00:00:00.000Z",
  },
};

const passWithFailedNonWaivableGatePayload = {
  ...passingQaReportPayload,
  gate_results: [
    {
      gate_id: "artifact-binding",
      result: "fail",
      blocking: true,
      waivable: false,
      evidence_refs: ["page-spec_01"],
    },
  ],
};

describe("publish/export control-plane routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 409 for legacy preview-only runs without full spine refs", async () => {
    mocks.from.mockReturnValueOnce(
      runQuery({
        id: "run_legacy",
        latest_page_spec_ref: null,
        latest_qa_report_ref: null,
        latest_publish_version_ref: null,
      }),
    );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_legacy" }),
    });

    expect(response.status).toBe(409);
  });

  it("returns 409 when the latest run has a PageSpec but no QAReport", async () => {
    mocks.from.mockReturnValueOnce(
      runQuery({
        id: "run_missing_qa",
        latest_page_spec_ref: "page-spec_01",
        latest_qa_report_ref: null,
        latest_publish_version_ref: null,
      }),
    );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_missing_qa" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("QAReport");
  });

  it("records a ready publish control-plane operation without external publishing", async () => {
    const operation = operationQuery({
      id: "operation_01",
      operation_type: "publish",
      status: "ready",
    });

    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_product_brief_ref: "product-brief_01",
          latest_section_graph_ref: "section-graph_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: "publish-version_01",
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "page-spec_01",
          artifact_type: "PageSpec",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: pageSpecPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "product-brief_01",
          artifact_type: "ProductBrief",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: productBriefPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "section-graph_01",
          artifact_type: "SectionGraph",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: sectionGraphPayload,
        }),
      )
      .mockReturnValueOnce(operation);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("publish_control_plane_ready");
    expect(body.previewReady).toBe(true);
    expect(body.operation).toEqual({
      id: "operation_01",
      operationType: "publish",
      status: "ready",
      diagnostics: [],
    });
    expect(body.externalPublishingImplemented).toBe(false);
    expect(operation.insert).toHaveBeenCalledWith({
      project_id: "project_01",
      run_id: "run_01",
      operation_type: "publish",
      status: "ready",
      page_spec_ref: "page-spec_01",
      qa_report_ref: "qa-report_01",
      publish_version_ref: "publish-version_01",
      preview_build_ref: "preview:run_01",
      failure_code: null,
      failure_reason: null,
      diagnostics: [],
      external_target: null,
      external_result: null,
    });
  });

  it("returns 409 for rejected QAReport artifacts even when payload passes", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "rejected",
          validation: { valid: false, errors: ["QAReport payload rejected"] },
          payload: passingQaReportPayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("not validated");
  });

  it("returns 409 for waived QAReports until waiver publishing is implemented", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: waivedQaReportPayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("not publishable");
  });

  it("returns 409 when the latest QAReport verdict fails", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: failingQaReportPayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("not publishable");
  });

  it("returns 409 when a passing QAReport has failed non-waivable gates", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passWithFailedNonWaivableGatePayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("failed non-waivable");
  });

  it("returns 409 when the latest QAReport binds an old PageSpec", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_02",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("latest PageSpec");
  });

  it("returns 409 for QAReports bound to a stale preview build", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_02",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("preview build");
  });

  it("returns 409 when the latest PageSpec artifact is missing", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      )
      .mockReturnValueOnce(artifactQuery(null));
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("PageSpec artifact is missing");
  });

  it("returns 409 when the latest PageSpec artifact is rejected", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "page-spec_01",
          artifact_type: "PageSpec",
          status: "rejected",
          validation: { valid: false, errors: ["PageSpec payload rejected"] },
          payload: pageSpecPayload,
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("PageSpec artifact is not validated");
  });

  it("returns 409 when the latest PageSpec payload is invalid", async () => {
    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: null,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "page-spec_01",
          artifact_type: "PageSpec",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: { route_id: "landing-page:run_01" },
        }),
      );
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("PageSpec artifact payload is invalid");
  });

  it("rejects export operations sent to the publish endpoint", async () => {
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ operationType: "export" }),
      }),
      {
        params: Promise.resolve({ projectId: "project_01" }),
      },
    );

    expect(response.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("records blocked operation diagnostics when ClaimRefs point at missing ProofRefs", async () => {
    const operation = operationQuery({
      id: "operation_blocked_01",
      operation_type: "publish",
      status: "blocked",
      diagnostics: [
        {
          code: "claim_ref_unknown_proof_ref",
          severity: "blocking",
          message: "ClaimRef claim:reviews.1 points at missing ProofRef proof:missing.",
          artifactType: "ProductBrief",
          artifactRef: "product-brief_01",
          details: {
            claimRef: "claim:reviews.1",
            proofRef: "proof:missing",
          },
        },
      ],
    });

    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_product_brief_ref: "product-brief_01",
          latest_section_graph_ref: "section-graph_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: "publish-version_01",
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "page-spec_01",
          artifact_type: "PageSpec",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: pageSpecPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "product-brief_01",
          artifact_type: "ProductBrief",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: {
            ...productBriefPayload,
            proof_sources: [],
            claim_refs: [
              {
                claim_ref: "claim:reviews.1",
                claim: "500+ reviews",
                proof_refs: ["proof:missing"],
              },
            ],
          },
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "section-graph_01",
          artifact_type: "SectionGraph",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: {
            ...sectionGraphPayload,
            proof_bindings: [{ section_id: "proof", proof_ref: "proof:missing" }],
          },
        }),
      )
      .mockReturnValueOnce(operation);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await publishPost(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.status).toBe("publish_control_plane_blocked");
    expect(body.operation.status).toBe("blocked");
    expect(body.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "proof_required_without_proof_refs" }),
        expect.objectContaining({ code: "claim_ref_unknown_proof_ref" }),
        expect.objectContaining({ code: "section_graph_unknown_proof_ref" }),
      ]),
    );
    expect(operation.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "blocked",
        failure_code: "proof_required_without_proof_refs",
        diagnostics: expect.arrayContaining([
          expect.objectContaining({ severity: "blocking" }),
        ]),
      }),
    );
  });

  it("records a ready export control-plane operation without external export", async () => {
    const operation = operationQuery({
      id: "operation_export_01",
      operation_type: "export",
      status: "ready",
    });

    mocks.from
      .mockReturnValueOnce(
        runQuery({
          id: "run_01",
          latest_product_brief_ref: "product-brief_01",
          latest_section_graph_ref: "section-graph_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
          latest_publish_version_ref: "publish-version_01",
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "qa-report_01",
          artifact_type: "QAReport",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: passingQaReportPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "page-spec_01",
          artifact_type: "PageSpec",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: pageSpecPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "product-brief_01",
          artifact_type: "ProductBrief",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: productBriefPayload,
        }),
      )
      .mockReturnValueOnce(
        artifactQuery({
          artifact_id: "section-graph_01",
          artifact_type: "SectionGraph",
          status: "validated",
          validation: { valid: true, errors: [] },
          payload: sectionGraphPayload,
        }),
      )
      .mockReturnValueOnce(operation);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await exportPost(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          externalTarget: { format: "html" },
        }),
      }),
      {
        params: Promise.resolve({ projectId: "project_01" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("export_control_plane_ready");
    expect(body.operation).toEqual({
      id: "operation_export_01",
      operationType: "export",
      status: "ready",
      diagnostics: [],
    });
    expect(body.externalExportImplemented).toBe(false);
    expect(operation.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        operation_type: "export",
        status: "ready",
        external_target: { format: "html" },
      }),
    );
  });
});
