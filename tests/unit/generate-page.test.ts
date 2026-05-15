import { describe, expect, it } from "vitest";
import {
  artifactEnvelopeSchema,
  brandProfilePayloadSchema,
  designSpecPayloadSchema,
  pageSpecPayloadSchema,
  pagePlanPayloadSchema,
  productBriefPayloadSchema,
  publishVersionPayloadSchema,
  qaReportPayloadSchema,
  sectionGraphPayloadSchema,
  themeTokensPayloadSchema,
} from "@/lib/domain/page-artifacts";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";

const payloadSchemas = {
  ProductBrief: productBriefPayloadSchema,
  BrandProfile: brandProfilePayloadSchema,
  PagePlan: pagePlanPayloadSchema,
  SectionGraph: sectionGraphPayloadSchema,
  ThemeTokens: themeTokensPayloadSchema,
  DesignSpec: designSpecPayloadSchema,
  PageSpec: pageSpecPayloadSchema,
  QAReport: qaReportPayloadSchema,
  PublishVersion: publishVersionPayloadSchema,
};

const producerStages = {
  ProductBrief: "product-and-brand-brief",
  BrandProfile: "product-and-brand-brief",
  PagePlan: "page-strategy",
  SectionGraph: "section-planning",
  ThemeTokens: "design-system-pass",
  DesignSpec: "design-spec-pass",
  PageSpec: "page-compile",
  QAReport: "verify-publishable-page",
  PublishVersion: "publish-preview",
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
      visualDirectionId: "premium-editorial",
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
    expect(result.latestRefs.designSpecRef).toBe(
      artifactsByType.DesignSpec.artifact_id,
    );
    expect(result.latestRefs.pageSpecRef).toBe(artifactsByType.PageSpec.artifact_id);
    expect(result.latestRefs.qaReportRef).toBe(
      artifactsByType.QAReport.artifact_id,
    );
    expect(result.latestRefs.publishVersionRef).toBe(
      artifactsByType.PublishVersion.artifact_id,
    );
    expect(result.payloads.productBrief.product_name).toBe("Atlas Bottle");
    expect(result.payloads.productBrief.claim_policy).toBe("proof-required");
    expect(result.payloads.sectionGraph.nodes[0]).toMatchObject({
      section_id: "hero",
      section_type: "hero",
    });
    expect(result.payloads.sectionGraph.section_order).toContain("buyer-fit");
    expect(result.payloads.pageSpec.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          section_id: "buyer-fit",
          section_type: "problem",
          props: expect.objectContaining({
            headline: "Built for Urban commuters",
          }),
        }),
      ]),
    );
    expect(result.payloads.themeTokens.colors).toMatchObject({
      background: expect.any(String),
      surface: expect.any(String),
      text: expect.any(String),
      accent: expect.any(String),
    });
    expect(result.payloads.pageSpec.token_refs).toMatchObject({
      theme_tokens_ref: artifactsByType.ThemeTokens.artifact_id,
      design_spec_ref: artifactsByType.DesignSpec.artifact_id,
    });
    expect(result.payloads.qaReport.verdict).toBe("pass");
    expect(result.qualityScore.total).toBeGreaterThan(0);
  });

  it("changes ThemeTokens when the visual direction changes", async () => {
    const baseInput = {
      runId: "run_test_direction",
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof", "Insulated"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek", "confident"],
      cta: "Shop now",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: [],
      referenceUrls: [],
    };

    const premium = await buildPageArtifacts({
      ...baseInput,
      visualDirectionId: "premium-editorial",
    });
    const performance = await buildPageArtifacts({
      ...baseInput,
      visualDirectionId: "performance-ad",
    });

    expect(premium.payloads.themeTokens.colors).not.toEqual(
      performance.payloads.themeTokens.colors,
    );
    expect(premium.payloads.designSpec.visual_thesis).not.toBe(
      performance.payloads.designSpec.visual_thesis,
    );
  });

  it("feeds anti-slop findings into QAReport and quality score", async () => {
    const clean = await buildPageArtifacts({
      runId: "run_clean",
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof", "Insulated"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek", "confident"],
      cta: "Shop now",
      visualDirectionId: "marketplace-clean",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: [],
      referenceUrls: [],
    });
    const flagged = await buildPageArtifacts({
      runId: "run_flagged",
      productName: "Atlas Bottle",
      sellingPoints: ["Trusted by 10,000 customers"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek", "confident"],
      cta: "Shop now",
      visualDirectionId: "marketplace-clean",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: [],
      referenceUrls: [],
    });

    expect(flagged.payloads.qaReport.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "claims",
          blocking: false,
        }),
      ]),
    );
    expect(flagged.qualityScore.breakdown.advisoryFindings).toBeGreaterThan(0);
    expect(flagged.qualityScore.total).toBeLessThan(clean.qualityScore.total);
  });
});
