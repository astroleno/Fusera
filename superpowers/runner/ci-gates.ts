import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { CodexAdapterMode } from "../adapters/codex/adapter.ts";
import { runFixture } from "./run-stage.ts";
import { verifyLiveCodexIsolatedBaseline } from "./verify-live-codex-isolated-baseline.ts";
import { verifyLiveCodexQuality, type LiveQualityReport } from "./verify-live-codex-quality.ts";
import { verifyLivePreviewPublish } from "./verify-live-preview-publish.ts";

type GateResult = {
  ok: boolean;
  command: string;
  generated_at: string;
  report_path?: string;
};

export type CiMockReport = GateResult & {
  command: "ci mock";
  gate: "required";
  summary: Record<string, unknown>;
};

export type CiLiveReport = GateResult & {
  command: "ci live";
  gate: "optional-live";
  stability_report: LiveStabilityReport;
};

export type CiIsolatedLiveReport = GateResult & {
  command: "ci isolated-live";
  gate: "optional-live";
  isolated_baseline_report: Record<string, unknown>;
};

export type LiveStabilityRunResult = {
  index: number;
  ok: boolean;
  run_id?: string;
  run_dir?: string;
  final_state?: string;
  run_failure_mode?: string;
  duration_ms: number;
  preview_ok: boolean;
  quality_ok: boolean;
  tool_use_observed: boolean;
  tool_use_stages: string[];
  retry_attempts: number;
  model_owned_attempts: number;
  model_owned_duration_ms: number;
  stage_durations_ms: Record<string, number>;
  stage_attempt_counts: Record<string, number>;
  timed_out_attempts: number;
  configured_models: string[];
  configured_reasoning_efforts: string[];
  timeout_ms_values: number[];
  failure_modes: Record<string, number>;
  stderr_excerpt_count: number;
  artifact_scores?: LiveQualityReport["artifact_scores"];
  findings: LiveQualityReport["findings"];
  run_error?: string;
  preview_error?: string;
  quality_error?: string;
  error?: string;
};

export type LiveStabilityReport = GateResult & {
  command: "live-stability";
  adapter_mode: CodexAdapterMode;
  iterations: number;
  input_ref?: string;
  canonical_live_defaults?: Record<string, string>;
  summary: {
    total: number;
    ok: number;
    failed: number;
    success_rate: number;
    published: number;
    preview_ok: number;
    quality_ok: number;
    tool_use_observed: number;
    retry_attempts: number;
    duration_ms_total: number;
    duration_ms_avg: number;
    duration_ms_min: number;
    duration_ms_max: number;
    duration_ms_p95: number;
    model_owned_duration_ms_avg: number;
    model_owned_duration_ms_min: number;
    model_owned_duration_ms_max: number;
    model_owned_duration_ms_p95: number;
    model_owned_stage_duration_ms: Record<string, DurationStats>;
    failure_modes: Record<string, number>;
    failure_triage: FailureTriageSummary;
    accounting: LiveAccountingSummary;
    artifact_score_drift: Record<string, {
      min_score: number;
      max_score: number;
      max_score_possible: number;
      delta: number;
    }>;
  };
  run_results: LiveStabilityRunResult[];
  markdown_report_path?: string;
};

type DurationStats = {
  min: number;
  max: number;
  avg: number;
  p95: number;
};

type FailureTriageSummary = {
  categories: Record<string, number>;
  failed_runs: Array<{
    index: number;
    run_id?: string;
    run_dir?: string;
    final_state?: string;
    categories: string[];
    run_failure_mode?: string;
    failure_modes: Record<string, number>;
    preview_error?: string;
    quality_error?: string;
    run_error?: string;
    findings: LiveQualityReport["findings"];
  }>;
};

type LiveAccountingSummary = {
  cost_available: false;
  cost_unavailable_reason: string;
  model_owned_attempts: number;
  timed_out_attempts: number;
  stderr_excerpt_count: number;
  configured_models: string[];
  configured_reasoning_efforts: string[];
  timeout_ms_values: number[];
};

const ROOT_DIR = process.cwd();
const MODEL_OWNED_STAGES = [
  "normalize-input",
  "product-and-brand-brief",
  "page-strategy",
  "section-planning",
  "design-system-pass",
  "design-spec-pass"
];
const CANONICAL_LIVE_ENV: Record<string, string> = {
  FUSERA_CODEX_MODEL: "gpt-5.2",
  FUSERA_CODEX_REASONING_EFFORT: "medium",
  FUSERA_CODEX_TIMEOUT_MS: "240000"
};

export async function runCiMock(options: {
  rootDir?: string;
} = {}): Promise<CiMockReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const startedAt = Date.now();
  const { verifyP0Harness } = await import("./verify-p0-harness.ts");
  const summary = await withEnv({ FUSERA_CODEX_ADAPTER: "mock" }, () => verifyP0Harness());
  const report: CiMockReport = {
    ok: summary.ok,
    command: "ci mock",
    gate: "required",
    generated_at: new Date().toISOString(),
    summary
  };
  const reportPath = await writeRuntimeReport(rootDir, "ci-mock", {
    ...report,
    duration_ms: Date.now() - startedAt
  });

  return {
    ...report,
    report_path: reportPath
  };
}

export async function runCiLive(options: {
  rootDir?: string;
  inputPath?: string;
  adapterMode?: CodexAdapterMode;
} = {}): Promise<CiLiveReport> {
  const stabilityReport = await runLiveStability({
    rootDir: options.rootDir,
    inputPath: options.inputPath,
    adapterMode: options.adapterMode ?? "real",
    iterations: 1
  });
  const report: CiLiveReport = {
    ok: stabilityReport.ok,
    command: "ci live",
    gate: "optional-live",
    generated_at: new Date().toISOString(),
    report_path: stabilityReport.report_path,
    stability_report: stabilityReport
  };

  return report;
}

export async function runCiIsolatedLive(options: {
  rootDir?: string;
  caseIds?: string[];
  targetStage?: string;
} = {}): Promise<CiIsolatedLiveReport> {
  const isolatedBaselineReport = await verifyLiveCodexIsolatedBaseline({
    rootDir: options.rootDir,
    caseIds: options.caseIds,
    targetStage: options.targetStage
  }) as Record<string, unknown>;
  const report: CiIsolatedLiveReport = {
    ok: Boolean(isolatedBaselineReport.ok),
    command: "ci isolated-live",
    gate: "optional-live",
    generated_at: new Date().toISOString(),
    report_path: typeof isolatedBaselineReport.report_path === "string" ? isolatedBaselineReport.report_path : undefined,
    isolated_baseline_report: isolatedBaselineReport
  };

  return report;
}

export async function runLiveStability(options: {
  rootDir?: string;
  inputPath?: string;
  iterations?: number;
  adapterMode?: CodexAdapterMode;
} = {}): Promise<LiveStabilityReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const iterations = Math.max(1, Math.floor(options.iterations ?? numberFromEnv("FUSERA_LIVE_STABILITY_RUNS", 3)));
  const adapterMode = options.adapterMode ?? "real";
  return withEnv(defaultEnvForAdapterMode(adapterMode), async () => {
    const startedAt = Date.now();
    const runResults: LiveStabilityRunResult[] = [];

    for (let index = 1; index <= iterations; index += 1) {
      runResults.push(
        await runOneStabilityIteration({
          rootDir,
          inputPath: options.inputPath,
          adapterMode,
          index
        })
      );
    }

    const reportBase = {
      ok: runResults.every((result) => result.ok),
      command: "live-stability" as const,
      generated_at: new Date().toISOString(),
      adapter_mode: adapterMode,
      iterations,
      input_ref: options.inputPath ? path.relative(rootDir, path.resolve(rootDir, options.inputPath)) : undefined,
      canonical_live_defaults: adapterMode === "real" ? canonicalLiveDefaults() : undefined,
      summary: summarizeRunResults(runResults, Date.now() - startedAt),
      run_results: runResults
    };
    const reportPath = await writeRuntimeReport(rootDir, "live-stability", reportBase);
    const markdownReportPath = await writeMarkdownReport(reportPath, reportBase);

    return {
      ...reportBase,
      report_path: reportPath,
      markdown_report_path: markdownReportPath
    };
  });
}

async function runOneStabilityIteration(options: {
  rootDir: string;
  inputPath?: string;
  adapterMode: CodexAdapterMode;
  index: number;
}): Promise<LiveStabilityRunResult> {
  const startedAt = Date.now();
  let run: Awaited<ReturnType<typeof runFixture>> | null = null;

  try {
    run = await withEnv(
      {
        FUSERA_CODEX_ADAPTER: options.adapterMode
      },
      () =>
        runFixture({
          rootDir: options.rootDir,
          inputPath: options.inputPath,
          mode: "publish",
          adapterMode: options.adapterMode
        })
    );
  } catch (error) {
    return failedRunResult({
      index: options.index,
      startedAt,
      run,
      runError: error
    });
  }

  let previewReport: Awaited<ReturnType<typeof verifyLivePreviewPublish>> | null = null;
  let previewError: unknown;

  try {
    previewReport = await verifyLivePreviewPublish({
      rootDir: options.rootDir,
      runDir: run.run_dir
    });
  } catch (error) {
    previewError = error;
  }

  let qualityReport: LiveQualityReport | null = null;
  let qualityError: unknown;

  try {
    qualityReport = await verifyLiveCodexQuality({
      rootDir: options.rootDir,
      inputPath: options.inputPath,
      runDir: run.run_dir,
      targetStage: "design-system-pass"
    });
  } catch (error) {
    qualityError = error;
  }

  return stabilityResultFromRun({
    index: options.index,
    startedAt,
    run,
    previewReport,
    qualityReport,
    previewError,
    qualityError
  });
}

async function stabilityResultFromRun(options: {
  index: number;
  startedAt: number;
  run: Awaited<ReturnType<typeof runFixture>>;
  previewReport: Awaited<ReturnType<typeof verifyLivePreviewPublish>> | null;
  qualityReport: LiveQualityReport | null;
  previewError?: unknown;
  qualityError?: unknown;
}): Promise<LiveStabilityRunResult> {
  const runRecord = await readJsonIfPresent(path.join(options.run.run_dir, "run.json"));
  const diagnostics = await readRunDiagnostics(options.run.run_dir);
  const runFailureMode = stringValue(runRecord?.failure_mode);

  if (runFailureMode) {
    diagnostics.failure_modes[runFailureMode] = Math.max(diagnostics.failure_modes[runFailureMode] ?? 0, 1);
  }

  const previewOk = options.previewReport?.ok === true;
  const qualityOk = options.qualityReport?.ok === true;
  const findings = [
    ...(options.qualityReport?.findings ?? []),
    ...verifierErrorFindings(options.previewError, options.qualityError)
  ];
  const ok = options.run.final_state === "published" && previewOk && qualityOk;

  return {
    index: options.index,
    ok,
    run_id: options.run.run_id,
    run_dir: options.run.run_dir,
    final_state: stringValue(runRecord?.state) ?? options.run.final_state,
    run_failure_mode: runFailureMode,
    duration_ms: Date.now() - options.startedAt,
    preview_ok: previewOk,
    quality_ok: qualityOk,
    tool_use_observed: options.qualityReport?.tool_use_summary.observed ?? false,
    tool_use_stages: options.qualityReport?.tool_use_summary.stages ?? [],
    retry_attempts: diagnostics.retry_attempts,
    model_owned_attempts: diagnostics.model_owned_attempts,
    model_owned_duration_ms: diagnostics.model_owned_duration_ms,
    stage_durations_ms: diagnostics.stage_durations_ms,
    stage_attempt_counts: diagnostics.stage_attempt_counts,
    timed_out_attempts: diagnostics.timed_out_attempts,
    configured_models: diagnostics.configured_models,
    configured_reasoning_efforts: diagnostics.configured_reasoning_efforts,
    timeout_ms_values: diagnostics.timeout_ms_values,
    failure_modes: diagnostics.failure_modes,
    stderr_excerpt_count: diagnostics.stderr_excerpt_count,
    artifact_scores: options.qualityReport?.artifact_scores,
    findings,
    preview_error: errorMessage(options.previewError),
    quality_error: errorMessage(options.qualityError)
  };
}

async function failedRunResult(options: {
  index: number;
  startedAt: number;
  run: Awaited<ReturnType<typeof runFixture>> | null;
  runError: unknown;
}): Promise<LiveStabilityRunResult> {
  if (options.run) {
    const runRecord = await readJsonIfPresent(path.join(options.run.run_dir, "run.json"));
    const diagnostics = await readRunDiagnostics(options.run.run_dir);
    const runFailureMode = stringValue(runRecord?.failure_mode);

    if (runFailureMode) {
      diagnostics.failure_modes[runFailureMode] = Math.max(diagnostics.failure_modes[runFailureMode] ?? 0, 1);
    }

    return {
      index: options.index,
      ok: false,
      run_id: options.run.run_id,
      run_dir: options.run.run_dir,
      final_state: stringValue(runRecord?.state) ?? options.run.final_state,
      run_failure_mode: runFailureMode,
      duration_ms: Date.now() - options.startedAt,
      preview_ok: false,
      quality_ok: false,
      tool_use_observed: false,
      tool_use_stages: [],
      retry_attempts: diagnostics.retry_attempts,
      model_owned_attempts: diagnostics.model_owned_attempts,
      model_owned_duration_ms: diagnostics.model_owned_duration_ms,
      stage_durations_ms: diagnostics.stage_durations_ms,
      stage_attempt_counts: diagnostics.stage_attempt_counts,
      timed_out_attempts: diagnostics.timed_out_attempts,
      configured_models: diagnostics.configured_models,
      configured_reasoning_efforts: diagnostics.configured_reasoning_efforts,
      timeout_ms_values: diagnostics.timeout_ms_values,
      failure_modes: diagnostics.failure_modes,
      stderr_excerpt_count: diagnostics.stderr_excerpt_count,
      findings: [
        {
          severity: "fail",
          criterion: "live-stability-run-exception",
          summary: errorMessage(options.runError) ?? "Unknown live stability run error."
        }
      ],
      run_error: errorMessage(options.runError),
      error: errorStack(options.runError)
    };
  }

  return {
    index: options.index,
    ok: false,
    duration_ms: Date.now() - options.startedAt,
    preview_ok: false,
    quality_ok: false,
    tool_use_observed: false,
    tool_use_stages: [],
    retry_attempts: 0,
    model_owned_attempts: 0,
    model_owned_duration_ms: 0,
    stage_durations_ms: {},
    stage_attempt_counts: {},
    timed_out_attempts: 0,
    configured_models: [],
    configured_reasoning_efforts: [],
    timeout_ms_values: [],
    failure_modes: {},
    stderr_excerpt_count: 0,
    findings: [
      {
        severity: "fail",
        criterion: "live-stability-run-exception",
        summary: errorMessage(options.runError) ?? "Unknown live stability run error."
      }
    ],
    run_error: errorMessage(options.runError),
    error: errorStack(options.runError)
  };
}

async function readRunDiagnostics(runDir: string): Promise<{
  retry_attempts: number;
  model_owned_attempts: number;
  model_owned_duration_ms: number;
  stage_durations_ms: Record<string, number>;
  stage_attempt_counts: Record<string, number>;
  timed_out_attempts: number;
  configured_models: string[];
  configured_reasoning_efforts: string[];
  timeout_ms_values: number[];
  failure_modes: Record<string, number>;
  stderr_excerpt_count: number;
}> {
  let retryAttempts = 0;
  let modelOwnedAttempts = 0;
  let modelOwnedDurationMs = 0;
  let stderrExcerptCount = 0;
  let timedOutAttempts = 0;
  const stageDurationsMs: Record<string, number> = {};
  const stageAttemptCounts: Record<string, number> = {};
  const failureModes: Record<string, number> = {};
  const configuredModels = new Set<string>();
  const configuredReasoningEfforts = new Set<string>();
  const timeoutMsValues = new Set<number>();

  for (const stage of MODEL_OWNED_STAGES) {
    const attemptsDir = path.join(runDir, "stages", stage, "attempts");
    const attemptIds = await readDirIfPresent(attemptsDir);
    retryAttempts += Math.max(0, attemptIds.length - 1);
    stageAttemptCounts[stage] = attemptIds.length;

    for (const attemptId of attemptIds) {
      const attemptDir = path.join(attemptsDir, attemptId);
      const result = await readJsonIfPresent(path.join(attemptDir, "adapter-result.json"));
      const stderr = await readTextIfPresent(path.join(attemptDir, "adapter-stderr.txt"));
      const usage = isRecord(result?.usage) ? result.usage : {};
      const durationMs = numberFromRecord(usage, "duration_ms");
      const failureMode = typeof result?.failure_mode === "string" ? result.failure_mode : undefined;
      const configuredModel = stringValue(usage.configured_model);
      const configuredReasoningEffort = stringValue(usage.configured_reasoning_effort);
      const timeoutMs = numberFromRecord(usage, "timeout_ms");

      modelOwnedAttempts += 1;
      modelOwnedDurationMs += durationMs;
      stageDurationsMs[stage] = (stageDurationsMs[stage] ?? 0) + durationMs;

      if (usage.timed_out === true) {
        timedOutAttempts += 1;
      }

      if (stderr.trim().length > 0) {
        stderrExcerptCount += 1;
      }

      if (configuredModel) {
        configuredModels.add(configuredModel);
      }

      if (configuredReasoningEffort) {
        configuredReasoningEfforts.add(configuredReasoningEffort);
      }

      if (timeoutMs > 0) {
        timeoutMsValues.add(timeoutMs);
      }

      if (failureMode) {
        failureModes[failureMode] = (failureModes[failureMode] ?? 0) + 1;
      }
    }
  }

  return {
    retry_attempts: retryAttempts,
    model_owned_attempts: modelOwnedAttempts,
    model_owned_duration_ms: modelOwnedDurationMs,
    stage_durations_ms: stageDurationsMs,
    stage_attempt_counts: stageAttemptCounts,
    timed_out_attempts: timedOutAttempts,
    configured_models: [...configuredModels].sort(),
    configured_reasoning_efforts: [...configuredReasoningEfforts].sort(),
    timeout_ms_values: [...timeoutMsValues].sort((a, b) => a - b),
    failure_modes: failureModes,
    stderr_excerpt_count: stderrExcerptCount
  };
}

function summarizeRunResults(
  runResults: LiveStabilityRunResult[],
  durationMsTotal: number
): LiveStabilityReport["summary"] {
  const ok = runResults.filter((result) => result.ok).length;
  const published = runResults.filter((result) => result.final_state === "published").length;
  const previewOk = runResults.filter((result) => result.preview_ok).length;
  const qualityOk = runResults.filter((result) => result.quality_ok).length;
  const toolUseObserved = runResults.filter((result) => result.tool_use_observed).length;
  const retryAttempts = runResults.reduce((sum, result) => sum + result.retry_attempts, 0);
  const modelOwnedAttempts = runResults.reduce((sum, result) => sum + result.model_owned_attempts, 0);
  const modelOwnedDurationMs = runResults.reduce((sum, result) => sum + result.model_owned_duration_ms, 0);
  const durations = durationStats(runResults.map((result) => result.duration_ms));
  const modelOwnedDurations = durationStats(runResults.map((result) => result.model_owned_duration_ms));

  return {
    total: runResults.length,
    ok,
    failed: runResults.length - ok,
    success_rate: runResults.length === 0 ? 0 : ok / runResults.length,
    published,
    preview_ok: previewOk,
    quality_ok: qualityOk,
    tool_use_observed: toolUseObserved,
    retry_attempts: retryAttempts,
    duration_ms_total: durationMsTotal,
    duration_ms_avg: runResults.length === 0 ? 0 : Math.round(durationMsTotal / runResults.length),
    duration_ms_min: durations.min,
    duration_ms_max: durations.max,
    duration_ms_p95: durations.p95,
    model_owned_duration_ms_avg: runResults.length === 0 ? 0 : Math.round(modelOwnedDurationMs / runResults.length),
    model_owned_duration_ms_min: modelOwnedDurations.min,
    model_owned_duration_ms_max: modelOwnedDurations.max,
    model_owned_duration_ms_p95: modelOwnedDurations.p95,
    model_owned_stage_duration_ms: stageDurationStats(runResults),
    failure_modes: mergeFailureModes(runResults),
    failure_triage: failureTriage(runResults),
    accounting: accountingSummary(runResults, modelOwnedAttempts),
    artifact_score_drift: artifactScoreDrift(runResults)
  };
}

function mergeFailureModes(runResults: LiveStabilityRunResult[]): Record<string, number> {
  const merged: Record<string, number> = {};

  for (const result of runResults) {
    for (const [failureMode, count] of Object.entries(result.failure_modes)) {
      merged[failureMode] = (merged[failureMode] ?? 0) + count;
    }
  }

  return merged;
}

function durationStats(values: number[]): DurationStats {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return { min: 0, max: 0, avg: 0, p95: 0 };
  }

  const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  const sum = sorted.reduce((total, value) => total + value, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    p95: sorted[p95Index]
  };
}

function stageDurationStats(runResults: LiveStabilityRunResult[]): Record<string, DurationStats> {
  const stats: Record<string, DurationStats> = {};

  for (const stage of MODEL_OWNED_STAGES) {
    stats[stage] = durationStats(
      runResults
        .map((result) => result.stage_durations_ms[stage])
        .filter((value): value is number => typeof value === "number" && value > 0)
    );
  }

  return stats;
}

function accountingSummary(
  runResults: LiveStabilityRunResult[],
  modelOwnedAttempts: number
): LiveAccountingSummary {
  return {
    cost_available: false,
    cost_unavailable_reason: "Codex CLI adapter usage metadata does not expose token or cost fields.",
    model_owned_attempts: modelOwnedAttempts,
    timed_out_attempts: runResults.reduce((sum, result) => sum + result.timed_out_attempts, 0),
    stderr_excerpt_count: runResults.reduce((sum, result) => sum + result.stderr_excerpt_count, 0),
    configured_models: uniqueStrings(runResults.flatMap((result) => result.configured_models)),
    configured_reasoning_efforts: uniqueStrings(runResults.flatMap((result) => result.configured_reasoning_efforts)),
    timeout_ms_values: uniqueNumbers(runResults.flatMap((result) => result.timeout_ms_values))
  };
}

function failureTriage(runResults: LiveStabilityRunResult[]): FailureTriageSummary {
  const categories: Record<string, number> = {};
  const failedRuns: FailureTriageSummary["failed_runs"] = [];

  for (const result of runResults.filter((runResult) => !runResult.ok)) {
    const runCategories = triageCategoriesFor(result);

    for (const category of runCategories) {
      categories[category] = (categories[category] ?? 0) + 1;
    }

    failedRuns.push({
      index: result.index,
      run_id: result.run_id,
      run_dir: result.run_dir,
      final_state: result.final_state,
      categories: runCategories,
      run_failure_mode: result.run_failure_mode,
      failure_modes: result.failure_modes,
      preview_error: result.preview_error,
      quality_error: result.quality_error,
      run_error: result.run_error,
      findings: result.findings
    });
  }

  return {
    categories,
    failed_runs: failedRuns
  };
}

function triageCategoriesFor(result: LiveStabilityRunResult): string[] {
  const categories = new Set<string>();

  if (result.run_error) {
    categories.add("run-exception");
  }

  if (result.preview_error || !result.preview_ok) {
    categories.add("preview-verifier");
  }

  if (result.quality_error || !result.quality_ok) {
    categories.add("quality-verifier");
  }

  if (result.tool_use_observed) {
    categories.add("ambient-tool-use");
  }

  if (result.timed_out_attempts > 0) {
    categories.add("timeout");
  }

  for (const failureMode of Object.keys(result.failure_modes)) {
    categories.add(failureCategoryForMode(failureMode));
  }

  if (result.run_failure_mode) {
    categories.add(failureCategoryForMode(result.run_failure_mode));
  }

  if (categories.size === 0) {
    categories.add("unknown");
  }

  return [...categories].sort();
}

function failureCategoryForMode(failureMode: string): string {
  if (failureMode === "invocation_failure") {
    return "adapter-invocation";
  }

  if (failureMode === "extraction_failure") {
    return "adapter-extraction";
  }

  if (failureMode === "validation_failure") {
    return "artifact-validation";
  }

  if (failureMode === "missing_output") {
    return "adapter-output";
  }

  return `failure-mode:${failureMode}`;
}

function artifactScoreDrift(runResults: LiveStabilityRunResult[]): LiveStabilityReport["summary"]["artifact_score_drift"] {
  const drift: LiveStabilityReport["summary"]["artifact_score_drift"] = {};

  for (const result of runResults) {
    for (const [artifactType, score] of Object.entries(result.artifact_scores ?? {})) {
      const existing = drift[artifactType];

      if (!existing) {
        drift[artifactType] = {
          min_score: score.score,
          max_score: score.score,
          max_score_possible: score.max_score,
          delta: 0
        };
      } else {
        existing.min_score = Math.min(existing.min_score, score.score);
        existing.max_score = Math.max(existing.max_score, score.score);
        existing.max_score_possible = Math.max(existing.max_score_possible, score.max_score);
        existing.delta = existing.max_score - existing.min_score;
      }
    }
  }

  return drift;
}

async function writeRuntimeReport(
  rootDir: string,
  prefix: string,
  report: Record<string, unknown>
): Promise<string> {
  const evidenceDir = path.join(rootDir, ".fusera/runs");
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const reportPath = path.join(evidenceDir, `${prefix}_${timestamp}_${Math.random().toString(36).slice(2, 8)}.json`);

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}

async function writeMarkdownReport(
  jsonReportPath: string,
  report: Omit<LiveStabilityReport, "report_path" | "markdown_report_path">
): Promise<string> {
  const markdownPath = jsonReportPath.replace(/\.json$/, ".md");
  const lines = [
    "# Live Stability Report",
    "",
    `Generated: ${report.generated_at}`,
    `Adapter mode: ${report.adapter_mode}`,
    `Runs: ${report.summary.ok}/${report.summary.total} ok`,
    `Success rate: ${(report.summary.success_rate * 100).toFixed(1)}%`,
    report.canonical_live_defaults
      ? `Canonical live defaults: model=${report.canonical_live_defaults.FUSERA_CODEX_MODEL}, reasoning=${report.canonical_live_defaults.FUSERA_CODEX_REASONING_EFFORT}, timeout=${report.canonical_live_defaults.FUSERA_CODEX_TIMEOUT_MS}ms`
      : undefined,
    `Average duration: ${report.summary.duration_ms_avg}ms`,
    `Duration p95: ${report.summary.duration_ms_p95}ms`,
    `Average model-owned duration: ${report.summary.model_owned_duration_ms_avg}ms`,
    `Model-owned duration p95: ${report.summary.model_owned_duration_ms_p95}ms`,
    `Model-owned attempts: ${report.summary.accounting.model_owned_attempts}`,
    `Timed-out attempts: ${report.summary.accounting.timed_out_attempts}`,
    `Tool-use observed runs: ${report.summary.tool_use_observed}`,
    `Retry attempts: ${report.summary.retry_attempts}`,
    "",
    "## Runs",
    "",
    "| # | OK | State | Preview | Quality | Duration | Retries | Tool Use | Run |",
    "|---|---|---|---|---|---:|---:|---|---|",
    ...report.run_results.map((result) =>
      [
        `| ${result.index}`,
        result.ok ? "yes" : "no",
        result.run_failure_mode ? `${result.final_state ?? "error"} (${result.run_failure_mode})` : result.final_state ?? "error",
        result.preview_ok ? "yes" : "no",
        result.quality_ok ? "yes" : "no",
        `${result.duration_ms}ms`,
        String(result.retry_attempts),
        result.tool_use_observed ? result.tool_use_stages.join(", ") || "yes" : "no",
        result.run_dir ?? "",
        "|"
      ].join(" | ")
    ),
    "",
    "## Stage Duration",
    "",
    "| Stage | Min | Avg | P95 | Max |",
    "|---|---:|---:|---:|---:|",
    ...Object.entries(report.summary.model_owned_stage_duration_ms).map(([stage, stats]) =>
      `| ${stage} | ${stats.min}ms | ${stats.avg}ms | ${stats.p95}ms | ${stats.max}ms |`
    ),
    "",
    "## Artifact Score Drift",
    "",
    "| Artifact | Min | Max | Delta | Max Possible |",
    "|---|---:|---:|---:|---:|",
    ...Object.entries(report.summary.artifact_score_drift).map(([artifactType, drift]) =>
      `| ${artifactType} | ${drift.min_score} | ${drift.max_score} | ${drift.delta} | ${drift.max_score_possible} |`
    ),
    "",
    "## Failure Modes",
    "",
    Object.keys(report.summary.failure_modes).length === 0
      ? "None"
      : Object.entries(report.summary.failure_modes)
          .map(([failureMode, count]) => `- ${failureMode}: ${count}`)
          .join("\n"),
    "",
    "## Failure Triage",
    "",
    Object.keys(report.summary.failure_triage.categories).length === 0
      ? "None"
      : Object.entries(report.summary.failure_triage.categories)
          .map(([category, count]) => `- ${category}: ${count}`)
          .join("\n"),
    "",
    "## Accounting",
    "",
    `Cost available: ${report.summary.accounting.cost_available ? "yes" : "no"}`,
    `Cost note: ${report.summary.accounting.cost_unavailable_reason}`,
    `Configured models: ${report.summary.accounting.configured_models.join(", ") || "none"}`,
    `Configured reasoning: ${report.summary.accounting.configured_reasoning_efforts.join(", ") || "none"}`,
    `Timeout values: ${report.summary.accounting.timeout_ms_values.join(", ") || "none"}`,
    "",
    "## Verifier Errors",
    "",
    ...report.run_results
      .filter((result) => result.preview_error || result.quality_error || result.run_error)
      .flatMap((result) => [
        `### Run ${result.index}`,
        "",
        result.run_error ? `- run: ${result.run_error}` : "",
        result.preview_error ? `- preview: ${result.preview_error}` : "",
        result.quality_error ? `- quality: ${result.quality_error}` : "",
        ""
      ])
      .filter(Boolean)
  ].filter((line): line is string => typeof line === "string");

  await writeFile(markdownPath, `${lines.join("\n")}\n`, "utf8");
  return markdownPath;
}

async function readDirIfPresent(dirPath: string): Promise<string[]> {
  try {
    const { readdir } = await import("node:fs/promises");
    return await readdir(dirPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function readJsonIfPresent(filePath: string): Promise<Record<string, any> | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Record<string, any>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function readTextIfPresent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

function numberFromRecord(value: unknown, key: string): number {
  return typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>)[key] === "number"
    ? (value as Record<string, number>)[key]
    : 0;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function defaultEnvForAdapterMode(adapterMode: CodexAdapterMode): Record<string, string> {
  return adapterMode === "real" ? canonicalLiveDefaults() : {};
}

function canonicalLiveDefaults(): Record<string, string> {
  const defaults: Record<string, string> = {};

  for (const [key, value] of Object.entries(CANONICAL_LIVE_ENV)) {
    defaults[key] = process.env[key] ?? value;
  }

  return defaults;
}

function verifierErrorFindings(previewError: unknown, qualityError: unknown): LiveQualityReport["findings"] {
  const findings: LiveQualityReport["findings"] = [];
  const previewMessage = errorMessage(previewError);
  const qualityMessage = errorMessage(qualityError);

  if (previewMessage) {
    findings.push({
      severity: "fail",
      criterion: "live-preview-verifier-error",
      summary: previewMessage
    });
  }

  if (qualityMessage) {
    findings.push({
      severity: "fail",
      criterion: "live-quality-verifier-error",
      summary: qualityMessage
    });
  }

  return findings;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))].sort();
}

function uniqueNumbers(values: unknown[]): number[] {
  return [...new Set(values.filter((value): value is number => typeof value === "number" && Number.isFinite(value)))]
    .sort((a, b) => a - b);
}

function errorMessage(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  return error instanceof Error ? error.message : String(error);
}

function errorStack(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  return error instanceof Error ? error.stack ?? error.message : String(error);
}

function numberFromEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function withEnv<T>(env: Record<string, string>, callback: () => Promise<T>): Promise<T> {
  const prior = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(env)) {
    prior.set(key, process.env[key]);
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [command, runsArg, inputPath] = process.argv.slice(2);
  const report =
    command === "mock"
      ? await runCiMock()
      : command === "live"
        ? await runCiLive({ inputPath: runsArg })
        : await runLiveStability({
            iterations: Number(runsArg) || undefined,
            inputPath
          });

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
