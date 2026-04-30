import { describe, expect, it } from "vitest";
import { scorePageQuality } from "@/lib/ai/quality-score";

describe("scorePageQuality", () => {
  it("returns a bounded score object", () => {
    const score = scorePageQuality({
      sectionTypes: ["hero", "features", "proof", "cta"],
      hasTrustSignals: true,
    });

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.breakdown.structure).toBeGreaterThan(0);
  });
});
