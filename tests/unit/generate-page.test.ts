import { describe, expect, it, vi } from "vitest";
import {
  artifactEnvelopeSchema,
  brandProfilePayloadSchema,
  pagePlanPayloadSchema,
  productBriefPayloadSchema,
  sectionGraphPayloadSchema,
  themeTokensPayloadSchema,
} from "@/lib/domain/page-artifacts";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";

const routeMocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: routeMocks.createDbClient,
}));

import { POST } from "@/app/api/projects/[projectId]/generate/route";

const payloadSchemas = {
  ProductBrief: productBriefPayloadSchema,
  BrandProfile: brandProfilePayloadSchema,
  PagePlan: pagePlanPayloadSchema,
  SectionGraph: sectionGraphPayloadSchema,
  ThemeTokens: themeTokensPayloadSchema,
};

const producerStages = {
  ProductBrief: "product-and-brand-brief",
  BrandProfile: "product-and-brand-brief",
  PagePlan: "page-strategy",
  SectionGraph: "section-planning",
  ThemeTokens: "design-system-pass",
};

describe("buildPageArtifacts", () => {
  it("returns strict canonical artifacts for a valid project", async () => {
    const result = await buildPageArtifacts({
      runId: "run_test_01",
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof", "Insulated"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek", "confident"],
      cta: "Shop now",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: ["500+ reviews"],
      referenceUrls: [],
    });

    const artifactsByType = Object.fromEntries(
      result.artifacts.map((artifact) => [artifact.artifact_type, artifact]),
    );

    expect(Object.keys(artifactsByType).sort()).toEqual(
      Object.keys(payloadSchemas).sort(),
    );

    for (const [artifactType, schema] of Object.entries(payloadSchemas)) {
      const artifact = artifactsByType[artifactType];
      expect(artifactEnvelopeSchema.safeParse(artifact).success).toBe(true);
      expect(schema.safeParse(artifact.payload).success).toBe(true);
      expect(artifact.producer_stage).toBe(
        producerStages[artifactType as keyof typeof producerStages],
      );
    }

    expect(result.latestRefs.productBriefRef).toBe(
      artifactsByType.ProductBrief.artifact_id,
    );
    expect(result.latestRefs.brandProfileRef).toBe(
      artifactsByType.BrandProfile.artifact_id,
    );
    expect(result.latestRefs.pagePlanRef).toBe(artifactsByType.PagePlan.artifact_id);
    expect(result.latestRefs.sectionGraphRef).toBe(
      artifactsByType.SectionGraph.artifact_id,
    );
    expect(result.latestRefs.themeTokensRef).toBe(
      artifactsByType.ThemeTokens.artifact_id,
    );
    expect(artifactsByType.ProductBrief.payload.product_name).toBe("Atlas Bottle");
    expect(artifactsByType.ProductBrief.payload.claim_policy).toBe(
      "proof-required",
    );
    expect(artifactsByType.SectionGraph.payload.nodes[0]).toMatchObject({
      section_id: "hero",
      section_type: "hero",
    });
    expect(artifactsByType.ThemeTokens.payload.colors).toMatchObject({
      background: expect.any(String),
      surface: expect.any(String),
      text: expect.any(String),
      accent: expect.any(String),
    });
  });
});

describe("POST /api/projects/[projectId]/generate", () => {
  it("returns 404 when the project is missing", async () => {
    routeMocks.single.mockResolvedValue({
      data: null,
      error: { message: "not found" },
    });
    routeMocks.eq.mockReturnValue({ single: routeMocks.single });
    routeMocks.select.mockReturnValue({ eq: routeMocks.eq });
    routeMocks.from.mockReturnValue({ select: routeMocks.select });
    routeMocks.createDbClient.mockResolvedValue({ from: routeMocks.from });

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_missing" }),
    });

    expect(response.status).toBe(404);
    expect(routeMocks.from).toHaveBeenCalledWith("projects");
  });
});
