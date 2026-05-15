import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/anti-slop-linter", () => ({
  lintLandingPageAntiSlop: () => [
    {
      issue_id: "blocking-contrast",
      severity: "high",
      category: "contrast",
      blocking: true,
      location_ref: "theme.colors.background",
      summary: "Synthetic blocking QA issue.",
    },
  ],
}));

import { buildPageArtifacts } from "@/lib/ai/page-strategy";

describe("buildPageArtifacts QA failure publishing contract", () => {
  it("does not produce a PublishVersion when QA fails", async () => {
    const result = await buildPageArtifacts({
      runId: "run_fail_01",
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

    expect(result.payloads.qaReport.verdict).toBe("fail");
    expect(result.artifacts.map((artifact) => artifact.artifact_type)).not.toContain(
      "PublishVersion",
    );
    expect(result.latestRefs.publishVersionRef).toBeNull();
    expect(result.payloads.publishVersion).toBeNull();
  });
});
