import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resumeFailedRun } from "./run-stage.ts";
import { verifyLiveCodexQuality, type LiveQualityReport } from "./verify-live-codex-quality.ts";

type LiveQualityMatrixCase = {
  id: string;
  fixture: string;
  target_stage?: string;
  expected_ok?: boolean;
  focus?: string[];
};

type LiveQualityMatrix = {
  cases: LiveQualityMatrixCase[];
};

type LiveQualityMatrixCaseResult = {
  id: string;
  fixture: string;
  input_path: string;
  target_stage: string;
  expected_ok: boolean;
  ok: boolean;
  outcome: "passed" | "failed" | "expected_failed" | "unexpected_pass";
  duration_ms: number;
  focus: string[];
  run_id?: string;
  run_dir?: string;
  final_state?: string;
  tool_use_policy?: LiveQualityReport["tool_use_policy"];
  tool_use_summary?: LiveQualityReport["tool_use_summary"];
  execution_provenance?: LiveQualityReport["execution_provenance"];
  artifact_scores?: LiveQualityReport["artifact_scores"];
  retry?: LiveQualityMatrixRetry;
  trend?: LiveQualityTrend;
  findings: LiveQualityReport["findings"];
  model_owned_stage_statuses?: LiveQualityReport["model_owned_stage_statuses"];
  error?: string;
};

type LiveQualityMatrixRetryPolicy = "off" | "retryable";

type LiveQualityMatrixRetry = {
  policy: LiveQualityMatrixRetryPolicy;
  attempted: boolean;
  retryable: boolean;
  recovered: boolean;
  reason?: string;
  initial_run_id?: string;
  initial_run_dir?: string;
  initial_final_state?: string;
  initial_failed_stage?: string;
  initial_failure_mode?: string;
  initial_timed_out?: boolean;
  initial_duration_ms?: number;
  retry_final_state?: string;
  retry_run_dir?: string;
  retry_attempt_count_before?: number;
  retry_attempt_count_after?: number;
};

type LiveQualityTrend = {
  ok: boolean;
  baseline_report_path?: string;
  baseline_run_dir?: string;
  baseline_duration_ms?: number;
  duration_delta_ms?: number;
  duration_ratio?: number;
  duration_regression: boolean;
  duration_regression_suppressed_by_retry?: boolean;
  duration_regression_threshold_ms: number;
  duration_regression_threshold_ratio: number;
  artifact_score_regressions: Array<{
    artifact_type: string;
    baseline_score: number;
    baseline_max_score: number;
    current_score: number;
    current_max_score: number;
    baseline_summary?: Record<string, unknown>;
    current_summary?: Record<string, unknown>;
  }>;
};

type LiveQualityMatrixReport = {
  ok: boolean;
  generated_at: string;
  root_dir: string;
  matrix_path: string;
  report_path: string;
  selected_case_ids: string[];
  target_stage_override?: string;
  tool_use_policy: string;
  retry_policy: LiveQualityMatrixRetryPolicy;
  execution_environment: {
    codex_model_env?: string;
    codex_timeout_ms_env?: string;
    codex_args_json_set: boolean;
    codex_command_env?: string;
    codex_workdir_env?: string;
    codex_reasoning_effort_env?: string;
    live_tool_use_policy_env?: string;
    live_matrix_retry_policy_env?: string;
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    expected_failed: number;
    unexpected_passes: number;
    unexpected_failures: number;
    trend_regressions: number;
    duration_regressions: number;
    artifact_score_regressions: number;
    retry_attempts: number;
    retry_recoveries: number;
    timed_out_stage_failures: number;
    duration_ms: number;
  };
  case_results: LiveQualityMatrixCaseResult[];
};

const ROOT_DIR = process.cwd();
const DEFAULT_MATRIX_PATH = "superpowers/runner/fixtures/live-quality/matrix.json";
const ARTIFACT_FILES: Record<string, string> = {
  ProductBrief: "product-brief.json",
  BrandProfile: "brand-profile.json",
  PagePlan: "page-plan.json",
  SectionGraph: "section-graph.json",
  ThemeTokens: "theme-tokens.json",
  DesignSpec: "design-spec.json"
};

export async function verifyLiveCodexMatrix(options: {
  rootDir?: string;
  matrixPath?: string;
  caseIds?: string[];
  targetStage?: string;
  retryPolicy?: LiveQualityMatrixRetryPolicy;
} = {}): Promise<LiveQualityMatrixReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const matrixPath = path.resolve(rootDir, options.matrixPath ?? process.env.FUSERA_LIVE_MATRIX_PATH ?? DEFAULT_MATRIX_PATH);
  const matrix = await readMatrix(matrixPath);
  const caseIds = options.caseIds ?? parseCaseFilter(process.env.FUSERA_LIVE_MATRIX_CASES);
  const selectedCases = selectCases(matrix.cases, caseIds);
  const targetStageOverride =
    options.targetStage ?? process.env.FUSERA_LIVE_MATRIX_TARGET_STAGE ?? process.env.FUSERA_LIVE_QUALITY_TARGET_STAGE;
  const retryPolicy = options.retryPolicy ?? retryPolicyFromEnv();
  const matrixStart = Date.now();
  const caseResults: LiveQualityMatrixCaseResult[] = [];

  for (const matrixCase of selectedCases) {
    const inputPath = path.resolve(path.dirname(matrixPath), matrixCase.fixture);
    const targetStage = targetStageOverride ?? matrixCase.target_stage ?? "design-system-pass";
    const expectedOk = matrixCase.expected_ok !== false;
    const caseStart = Date.now();

    try {
      let qualityReport = await verifyLiveCodexQuality({
        rootDir,
        inputPath,
        targetStage
      });
      const retry = await maybeRetryQualityRun({
        rootDir,
        inputPath,
        targetStage,
        retryPolicy,
        qualityReport
      });

      if (retry.qualityReport) {
        qualityReport = retry.qualityReport;
      }

      const durationMs = Date.now() - caseStart;

      caseResults.push({
        id: matrixCase.id,
        fixture: matrixCase.fixture,
        input_path: inputPath,
        target_stage: targetStage,
        expected_ok: expectedOk,
        ok: qualityReport.ok,
        outcome: outcomeFor(qualityReport.ok, expectedOk),
        duration_ms: durationMs,
        focus: matrixCase.focus ?? [],
        run_id: qualityReport.run_id,
        run_dir: qualityReport.run_dir,
        final_state: qualityReport.final_state,
        tool_use_policy: qualityReport.tool_use_policy,
        tool_use_summary: qualityReport.tool_use_summary,
        execution_provenance: qualityReport.execution_provenance,
        artifact_scores: qualityReport.artifact_scores,
        retry: retry.summary,
        findings: qualityReport.findings,
        model_owned_stage_statuses: qualityReport.model_owned_stage_statuses
      });
    } catch (error) {
      const durationMs = Date.now() - caseStart;

      caseResults.push({
        id: matrixCase.id,
        fixture: matrixCase.fixture,
        input_path: inputPath,
        target_stage: targetStage,
        expected_ok: expectedOk,
        ok: false,
        outcome: expectedOk ? "failed" : "expected_failed",
        duration_ms: durationMs,
        focus: matrixCase.focus ?? [],
        findings: [
          {
            severity: "fail",
            criterion: "matrix-case-exception",
            summary: (error as Error).message
          }
        ],
        error: (error as Error).stack ?? (error as Error).message
      });
    }
  }

  await attachTrendChecks(rootDir, caseResults);
  const summary = summarize(caseResults, Date.now() - matrixStart);
  const reportPath = await matrixReportPath(rootDir);
  const report: LiveQualityMatrixReport = {
    ok: summary.unexpected_failures === 0 && summary.unexpected_passes === 0 && summary.trend_regressions === 0,
    generated_at: new Date().toISOString(),
    root_dir: rootDir,
    matrix_path: matrixPath,
    report_path: reportPath,
    selected_case_ids: selectedCases.map((matrixCase) => matrixCase.id),
    target_stage_override: targetStageOverride,
    tool_use_policy: process.env.FUSERA_LIVE_TOOL_USE_POLICY ?? "fail",
    retry_policy: retryPolicy,
    execution_environment: executionEnvironment(),
    summary,
    case_results: caseResults
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

async function readMatrix(matrixPath: string): Promise<LiveQualityMatrix> {
  const matrix = JSON.parse(await readFile(matrixPath, "utf8")) as LiveQualityMatrix;

  if (!Array.isArray(matrix.cases) || matrix.cases.length === 0) {
    throw new Error(`Live quality matrix has no cases: ${matrixPath}`);
  }

  for (const matrixCase of matrix.cases) {
    if (!matrixCase.id || !matrixCase.fixture) {
      throw new Error(`Live quality matrix case must include id and fixture: ${JSON.stringify(matrixCase)}`);
    }
  }

  return matrix;
}

function selectCases(cases: LiveQualityMatrixCase[], caseIds?: string[]): LiveQualityMatrixCase[] {
  if (!caseIds || caseIds.length === 0) {
    return cases;
  }

  const byId = new Map(cases.map((matrixCase) => [matrixCase.id, matrixCase]));
  const selected = caseIds.map((caseId) => byId.get(caseId));
  const missing = caseIds.filter((caseId, index) => !selected[index]);

  if (missing.length > 0) {
    throw new Error(`Unknown live quality matrix case id(s): ${missing.join(", ")}`);
  }

  return selected.filter((matrixCase): matrixCase is LiveQualityMatrixCase => Boolean(matrixCase));
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

function outcomeFor(ok: boolean, expectedOk: boolean): LiveQualityMatrixCaseResult["outcome"] {
  if (ok && expectedOk) {
    return "passed";
  }

  if (!ok && expectedOk) {
    return "failed";
  }

  if (!ok && !expectedOk) {
    return "expected_failed";
  }

  return "unexpected_pass";
}

function summarize(
  caseResults: LiveQualityMatrixCaseResult[],
  durationMs: number
): LiveQualityMatrixReport["summary"] {
  const passed = caseResults.filter((result) => result.outcome === "passed").length;
  const failed = caseResults.filter((result) => result.outcome === "failed").length;
  const expectedFailed = caseResults.filter((result) => result.outcome === "expected_failed").length;
  const unexpectedPasses = caseResults.filter((result) => result.outcome === "unexpected_pass").length;
  const trendRegressions = caseResults.filter((result) => result.trend?.ok === false).length;
  const durationRegressions = caseResults.filter((result) => result.trend?.duration_regression === true).length;
  const artifactScoreRegressions = caseResults.reduce(
    (count, result) => count + (result.trend?.artifact_score_regressions.length ?? 0),
    0
  );
  const retryAttempts = caseResults.filter((result) => result.retry?.attempted === true).length;
  const retryRecoveries = caseResults.filter((result) => result.retry?.recovered === true).length;
  const timedOutStageFailures = caseResults.filter((result) =>
    result.retry?.initial_timed_out === true ||
    (result.model_owned_stage_statuses ?? []).some(
      (stage) => stage.adapter_status !== "ok" && stage.timed_out === true
    )
  ).length;

  return {
    total: caseResults.length,
    passed,
    failed,
    expected_failed: expectedFailed,
    unexpected_passes: unexpectedPasses,
    unexpected_failures: failed,
    trend_regressions: trendRegressions,
    duration_regressions: durationRegressions,
    artifact_score_regressions: artifactScoreRegressions,
    retry_attempts: retryAttempts,
    retry_recoveries: retryRecoveries,
    timed_out_stage_failures: timedOutStageFailures,
    duration_ms: durationMs
  };
}

async function maybeRetryQualityRun(options: {
  rootDir: string;
  inputPath: string;
  targetStage: string;
  retryPolicy: LiveQualityMatrixRetryPolicy;
  qualityReport: LiveQualityReport;
}): Promise<{
  summary: LiveQualityMatrixRetry;
  qualityReport?: LiveQualityReport;
}> {
  const retryableFailure = retryableFailureFrom(options.qualityReport);
  const baseSummary: LiveQualityMatrixRetry = {
    policy: options.retryPolicy,
    attempted: false,
    retryable: Boolean(retryableFailure),
    recovered: false,
    reason: retryableFailure ? "retryable model-owned stage failure" : "no retryable model-owned failure",
    initial_run_id: options.qualityReport.run_id,
    initial_run_dir: options.qualityReport.run_dir,
    initial_final_state: options.qualityReport.final_state,
    initial_failed_stage: retryableFailure?.stage,
    initial_failure_mode: retryableFailure?.failure_mode,
    initial_timed_out: retryableFailure?.timed_out,
    initial_duration_ms: retryableFailure?.duration_ms
  };

  if (options.retryPolicy === "off" || !retryableFailure) {
    return { summary: baseSummary };
  }

  const retryAttemptCountBefore = await countAttempts(options.qualityReport.run_dir, retryableFailure.stage);
  await withEnv({ FUSERA_CODEX_ADAPTER: "real" }, () =>
    resumeFailedRun({
      rootDir: options.rootDir,
      runDir: options.qualityReport.run_dir
    })
  );
  const retriedReport = await verifyLiveCodexQuality({
    rootDir: options.rootDir,
    inputPath: options.inputPath,
    targetStage: options.targetStage,
    runDir: options.qualityReport.run_dir
  });
  const retryAttemptCountAfter = await countAttempts(options.qualityReport.run_dir, retryableFailure.stage);

  return {
    summary: {
      ...baseSummary,
      attempted: true,
      recovered: retriedReport.ok,
      reason: retriedReport.ok ? "retry recovered live quality run" : "retry completed but live quality still failed",
      retry_final_state: retriedReport.final_state,
      retry_run_dir: retriedReport.run_dir,
      retry_attempt_count_before: retryAttemptCountBefore,
      retry_attempt_count_after: retryAttemptCountAfter
    },
    qualityReport: retriedReport
  };
}

function retryableFailureFrom(report: LiveQualityReport): LiveQualityReport["model_owned_stage_statuses"][number] | null {
  if (report.ok) {
    return null;
  }

  return report.model_owned_stage_statuses.find(
    (stage) =>
      stage.adapter_status !== "ok" &&
      ["invocation_failure", "extraction_failure", "validation_failure", "missing_output"].includes(stage.failure_mode ?? "")
  ) ?? null;
}

async function countAttempts(runDir: string, stage: string): Promise<number> {
  try {
    return (await readdir(path.join(runDir, "stages", stage, "attempts"))).length;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return 0;
    }

    throw error;
  }
}

async function attachTrendChecks(rootDir: string, caseResults: LiveQualityMatrixCaseResult[]): Promise<void> {
  const priorReports = await readPriorMatrixReports(rootDir);

  for (const caseResult of caseResults) {
    const baseline = findBaselineCaseResult(priorReports, caseResult);
    caseResult.trend = await trendFor(caseResult, baseline);
  }
}

async function readPriorMatrixReports(rootDir: string): Promise<Array<Record<string, any>>> {
  const evidenceDir = path.join(rootDir, ".fusera/runs");

  try {
    const fileNames = await readdir(evidenceDir);
    const reportNames = fileNames
      .filter((fileName) => /^live-quality-matrix_.*\.json$/.test(fileName))
      .sort()
      .reverse();
    const reports: Array<Record<string, any>> = [];

    for (const reportName of reportNames) {
      const reportPath = path.join(evidenceDir, reportName);

      try {
        reports.push({
          ...JSON.parse(await readFile(reportPath, "utf8")),
          report_path: reportPath
        });
      } catch {
        // Ignore malformed runtime evidence; the current run should still report its own result.
      }
    }

    return reports;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function findBaselineCaseResult(
  reports: Array<Record<string, any>>,
  current: LiveQualityMatrixCaseResult
): Record<string, any> | null {
  for (const report of reports) {
    const caseResults = Array.isArray(report.case_results) ? report.case_results : [];
    const match = caseResults.find(
      (caseResult: Record<string, any>) =>
        caseResult.id === current.id &&
        caseResult.target_stage === current.target_stage &&
        caseResult.ok === true &&
        caseResult.trend?.ok !== false &&
        caseResult.artifact_scores &&
        typeof caseResult.duration_ms === "number"
    );

    if (match) {
      return {
        ...match,
        baseline_report_path: report.report_path
      };
    }
  }

  return null;
}

async function trendFor(current: LiveQualityMatrixCaseResult, baseline: Record<string, any> | null): Promise<LiveQualityTrend> {
  const durationThresholdMs = numberFromEnv("FUSERA_LIVE_TREND_DURATION_REGRESSION_MS", 120000);
  const durationThresholdRatio = numberFromEnv("FUSERA_LIVE_TREND_DURATION_REGRESSION_RATIO", 0.5);

  if (!baseline) {
    return {
      ok: true,
      duration_regression: false,
      duration_regression_threshold_ms: durationThresholdMs,
      duration_regression_threshold_ratio: durationThresholdRatio,
      artifact_score_regressions: []
    };
  }

  const baselineDuration = typeof baseline.duration_ms === "number" ? baseline.duration_ms : undefined;
  const durationDelta = baselineDuration === undefined ? undefined : current.duration_ms - baselineDuration;
  const durationRatio = baselineDuration && baselineDuration > 0 ? current.duration_ms / baselineDuration : undefined;
  const durationRegressionRaw =
    durationDelta !== undefined &&
    durationRatio !== undefined &&
    durationDelta > durationThresholdMs &&
    durationRatio > 1 + durationThresholdRatio;
  const durationRegressionSuppressedByRetry = durationRegressionRaw && current.retry?.recovered === true;
  const durationRegression = durationRegressionRaw && !durationRegressionSuppressedByRetry;
  const artifactScoreRegressions = await artifactScoreRegressionsFor(current, baseline);

  return {
    ok: !durationRegression && artifactScoreRegressions.length === 0,
    baseline_report_path: baseline.baseline_report_path,
    baseline_run_dir: typeof baseline.run_dir === "string" ? baseline.run_dir : undefined,
    baseline_duration_ms: baselineDuration,
    duration_delta_ms: durationDelta,
    duration_ratio: durationRatio,
    duration_regression: durationRegression,
    duration_regression_suppressed_by_retry: durationRegressionSuppressedByRetry || undefined,
    duration_regression_threshold_ms: durationThresholdMs,
    duration_regression_threshold_ratio: durationThresholdRatio,
    artifact_score_regressions: artifactScoreRegressions
  };
}

async function artifactScoreRegressionsFor(
  current: LiveQualityMatrixCaseResult,
  baseline: Record<string, any>
): Promise<LiveQualityTrend["artifact_score_regressions"]> {
  const currentScores = current.artifact_scores;
  const baselineScores = baseline.artifact_scores as LiveQualityReport["artifact_scores"] | undefined;

  if (!currentScores || !baselineScores) {
    return [];
  }

  const regressions = Object.entries(baselineScores)
    .filter(([artifactType]) => currentScores[artifactType])
    .filter(([, baselineScore]) => typeof baselineScore?.score === "number" && typeof baselineScore?.max_score === "number")
    .map(([artifactType, baselineScore]) => ({
      artifact_type: artifactType,
      baseline_score: baselineScore.score,
      baseline_max_score: baselineScore.max_score,
      current_score: currentScores[artifactType].score,
      current_max_score: currentScores[artifactType].max_score
    }))
    .filter((score) => score.current_score / score.current_max_score < score.baseline_score / score.baseline_max_score);

  return Promise.all(regressions.map(async (regression) => ({
    ...regression,
    baseline_summary: await artifactSummary(baseline.run_dir, regression.artifact_type),
    current_summary: await artifactSummary(current.run_dir, regression.artifact_type)
  })));
}

async function artifactSummary(runDir: unknown, artifactType: string): Promise<Record<string, unknown> | undefined> {
  if (typeof runDir !== "string") {
    return undefined;
  }

  const fileName = ARTIFACT_FILES[artifactType];

  if (!fileName) {
    return undefined;
  }

  try {
    const artifact = JSON.parse(await readFile(path.join(runDir, "artifacts", fileName), "utf8"));
    const payload = artifact.payload ?? {};

    if (artifactType === "ProductBrief") {
      return pickSummary(payload, ["product_name", "cta_goal", "claim_policy", "proof_inputs"]);
    }

    if (artifactType === "BrandProfile") {
      return pickSummary(payload, ["brand_traits", "tone_keywords", "visual_directions", "positioning"]);
    }

    if (artifactType === "PagePlan") {
      return pickSummary(payload, ["page_goal", "cta_strategy", "proof_strategy", "section_intents"]);
    }

    if (artifactType === "SectionGraph") {
      return pickSummary(payload, ["section_order", "proof_bindings"]);
    }

    if (artifactType === "ThemeTokens") {
      return pickSummary(payload, ["colors", "typography", "radii"]);
    }

    if (artifactType === "DesignSpec") {
      return pickSummary(payload, [
        "visual_thesis",
        "token_directives",
        "section_design_intents",
        "claim_and_proof_constraints",
        "anti_patterns"
      ]);
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function pickSummary(payload: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(
    keys
      .filter((key) => payload[key] !== undefined)
      .map((key) => [key, payload[key]])
  );
}

function numberFromEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function retryPolicyFromEnv(): LiveQualityMatrixRetryPolicy {
  const value = process.env.FUSERA_LIVE_MATRIX_RETRY_POLICY ?? "off";

  if (value === "off" || value === "retryable") {
    return value;
  }

  throw new Error(`Unsupported FUSERA_LIVE_MATRIX_RETRY_POLICY: ${value}`);
}

function executionEnvironment(): LiveQualityMatrixReport["execution_environment"] {
  return {
    codex_model_env: process.env.FUSERA_CODEX_MODEL,
    codex_timeout_ms_env: process.env.FUSERA_CODEX_TIMEOUT_MS,
    codex_args_json_set: Boolean(process.env.FUSERA_CODEX_ARGS_JSON),
    codex_command_env: process.env.FUSERA_CODEX_COMMAND,
    codex_workdir_env: process.env.FUSERA_CODEX_WORKDIR,
    codex_reasoning_effort_env: process.env.FUSERA_CODEX_REASONING_EFFORT,
    live_tool_use_policy_env: process.env.FUSERA_LIVE_TOOL_USE_POLICY,
    live_matrix_retry_policy_env: process.env.FUSERA_LIVE_MATRIX_RETRY_POLICY
  };
}

async function withEnv<T>(env: Record<string, string>, callback: () => Promise<T>): Promise<T> {
  const prior = new Map<string, string | undefined>();

  for (const key of Object.keys(env)) {
    prior.set(key, process.env[key]);
  }

  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }

  try {
    return await callback();
  } finally {
    for (const [key, value] of prior.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function matrixReportPath(rootDir: string): Promise<string> {
  const evidenceDir = path.join(rootDir, ".fusera/runs");
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const reportPath = path.join(evidenceDir, `live-quality-matrix_${timestamp}_${Math.random().toString(36).slice(2, 8)}.json`);

  await mkdir(evidenceDir, { recursive: true });
  return reportPath;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const caseIds = parseCaseFilter(args[0]);
  const targetStage = args[1];
  const report = await verifyLiveCodexMatrix({
    caseIds,
    targetStage
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
