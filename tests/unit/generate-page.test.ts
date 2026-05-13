import { describe, expect, it } from "vitest";
import {
  artifactEnvelopeSchema,
  brandProfilePayloadSchema,
  designSpecPayloadSchema,
  pagePlanPayloadSchema,
  productBriefPayloadSchema,
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
};

const producerStages = {
  ProductBrief: "product-and-brand-brief",
  BrandProfile: "product-and-brand-brief",
  PagePlan: "page-strategy",
  SectionGraph: "section-planning",
  ThemeTokens: "design-system-pass",
  DesignSpec: "design-spec-pass",
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

    const [
      productBrief,
      brandProfile,
      pagePlan,
      sectionGraph,
      themeTokens,
      designSpec,
    ] = result.artifacts;
    const artifactsByType = {
      ProductBrief: productBrief,
      BrandProfile: brandProfile,
      PagePlan: pagePlan,
      SectionGraph: sectionGraph,
      ThemeTokens: themeTokens,
      DesignSpec: designSpec,
    };

    expect(Object.keys(artifactsByType).sort()).toEqual(
      Object.keys(payloadSchemas).sort(),
    );

    for (const [artifactType, schema] of Object.entries(payloadSchemas)) {
      const artifact = artifactsByType[artifactType as keyof typeof artifactsByType];
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
    expect(artifactsByType.DesignSpec.input_refs).toEqual([
      artifactsByType.ProductBrief.artifact_id,
      artifactsByType.BrandProfile.artifact_id,
      artifactsByType.PagePlan.artifact_id,
      artifactsByType.SectionGraph.artifact_id,
      artifactsByType.ThemeTokens.artifact_id,
    ]);
    expect(
      artifactsByType.DesignSpec.payload.section_design_intents.map(
        (intent) => intent.section_id,
      ),
    ).toEqual(artifactsByType.SectionGraph.payload.section_order);
    expect(
      artifactsByType.DesignSpec.payload.claim_and_proof_constraints.claim_policy,
    ).toBe(artifactsByType.ProductBrief.payload.claim_policy);
    expect(artifactsByType.DesignSpec.payload.token_directives).toMatchObject({
      radii: expect.any(Object),
      shadows: expect.any(Object),
    });
    expect(artifactsByType.DesignSpec.payload.anti_patterns).toMatchObject({
      visual: expect.arrayContaining([expect.any(String)]),
      copy: expect.arrayContaining([expect.any(String)]),
      proof: expect.arrayContaining([expect.any(String)]),
    });
  });
});
