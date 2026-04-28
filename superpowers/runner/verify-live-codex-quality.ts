import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runStageProof } from "./run-stage.ts";

type QualitySeverity = "info" | "warn" | "fail";
type ToolUsePolicy = "fail" | "warn" | "allow";

type StageExecutionProvenance = {
  stage: string;
  command?: string;
  args?: string[];
  configured_model?: string | null;
  configured_reasoning_effort?: string | null;
  timeout_ms?: number;
  workdir?: string;
  duration_ms?: number;
  timed_out?: boolean;
  exit_code?: number | null;
  signal?: string | null;
  extraction_error_count?: number;
  codex_version?: string | null;
  workspace_inspection_policy?: string;
  tool_use_observed?: boolean;
};

type ExecutionProvenance = {
  codex_versions: string[];
  configured_models: string[];
  timeout_ms_values: number[];
  commands: string[];
  adapter_args: string[][];
  stages: StageExecutionProvenance[];
};

export type QualityFinding = {
  severity: QualitySeverity;
  artifact_type?: string;
  criterion: string;
  summary: string;
  details?: Record<string, unknown>;
};

export type LiveQualityReport = {
  ok: boolean;
  run_id: string;
  run_dir: string;
  target_stage: string;
  final_state: string;
  model_owned_stage_statuses: Array<{
    stage: string;
    adapter_status: string | null;
    attempt_id?: string;
    attempt_dir?: string;
    tool_use_observed?: boolean;
    produced_artifact_types: string[];
    failure_mode?: string;
    command?: string;
    args?: string[];
    configured_model?: string | null;
    configured_reasoning_effort?: string | null;
    timeout_ms?: number;
    workdir?: string;
    duration_ms?: number;
    timed_out?: boolean;
    exit_code?: number | null;
    signal?: string | null;
    extraction_error_count?: number;
    codex_version?: string | null;
    workspace_inspection_policy?: string;
  }>;
  tool_use_policy: ToolUsePolicy;
  tool_use_summary: {
    observed: boolean;
    stages: string[];
  };
  execution_provenance: ExecutionProvenance;
  artifact_scores: Record<string, {
    present: boolean;
    status?: string;
    score: number;
    max_score: number;
  }>;
  findings: QualityFinding[];
};

const ROOT_DIR = process.cwd();
const DEFAULT_TARGET_STAGE = "design-system-pass";
const MODEL_OWNED_STAGES = [
  "normalize-input",
  "product-and-brand-brief",
  "page-strategy",
  "section-planning",
  "design-system-pass"
];

const ARTIFACT_FILES: Record<string, string> = {
  ProductBrief: "product-brief.json",
  BrandProfile: "brand-profile.json",
  PagePlan: "page-plan.json",
  SectionGraph: "section-graph.json",
  ThemeTokens: "theme-tokens.json"
};

const ARTIFACTS_BY_TARGET_STAGE: Record<string, string[]> = {
  "product-and-brand-brief": ["ProductBrief", "BrandProfile"],
  "page-strategy": ["ProductBrief", "BrandProfile", "PagePlan"],
  "section-planning": ["ProductBrief", "BrandProfile", "PagePlan", "SectionGraph"],
  "design-system-pass": ["ProductBrief", "BrandProfile", "PagePlan", "SectionGraph", "ThemeTokens"]
};

export async function verifyLiveCodexQuality(options: {
  rootDir?: string;
  inputPath?: string;
  targetStage?: string;
  runDir?: string;
} = {}): Promise<LiveQualityReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const targetStage = options.targetStage ?? process.env.FUSERA_LIVE_QUALITY_TARGET_STAGE ?? DEFAULT_TARGET_STAGE;
  const run = options.runDir
    ? {
        run_id: "",
        run_dir: path.resolve(rootDir, options.runDir),
        final_state: "",
        artifacts: []
      }
    : await withEnv(
        {
          FUSERA_CODEX_ADAPTER: "real"
        },
        () =>
          runStageProof({
            rootDir,
            inputPath: options.inputPath ?? process.env.FUSERA_LIVE_QUALITY_INPUT,
            targetStage
          })
      );
  const runRecord = await readJson(path.join(run.run_dir, "run.json"));
  const inputPath =
    options.inputPath ??
    process.env.FUSERA_LIVE_QUALITY_INPUT ??
    (typeof runRecord.input_ref === "string"
      ? path.join(rootDir, runRecord.input_ref)
      : path.join(rootDir, "superpowers/runner/fixtures/landing-input.json"));
  const input = await readJson(inputPath);
  const artifacts = await readArtifacts(run.run_dir);
  const expectedArtifactTypes = artifactTypesForTargetStage(targetStage);
  const findings: QualityFinding[] = [];
  const artifactScores: LiveQualityReport["artifact_scores"] = {};
  const toolUsePolicy = toolUsePolicyFromEnv();

  if (expectedArtifactTypes.includes("ProductBrief")) {
    scoreProductBrief(artifacts.ProductBrief, input, artifactScores, findings);
  }
  if (expectedArtifactTypes.includes("BrandProfile")) {
    scoreBrandProfile(artifacts.BrandProfile, input, artifactScores, findings);
  }
  if (expectedArtifactTypes.includes("PagePlan")) {
    scorePagePlan(artifacts.PagePlan, input, artifactScores, findings);
  }
  if (expectedArtifactTypes.includes("SectionGraph")) {
    scoreSectionGraph(artifacts.SectionGraph, artifacts.ProductBrief, artifactScores, findings);
  }
  if (expectedArtifactTypes.includes("ThemeTokens")) {
    scoreThemeTokens(artifacts.ThemeTokens, input, artifacts.BrandProfile, artifactScores, findings);
  }
  scoreCrossArtifactConsistency(artifacts, expectedArtifactTypes, findings);

  const modelOwnedStageStatuses = await readModelOwnedStageStatuses(run.run_dir, targetStage);
  scoreToolUsePolicy(modelOwnedStageStatuses, toolUsePolicy, findings);
  const toolUseSummary = toolUseSummaryFrom(modelOwnedStageStatuses);
  const executionProvenance = executionProvenanceFrom(modelOwnedStageStatuses);
  const failedAdapterStages = modelOwnedStageStatuses.filter((stage) => stage.adapter_status !== "ok");
  const qualityFailures = findings.filter((finding) => finding.severity === "fail");
  const ok =
    acceptableFinalStates(targetStage).includes(String(runRecord.state)) &&
    failedAdapterStages.length === 0 &&
    qualityFailures.length === 0 &&
    requiredArtifactsPresent(artifacts, expectedArtifactTypes);
  const report: LiveQualityReport = {
    ok,
    run_id: typeof runRecord.run_id === "string" ? runRecord.run_id : run.run_id,
    run_dir: run.run_dir,
    target_stage: targetStage,
    final_state: String(runRecord.state),
    model_owned_stage_statuses: modelOwnedStageStatuses,
    tool_use_policy: toolUsePolicy,
    tool_use_summary: toolUseSummary,
    execution_provenance: executionProvenance,
    artifact_scores: artifactScores,
    findings
  };

  await writeFile(
    path.join(run.run_dir, "live-quality-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );

  return report;
}

function scoreProductBrief(
  artifact: Record<string, any> | null,
  input: Record<string, any>,
  scores: LiveQualityReport["artifact_scores"],
  findings: QualityFinding[]
): void {
  const payload = artifact?.payload ?? {};
  let score = baseArtifactScore("ProductBrief", artifact, scores, findings);
  const maxScore = 9;
  const claimPolicy = typeof payload.claim_policy === "string" ? payload.claim_policy : "";
  const inputClaimPolicy = typeof input.claim_policy === "string" ? input.claim_policy : "";

  score += requireString("ProductBrief", "product_name", payload.product_name, findings);
  score += requireArray("ProductBrief", "audiences", payload.audiences, findings);
  score += requireString("ProductBrief", "core_problem", payload.core_problem, findings);
  score += requireArray("ProductBrief", "value_props", payload.value_props, findings);
  score += requireString("ProductBrief", "cta_goal", payload.cta_goal, findings);
  score += scoreProofInputsByPolicy(payload, input, findings);

  if (payload.product_name === input.product_name) {
    score += 1;
  } else {
    findings.push({
      severity: "warn",
      artifact_type: "ProductBrief",
      criterion: "input-alignment",
      summary: "ProductBrief.product_name does not preserve the normalized input product_name."
    });
  }

  if (["proof-required", "low-proof", "no-claims"].includes(claimPolicy)) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "ProductBrief",
      criterion: "claim-policy",
      summary: "ProductBrief.claim_policy must be one of the supported claim policy values."
    });
  }

  if (["proof-required", "low-proof", "no-claims"].includes(inputClaimPolicy) && claimPolicy !== inputClaimPolicy) {
    findings.push({
      severity: "fail",
      artifact_type: "ProductBrief",
      criterion: "claim-policy-alignment",
      summary: "ProductBrief.claim_policy must preserve the normalized input claim_policy."
    });
  }

  scores.ProductBrief = withMax(scores.ProductBrief, score, maxScore);
}

function scoreBrandProfile(
  artifact: Record<string, any> | null,
  input: Record<string, any>,
  scores: LiveQualityReport["artifact_scores"],
  findings: QualityFinding[]
): void {
  const payload = artifact?.payload ?? {};
  let score = baseArtifactScore("BrandProfile", artifact, scores, findings);
  const maxScore = 7;

  score += requireArray("BrandProfile", "brand_traits", payload.brand_traits, findings);
  score += requireArray("BrandProfile", "tone_keywords", payload.tone_keywords, findings);
  score += requireArray("BrandProfile", "visual_directions", payload.visual_directions, findings);
  score += requireString("BrandProfile", "positioning", payload.positioning, findings);

  const doNotUse = Array.isArray(payload.do_not_use) ? payload.do_not_use : [];
  const inputDoNotUse = Array.isArray(input.do_not_use) ? input.do_not_use : [];
  const visualDirections = stringArray(payload.visual_directions);
  const inputVisualDirections = stringArray(input.visual_directions);

  if (inputDoNotUse.every((item) => doNotUse.includes(item))) {
    score += 1;
  } else {
    findings.push({
      severity: "warn",
      artifact_type: "BrandProfile",
      criterion: "brand-constraints",
      summary: "BrandProfile.do_not_use does not preserve every normalized input constraint."
    });
  }

  if (!containsPlaceholder(payload)) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "BrandProfile",
      criterion: "placeholder-free",
      summary: "BrandProfile contains placeholder-like language."
    });
  }

  scoreVisualDirectionPreservation("BrandProfile", inputVisualDirections, visualDirections, findings);

  scores.BrandProfile = withMax(scores.BrandProfile, score, maxScore);
}

function scorePagePlan(
  artifact: Record<string, any> | null,
  input: Record<string, any>,
  scores: LiveQualityReport["artifact_scores"],
  findings: QualityFinding[]
): void {
  const payload = artifact?.payload ?? {};
  let score = baseArtifactScore("PagePlan", artifact, scores, findings);
  const maxScore = 8;
  const sectionIntents = Array.isArray(payload.section_intents) ? payload.section_intents : [];

  score += requireString("PagePlan", "page_goal", payload.page_goal, findings);
  score += requireString("PagePlan", "narrative_arc", payload.narrative_arc, findings);
  score += requireArray("PagePlan", "section_intents", sectionIntents, findings);
  score += requireString("PagePlan", "cta_strategy", payload.cta_strategy, findings);
  score += requireString("PagePlan", "proof_strategy", payload.proof_strategy, findings);

  if (sectionIntents.length >= 3) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "PagePlan",
      criterion: "section-coverage",
      summary: "PagePlan should include at least three section intents for a landing page."
    });
  }

  const ctaAlignment = ctaAlignmentDetails(input.cta_goal, payload.cta_strategy);

  if (ctaAlignment.ok) {
    score += 1;
  } else {
    findings.push({
      severity: "warn",
      artifact_type: "PagePlan",
      criterion: "cta-alignment",
      summary: "PagePlan.cta_strategy appears weakly aligned with the normalized input CTA goal.",
      details: ctaAlignment
    });
  }

  scores.PagePlan = withMax(scores.PagePlan, score, maxScore);
}

function scoreSectionGraph(
  artifact: Record<string, any> | null,
  productBrief: Record<string, any> | null,
  scores: LiveQualityReport["artifact_scores"],
  findings: QualityFinding[]
): void {
  const payload = artifact?.payload ?? {};
  let score = baseArtifactScore("SectionGraph", artifact, scores, findings);
  const maxScore = 8;
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
  const sectionOrder = Array.isArray(payload.section_order) ? payload.section_order : [];
  const nodeIds = new Set(nodes.map((node: Record<string, any>) => node.section_id));

  score += requireArray("SectionGraph", "nodes", nodes, findings);
  score += requireArray("SectionGraph", "section_order", sectionOrder, findings);

  if (sectionOrder.every((sectionId: string) => nodeIds.has(sectionId))) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "SectionGraph",
      criterion: "graph-integrity",
      summary: "SectionGraph.section_order references missing node ids."
    });
  }

  if (nodes.some((node: Record<string, any>) => node.section_type === "hero")) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "SectionGraph",
      criterion: "landing-structure",
      summary: "SectionGraph must include a hero section for the landing page path."
    });
  }

  if (nodes.some((node: Record<string, any>) => node.section_type === "cta")) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "SectionGraph",
      criterion: "landing-structure",
      summary: "SectionGraph must include a CTA section for the landing page path."
    });
  }

  const claimPolicy = productBrief?.payload?.claim_policy ?? payload.claim_policy;
  const proofBindings = Array.isArray(payload.proof_bindings) ? payload.proof_bindings : [];

  if (claimPolicy !== "proof-required" || proofBindings.length > 0) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "SectionGraph",
      criterion: "proof-binding",
      summary: "SectionGraph.proof_bindings must not be empty when claim_policy is proof-required."
    });
  }

  if (!containsPlaceholder(payload)) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "SectionGraph",
      criterion: "placeholder-free",
      summary: "SectionGraph contains placeholder-like language."
    });
  }

  scores.SectionGraph = withMax(scores.SectionGraph, score, maxScore);
}

function scoreThemeTokens(
  artifact: Record<string, any> | null,
  input: Record<string, any>,
  brandProfile: Record<string, any> | null,
  scores: LiveQualityReport["artifact_scores"],
  findings: QualityFinding[]
): void {
  const payload = artifact?.payload ?? {};
  let score = baseArtifactScore("ThemeTokens", artifact, scores, findings);
  const maxScore = 8;
  const colors = payload.colors ?? {};

  score += requireObject("ThemeTokens", "colors", colors, findings);
  score += requireObject("ThemeTokens", "typography", payload.typography, findings);
  score += requireObject("ThemeTokens", "spacing", payload.spacing, findings);
  score += requireObject("ThemeTokens", "radii", payload.radii, findings);
  score += requireObject("ThemeTokens", "motion", payload.motion, findings);

  if (["background", "surface", "text", "accent"].every((key) => typeof colors[key] === "string" && colors[key].length > 0)) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "ThemeTokens",
      criterion: "color-token-completeness",
      summary: "ThemeTokens.colors must include background, surface, text, and accent."
    });
  }

  if (!isPurpleBlueGradientDefault(colors)) {
    score += 1;
  } else {
    findings.push({
      severity: "fail",
      artifact_type: "ThemeTokens",
      criterion: "anti-slop",
      summary: "ThemeTokens appear to default to a generic purple-blue gradient palette."
    });
  }

  scoreThemeVisualDirectionSignals(artifact, input, brandProfile, findings);

  scores.ThemeTokens = withMax(scores.ThemeTokens, score, maxScore);
}

function scoreProofInputsByPolicy(
  payload: Record<string, any>,
  input: Record<string, any>,
  findings: QualityFinding[]
): number {
  const claimPolicy = typeof payload.claim_policy === "string" ? payload.claim_policy : "";
  const proofInputs = stringArray(payload.proof_inputs);
  const inputProofInputs = stringArray(input.proof_inputs);

  if (!["proof-required", "low-proof", "no-claims"].includes(claimPolicy)) {
    return 0;
  }

  if (claimPolicy === "proof-required") {
    if (proofInputs.length === 0) {
      findings.push({
        severity: "fail",
        artifact_type: "ProductBrief",
        criterion: "proof-inputs",
        summary: "ProductBrief.proof_inputs must be non-empty when claim_policy is proof-required."
      });
      return 0;
    }

    if (inputProofInputs.length > 0 && !hasAnyMeaningfulOverlap(inputProofInputs, proofInputs)) {
      findings.push({
        severity: "fail",
        artifact_type: "ProductBrief",
        criterion: "proof-input-alignment",
        summary: "ProductBrief.proof_inputs must retain at least one normalized input proof reference."
      });
      return 0;
    }

    if (inputProofInputs.length > 0 && !inputProofInputs.every((proofInput) => hasMeaningfulOverlap(proofInput, proofInputs))) {
      findings.push({
        severity: "warn",
        artifact_type: "ProductBrief",
        criterion: "proof-input-coverage",
        summary: "ProductBrief.proof_inputs did not retain every normalized input proof reference."
      });
    }

    return 1;
  }

  if ((claimPolicy === "low-proof" || claimPolicy === "no-claims") && inputProofInputs.length === 0 && proofInputs.length > 0) {
    findings.push({
      severity: "fail",
      artifact_type: "ProductBrief",
      criterion: "proof-invention",
      summary: "ProductBrief.proof_inputs must stay empty when the input provides no proof references."
    });
    return 0;
  }

  return 1;
}

function scoreVisualDirectionPreservation(
  artifactType: string,
  inputVisualDirections: string[],
  outputVisualDirections: string[],
  findings: QualityFinding[]
): void {
  if (inputVisualDirections.length === 0 || outputVisualDirections.length === 0) {
    return;
  }

  const dominantDirection = dominantKnownDirection(inputVisualDirections);
  const outputJoined = outputVisualDirections.join(" ");

  if (dominantDirection && !includesDirectionSignal(outputJoined, dominantDirection)) {
    findings.push({
      severity: "fail",
      artifact_type: artifactType,
      criterion: "visual-direction-preservation",
      summary: `${artifactType}.visual_directions must preserve the input ${dominantDirection} direction.`
    });
    return;
  }

  if (!hasAnyMeaningfulOverlap(inputVisualDirections, outputVisualDirections)) {
    findings.push({
      severity: "warn",
      artifact_type: artifactType,
      criterion: "visual-direction-preservation",
      summary: `${artifactType}.visual_directions appear weakly aligned with the normalized input visual directions.`
    });
  }
}

function scoreThemeVisualDirectionSignals(
  artifact: Record<string, any> | null,
  input: Record<string, any>,
  brandProfile: Record<string, any> | null,
  findings: QualityFinding[]
): void {
  if (!artifact) {
    return;
  }

  const payload = artifact.payload ?? {};
  const inputDirections = stringArray(input.visual_directions);
  const brandDirections = stringArray(brandProfile?.payload?.visual_directions);
  const dominantDirection = dominantKnownDirection([...inputDirections, ...brandDirections]);

  if (!dominantDirection) {
    return;
  }

  const colors = typeof payload.colors === "object" && payload.colors !== null ? payload.colors : {};
  const tokenText = normalizedText(payload);

  if (dominantDirection === "terminal" && !hasTerminalTokenSignal(colors, tokenText)) {
    findings.push({
      severity: "fail",
      artifact_type: "ThemeTokens",
      criterion: "visual-direction-signal",
      summary: "ThemeTokens must show terminal-specific signals for terminal visual direction."
    });
  }

  if (dominantDirection === "bauhaus" && !hasBauhausTokenSignal(colors, payload, tokenText)) {
    findings.push({
      severity: "fail",
      artifact_type: "ThemeTokens",
      criterion: "visual-direction-signal",
      summary: "ThemeTokens must show Bauhaus-specific signals for bauhaus visual direction."
    });
  }

  if (dominantDirection === "industrial" && !hasIndustrialTokenSignal(colors, tokenText)) {
    findings.push({
      severity: "fail",
      artifact_type: "ThemeTokens",
      criterion: "visual-direction-signal",
      summary: "ThemeTokens must show industrial-specific signals for industrial visual direction."
    });
  }
}

function scoreCrossArtifactConsistency(
  artifacts: Record<string, Record<string, any> | null>,
  expectedArtifactTypes: string[],
  findings: QualityFinding[]
): void {
  const runIds = expectedArtifactTypes
    .map((artifactType) => artifacts[artifactType])
    .filter(Boolean)
    .map((artifact) => artifact?.run_id);
  const uniqueRunIds = new Set(runIds);

  if (uniqueRunIds.size > 1) {
    findings.push({
      severity: "fail",
      criterion: "run-consistency",
      summary: "Live Codex artifacts do not all share the same run_id."
    });
  }
}

function baseArtifactScore(
  artifactType: string,
  artifact: Record<string, any> | null,
  scores: LiveQualityReport["artifact_scores"],
  findings: QualityFinding[]
): number {
  if (!artifact) {
    findings.push({
      severity: "fail",
      artifact_type: artifactType,
      criterion: "presence",
      summary: `${artifactType} was not materialized by the live run.`
    });
    scores[artifactType] = {
      present: false,
      status: "missing",
      score: 0,
      max_score: 1
    };
    return 0;
  }

  if (artifact.status !== "validated") {
    findings.push({
      severity: "fail",
      artifact_type: artifactType,
      criterion: "validation-status",
      summary: `${artifactType} status is ${artifact.status}, expected validated.`
    });
    scores[artifactType] = {
      present: true,
      status: String(artifact.status),
      score: 0,
      max_score: 1
    };
    return 0;
  }

  return 1;
}

function requireString(
  artifactType: string,
  field: string,
  value: unknown,
  findings: QualityFinding[]
): number {
  if (typeof value === "string" && value.trim().length > 0 && !looksPlaceholder(value)) {
    return 1;
  }

  findings.push({
    severity: "fail",
    artifact_type: artifactType,
    criterion: `payload.${field}`,
    summary: `${artifactType}.${field} must be non-empty and not placeholder-like.`
  });
  return 0;
}

function requireArray(
  artifactType: string,
  field: string,
  value: unknown,
  findings: QualityFinding[]
): number {
  if (Array.isArray(value) && value.length > 0 && !containsPlaceholder(value)) {
    return 1;
  }

  findings.push({
    severity: "fail",
    artifact_type: artifactType,
    criterion: `payload.${field}`,
    summary: `${artifactType}.${field} must be a non-empty array without placeholder-like values.`
  });
  return 0;
}

function requireObject(
  artifactType: string,
  field: string,
  value: unknown,
  findings: QualityFinding[]
): number {
  if (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
    return 1;
  }

  findings.push({
    severity: "fail",
    artifact_type: artifactType,
    criterion: `payload.${field}`,
    summary: `${artifactType}.${field} must be a non-empty object.`
  });
  return 0;
}

function withMax(
  prior: { present: boolean; status?: string; score: number; max_score: number } | undefined,
  score: number,
  maxScore: number
): { present: boolean; status?: string; score: number; max_score: number } {
  return {
    present: prior?.present ?? true,
    status: prior?.status ?? "validated",
    score: Math.min(score, maxScore),
    max_score: maxScore
  };
}

async function readArtifacts(runDir: string): Promise<Record<string, Record<string, any> | null>> {
  const entries: Record<string, Record<string, any> | null> = {};

  for (const [artifactType, fileName] of Object.entries(ARTIFACT_FILES)) {
    entries[artifactType] = await readJsonIfPresent(path.join(runDir, "artifacts", fileName));
  }

  return entries;
}

async function readModelOwnedStageStatuses(
  runDir: string,
  targetStage: string
): Promise<LiveQualityReport["model_owned_stage_statuses"]> {
  const statuses: LiveQualityReport["model_owned_stage_statuses"] = [];
  const targetIndex = MODEL_OWNED_STAGES.indexOf(targetStage);
  const stages = targetIndex === -1 ? MODEL_OWNED_STAGES : MODEL_OWNED_STAGES.slice(0, targetIndex + 1);

  for (const stage of stages) {
    const adapterResult = await readJsonIfPresent(path.join(runDir, "stages", stage, "adapter-result.json"));
    const candidates = Array.isArray(adapterResult?.produced_artifact_candidates)
      ? adapterResult.produced_artifact_candidates
      : [];
    const usage = typeof adapterResult?.usage === "object" && adapterResult.usage !== null
      ? adapterResult.usage as Record<string, unknown>
      : {};
    const args = stringArray(usage.args);

    statuses.push({
      stage,
      adapter_status: typeof adapterResult?.status === "string" ? adapterResult.status : null,
      attempt_id: typeof usage.attempt_id === "string" ? usage.attempt_id : undefined,
      attempt_dir: typeof usage.attempt_dir === "string" ? usage.attempt_dir : undefined,
      tool_use_observed:
        typeof usage.tool_use_observed === "boolean"
          ? usage.tool_use_observed
          : undefined,
      produced_artifact_types: candidates
        .map((candidate: Record<string, unknown>) => candidate.artifact_type)
        .filter((artifactType: unknown): artifactType is string => typeof artifactType === "string"),
      failure_mode: typeof adapterResult?.failure_mode === "string" ? adapterResult.failure_mode : undefined,
      command: typeof usage.command === "string" ? usage.command : undefined,
      args,
      configured_model:
        typeof usage.configured_model === "string" ? usage.configured_model : configuredModelFromArgs(args),
      configured_reasoning_effort:
        typeof usage.configured_reasoning_effort === "string" ? usage.configured_reasoning_effort : null,
      timeout_ms: numberValue(usage.timeout_ms),
      workdir: typeof usage.workdir === "string" ? usage.workdir : undefined,
      duration_ms: numberValue(usage.duration_ms),
      timed_out: typeof usage.timed_out === "boolean" ? usage.timed_out : undefined,
      exit_code: nullableNumberValue(usage.exit_code),
      signal: typeof usage.signal === "string" ? usage.signal : null,
      extraction_error_count: numberValue(usage.extraction_error_count),
      codex_version:
        typeof usage.codex_version === "string"
          ? usage.codex_version
          : codexVersionFromTranscript(adapterResult?.stdout, adapterResult?.stderr),
      workspace_inspection_policy:
        typeof usage.workspace_inspection_policy === "string" ? usage.workspace_inspection_policy : undefined
    });
  }

  return statuses;
}

function scoreToolUsePolicy(
  statuses: LiveQualityReport["model_owned_stage_statuses"],
  policy: ToolUsePolicy,
  findings: QualityFinding[]
): void {
  const toolUseStages = statuses
    .filter((status) => status.tool_use_observed === true)
    .map((status) => status.stage);

  if (toolUseStages.length === 0) {
    return;
  }

  const severity = policy === "fail" ? "fail" : policy === "warn" ? "warn" : "info";
  findings.push({
    severity,
    criterion: "ambient-tool-use",
    summary:
      policy === "fail"
        ? `Live quality requires bundle-only execution; tool use was observed in: ${toolUseStages.join(", ")}.`
        : `Live quality observed ambient tool use in: ${toolUseStages.join(", ")}.`
  });
}

function toolUseSummaryFrom(
  statuses: LiveQualityReport["model_owned_stage_statuses"]
): LiveQualityReport["tool_use_summary"] {
  const stages = statuses
    .filter((status) => status.tool_use_observed === true)
    .map((status) => status.stage);

  return {
    observed: stages.length > 0,
    stages
  };
}

function executionProvenanceFrom(
  statuses: LiveQualityReport["model_owned_stage_statuses"]
): ExecutionProvenance {
  const stages: StageExecutionProvenance[] = statuses.map((status) => ({
    stage: status.stage,
    command: status.command,
    args: status.args && status.args.length > 0 ? status.args : undefined,
    configured_model: status.configured_model,
    configured_reasoning_effort: status.configured_reasoning_effort,
    timeout_ms: status.timeout_ms,
    workdir: status.workdir,
    duration_ms: status.duration_ms,
    timed_out: status.timed_out,
    exit_code: status.exit_code,
    signal: status.signal,
    extraction_error_count: status.extraction_error_count,
    codex_version: status.codex_version,
    workspace_inspection_policy: status.workspace_inspection_policy,
    tool_use_observed: status.tool_use_observed
  }));

  return {
    codex_versions: uniqueStrings(stages.map((stage) => stage.codex_version)),
    configured_models: uniqueStrings(stages.map((stage) => stage.configured_model)),
    timeout_ms_values: uniqueNumbers(stages.map((stage) => stage.timeout_ms)),
    commands: uniqueStrings(stages.map((stage) => stage.command)),
    adapter_args: uniqueArgVectors(stages.map((stage) => stage.args ?? [])),
    stages
  };
}

function requiredArtifactsPresent(
  artifacts: Record<string, Record<string, any> | null>,
  expectedArtifactTypes: string[]
): boolean {
  return expectedArtifactTypes.every((artifactType) => artifacts[artifactType] !== null);
}

function artifactTypesForTargetStage(targetStage: string): string[] {
  const artifactTypes = ARTIFACTS_BY_TARGET_STAGE[targetStage];

  if (!artifactTypes) {
    throw new Error(`Unsupported live quality target stage: ${targetStage}`);
  }

  return artifactTypes;
}

function acceptableFinalStates(targetStage: string): string[] {
  return targetStage === DEFAULT_TARGET_STAGE ? ["stage_proved", "published"] : ["stage_proved"];
}

function containsPlaceholder(value: unknown): boolean {
  if (typeof value === "string") {
    return looksPlaceholder(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsPlaceholder(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).some((item) => containsPlaceholder(item));
  }

  return false;
}

function looksPlaceholder(value: string): boolean {
  return (
    /\b(todo|tbd|lorem|ipsum|placeholder|dummy|insert)\b/i.test(value) ||
    /\byour product\b(?!\s+name)/i.test(value) ||
    /\b(example|sample)\s+(copy|text|content|image|logo|testimonial|stat|metric)\b/i.test(value)
  );
}

function isPurpleBlueGradientDefault(colors: Record<string, unknown>): boolean {
  const joined = Object.values(colors).join(" ").toLowerCase();
  return (
    joined.includes("linear-gradient") &&
    (joined.includes("purple") || joined.includes("#8b5cf6") || joined.includes("#a855f7")) &&
    (joined.includes("blue") || joined.includes("#3b82f6") || joined.includes("#2563eb"))
  );
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function nullableNumberValue(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }

  return numberValue(value);
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))];
}

function uniqueNumbers(values: Array<number | undefined>): number[] {
  return [...new Set(values.filter((value): value is number => typeof value === "number"))];
}

function uniqueArgVectors(values: string[][]): string[][] {
  const seen = new Set<string>();
  const unique: string[][] = [];

  for (const value of values) {
    if (value.length === 0) {
      continue;
    }

    const key = JSON.stringify(value);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(value);
  }

  return unique;
}

function configuredModelFromArgs(args: string[]): string | null {
  const modelIndex = args.indexOf("--model");

  if (modelIndex !== -1 && typeof args[modelIndex + 1] === "string") {
    return args[modelIndex + 1];
  }

  return null;
}

function codexVersionFromTranscript(stdout: unknown, stderr: unknown): string | null {
  const transcript = `${typeof stdout === "string" ? stdout : ""}\n${typeof stderr === "string" ? stderr : ""}`;
  const match = transcript.match(/\bOpenAI Codex v([^\s]+)/);

  return match ? match[1] : null;
}

function toolUsePolicyFromEnv(): ToolUsePolicy {
  const policy = process.env.FUSERA_LIVE_TOOL_USE_POLICY ?? "fail";

  if (policy === "fail" || policy === "warn" || policy === "allow") {
    return policy;
  }

  throw new Error(`Unsupported FUSERA_LIVE_TOOL_USE_POLICY: ${policy}`);
}

function normalizedText(value: unknown): string {
  if (typeof value === "string") {
    return value.toLowerCase();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizedText(item)).join(" ");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, item]) => `${key} ${normalizedText(item)}`)
      .join(" ")
      .toLowerCase();
  }

  return String(value ?? "").toLowerCase();
}

const MEANINGLESS_TOKENS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "page",
  "landing",
  "visual",
  "direction",
  "style",
  "proof",
  "input",
  "inputs"
]);

function meaningfulTokens(value: string): string[] {
  return normalizedText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !MEANINGLESS_TOKENS.has(token));
}

function hasMeaningfulOverlap(source: string, candidates: string[]): boolean {
  const sourceText = normalizedText(source).trim();
  const candidateText = normalizedText(candidates);

  if (sourceText && candidateText.includes(sourceText)) {
    return true;
  }

  const candidateTokens = new Set(candidates.flatMap((candidate) => meaningfulTokens(candidate)));
  return meaningfulTokens(source).some((token) => candidateTokens.has(token));
}

function hasAnyMeaningfulOverlap(sources: string[], candidates: string[]): boolean {
  return sources.some((source) => hasMeaningfulOverlap(source, candidates));
}

function ctaAlignmentDetails(inputGoal: unknown, ctaStrategy: unknown): {
  ok: boolean;
  input_cta_goal: string;
  cta_strategy: string;
  input_tokens: string[];
  strategy_tokens: string[];
  matched_tokens: string[];
  required_match_count: number;
  action_token_matched: boolean;
} {
  const inputCtaGoal = typeof inputGoal === "string" ? inputGoal.trim() : "";
  const strategy = typeof ctaStrategy === "string" ? ctaStrategy.trim() : "";

  if (!inputCtaGoal) {
    return {
      ok: true,
      input_cta_goal: inputCtaGoal,
      cta_strategy: strategy,
      input_tokens: [],
      strategy_tokens: meaningfulTokens(strategy),
      matched_tokens: [],
      required_match_count: 0,
      action_token_matched: false
    };
  }

  const inputTokens = meaningfulTokens(inputCtaGoal);
  const strategyTokens = meaningfulTokens(strategy);
  const matchedTokens = inputTokens.filter((inputToken) =>
    strategyTokens.some((strategyToken) => equivalentToken(inputToken, strategyToken))
  );
  const actionToken = inputTokens[0];
  const actionTokenMatched = actionToken
    ? strategyTokens.some((strategyToken) => equivalentToken(actionToken, strategyToken))
    : false;
  const requiredMatchCount = Math.min(2, inputTokens.length);
  const normalizedStrategy = normalizedText(strategy);
  const normalizedGoal = normalizedText(inputCtaGoal);

  return {
    ok:
      normalizedStrategy.includes(normalizedGoal) ||
      actionTokenMatched ||
      matchedTokens.length >= requiredMatchCount,
    input_cta_goal: inputCtaGoal,
    cta_strategy: strategy,
    input_tokens: inputTokens,
    strategy_tokens: strategyTokens,
    matched_tokens: [...new Set(matchedTokens)],
    required_match_count: requiredMatchCount,
    action_token_matched: actionTokenMatched
  };
}

function equivalentToken(left: string, right: string): boolean {
  if (left === right) {
    return true;
  }

  const leftStem = tokenStem(left);
  const rightStem = tokenStem(right);

  return leftStem.length >= 4 && rightStem.length >= 4 && leftStem === rightStem;
}

function tokenStem(token: string): string {
  let stem = token.toLowerCase();

  if (stem.endsWith("ing") && stem.length > 5) {
    stem = stem.slice(0, -3);
  } else if (stem.endsWith("ed") && stem.length > 4) {
    stem = stem.slice(0, -2);
  } else if (stem.endsWith("es") && stem.length > 4) {
    stem = stem.slice(0, -2);
  } else if (stem.endsWith("s") && stem.length > 4) {
    stem = stem.slice(0, -1);
  }

  if (stem.endsWith("e") && stem.length > 4) {
    stem = stem.slice(0, -1);
  }

  return stem;
}

function dominantKnownDirection(directions: string[]): "bauhaus" | "industrial" | "terminal" | null {
  const joined = normalizedText(directions);

  if (includesDirectionSignal(joined, "bauhaus")) {
    return "bauhaus";
  }

  if (includesDirectionSignal(joined, "industrial")) {
    return "industrial";
  }

  if (includesDirectionSignal(joined, "terminal")) {
    return "terminal";
  }

  return null;
}

function includesDirectionSignal(text: string, direction: "bauhaus" | "industrial" | "terminal"): boolean {
  const signalText = text.replace(/[_-]+/g, " ");
  const patterns: Record<typeof direction, RegExp> = {
    bauhaus: /\b(bauhaus|geometric|primary|color\s+blocking|poster|hard\s+edge|hard\s+shadow)\b/i,
    industrial: /\b(industrial|mechanical|tactile|safety|caution|steel|metal|control\s*panel|factory)\b/i,
    terminal: /\b(terminal|console|command\s*line|shell|cli|monochrome|status)\b/i
  };

  return patterns[direction].test(signalText);
}

function hasTerminalTokenSignal(colors: Record<string, unknown>, tokenText: string): boolean {
  const hasTerminalVocabulary = /\b(terminal|console|command|shell|cli|status|prompt|green|cyan|lime)\b/i.test(tokenText);
  const hasDarkSurface = isDarkColor(colors.background) || isDarkColor(colors.surface);

  return hasTerminalVocabulary || (hasDarkSurface && /\b(mono|monospace|code)\b/i.test(tokenText));
}

function hasBauhausTokenSignal(
  colors: Record<string, unknown>,
  payload: Record<string, unknown>,
  tokenText: string
): boolean {
  const signalText = tokenText.replace(/[_-]+/g, " ");
  const hasBauhausVocabulary = includesDirectionSignal(signalText, "bauhaus");
  const hasHardEdges = /\b(hard|poster|block|0px|none)\b/i.test(normalizedText(payload.radii));
  const hasPrimaryColorSignal =
    /\b(primary|red|yellow|blue|bauhaus)\b/i.test(signalText) ||
    hasHueInRange(colors, 0, 45) ||
    hasHueInRange(colors, 70, 115) ||
    hasHueInRange(colors, 215, 285);

  return hasBauhausVocabulary || (hasHardEdges && hasPrimaryColorSignal);
}

function hasIndustrialTokenSignal(colors: Record<string, unknown>, tokenText: string): boolean {
  const hasIndustrialVocabulary = includesDirectionSignal(tokenText, "industrial");
  const hasSafetyAccent =
    /\b(safety|caution|amber|orange|yellow|hazard)\b/i.test(tokenText) || hasHueInRange({ accent: colors.accent }, 30, 95);

  return hasIndustrialVocabulary || hasSafetyAccent;
}

function hasHueInRange(colors: Record<string, unknown>, min: number, max: number): boolean {
  return Object.values(colors)
    .filter((value): value is string => typeof value === "string")
    .some((value) => {
      const hue = oklchHue(value) ?? hexHue(value);
      return hue !== null && hue >= min && hue <= max;
    });
}

function isDarkColor(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const lightness = oklchLightness(value);

  if (lightness !== null) {
    return lightness < 45;
  }

  const luminance = hexLuminance(value);
  return luminance !== null && luminance < 0.22;
}

function oklchLightness(value: string): number | null {
  const match = value.match(/oklch\(\s*([0-9.]+)(%)?/i);

  if (!match) {
    return null;
  }

  let lightness = Number(match[1]);

  if (!match[2] && lightness <= 1) {
    lightness *= 100;
  }

  return Number.isFinite(lightness) ? lightness : null;
}

function oklchHue(value: string): number | null {
  const match = value.match(/oklch\(\s*[0-9.]+%?\s+[0-9.]+%?\s+([0-9.]+)/i);

  if (!match) {
    return null;
  }

  const hue = Number(match[1]);
  return Number.isFinite(hue) ? hue : null;
}

function hexHue(value: string): number | null {
  const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!match) {
    return null;
  }

  const hex = match[1].length === 3
    ? match[1].split("").map((part) => `${part}${part}`).join("")
    : match[1];
  const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) {
    return null;
  }

  let hue = 0;

  if (max === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (max === green) {
    hue = 60 * ((blue - red) / delta + 2);
  } else {
    hue = 60 * ((red - green) / delta + 4);
  }

  return hue < 0 ? hue + 360 : hue;
}

function hexLuminance(value: string): number | null {
  const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!match) {
    return null;
  }

  const hex = match[1].length === 3
    ? match[1].split("").map((part) => `${part}${part}`).join("")
    : match[1];
  const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
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
  const args = process.argv.slice(2);
  const useExistingRun = args[0] === "--run-dir";
  const runDir = useExistingRun ? args[1] : undefined;
  const inputPath = useExistingRun ? args[3] : args[0];
  const targetStage = useExistingRun ? args[2] : args[1];

  if (useExistingRun && !runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/verify-live-codex-quality.ts --run-dir <run-dir> [target-stage] [input.json]");
    process.exit(1);
  }

  const report = await verifyLiveCodexQuality({
    inputPath: inputPath || undefined,
    targetStage: targetStage || undefined,
    runDir
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
