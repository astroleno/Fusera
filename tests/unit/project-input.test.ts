import { describe, expect, it } from "vitest";
import { createArtifactEnvelope } from "@/lib/domain/page-artifacts";
import { projectInputSchema } from "@/lib/domain/project-input";

describe("projectInputSchema", () => {
  it("rejects submissions without required fields", () => {
    const result = projectInputSchema.safeParse({
      productName: "",
      sellingPoints: [],
      targetAudience: "",
      brandKeywords: [],
      cta: "",
      imageUrls: [],
    });

    expect(result.success).toBe(false);
  });

  it("defaults optional collection fields", () => {
    const result = projectInputSchema.parse({
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek"],
      cta: "Shop now",
      imageUrls: ["https://example.com/product.jpg"],
    });

    expect(result.trustSignals).toEqual([]);
    expect(result.productDetails).toEqual([]);
    expect(result.proofSources).toEqual([]);
    expect(result.referenceUrls).toEqual([]);
    expect(result.visualDirectionId).toBe("premium-editorial");
  });

  it("accepts structured product details and proof sources", () => {
    const result = projectInputSchema.parse({
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof"],
      productDetails: [{ label: "Capacity", value: "24 oz" }],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek"],
      cta: "Shop now",
      imageUrls: ["https://example.com/product.jpg"],
      trustSignals: ["500+ reviews"],
      proofSources: [
        {
          claim: "500+ reviews",
          source: "Review export supplied by brand",
          url: "https://example.com/reviews",
        },
      ],
    });

    expect(result.productDetails).toEqual([{ label: "Capacity", value: "24 oz" }]);
    expect(result.proofSources).toEqual([
      {
        claim: "500+ reviews",
        source: "Review export supplied by brand",
        url: "https://example.com/reviews",
      },
    ]);
  });

  it("accepts the curated commercial visual directions", () => {
    const result = projectInputSchema.parse({
      productName: "Atlas Bottle",
      sellingPoints: ["Leak-proof"],
      targetAudience: "Urban commuters",
      brandKeywords: ["sleek"],
      cta: "Shop now",
      visualDirectionId: "marketplace-clean",
      imageUrls: ["https://example.com/product.jpg"],
    });

    expect(result.visualDirectionId).toBe("marketplace-clean");
  });
});

describe("createArtifactEnvelope", () => {
  it("wraps payloads in the canonical validated envelope", () => {
    const envelope = createArtifactEnvelope({
      artifactType: "ProductBrief",
      runId: "run_test_01",
      producerStage: "product-and-brand-brief",
      inputRefs: ["normalized-input"],
      payload: {
        product_name: "Atlas Bottle",
      },
    });

    expect(envelope.artifact_type).toBe("ProductBrief");
    expect(envelope.schema_version).toBe("1.0.0");
    expect(envelope.status).toBe("validated");
    expect(envelope.validation).toEqual({ valid: true, errors: [] });
    expect(envelope.payload).toEqual({ product_name: "Atlas Bottle" });
  });
});
