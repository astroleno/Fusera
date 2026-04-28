import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { verifyLiveCodexMatrix } from "./verify-live-codex-matrix.ts";

const BASELINE_ENV: Record<string, string> = {
  FUSERA_CODEX_COMMAND: "codex",
  FUSERA_CODEX_MODEL: "gpt-5.4",
  FUSERA_CODEX_REASONING_EFFORT: "xhigh",
  FUSERA_CODEX_TIMEOUT_MS: "300000",
  FUSERA_LIVE_TOOL_USE_POLICY: "fail",
  FUSERA_LIVE_MATRIX_RETRY_POLICY: "retryable"
};

const BASELINE_CLEARED_ENV = [
  "FUSERA_CODEX_ARGS_JSON",
  "FUSERA_CODEX_ALLOW_WORKSPACE_INSPECTION",
  "FUSERA_CODEX_WORKDIR",
  "FUSERA_LIVE_MATRIX_PATH",
  "FUSERA_LIVE_MATRIX_CASES",
  "FUSERA_LIVE_MATRIX_TARGET_STAGE",
  "FUSERA_LIVE_QUALITY_TARGET_STAGE"
];

export async function verifyLiveCodexBaseline(options: {
  rootDir?: string;
  caseIds?: string[];
  targetStage?: string;
  codexWorkDir?: string;
  latestIndexPath?: string;
} = {}) {
  const restoreEnv = applyBaselineEnv(options);

  try {
    const report = await verifyLiveCodexMatrix(options);
    await writeLatestBaselineIndex(report, options.latestIndexPath);
    return report;
  } finally {
    restoreEnv();
  }
}

function applyBaselineEnv(options: {
  codexWorkDir?: string;
} = {}): () => void {
  const prior = new Map<string, string | undefined>();
  const touchedKeys = new Set([
    ...Object.keys(BASELINE_ENV),
    ...BASELINE_CLEARED_ENV,
    "FUSERA_CODEX_WORKDIR"
  ]);

  for (const key of touchedKeys) {
    prior.set(key, process.env[key]);
  }

  for (const [key, value] of Object.entries(BASELINE_ENV)) {
    process.env[key] = value;
  }

  for (const key of BASELINE_CLEARED_ENV) {
    delete process.env[key];
  }

  if (options.codexWorkDir) {
    process.env.FUSERA_CODEX_WORKDIR = options.codexWorkDir;
  }

  return () => {
    for (const [key, value] of prior.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
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

async function writeLatestBaselineIndex(report: Record<string, any>, indexPathOverride?: string): Promise<void> {
  const rootDir = typeof report.root_dir === "string" ? report.root_dir : process.cwd();
  const indexPath = indexPathOverride
    ? path.resolve(rootDir, indexPathOverride)
    : path.join(rootDir, ".fusera/runs/live-quality-baseline-latest.json");
  const caseResults = Array.isArray(report.case_results) ? report.case_results : [];
  const index = {
    generated_at: new Date().toISOString(),
    report_path: report.report_path,
    ok: report.ok,
    matrix_path: report.matrix_path,
    selected_case_ids: report.selected_case_ids,
    target_stage_override: report.target_stage_override,
    tool_use_policy: report.tool_use_policy,
    execution_environment: report.execution_environment,
    summary: report.summary,
    case_results: caseResults.map((caseResult: Record<string, any>) => ({
      id: caseResult.id,
      target_stage: caseResult.target_stage,
      ok: caseResult.ok,
      outcome: caseResult.outcome,
      duration_ms: caseResult.duration_ms,
      run_dir: caseResult.run_dir,
      tool_use_summary: caseResult.tool_use_summary,
      retry: caseResult.retry,
      trend: caseResult.trend,
      findings: caseResult.findings
    }))
  };

  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const caseIds = parseCaseFilter(args[0]);
  const targetStage = args[1];
  const report = await verifyLiveCodexBaseline({
    caseIds,
    targetStage
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
