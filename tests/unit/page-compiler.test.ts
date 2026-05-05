import { describe, expect, it } from "vitest";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";
import { compilePage } from "@/lib/page-spec/compile-page";

describe("compilePage", () => {
  it("maps a canonical section graph into renderable sections", async () => {
    const generated = await buildPageArtifacts({
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

    const page = compilePage({
      sectionGraph: generated.payloads.sectionGraph,
      themeTokens: generated.payloads.themeTokens,
    });

    expect(page.sections[0]).toMatchObject({
      key: "hero:hero",
      sectionId: "hero",
      sectionType: "hero",
    });
    expect(page.sections[0].props.headline).toBe("Atlas Bottle");
    expect(page.theme.colors.accent).toBe("#315f52");
  });
});
