import { describe, expect, it } from "vitest";
import { buildPageArtifacts } from "@/lib/ai/page-strategy";
import { projectInputSchema } from "@/lib/domain/project-input";
import commercialProofBaseline from "../../superpowers/runner/fixtures/lead-icp/commercial-proof-baseline.json";
import baseline from "../../superpowers/runner/fixtures/lead-icp/landing-page-baseline.json";
import briefs from "../../superpowers/runner/fixtures/lead-icp/landing-page-briefs.json";
import scorecards from "../../superpowers/runner/fixtures/lead-icp/landing-page-scorecards.json";

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

  it("record landing-only scorecards without unfreezing phase 2 runtime", () => {
    const fixtureIds = briefs.map((brief) => brief.id).sort();
    const scoredFixtureIds = scorecards.cards
      .map((card) => card.fixtureId)
      .sort();

    expect(scorecards.runtimeScope).toEqual(["landing-page"]);
    expect(scorecards.phase2RuntimeFrozen).toBe(true);
    expect(scoredFixtureIds).toEqual(fixtureIds);
    expect(scorecards.summary.firstDraftUsableCount).toBeGreaterThanOrEqual(5);
    expect(scorecards.summary.manualAdjustmentAverage).toBeLessThanOrEqual(3);
    expect(scorecards.summary.draftToRealExportPublishRate).toBe(0);
    expect(scorecards.summary.commercialProofLoopComplete).toBe(false);
  });

  it("pins pass 2 as the active landing-only scorecard baseline", () => {
    expect(baseline.baselineVersion).toBe(scorecards.scoringVersion);
    expect(baseline.baselineSource).toBe(
      "superpowers/runner/fixtures/lead-icp/landing-page-scorecards.json",
    );
    expect(baseline.fixtureSource).toBe(
      "superpowers/runner/fixtures/lead-icp/landing-page-briefs.json",
    );
    expect(baseline.runtimeScope).toEqual(scorecards.runtimeScope);
    expect(baseline.phase2RuntimeFrozen).toBe(true);
    expect(baseline.qualityBaseline).toMatchObject({
      firstDraftUsableRate: scorecards.summary.firstDraftUsableRate,
      manualAdjustmentAverage: scorecards.summary.manualAdjustmentAverage,
      draftToRealExportPublishRate:
        scorecards.summary.draftToRealExportPublishRate,
      commercialProofLoopComplete: scorecards.summary.commercialProofLoopComplete,
    });
    expect(baseline.blockedRuntimeUntilRealPublishLoop).toEqual(
      expect.arrayContaining(["image-poster-runtime"]),
    );
    expect(
      baseline.promotionCriteria.requiresRealExportPublishLoop,
    ).toBe(true);
  });

  it("keeps the commercial proof baseline in no-go until real merchant intent exists", () => {
    const fixtureIds = briefs.map((brief) => brief.id).sort();
    const baselineFixtureIds = commercialProofBaseline.seededBriefs
      .map((brief) => brief.fixtureId)
      .sort();

    expect(commercialProofBaseline.runtimeScope).toEqual(["landing-page"]);
    expect(commercialProofBaseline.phase2RuntimeFrozen).toBe(true);
    expect(commercialProofBaseline.decision).toBe("no-go-phase-2");
    expect(baselineFixtureIds).toEqual(fixtureIds);
    expect(
      commercialProofBaseline.summary.seededDraftToExportPublishIntentRate,
    ).toBe(0);
    expect(commercialProofBaseline.summary.realMerchantBriefCount).toBe(0);
    expect(
      commercialProofBaseline.summary.realMerchantDraftToExportPublishIntentRate,
    ).toBeNull();
    expect(
      commercialProofBaseline.summary.commercialProofLoopComplete,
    ).toBe(false);
    expect(
      commercialProofBaseline.realMerchantBriefs.every(
        (brief) => brief.status === "pending-real-brief",
      ),
    ).toBe(true);
  });
});
