import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  single: vi.fn(),
  in: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { loadProjectPreview } from "@/lib/projects/load-project-preview";

const sectionGraphPayload = {
  nodes: [
    {
      section_id: "hero",
      section_type: "hero",
      title: "Atlas Bottle",
      props: {
        headline: "Atlas Bottle",
        cta_label: "Shop now",
        image_urls: ["https://example.com/product.jpg"],
      },
    },
  ],
  edges: [],
  section_order: ["hero"],
  required_props: {
    hero: ["headline", "cta_label", "image_urls"],
  },
  proof_bindings: [],
  claim_policy: "low-proof",
};

const themeTokensPayload = {
  colors: {
    background: "#f7f3ec",
    surface: "#fffaf2",
    text: "#171513",
    accent: "#315f52",
  },
  typography: {},
  spacing: {},
  radii: {},
  shadows: {},
  motion: {},
};

const pageSpecPayload = {
  route_id: "landing-page:run_01",
  sections: [
    {
      section_id: "hero",
      section_type: "hero",
      component: "landing.hero",
      title: "Atlas Bottle",
      props: {
        headline: "Atlas Bottle",
        cta_label: "Shop now",
        image_urls: ["https://example.com/product.jpg"],
      },
      design_intent: {
        layout: "Product-first hero layout.",
        media: "Use supplied product image.",
        copy: "Keep copy grounded in the product brief.",
        proof: "Avoid unsupported proof claims.",
        motion: "Use subtle interaction feedback.",
      },
    },
  ],
  token_refs: {
    theme_tokens_ref: "theme-tokens_01",
    design_spec_ref: "design-spec_01",
  },
  asset_refs: ["https://example.com/product.jpg"],
  compile_targets: ["preview"],
};

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

describe("loadProjectPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers PageSpec for the latest completed run", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_01",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            artifact_id: "page-spec_01",
            artifact_type: "PageSpec",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: pageSpecPayload,
          },
          {
            artifact_id: "qa-report_01",
            artifact_type: "QAReport",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: passingQaReportPayload,
          },
          {
            artifact_id: "section-graph_01",
            artifact_type: "SectionGraph",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: sectionGraphPayload,
          },
          {
            artifact_id: "theme-tokens_01",
            artifact_type: "ThemeTokens",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: themeTokensPayload,
          },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const preview = await loadProjectPreview("project_01");

    expect(preview?.mode).toBe("page-spec");
    expect(preview?.publishReady).toBe(true);
    expect(preview?.runId).toBe("run_01");
    expect(preview?.pageSpecRef).toBe("page-spec_01");
    expect(preview?.qaReportRef).toBe("qa-report_01");
    expect(preview?.qaFailureReason).toBeNull();
    expect(preview?.page.sections[0]).toMatchObject({
      key: "hero:hero",
      sectionType: "hero",
    });
    expect(preview?.page.theme.colors.accent).toBe("#315f52");
  });

  it("falls back to legacy SectionGraph previews without publish readiness", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_legacy",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
          latest_page_spec_ref: null,
          latest_qa_report_ref: null,
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            artifact_id: "section-graph_01",
            artifact_type: "SectionGraph",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: sectionGraphPayload,
          },
          {
            artifact_id: "theme-tokens_01",
            artifact_type: "ThemeTokens",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: themeTokensPayload,
          },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const preview = await loadProjectPreview("project_legacy");

    expect(preview?.mode).toBe("legacy-section-graph");
    expect(preview?.publishReady).toBe(false);
    expect(preview?.pageSpecRef).toBeNull();
    expect(preview?.qaFailureReason).toContain("Legacy preview");
    expect(preview?.legacyReason).toContain("predates PageSpec");
  });

  it("returns null when no completed run exists", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "not found" },
      }),
    };

    mocks.from.mockReturnValue(runQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    await expect(loadProjectPreview("project_missing")).resolves.toBeNull();
  });

  it("returns null when preview storage is not configured", async () => {
    mocks.createDbClient.mockRejectedValue(new Error("supabaseUrl is required"));

    await expect(loadProjectPreview("project_local")).resolves.toBeNull();
  });

  it("does not mark QAReports for another PageSpec as publish-ready", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_02",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
          latest_page_spec_ref: "page-spec_02",
          latest_qa_report_ref: "qa-report_01",
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            artifact_id: "page-spec_02",
            artifact_type: "PageSpec",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: pageSpecPayload,
          },
          {
            artifact_id: "qa-report_01",
            artifact_type: "QAReport",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: passingQaReportPayload,
          },
          {
            artifact_id: "theme-tokens_01",
            artifact_type: "ThemeTokens",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: themeTokensPayload,
          },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const preview = await loadProjectPreview("project_01");

    expect(preview?.mode).toBe("page-spec");
    expect(preview?.publishReady).toBe(false);
  });

  it("does not mark stale preview builds as publish-ready", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_02",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            artifact_id: "page-spec_01",
            artifact_type: "PageSpec",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: pageSpecPayload,
          },
          {
            artifact_id: "qa-report_01",
            artifact_type: "QAReport",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: passingQaReportPayload,
          },
          {
            artifact_id: "theme-tokens_01",
            artifact_type: "ThemeTokens",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: themeTokensPayload,
          },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const preview = await loadProjectPreview("project_01");

    expect(preview?.mode).toBe("page-spec");
    expect(preview?.publishReady).toBe(false);
  });

  it("does not mark failed non-waivable QA gates as publish-ready", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_01",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
          latest_page_spec_ref: "page-spec_01",
          latest_qa_report_ref: "qa-report_01",
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            artifact_id: "page-spec_01",
            artifact_type: "PageSpec",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: pageSpecPayload,
          },
          {
            artifact_id: "qa-report_01",
            artifact_type: "QAReport",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: {
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
            },
          },
          {
            artifact_id: "theme-tokens_01",
            artifact_type: "ThemeTokens",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: themeTokensPayload,
          },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const preview = await loadProjectPreview("project_01");

    expect(preview?.mode).toBe("page-spec");
    expect(preview?.publishReady).toBe(false);
  });

  it("returns null instead of legacy fallback when latest PageSpec is corrupt", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_corrupt",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
          latest_page_spec_ref: "page-spec_corrupt",
          latest_qa_report_ref: null,
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          {
            artifact_id: "page-spec_corrupt",
            artifact_type: "PageSpec",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: { route_id: "landing-page:run_corrupt" },
          },
          {
            artifact_id: "section-graph_01",
            artifact_type: "SectionGraph",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: sectionGraphPayload,
          },
          {
            artifact_id: "theme-tokens_01",
            artifact_type: "ThemeTokens",
            status: "validated",
            validation: { valid: true, errors: [] },
            payload: themeTokensPayload,
          },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    await expect(loadProjectPreview("project_corrupt")).resolves.toBeNull();
  });
});
