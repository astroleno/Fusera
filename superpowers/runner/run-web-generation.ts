import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { createDbClient } from "../../src/lib/db.ts";
import { projectInputSchema } from "../../src/lib/domain/project-input.ts";
import { projectInputToHarness } from "../integrations/web/project-input-to-harness.ts";
import {
  createSupabaseEvidenceStore,
  mirrorRunEvidence,
  type EvidenceStore,
  type SupabaseEvidenceClient
} from "../integrations/supabase/mirror-run-evidence.ts";
import {
  createHarnessObserver,
  createSupabaseRunProjection,
  type RunProjection,
  type SupabaseRunProjectionClient
} from "../integrations/supabase/supabase-harness-observer.ts";
import {
  createSupabaseArtifactProjection,
  syncHarnessArtifacts,
  type ArtifactProjection,
  type SupabaseArtifactProjectionClient
} from "../integrations/supabase/sync-harness-artifacts.ts";
import { checkLiveRunner } from "./check-live-runner.ts";
import {
  runGeneration,
  type GenerationRunResult,
  type RunGenerationOptions
} from "./run-generation.ts";
import type { HarnessRunObserver } from "./run-observer.ts";

type SupabaseError = { message?: string };
type ProjectIntakeResult = {
  data: { intake: unknown } | null;
  error: SupabaseError | null;
};

type ProjectIntakeClient = {
  from(table: "projects"): {
    select(columns: "intake"): {
      eq(column: "id", value: string): {
        single(): PromiseLike<ProjectIntakeResult>;
      };
    };
  };
};

type PreflightResult = {
  ok: boolean;
  checks?: Array<{ name?: string; ok?: boolean; error?: string }>;
};

export type WebGenerationDatabase = {
  loadProjectIntake(projectId: string): Promise<unknown>;
  updateRun(runId: string, values: Record<string, unknown>): Promise<void>;
  runProjection: RunProjection;
  evidenceStore: EvidenceStore;
  artifactProjection: ArtifactProjection;
};

export type WebGenerationDependencies = {
  createDatabase(): Promise<WebGenerationDatabase>;
  checkLiveRunner(options: {
    rootDir: string;
    strictGithubActions: true;
    authProbe: true;
  }): Promise<PreflightResult>;
  createObserver(options: {
    projectId: string;
    runId: string;
    projection: RunProjection;
    evidenceStore: EvidenceStore;
  }): HarnessRunObserver;
  runGeneration(options: RunGenerationOptions): Promise<GenerationRunResult>;
  syncArtifacts: typeof syncHarnessArtifacts;
  mirrorEvidence: typeof mirrorRunEvidence;
};

export type RunWebGenerationOptions = {
  projectId: string;
  runId: string;
  rootDir?: string;
  dependencies?: Partial<WebGenerationDependencies>;
};

const uuidSchema = z.string().uuid();
const ACCEPTED_TERMINAL_STATES = new Set(["published", "needs_review"]);

const DEFAULT_DEPENDENCIES: WebGenerationDependencies = {
  createDatabase: createWebGenerationDatabase,
  checkLiveRunner,
  createObserver: createHarnessObserver,
  runGeneration,
  syncArtifacts: syncHarnessArtifacts,
  mirrorEvidence: mirrorRunEvidence
};

export async function runWebGeneration(
  options: RunWebGenerationOptions
): Promise<GenerationRunResult> {
  const projectId = uuidSchema.parse(options.projectId);
  const runId = uuidSchema.parse(options.runId);
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const dependencies: WebGenerationDependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...options.dependencies
  };
  const database = await dependencies.createDatabase();

  try {
    const preflight = await dependencies.checkLiveRunner({
      rootDir,
      strictGithubActions: true,
      authProbe: true
    });
    if (!preflight.ok) {
      throw new Error(preflightFailureMessage(preflight));
    }

    const intake = projectInputSchema.parse(
      await database.loadProjectIntake(projectId)
    );
    await database.updateRun(runId, {
      backend: "codex",
      adapter_mode: "real",
      run_evidence_prefix: `projects/${projectId}/runs/${runId}`,
      updated_at: new Date().toISOString()
    });

    const observer = dependencies.createObserver({
      projectId,
      runId,
      projection: database.runProjection,
      evidenceStore: database.evidenceStore
    });
    const result = await dependencies.runGeneration({
      rootDir,
      runsRoot: path.join(rootDir, ".fusera/runs"),
      runId,
      input: projectInputToHarness(intake),
      inputRef: `supabase:projects/${projectId}/intake`,
      mode: "publish",
      adapterMode: "real",
      observer
    });

    await dependencies.syncArtifacts({
      projectId,
      runId,
      runDir: result.run_dir,
      projection: database.artifactProjection
    });

    if (!ACCEPTED_TERMINAL_STATES.has(result.final_state)) {
      throw new Error(`Unexpected Harness terminal state: ${result.final_state}`);
    }

    await dependencies.mirrorEvidence({
      store: database.evidenceStore,
      projectId,
      runId,
      runDir: result.run_dir
    });

    return result;
  } catch (error) {
    try {
      await database.updateRun(runId, {
        status: "failed",
        updated_at: new Date().toISOString()
      });
    } catch (updateError) {
      throw new AggregateError(
        [error, updateError],
        "Web generation failed and the failed status could not be persisted"
      );
    }

    throw error;
  }
}

async function createWebGenerationDatabase(): Promise<WebGenerationDatabase> {
  const rawClient: unknown = await createDbClient();
  const projectClient = rawClient as ProjectIntakeClient;
  const runProjection = createSupabaseRunProjection(
    rawClient as SupabaseRunProjectionClient
  );

  return {
    async loadProjectIntake(projectId) {
      const result = await projectClient
        .from("projects")
        .select("intake")
        .eq("id", projectId)
        .single();

      if (result.error || !result.data) {
        throw new Error(
          `Supabase failed to load project ${projectId}: ${result.error?.message ?? "not found"}`
        );
      }

      return result.data.intake;
    },
    updateRun: runProjection.updateRun,
    runProjection,
    evidenceStore: createSupabaseEvidenceStore(
      rawClient as SupabaseEvidenceClient
    ),
    artifactProjection: createSupabaseArtifactProjection(
      rawClient as SupabaseArtifactProjectionClient
    )
  };
}

function preflightFailureMessage(report: PreflightResult): string {
  const failures = (report.checks ?? [])
    .filter((check) => check.ok === false)
    .map((check) => `${check.name ?? "unknown"}: ${check.error ?? "failed"}`);

  return failures.length > 0
    ? `Live runner preflight failed: ${failures.join("; ")}`
    : "Live runner preflight failed";
}

function parseCliArguments(args: string[]): { projectId: string; runId: string } {
  let projectId: string | undefined;
  let runId: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--project-id") {
      projectId = args[index + 1];
      index += 1;
    } else if (argument === "--run-id") {
      runId = args[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!projectId || !runId) {
    throw new Error(
      "Usage: npx tsx superpowers/runner/run-web-generation.ts --project-id <uuid> --run-id <uuid>"
    );
  }

  return { projectId, runId };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { projectId, runId } = parseCliArguments(process.argv.slice(2));
    const result = await runWebGeneration({ projectId, runId });
    console.log(JSON.stringify({
      run_id: result.run_id,
      final_state: result.final_state,
      run_dir: result.run_dir
    }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
