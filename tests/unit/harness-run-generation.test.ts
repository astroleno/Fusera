import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runGeneration } from "../../superpowers/runner/run-generation.ts";
import type { HarnessRunObserver } from "../../superpowers/runner/run-observer.ts";

const RUN_ID = "11111111-1111-4111-8111-111111111111";
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("runGeneration", () => {
  it("runs the canonical mock harness with caller-owned input, identity, and durable observer hooks", async () => {
    const rootDir = process.cwd();
    const runsRoot = await mkdtemp(path.join(os.tmpdir(), "fusera-run-generation-"));
    temporaryRoots.push(runsRoot);
    const fixtureInput = JSON.parse(
      await readFile(path.join(rootDir, "superpowers/runner/fixtures/landing-input.json"), "utf8")
    ) as Record<string, unknown>;
    const observedRecords: Array<Record<string, unknown>> = [];
    const observedEventIds: string[] = [];
    const observer: HarnessRunObserver = {
      async onRunRecord({ runDir, record }) {
        const durableRecord = JSON.parse(await readFile(path.join(runDir, "run.json"), "utf8"));
        expect(durableRecord).toEqual(record);
        observedRecords.push(record);
      },
      async onRunEvent({ runDir, event }) {
        const durableEvents = (await readFile(path.join(runDir, "events.ndjson"), "utf8"))
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line));
        expect(durableEvents).toContainEqual(event);
        observedEventIds.push(event.event_id ?? "");
      }
    };

    const result = await runGeneration({
      rootDir,
      runsRoot,
      runId: RUN_ID,
      input: fixtureInput,
      inputRef: null,
      mode: "publish",
      adapterMode: "mock",
      observer
    });

    expect(result).toMatchObject({
      run_id: RUN_ID,
      run_dir: path.join(runsRoot, RUN_ID),
      final_state: "published"
    });
    expect(result.artifacts).toContain("publish-version.json");
    expect(observedRecords).toHaveLength(2);
    expect(observedEventIds.length).toBeGreaterThan(0);
    expect(observedEventIds.every(Boolean)).toBe(true);

    const durableEventIds = (await readFile(path.join(runsRoot, RUN_ID, "events.ndjson"), "utf8"))
      .trim()
      .split("\n")
      .map((line) => (JSON.parse(line) as { event_id: string }).event_id);
    expect(observedEventIds).toEqual(durableEventIds);

    const finalRecord = JSON.parse(
      await readFile(path.join(runsRoot, RUN_ID, "run.json"), "utf8")
    ) as Record<string, unknown>;
    expect(finalRecord).toMatchObject({
      run_id: RUN_ID,
      input_ref: null,
      input_payload: fixtureInput,
      state: "published"
    });
  });
});
