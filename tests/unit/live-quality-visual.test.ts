import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runFixture } from "../../superpowers/runner/run-stage";
import { verifyLiveCodexQuality } from "../../superpowers/runner/verify-live-codex-quality";

const rootDir = process.cwd();
const inputPath = path.join(rootDir, "superpowers/runner/fixtures/landing-input.json");

describe("verifyLiveCodexQuality visual scoring", () => {
  it("adds a VisualQuality score for design-system proof runs", async () => {
    const run = await runFixture({
      rootDir,
      inputPath,
      adapterMode: "mock",
      stopAfterStage: "design-system-pass",
    });

    const report = await verifyLiveCodexQuality({
      rootDir,
      inputPath,
      runDir: run.run_dir,
    });

    expect(report.ok).toBe(true);
    expect(report.artifact_scores.VisualQuality).toMatchObject({
      present: true,
      status: "evaluated",
      score: 7,
      max_score: 7,
    });
  });

  it("fails when theme colors collapse readable visual roles", async () => {
    const run = await runFixture({
      rootDir,
      inputPath,
      adapterMode: "mock",
      stopAfterStage: "design-system-pass",
    });
    const themeTokensPath = path.join(run.run_dir, "artifacts/theme-tokens.json");
    const themeTokens = JSON.parse(await readFile(themeTokensPath, "utf8"));
    themeTokens.payload.colors = {
      background: "#ffffff",
      surface: "#ffffff",
      text: "#ffffff",
      accent: "#ffffff",
    };
    await writeFile(themeTokensPath, `${JSON.stringify(themeTokens, null, 2)}\n`, "utf8");

    const report = await verifyLiveCodexQuality({
      rootDir,
      inputPath,
      runDir: run.run_dir,
    });

    expect(report.ok).toBe(false);
    expect(report.artifact_scores.VisualQuality.score).toBeLessThan(
      report.artifact_scores.VisualQuality.max_score,
    );
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          criterion: "visual-contrast",
          severity: "fail",
        }),
        expect.objectContaining({
          criterion: "visual-palette",
          severity: "fail",
        }),
      ]),
    );
  });
});
