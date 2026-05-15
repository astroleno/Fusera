import { describe, expect, it } from "vitest";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";
import { projectInputSchema } from "@/lib/domain/project-input";
import briefs from "../../superpowers/runner/fixtures/lead-icp/landing-page-briefs.json";

describe("seeded lead ICP landing-page briefs", () => {
  it("produce the full landing-page spine without starting other output modes", async () => {
    expect(briefs.length).toBeGreaterThanOrEqual(5);
    expect(briefs.length).toBeLessThanOrEqual(10);

    for (const brief of briefs) {
      const intake = projectInputSchema.parse(brief.intake);
      const result = await buildPageArtifacts({
        runId: `run_${brief.id}`,
        ...intake,
      });

      expect(result.artifacts.map((artifact) => artifact.artifact_type)).toEqual([
        "ProductBrief",
        "BrandProfile",
        "PagePlan",
        "SectionGraph",
        "ThemeTokens",
        "DesignSpec",
        "PageSpec",
        "QAReport",
        "PublishVersion",
      ]);
      expect(result.payloads.pageSpec.compile_targets).toEqual(["preview"]);
      expect(result.payloads.qaReport.verdict).toBe("pass");
      expect(result.payloads.publishVersion?.publish_target).toBe("preview");
    }
  });
});
