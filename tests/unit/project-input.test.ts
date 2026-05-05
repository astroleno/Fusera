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
    expect(result.referenceUrls).toEqual([]);
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
