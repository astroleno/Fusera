import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { verifyLiveCodexBaseline } from "./verify-live-codex-baseline.ts";

type IsolationCheck = {
  ok: boolean;
  workdir: string;
  workdir_inside_repo: boolean;
  all_stage_workdirs_isolated: boolean;
  all_stages_bundle_only: boolean;
  tool_use_observed: boolean;
  workdir_entry_count: number;
  workdir_entries: string[];
};

type WorkdirRetentionPolicy = "delete-empty" | "delete-on-success" | "delete" | "keep";

type WorkdirCleanup = {
  ok: boolean;
  policy: WorkdirRetentionPolicy;
  deleted: boolean;
  error?: string;
};

type IsolatedBaselineReport = {
  ok: boolean;
  generated_at: string;
  root_dir: string;
  report_path: string;
  matrix_report_path?: string;
  workdir: string;
  isolation: IsolationCheck;
  workdir_cleanup: WorkdirCleanup;
  matrix_report: Record<string, any>;
};

const ROOT_DIR = process.cwd();
const LATEST_INDEX_PATH = ".fusera/runs/live-quality-isolated-baseline-latest.json";

export async function verifyLiveCodexIsolatedBaseline(options: {
  rootDir?: string;
  caseIds?: string[];
  targetStage?: string;
  workDir?: string;
  workdirRetention?: WorkdirRetentionPolicy;
} = {}): Promise<IsolatedBaselineReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const workDir = options.workDir ?? (await mkdtemp(path.join(os.tmpdir(), "fusera-live-codex-workdir-")));
  const matrixReport = await verifyLiveCodexBaseline({
    rootDir,
    caseIds: options.caseIds,
    targetStage: options.targetStage,
    codexWorkDir: workDir,
    latestIndexPath: LATEST_INDEX_PATH
  }) as Record<string, any>;
  const isolation = await isolationCheck(rootDir, workDir, matrixReport);
  const shouldBeOk = Boolean(matrixReport.ok) && isolation.ok;
  const workdirCleanup = await cleanupWorkdir({
    workDir,
    policy: options.workdirRetention ?? workdirRetentionPolicyFromEnv(),
    runOk: shouldBeOk,
    workdirEmpty: isolation.workdir_entry_count === 0
  });
  const reportPath = await isolatedReportPath(rootDir);
  const report: IsolatedBaselineReport = {
    ok: shouldBeOk && workdirCleanup.ok,
    generated_at: new Date().toISOString(),
    root_dir: rootDir,
    report_path: reportPath,
    matrix_report_path: typeof matrixReport.report_path === "string" ? matrixReport.report_path : undefined,
    workdir: workDir,
    isolation,
    workdir_cleanup: workdirCleanup,
    matrix_report: matrixReport
  };

  await writeJson(reportPath, report);
  await writeJson(path.resolve(rootDir, LATEST_INDEX_PATH), compactIndex(report));

  return report;
}

async function cleanupWorkdir(options: {
  workDir: string;
  policy: WorkdirRetentionPolicy;
  runOk: boolean;
  workdirEmpty: boolean;
}): Promise<WorkdirCleanup> {
  const shouldDelete =
    options.policy === "delete" ||
    (options.policy === "delete-empty" && options.workdirEmpty) ||
    (options.policy === "delete-on-success" && options.runOk);

  if (!shouldDelete) {
    return {
      ok: true,
      policy: options.policy,
      deleted: false
    };
  }

  try {
    await rm(options.workDir, { recursive: true, force: true });

    return {
      ok: true,
      policy: options.policy,
      deleted: true
    };
  } catch (error) {
    return {
      ok: false,
      policy: options.policy,
      deleted: false,
      error: (error as Error).message
    };
  }
}

async function isolationCheck(
  rootDir: string,
  workDir: string,
  matrixReport: Record<string, any>
): Promise<IsolationCheck> {
  const stageWorkdirs = stageUsageValues(matrixReport, "workdir");
  const stagePolicies = stageUsageValues(matrixReport, "workspace_inspection_policy");
  const workdirEntries = await readRecursiveEntries(workDir);
  const workdirInsideRepo = isInside(rootDir, workDir);
  const allStageWorkdirsIsolated =
    stageWorkdirs.length > 0 &&
    stageWorkdirs.every((stageWorkdir) => path.resolve(String(stageWorkdir)) === path.resolve(workDir));
  const allStagesBundleOnly =
    stagePolicies.length > 0 &&
    stagePolicies.every((policy) => policy === "bundle-only");
  const toolUseObserved = (Array.isArray(matrixReport.case_results) ? matrixReport.case_results : [])
    .some((caseResult: Record<string, any>) => caseResult.tool_use_summary?.observed === true);

  return {
    ok:
      !workdirInsideRepo &&
      allStageWorkdirsIsolated &&
      allStagesBundleOnly &&
      !toolUseObserved &&
      workdirEntries.length === 0,
    workdir: workDir,
    workdir_inside_repo: workdirInsideRepo,
    all_stage_workdirs_isolated: allStageWorkdirsIsolated,
    all_stages_bundle_only: allStagesBundleOnly,
    tool_use_observed: toolUseObserved,
    workdir_entry_count: workdirEntries.length,
    workdir_entries: workdirEntries.slice(0, 50)
  };
}

function stageUsageValues(matrixReport: Record<string, any>, field: string): unknown[] {
  const values: unknown[] = [];
  const caseResults = Array.isArray(matrixReport.case_results) ? matrixReport.case_results : [];

  for (const caseResult of caseResults) {
    const stages = Array.isArray(caseResult.execution_provenance?.stages)
      ? caseResult.execution_provenance.stages
      : [];

    for (const stage of stages) {
      const value = stage?.[field];

      if (value !== undefined && value !== null) {
        values.push(value);
      }
    }
  }

  return values;
}

async function readRecursiveEntries(workDir: string): Promise<string[]> {
  try {
    return (await readdir(workDir, { recursive: true }))
      .map((entry) => String(entry))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function compactIndex(report: IsolatedBaselineReport): Record<string, unknown> {
  return {
    generated_at: report.generated_at,
    report_path: report.report_path,
    ok: report.ok,
    matrix_report_path: report.matrix_report_path,
    workdir: report.workdir,
    isolation: report.isolation,
    workdir_cleanup: report.workdir_cleanup,
    matrix_summary: report.matrix_report.summary,
    selected_case_ids: report.matrix_report.selected_case_ids,
    target_stage_override: report.matrix_report.target_stage_override,
    execution_environment: report.matrix_report.execution_environment
  };
}

function workdirRetentionPolicyFromEnv(): WorkdirRetentionPolicy {
  const policy = process.env.FUSERA_LIVE_ISOLATED_WORKDIR_RETENTION ?? "delete-empty";

  if (policy === "delete-empty" || policy === "delete-on-success" || policy === "delete" || policy === "keep") {
    return policy;
  }

  throw new Error(`Unsupported FUSERA_LIVE_ISOLATED_WORKDIR_RETENTION: ${policy}`);
}

async function isolatedReportPath(rootDir: string): Promise<string> {
  const evidenceDir = path.join(rootDir, ".fusera/runs");
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const reportPath = path.join(
    evidenceDir,
    `live-quality-isolated-baseline_${timestamp}_${Math.random().toString(36).slice(2, 8)}.json`
  );

  await mkdir(evidenceDir, { recursive: true });
  return reportPath;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function isInside(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function parseCaseFilter(value: string | undefined): string[] | undefined {
  if (!value || value.trim().length === 0 || value.trim() === "all") {
    return undefined;
  }

  return value
    .split(",")
    .map((caseId) => caseId.trim())
    .filter(Boolean);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const caseIds = parseCaseFilter(args[0]);
  const targetStage = args[1];
  const report = await verifyLiveCodexIsolatedBaseline({
    caseIds,
    targetStage
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
