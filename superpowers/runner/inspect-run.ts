import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readRunGraphSummary, type HarnessGraphSummary } from "./harness-graph.ts";

type RunInspection = {
  run_id: string;
  run_dir: string;
  state: string;
  adapter_mode?: string;
  adapter_mode_source: "run.json" | "stage-evidence" | "unknown";
  proof_target_stage?: string | null;
  proof_completed?: boolean;
  failed_stage?: string | null;
  failure_message?: string | null;
  preview_build_ref?: string;
  event_count: number;
  stages: StageInspection[];
  artifacts: ArtifactInspection[];
  compiled: {
    preview_build_present: boolean;
    preview_build_ref?: string;
    page_spec_ref?: string;
  };
  preview_publish: {
    handoff_present: boolean;
    publish_version_ref?: string;
    preview_url?: string;
  };
  graph?: HarnessGraphSummary | null;
  recent_events: Array<Record<string, unknown>>;
};

type StageInspection = {
  stage: string;
  started: boolean;
  completed: boolean;
  backend_skipped: boolean;
  backend_failed: boolean;
  adapter_status?: string;
  usage_mode?: string;
  latest_attempt_id?: string;
  latest_attempt_dir?: string;
  attempt_count: number;
  latest_attempt_evidence_present: boolean;
  produced_artifact_types: string[];
  failure_mode?: string;
  normalized_input_present?: boolean;
  diagnostics: {
    failed_attempt_count: number;
    failure_modes: Record<string, number>;
    total_duration_ms: number;
    latest_duration_ms?: number;
    latest_timeout_ms?: number;
    latest_extraction_error_count?: number;
    latest_tool_use_observed?: boolean;
    latest_stderr_present: boolean;
    latest_stderr_excerpt?: string;
    cost: "not_available";
  };
};

type ArtifactInspection = {
  file_name: string;
  artifact_type?: string;
  artifact_id?: string;
  status?: string;
  producer_stage?: string;
  validation_valid?: boolean;
  rejected?: boolean;
  validation_errors?: string[];
};

const DEFAULT_RECENT_EVENT_COUNT = 12;

export async function inspectRun(options: {
  rootDir?: string;
  runDir: string;
  recentEventCount?: number;
  includeGraph?: boolean;
}): Promise<RunInspection> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const run = await readJson(path.join(runDir, "run.json"));
  const events = await readEvents(runDir);
  const stageNames = await listStageNames(runDir);
  const stages = await Promise.all(
    stageNames.map((stage) => inspectStage({
      runDir,
      stage,
      events
    }))
  );
  const artifacts = await inspectArtifacts(runDir);
  const previewBuild = await readJsonIfPresent(path.join(runDir, "compiled/preview-build.json"));
  const handoff = await readJsonIfPresent(path.join(runDir, "previews/publish-handoff.json"));
  const recentEventCount = options.recentEventCount ?? DEFAULT_RECENT_EVENT_COUNT;
  const persistedAdapterMode = stringOrUndefined(run.adapter_mode);
  const inferredAdapterMode = inferAdapterModeFromStages(stages);

  return {
    run_id: stringFrom(run.run_id, ""),
    run_dir: runDir,
    state: stringFrom(run.state, "unknown"),
    adapter_mode: persistedAdapterMode ?? inferredAdapterMode,
    adapter_mode_source: persistedAdapterMode ? "run.json" : inferredAdapterMode ? "stage-evidence" : "unknown",
    proof_target_stage: typeof run.proof_target_stage === "string" ? run.proof_target_stage : null,
    proof_completed: typeof run.proof_completed === "boolean" ? run.proof_completed : undefined,
    failed_stage: typeof run.failed_stage === "string" ? run.failed_stage : null,
    failure_message: typeof run.failure_message === "string" ? run.failure_message : null,
    preview_build_ref: stringOrUndefined(run.preview_build_ref),
    event_count: events.length,
    stages,
    artifacts,
    compiled: {
      preview_build_present: previewBuild !== null,
      preview_build_ref: stringOrUndefined(previewBuild?.preview_build_ref),
      page_spec_ref: stringOrUndefined(previewBuild?.page_spec_ref)
    },
    preview_publish: {
      handoff_present: handoff !== null,
      publish_version_ref: stringOrUndefined(handoff?.publish_version_ref),
      preview_url: stringOrUndefined(handoff?.preview_url)
    },
    graph: options.includeGraph ? await readRunGraphSummary({ rootDir, runDir }) : undefined,
    recent_events: events.slice(Math.max(0, events.length - recentEventCount))
  };
}

export function formatInspectionText(inspection: RunInspection): string {
  const lines = [
    `run: ${inspection.run_id}`,
    `state: ${inspection.state}`,
    `adapter_mode: ${inspection.adapter_mode ?? "unknown"} (${inspection.adapter_mode_source})`,
    `run_dir: ${inspection.run_dir}`,
    `proof: ${inspection.proof_target_stage ?? "none"} (${inspection.proof_completed === true ? "completed" : "not-completed"})`,
    `preview_build_ref: ${inspection.compiled.preview_build_ref ?? "none"}`,
    `publish_handoff: ${inspection.preview_publish.handoff_present ? inspection.preview_publish.preview_url ?? "present" : "none"}`,
    "",
    "stages:"
  ];

  for (const stage of inspection.stages) {
    const status = stage.completed ? "completed" : stage.started ? "started" : "pending";
    const backend = stage.backend_skipped
      ? "runner-owned-noop"
      : stage.adapter_status
        ? `${stage.adapter_status}/${stage.usage_mode ?? "unknown"}`
        : "none";

    lines.push(
      `- ${stage.stage}: ${status}; backend=${backend}; attempts=${stage.attempt_count}; latest=${stage.latest_attempt_id ?? "none"}`
    );

    if (stage.failure_mode) {
      lines.push(`  failure_mode: ${stage.failure_mode}`);
    }

    if (stage.produced_artifact_types.length > 0) {
      lines.push(`  produced: ${stage.produced_artifact_types.join(", ")}`);
    }

    if (
      stage.diagnostics.failed_attempt_count > 0 ||
      stage.diagnostics.latest_duration_ms !== undefined ||
      stage.diagnostics.latest_stderr_present
    ) {
      lines.push(
        `  diagnostics: failed_attempts=${stage.diagnostics.failed_attempt_count}; total_duration_ms=${stage.diagnostics.total_duration_ms}; latest_timeout_ms=${stage.diagnostics.latest_timeout_ms ?? "n/a"}; cost=${stage.diagnostics.cost}`
      );

      if (Object.keys(stage.diagnostics.failure_modes).length > 0) {
        lines.push(`  failure_modes: ${JSON.stringify(stage.diagnostics.failure_modes)}`);
      }

      if (stage.diagnostics.latest_stderr_excerpt) {
        lines.push(`  stderr: ${stage.diagnostics.latest_stderr_excerpt}`);
      }
    }
  }

  lines.push("", "artifacts:");

  for (const artifact of inspection.artifacts) {
    lines.push(
      `- ${artifact.file_name}: ${artifact.artifact_type ?? "unknown"} ${artifact.status ?? "unknown"} ${artifact.artifact_id ?? ""}`.trim()
    );

    if (artifact.validation_errors && artifact.validation_errors.length > 0) {
      lines.push(`  errors: ${artifact.validation_errors.join("; ")}`);
    }
  }

  if (inspection.failed_stage || inspection.failure_message) {
    lines.push("", `failure: ${inspection.failed_stage ?? "unknown"} ${inspection.failure_message ?? ""}`.trim());
  }

  if (inspection.graph !== undefined) {
    lines.push("", "graph:");

    if (inspection.graph === null) {
      lines.push("- none");
    } else {
      lines.push(
        `- ${inspection.graph.graph_type}: nodes=${inspection.graph.nodes}; links=${inspection.graph.links}; diagnostics=${inspection.graph.diagnostics}; critical=${inspection.graph.critical_diagnostics}`
      );
      lines.push(`  graph_path: ${inspection.graph.graph_path ?? "unknown"}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function inspectStage(options: {
  runDir: string;
  stage: string;
  events: Array<Record<string, unknown>>;
}): Promise<StageInspection> {
  const stageDir = path.join(options.runDir, "stages", options.stage);
  const adapterResult = await readJsonIfPresent(path.join(stageDir, "adapter-result.json"));
  const attempts = await listAttemptIds(stageDir);
  const attemptResults = await Promise.all(
    attempts.map((attemptId) => readJsonIfPresent(path.join(stageDir, "attempts", attemptId, "adapter-result.json")))
  );
  const candidates = Array.isArray(adapterResult?.produced_artifact_candidates)
    ? adapterResult.produced_artifact_candidates
    : [];
  const latestAttemptDir = stringOrUndefined(adapterResult?.usage?.attempt_dir);
  const latestUsage = isRecord(adapterResult?.usage) ? adapterResult.usage : {};
  const latestStderr = typeof adapterResult?.stderr === "string" ? adapterResult.stderr : "";

  return {
    stage: options.stage,
    started: hasEvent(options.events, options.stage, "stage_started"),
    completed: hasEvent(options.events, options.stage, "stage_completed"),
    backend_skipped: hasEvent(options.events, options.stage, "backend_skipped"),
    backend_failed: hasEvent(options.events, options.stage, "backend_failed"),
    adapter_status: stringOrUndefined(adapterResult?.status),
    usage_mode: stringOrUndefined(adapterResult?.usage?.mode),
    latest_attempt_id: stringOrUndefined(adapterResult?.usage?.attempt_id),
    latest_attempt_dir: latestAttemptDir,
    attempt_count: attempts.length,
    latest_attempt_evidence_present: latestAttemptDir
      ? await hasAttemptEvidence(path.join(options.runDir, latestAttemptDir))
      : false,
    produced_artifact_types: candidates
      .map((candidate: Record<string, unknown>) => candidate.artifact_type)
      .filter((artifactType: unknown): artifactType is string => typeof artifactType === "string"),
    failure_mode: stringOrUndefined(adapterResult?.failure_mode),
    normalized_input_present:
      options.stage === "normalize-input"
        ? await fileExists(path.join(stageDir, "normalized-input.json"))
        : undefined,
    diagnostics: {
      failed_attempt_count: attemptResults.filter((result) => result?.status === "failed").length,
      failure_modes: countFailureModes(attemptResults),
      total_duration_ms: attemptResults.reduce(
        (sum, result) => sum + numberFrom(isRecord(result?.usage) ? result.usage.duration_ms : undefined, 0),
        0
      ),
      latest_duration_ms: numberOrUndefined(latestUsage.duration_ms),
      latest_timeout_ms: numberOrUndefined(latestUsage.timeout_ms),
      latest_extraction_error_count: numberOrUndefined(latestUsage.extraction_error_count),
      latest_tool_use_observed: typeof latestUsage.tool_use_observed === "boolean" ? latestUsage.tool_use_observed : undefined,
      latest_stderr_present: latestStderr.length > 0,
      latest_stderr_excerpt: stderrExcerpt(latestStderr),
      cost: "not_available"
    }
  };
}

async function inspectArtifacts(runDir: string): Promise<ArtifactInspection[]> {
  const artifactsDir = path.join(runDir, "artifacts");
  const fileNames = await readDirIfPresent(artifactsDir);
  const artifactFiles = fileNames.filter((fileName) => fileName.endsWith(".json")).sort();
  const rejectedDir = path.join(artifactsDir, "rejected");
  const rejectedArtifactFiles = (await readDirIfPresent(rejectedDir))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => `rejected/${fileName}`);

  return Promise.all(
    [...artifactFiles, ...rejectedArtifactFiles].map(async (fileName) => {
      const artifact = await readJson(path.join(artifactsDir, fileName));
      const validation = isRecord(artifact.validation) ? artifact.validation : {};

      return {
        file_name: fileName,
        artifact_type: stringOrUndefined(artifact.artifact_type),
        artifact_id: stringOrUndefined(artifact.artifact_id),
        status: stringOrUndefined(artifact.status),
        producer_stage: stringOrUndefined(artifact.producer_stage),
        validation_valid:
          typeof validation.valid === "boolean" ? Boolean(validation.valid) : undefined,
        rejected: fileName.startsWith("rejected/"),
        validation_errors: Array.isArray(validation.errors)
          ? validation.errors.filter((error): error is string => typeof error === "string")
          : undefined
      };
    })
  );
}

async function listStageNames(runDir: string): Promise<string[]> {
  const stagesDir = path.join(runDir, "stages");
  const fileNames = await readDirIfPresent(stagesDir);
  const stageNames = [];

  for (const fileName of fileNames) {
    if (fileName === "repairing" || fileName === "retrying") {
      continue;
    }

    const fileStat = await stat(path.join(stagesDir, fileName));

    if (fileStat.isDirectory()) {
      stageNames.push(fileName);
    }
  }

  return stageNames.sort((left, right) => stageOrder(left) - stageOrder(right));
}

async function listAttemptIds(stageDir: string): Promise<string[]> {
  const attemptRoot = path.join(stageDir, "attempts");
  const fileNames = await readDirIfPresent(attemptRoot);
  const attemptIds = [];

  for (const fileName of fileNames) {
    const fileStat = await stat(path.join(attemptRoot, fileName));

    if (fileStat.isDirectory()) {
      attemptIds.push(fileName);
    }
  }

  return attemptIds.sort();
}

async function hasAttemptEvidence(attemptDir: string): Promise<boolean> {
  const requiredFiles = [
    "adapter-raw-request.json",
    "adapter-stdout.txt",
    "adapter-stderr.txt",
    "adapter-result.json"
  ];

  for (const fileName of requiredFiles) {
    if (!(await fileExists(path.join(attemptDir, fileName)))) {
      return false;
    }
  }

  return true;
}

async function readEvents(runDir: string): Promise<Array<Record<string, unknown>>> {
  try {
    return (await readFile(path.join(runDir, "events.ndjson"), "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function readJson(filePath: string): Promise<Record<string, any>> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readJsonIfPresent(filePath: string): Promise<Record<string, any> | null> {
  try {
    return await readJson(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function readDirIfPresent(dirPath: string): Promise<string[]> {
  try {
    return await readdir(dirPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function hasEvent(events: Array<Record<string, unknown>>, stage: string, type: string): boolean {
  return events.some((event) => event.stage === stage && event.type === type);
}

function stageOrder(stage: string): number {
  const order = [
    "normalize-input",
    "product-and-brand-brief",
    "page-strategy",
    "section-planning",
    "design-system-pass",
    "design-spec-pass",
    "page-compile",
    "verify-publishable-page",
    "publish-preview"
  ];
  const index = order.indexOf(stage);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function inferAdapterModeFromStages(stages: StageInspection[]): string | undefined {
  const modes = new Set<string>();

  for (const stage of stages) {
    if (stage.usage_mode === "real") {
      modes.add("real");
    } else if (stage.usage_mode === "stub" || stage.usage_mode === "mock") {
      modes.add("mock");
    }
  }

  return modes.size === 1 ? [...modes][0] : undefined;
}

function countFailureModes(results: Array<Record<string, any> | null>): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const result of results) {
    const failureMode = stringOrUndefined(result?.failure_mode);

    if (failureMode) {
      counts[failureMode] = (counts[failureMode] ?? 0) + 1;
    }
  }

  return counts;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function numberFrom(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stderrExcerpt(value: string): string | undefined {
  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > 0 ? normalized.slice(0, 220) : undefined;
}

function stringFrom(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const recentEventIndex = args.indexOf("--recent-events");
  const recentEventCount = recentEventIndex === -1 ? undefined : Number(args[recentEventIndex + 1]);
  const runDir = args.find((arg, index) => {
    const previous = args[index - 1];

    return !arg.startsWith("--") && previous !== "--recent-events";
  });

  if (!runDir) {
    console.error(
      "Usage: node --experimental-strip-types superpowers/runner/inspect-run.ts <run-dir> [--json] [--recent-events <n>]"
    );
    process.exit(1);
  }

  const inspection = await inspectRun({
    runDir,
    recentEventCount: Number.isFinite(recentEventCount) ? recentEventCount : undefined
  });

  console.log(json ? JSON.stringify(inspection, null, 2) : formatInspectionText(inspection));
}
