import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { CODEX_CAPABILITIES } from "./capabilities.ts";
import { extractAdapterOutputFromText } from "./extract-artifacts.ts";
import type {
  CodexAdapter,
  CodexInvocationBundle,
  CodexInvocationResult
} from "./adapter.ts";

const RUNNER_OWNED_ARTIFACT_TYPES = new Set(["PageSpec", "QAReport", "PublishVersion"]);

export class RealCodexAdapter implements CodexAdapter {
  id = "codex" as const;
  capabilities = CODEX_CAPABILITIES;

  async invoke(bundle: CodexInvocationBundle): Promise<CodexInvocationResult> {
    const startedAt = Date.now();
    const command = process.env.FUSERA_CODEX_COMMAND ?? "codex";
    let args: string[] = [];
    let timeoutMs = 120000;

    try {
      args = configuredArgs();
      timeoutMs = numberFrom(process.env.FUSERA_CODEX_TIMEOUT_MS, 120000);
      const prompt = await buildPrompt(bundle);
      const workdir = codexWorkdir();
      const processResult = await runProcess({
        command,
        args,
        stdin: prompt,
        cwd: workdir,
        timeoutMs
      });
      const extraction = extractAdapterOutputFromText(processResult.stdout);
      const durationMs = Date.now() - startedAt;
      const toolUseObserved = observedToolUse(processResult.stdout, processResult.stderr);
      const baseUsage = adapterUsage({
        command,
        args,
        durationMs,
        timeoutMs,
        workdir,
        processResult,
        extractionErrorCount: extraction.errors.length,
        toolUseObserved
      });

      if (processResult.timedOut || processResult.stdinError) {
        return {
          status: "failed",
          stdout: processResult.stdout,
          stderr: appendLine(processResult.stderr, processResult.stdinError),
          usage: {
            ...baseUsage,
            timed_out: processResult.timedOut,
            stdin_error: processResult.stdinError
          },
          attachments: [],
          produced_artifact_candidates: [],
          failure_mode: "invocation_failure"
        };
      }

      if (processResult.exitCode !== 0) {
        return {
          status: "failed",
          stdout: processResult.stdout,
          stderr: processResult.stderr,
          usage: baseUsage,
          attachments: extraction.attachments,
          produced_artifact_candidates: extraction.candidates,
          failure_mode: "invocation_failure"
        };
      }

      if (
        extraction.errors.length > 0 &&
        extraction.candidates.length === 0 &&
        extraction.attachments.length === 0
      ) {
        return {
          status: "failed",
          stdout: processResult.stdout,
          stderr: `${processResult.stderr}${processResult.stderr ? "\n" : ""}${extraction.errors.join("\n")}`,
          usage: baseUsage,
          attachments: [],
          produced_artifact_candidates: [],
          failure_mode: "extraction_failure"
        };
      }

      if (bundle.stage === "normalize-input" && !hasNormalizedInputAttachment(extraction.attachments)) {
        return {
          status: "failed",
          stdout: processResult.stdout,
          stderr: appendLine(processResult.stderr, "Missing normalized_input_bundle attachment"),
          usage: baseUsage,
          attachments: extraction.attachments,
          produced_artifact_candidates: extraction.candidates,
          failure_mode: "missing_output"
        };
      }

      return {
        status: "ok",
        stdout: processResult.stdout,
        stderr: processResult.stderr,
        usage: baseUsage,
        attachments: extraction.attachments,
        produced_artifact_candidates: extraction.candidates
      };
    } catch (error) {
      return {
        status: "failed",
        stdout: "",
        stderr: (error as Error).message,
        usage: {
          mode: "real",
          command,
          args,
          duration_ms: Date.now() - startedAt,
          timeout_ms: timeoutMs,
          workdir: codexWorkdir(),
          configured_model: configuredModel(args),
          configured_reasoning_effort: process.env.FUSERA_CODEX_REASONING_EFFORT,
          workspace_inspection_policy: workspaceInspectionPolicy(),
          codex_version: null,
          tool_use_observed: false
        },
        attachments: [],
        produced_artifact_candidates: [],
        failure_mode: "invocation_failure"
      };
    }
  }
}

function configuredArgs(): string[] {
  if (process.env.FUSERA_CODEX_ARGS_JSON) {
    const parsed = JSON.parse(process.env.FUSERA_CODEX_ARGS_JSON);

    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      throw new Error("FUSERA_CODEX_ARGS_JSON must be a JSON string array");
    }

    return parsed;
  }

  const args = [
    "exec",
    "--skip-git-repo-check",
    "--sandbox",
    "read-only"
  ];
  const model = process.env.FUSERA_CODEX_MODEL;

  if (model) {
    args.push("--model", model);
  }

  const reasoningEffort = process.env.FUSERA_CODEX_REASONING_EFFORT;

  if (reasoningEffort) {
    args.push("--config", `model_reasoning_effort="${reasoningEffort}"`);
  }

  args.push("-");

  return args;
}

async function buildPrompt(bundle: CodexInvocationBundle): Promise<string> {
  const runId = typeof bundle.run.run_id === "string" ? bundle.run.run_id : "";
  const expectedStableOutputs = expectedArtifactTypes(bundle);
  const outputContracts = await loadOutputContracts(bundle.output_contract_refs);
  const protocolLines =
    bundle.stage === "normalize-input"
      ? [
          "For normalize-input, emit one run-owned attachment block.",
          "The attachment block uses markdown fence info string fusera-attachment-json.",
          "Its JSON shape is { kind: \"normalized_input_bundle\", file_name: \"normalized-input.json\", body: { bundle_type: \"normalized_input_bundle\", payload: <normalized input object> } }.",
          "Do not wrap the normalized input in a stable artifact envelope."
        ]
      : expectedStableOutputs.length === 0
        ? [
            "This stage is runner-owned in P1.",
            "Do not emit stable artifact fences or attachment fences for this stage.",
            "Return an empty response if no adapter-owned output is requested."
          ]
      : [
          "For stable artifacts, emit each artifact candidate in a markdown fence whose info string is fusera-artifact-json.",
          `Expected stable artifact types for this stage: ${expectedStableOutputs.join(", ") || "none"}.`,
          `Every artifact candidate must use run_id exactly ${runId}.`,
          `Every artifact candidate must use producer_stage exactly ${bundle.stage}.`,
          "Every artifact candidate starts with status draft and validation { valid: false, errors: [] }.",
          "Obey output_contract_schemas before emitting stable artifact candidates.",
          "Use simple artifact_id values; do not compute hashes or inspect naming conventions.",
          "Do not emit protocol examples; emit only real candidate blocks for this run."
        ];

  return [
    "You are the Fusera P1 Codex adapter worker.",
    `Current run_id: ${runId}.`,
    `Current stage: ${bundle.stage}.`,
    "Return only the outputs requested by the invocation bundle. Do not include prose outside output fences.",
    workspaceInspectionInstruction(),
    "Prefer the smallest valid JSON that satisfies the contract and pack handoff. Keep each output under 120 lines.",
    ...protocolLines,
    "Each output fence must contain one parseable JSON object and no comments.",
    "Do not write files. Do not mutate the workspace. The harness validates and persists artifacts.",
    "Invocation bundle:",
    JSON.stringify(compactBundle(bundle, outputContracts), null, 2)
  ].join("\n\n");
}

async function loadOutputContracts(refs: string[]): Promise<Array<Record<string, unknown>>> {
  const contracts: Array<Record<string, unknown>> = [];

  for (const ref of refs) {
    if (!ref.endsWith(".json")) {
      contracts.push({
        ref,
        kind: "logical-contract"
      });
      continue;
    }

    try {
      contracts.push({
        ref,
        schema: JSON.parse(await readFile(ref, "utf8"))
      });
    } catch (error) {
      contracts.push({
        ref,
        load_error: (error as Error).message
      });
    }
  }

  return contracts;
}

function expectedArtifactTypes(bundle: CodexInvocationBundle): string[] {
  const allowedOutputs = bundle.stage_profile.allowed_outputs;

  if (!Array.isArray(allowedOutputs)) {
    return [];
  }

  return allowedOutputs.filter(
    (output): output is string => typeof output === "string" && !RUNNER_OWNED_ARTIFACT_TYPES.has(output)
  );
}

function compactBundle(
  bundle: CodexInvocationBundle,
  outputContracts: Array<Record<string, unknown>>
): Record<string, unknown> {
  return {
    stage: bundle.stage,
    selected_pack_ids: bundle.selected_pack_ids,
    stage_profile: bundle.stage_profile,
    compiled_packs: bundle.compiled_packs.map((pack) => ({
      pack_id: pack.pack_id,
      backend: pack.backend,
      manifest: pack.manifest,
      skill_source: pack.skill_source,
      reference_sources: pack.reference_sources ?? [],
      reference_budget: pack.reference_budget ?? null
    })),
    run: bundle.run,
    normalized_input_bundle: bundle.normalized_input_bundle,
    input_artifact_refs: bundle.input_artifact_refs,
    materialized_artifacts: bundle.materialized_artifacts,
    output_contract_refs: bundle.output_contract_refs,
    output_contract_schemas: outputContracts,
    repair_directives: bundle.repair_directives ?? []
  };
}

function hasNormalizedInputAttachment(attachments: unknown[]): boolean {
  return attachments.some(
    (attachment) =>
      typeof attachment === "object" &&
      attachment !== null &&
      (attachment as Record<string, unknown>).kind === "normalized_input_bundle"
  );
}

type ProcessResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  stdinError?: string;
};

function runProcess(options: {
  command: string;
  args: string[];
  stdin: string;
  cwd: string;
  timeoutMs: number;
}): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(options.command, options.args, {
      cwd: options.cwd,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;
    let stdinError: string | undefined;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, options.timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.stdin.on("error", (error: NodeJS.ErrnoException) => {
      stdinError = `${error.code ?? "stdin_error"}: ${error.message}`;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        resolve({
          stdout,
          stderr,
          exitCode,
          signal,
          timedOut,
          stdinError
        });
      }
    });
    child.stdin.end(options.stdin);
  });
}

function appendLine(text: string, line?: string): string {
  if (!line) {
    return text;
  }

  return `${text}${text ? "\n" : ""}${line}`;
}

function adapterUsage(options: {
  command: string;
  args: string[];
  durationMs: number;
  timeoutMs: number;
  workdir: string;
  processResult: ProcessResult;
  extractionErrorCount: number;
  toolUseObserved: boolean;
}): Record<string, unknown> {
  return {
    mode: "real",
    command: options.command,
    args: options.args,
    duration_ms: options.durationMs,
    timeout_ms: options.timeoutMs,
    workdir: options.workdir,
    configured_model: configuredModel(options.args),
    configured_reasoning_effort: process.env.FUSERA_CODEX_REASONING_EFFORT,
    workspace_inspection_policy: workspaceInspectionPolicy(),
    codex_version: codexVersionFromTranscript(options.processResult.stdout, options.processResult.stderr),
    exit_code: options.processResult.exitCode,
    signal: options.processResult.signal,
    extraction_error_count: options.extractionErrorCount,
    tool_use_observed: options.toolUseObserved
  };
}

function codexWorkdir(): string {
  return process.env.FUSERA_CODEX_WORKDIR ?? process.cwd();
}

function observedToolUse(stdout: string, stderr: string): boolean {
  const transcript = `\n${stdout}\n${stderr}\n`;

  return (
    /\n\s*(exec|apply_patch|web\.run|functions\.[a-z_]+|mcp__[a-z0-9_]+__[a-z0-9_]+)\s*\n/i.test(transcript) ||
    /\n\s*[\w./-]+\s+(succeeded|exited\s+\d+)\s+in\s+\d+ms:/i.test(transcript)
  );
}

function workspaceInspectionInstruction(): string {
  if (workspaceInspectionPolicy() === "ambient-read-allowed") {
    return "Read-only workspace inspection is allowed when needed. Do not write files or mutate the workspace. Tool-use evidence is recorded from the adapter transcript.";
  }

  return "Use only the invocation bundle and embedded reference_sources. Do not inspect workspace files or call tools. Tool-use evidence is recorded from the adapter transcript.";
}

function workspaceInspectionPolicy(): "bundle-only" | "ambient-read-allowed" {
  return truthy(process.env.FUSERA_CODEX_ALLOW_WORKSPACE_INSPECTION)
    ? "ambient-read-allowed"
    : "bundle-only";
}

function configuredModel(args: string[]): string | null {
  const modelIndex = args.indexOf("--model");

  if (modelIndex !== -1 && typeof args[modelIndex + 1] === "string") {
    return args[modelIndex + 1];
  }

  return process.env.FUSERA_CODEX_MODEL ?? null;
}

function codexVersionFromTranscript(stdout: string, stderr: string): string | null {
  const match = `${stdout}\n${stderr}`.match(/\bOpenAI Codex v([^\s]+)/);
  return match ? match[1] : null;
}

function truthy(value: string | undefined): boolean {
  return value === "1" || value === "true" || value === "yes";
}

function numberFrom(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
