import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { HarnessRunObserver } from "../../superpowers/runner/run-observer.ts";
import type {
  GenerationRunResult,
  RunGenerationOptions
} from "../../superpowers/runner/run-generation.ts";
import {
  runWebGeneration,
  type WebGenerationDatabase,
  type WebGenerationDependencies
} from "../../superpowers/runner/run-web-generation.ts";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const RUN_ID = "22222222-2222-4222-8222-222222222222";
const ROOT_DIR = "/repo/fusera";

const intake = {
  productName: "Fusera Studio",
  sellingPoints: ["统一生成链路", "保留运行证据"],
  productDetails: [{ label: "Runtime", value: "Node 24" }],
  targetAudience: "品牌团队",
  brandKeywords: ["可信", "高效"],
  cta: "开始生成",
  visualDirectionId: "premium-editorial",
  imageUrls: ["https://cdn.example.com/hero.png"],
  trustSignals: ["可审计运行记录"],
  proofSources: [{ claim: "统一入口", source: "Harness contract" }],
  referenceUrls: []
};

describe("runWebGeneration", () => {
  it("validates caller UUIDs before invoking runtime or database dependencies", async () => {
    const createDatabase = vi.fn();

    await expect(runWebGeneration({
      projectId: "not-a-uuid",
      runId: RUN_ID,
      rootDir: ROOT_DIR,
      dependencies: {
        ...createDependencies().dependencies,
        createDatabase
      }
    })).rejects.toThrow();

    expect(createDatabase).not.toHaveBeenCalled();
  });

  it("rejects invalid persisted project intake before starting the Harness", async () => {
    const context = createDependencies({ intake: { productName: "incomplete" } });

    await expect(runWebGeneration({
      projectId: PROJECT_ID,
      runId: RUN_ID,
      rootDir: ROOT_DIR,
      dependencies: context.dependencies
    })).rejects.toThrow();

    expect(context.runGeneration).not.toHaveBeenCalled();
    expect(context.database.updateRun).toHaveBeenLastCalledWith(
      RUN_ID,
      expect.objectContaining({ status: "failed" })
    );
  });

  it.each(["published", "needs_review"])(
    "runs the live Harness and accepts the %s product outcome",
    async (finalState) => {
      const context = createDependencies({ finalState });

      const result = await runWebGeneration({
        projectId: PROJECT_ID,
        runId: RUN_ID,
        rootDir: ROOT_DIR,
        dependencies: context.dependencies
      });

      expect(result.final_state).toBe(finalState);
      expect(context.checkLiveRunner).toHaveBeenCalledWith({
        rootDir: ROOT_DIR,
        strictGithubActions: true,
        authProbe: true
      });
      expect(context.database.loadProjectIntake).toHaveBeenCalledWith(PROJECT_ID);
      expect(context.database.updateRun).toHaveBeenCalledWith(
        RUN_ID,
        expect.objectContaining({
          backend: "codex",
          adapter_mode: "real",
          run_evidence_prefix: `projects/${PROJECT_ID}/runs/${RUN_ID}`
        })
      );
      expect(context.runGeneration).toHaveBeenCalledWith(expect.objectContaining({
        rootDir: ROOT_DIR,
        runsRoot: path.join(ROOT_DIR, ".fusera/runs"),
        runId: RUN_ID,
        inputRef: `supabase:projects/${PROJECT_ID}/intake`,
        input: expect.objectContaining({
          product_name: "Fusera Studio",
          audiences: ["品牌团队"],
          proof_inputs: ["可审计运行记录"]
        }),
        mode: "publish",
        adapterMode: "real",
        observer: context.observer
      }));
      expect(context.syncArtifacts).toHaveBeenCalledWith(expect.objectContaining({
        projectId: PROJECT_ID,
        runId: RUN_ID,
        runDir: path.join(ROOT_DIR, ".fusera/runs", RUN_ID),
        projection: context.database.artifactProjection
      }));
      expect(context.mirrorEvidence).toHaveBeenLastCalledWith({
        store: context.database.evidenceStore,
        projectId: PROJECT_ID,
        runId: RUN_ID,
        runDir: path.join(ROOT_DIR, ".fusera/runs", RUN_ID)
      });
    }
  );

  it("marks an unexpected terminal state failed without erasing observer diagnostics", async () => {
    const context = createDependencies({ finalState: "assembling" });

    await expect(runWebGeneration({
      projectId: PROJECT_ID,
      runId: RUN_ID,
      rootDir: ROOT_DIR,
      dependencies: context.dependencies
    })).rejects.toThrow("Unexpected Harness terminal state: assembling");

    expect(context.syncArtifacts).toHaveBeenCalledOnce();
    const failureUpdate = context.database.updateRun.mock.calls.at(-1)?.[1];
    expect(failureUpdate).toEqual(expect.objectContaining({ status: "failed" }));
    expect(failureUpdate).not.toHaveProperty("failure_mode");
    expect(failureUpdate).not.toHaveProperty("failure_message");
    expect(failureUpdate).not.toHaveProperty("failed_stage");
  });
});

function createDependencies(options: {
  intake?: unknown;
  finalState?: string;
} = {}) {
  const database: WebGenerationDatabase & {
    loadProjectIntake: ReturnType<typeof vi.fn>;
    updateRun: ReturnType<typeof vi.fn>;
  } = {
    loadProjectIntake: vi.fn(async () => options.intake ?? intake),
    updateRun: vi.fn(async () => undefined),
    runProjection: {
      async updateRun() {},
      async upsertEvent() {}
    },
    evidenceStore: {
      async upload() {},
      async upsertManifest() {}
    },
    artifactProjection: {
      async upsertArtifacts() {},
      async updateRun() {}
    }
  };
  const observer: HarnessRunObserver = {};
  const checkLiveRunner = vi.fn(async () => ({ ok: true }));
  const runGeneration = vi.fn(async (_runOptions: RunGenerationOptions): Promise<GenerationRunResult> => ({
    run_id: RUN_ID,
    run_dir: path.join(ROOT_DIR, ".fusera/runs", RUN_ID),
    final_state: options.finalState ?? "published",
    artifacts: []
  }));
  const syncArtifacts = vi.fn(async () => ({ artifacts: [], latestRefs: {}, runUpdate: {} }));
  const mirrorEvidence = vi.fn(async () => undefined);
  const dependencies: WebGenerationDependencies = {
    createDatabase: async () => database,
    checkLiveRunner,
    createObserver: () => observer,
    runGeneration,
    syncArtifacts,
    mirrorEvidence
  };

  return {
    database,
    observer,
    checkLiveRunner,
    runGeneration,
    syncArtifacts,
    mirrorEvidence,
    dependencies
  };
}
