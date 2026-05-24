import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { CodexAdapterMode } from "../adapters/codex/adapter.ts";
import { formatCapabilityReportText, writeCapabilityReport } from "./capability-report.ts";
import { runCiIsolatedLive, runCiLive, runCiMock, runLiveStability } from "./ci-gates.ts";
import { checkLiveRunner } from "./check-live-runner.ts";
import { inspectRun, formatInspectionText } from "./inspect-run.ts";
import { continueStageProof, resumeFailedRun, runFixture, runStageProof } from "./run-stage.ts";
import { verifyLiveCodexQuality } from "./verify-live-codex-quality.ts";
import { verifyLivePreviewPublish } from "./verify-live-preview-publish.ts";
import { verifyP0Harness } from "./verify-p0-harness.ts";
import { buildHarnessTopologyGraph, writeHarnessTopologyGraph, writeRunEvidenceGraph } from "./harness-graph.ts";

type CliResult = Record<string, unknown>;
type DoctorCheck = {
  name: string;
  ok: boolean;
  details?: Record<string, unknown>;
  error?: string;
};

export async function runCli(argv = process.argv.slice(2)): Promise<CliResult> {
  const [command, subcommand, ...rest] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    return {
      ok: true,
      usage: usage()
    };
  }

  if (command === "run") {
    return runCommand(subcommand, rest);
  }

  if (command === "proof") {
    return proofCommand(subcommand, rest);
  }

  if (command === "continue") {
    return continueCommand(subcommand, rest);
  }

  if (command === "resume") {
    return resumeCommand(subcommand, rest);
  }

  if (command === "inspect") {
    return inspectCommand(subcommand, rest);
  }

  if (command === "verify") {
    return verifyCommand(subcommand, rest);
  }

  if (command === "ci") {
    return ciCommand(subcommand, rest);
  }

  if (command === "live-stability") {
    return liveStabilityCommand([subcommand, ...rest].filter((arg): arg is string => typeof arg === "string"));
  }

  if (command === "doctor") {
    return doctorCommand([subcommand, ...rest].filter((arg): arg is string => typeof arg === "string"));
  }

  if (command === "capability-report") {
    return capabilityReportCommand([subcommand, ...rest].filter((arg): arg is string => typeof arg === "string"));
  }

  if (command === "graph") {
    return graphCommand(subcommand, rest);
  }

  if (command === "skills") {
    return skillsCommand(subcommand, rest);
  }

  throw new Error(`Unknown command: ${command}\n\n${usage()}`);
}

async function runCommand(mode: string | undefined, args: string[]): Promise<CliResult> {
  const inputPath = positional(args, 0);

  if (mode === "mock-publish") {
    return withEnv({ FUSERA_CODEX_ADAPTER: "mock" }, async () => ({
      ok: true,
      command: "run mock-publish",
      result: await runFixture({
        inputPath,
        mode: "publish",
        adapterMode: "mock"
      })
    }));
  }

  if (mode === "qa-failure") {
    return withEnv({ FUSERA_CODEX_ADAPTER: "mock" }, async () => ({
      ok: true,
      command: "run qa-failure",
      result: await runFixture({
        inputPath,
        mode: "qa-failure",
        adapterMode: "mock"
      })
    }));
  }

  if (mode === "live-publish") {
    return withEnv({ FUSERA_CODEX_ADAPTER: "real" }, async () => {
      const result = await runFixture({
        inputPath,
        mode: "publish",
        adapterMode: "real"
      });
      const previewReport = await verifyLivePreviewPublish({
        runDir: result.run_dir
      });

      return {
        ok: previewReport.ok,
        command: "run live-publish",
        result,
        verification: {
          live_preview_publish_ok: previewReport.ok,
          report_path: path.join(result.run_dir, "live-preview-publish-report.json")
        }
      };
    });
  }

  throw new Error(`Unknown run mode: ${mode ?? "(missing)"}\n\n${usage()}`);
}

async function proofCommand(targetStage: string | undefined, args: string[]): Promise<CliResult> {
  if (!targetStage) {
    throw new Error(`proof requires a target stage\n\n${usage()}`);
  }

  const explicitAdapterMode = adapterModeFlag(args);
  const adapterMode = explicitAdapterMode ?? "mock";
  const inputPath = positional(args.filter((arg) => arg !== "--live" && arg !== "--mock"), 0);

  return withEnv({ FUSERA_CODEX_ADAPTER: adapterMode }, async () => ({
    ok: true,
    command: adapterMode === "real" ? "proof --live" : explicitAdapterMode === "mock" ? "proof --mock" : "proof",
    target_stage: targetStage,
    result: await runStageProof({
      targetStage,
      inputPath,
      adapterMode
    })
  }));
}

async function continueCommand(runDir: string | undefined, args: string[]): Promise<CliResult> {
  const targetStage = positional(args, 0);
  const adapterMode = adapterModeFlag(args);

  if (!runDir || !targetStage) {
    throw new Error(`continue requires a run directory and target stage\n\n${usage()}`);
  }

  return {
    ok: true,
    command: "continue",
    result: await continueStageProof({
      runDir,
      targetStage,
      adapterMode
    })
  };
}

async function resumeCommand(runDir: string | undefined, args: string[]): Promise<CliResult> {
  const adapterMode = adapterModeFlag(args);

  if (!runDir) {
    throw new Error(`resume requires a run directory\n\n${usage()}`);
  }

  return {
    ok: true,
    command: "resume",
    result: await resumeFailedRun({
      runDir,
      adapterMode
    })
  };
}

async function inspectCommand(runDir: string | undefined, args: string[]): Promise<CliResult> {
  if (!runDir) {
    throw new Error(`inspect requires a run directory\n\n${usage()}`);
  }

  const recentEventIndex = args.indexOf("--recent-events");
  const recentEventCount = recentEventIndex === -1 ? undefined : Number(args[recentEventIndex + 1]);
  const inspection = await inspectRun({
    runDir,
    recentEventCount: Number.isFinite(recentEventCount) ? recentEventCount : undefined,
    includeGraph: args.includes("--graph")
  });

  if (args.includes("--json")) {
    return {
      ok: true,
      command: "inspect",
      inspection
    };
  }

  return {
    ok: true,
    command: "inspect",
    text: formatInspectionText(inspection)
  };
}

async function verifyCommand(target: string | undefined, args: string[]): Promise<CliResult> {
  if (target === "p0") {
    const summary = await verifyP0Harness();

    return {
      ok: summary.ok,
      command: "verify p0",
      summary
    };
  }

  if (target === "live-preview") {
    const runDir = positional(args, 0);

    if (!runDir) {
      throw new Error("verify live-preview requires a run directory");
    }

    const report = await verifyLivePreviewPublish({ runDir });

    return {
      ok: report.ok,
      command: "verify live-preview",
      report
    };
  }

  if (target === "live-quality") {
    const runDir = positional(args, 0);
    const targetStage = positional(args, 1) ?? "design-system-pass";

    if (!runDir) {
      throw new Error("verify live-quality requires a run directory");
    }

    const report = await verifyLiveCodexQuality({
      runDir,
      targetStage
    });

    return {
      ok: report.ok,
      command: "verify live-quality",
      report
    };
  }

  throw new Error(`Unknown verify target: ${target ?? "(missing)"}\n\n${usage()}`);
}

async function ciCommand(target: string | undefined, args: string[]): Promise<CliResult> {
  if (target === "topology") {
    const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? process.cwd();
    const result = await writeHarnessTopologyGraph({ rootDir: sourceRoot });
    const graph = result.graph;
    const criticalDiagnostics = graph.diagnostics.filter((diagnostic) => diagnostic.severity === "critical");

    return {
      ok: criticalDiagnostics.length === 0,
      command: "ci topology",
      graph_path: result.graph_path,
      report_path: result.report_path,
      report: {
        graph_type: graph.graph_type,
        schema_version: graph.schema_version,
        nodes: graph.nodes.length,
        links: graph.links.length,
        diagnostics: graph.diagnostics.length,
        critical_diagnostics: criticalDiagnostics.map((diagnostic) => ({
          code: diagnostic.code,
          message: diagnostic.message,
          source_ref: diagnostic.source_ref
        }))
      }
    };
  }

  if (target === "mock") {
    const report = await runCiMock();

    return {
      ok: report.ok,
      command: "ci mock",
      report
    };
  }

  if (target === "live") {
    const inputPath = positionalWithoutValueFlags(args, 0, []);
    const report = await withEnv({ FUSERA_CODEX_ADAPTER: "real" }, () =>
      runCiLive({
        inputPath,
        adapterMode: "real"
      })
    );

    return {
      ok: report.ok,
      command: "ci live",
      report
    };
  }

  if (target === "isolated-live") {
    const caseIds = parseCaseFilter(positional(args, 0));
    const targetStage = positional(args, 1);
    const report = await runCiIsolatedLive({
      caseIds,
      targetStage
    });

    return {
      ok: report.ok,
      command: "ci isolated-live",
      report
    };
  }

  throw new Error(`Unknown ci target: ${target ?? "(missing)"}\n\n${usage()}`);
}

async function liveStabilityCommand(args: string[]): Promise<CliResult> {
  const runs = numberFlag(args, "--runs");
  const adapterMode: CodexAdapterMode = args.includes("--mock") ? "mock" : "real";
  const inputPath = positionalWithoutValueFlags(args, 0, ["--runs"]);
  const report = await withEnv({ FUSERA_CODEX_ADAPTER: adapterMode }, () =>
    runLiveStability({
      inputPath,
      iterations: runs,
      adapterMode
    })
  );

  return {
    ok: report.ok,
    command: "live-stability",
    report
  };
}

async function doctorCommand(args: string[]): Promise<CliResult> {
  const live = args.includes("--live");
  const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? process.cwd();
  const checks: DoctorCheck[] = [
    await checkReadable("artifact-schemas", path.join(sourceRoot, "superpowers/contracts/artifacts")),
    await checkReadable("pack-registry", path.join(sourceRoot, "superpowers/packs/registry.yaml")),
    await checkReadable("stage-profiles", path.join(sourceRoot, "superpowers/packs/stage-profiles.yaml")),
    await checkHarnessTopologyGraph(sourceRoot),
    await checkWritableRuntime(sourceRoot)
  ];

  let liveReport: Record<string, unknown> | undefined;

  if (live) {
    const report = await checkLiveRunner({
      rootDir: sourceRoot,
      authProbe: args.includes("--auth-probe"),
      strictGithubActions: args.includes("--strict-github-actions")
    });
    liveReport = report as unknown as Record<string, unknown>;
    checks.push(
      ...report.checks.map((check) => ({
        ...check,
        name: `live:${check.name}`
      }))
    );
  }

  return {
    ok: checks.every((check) => check.ok),
    command: "doctor --deep",
    source_root: sourceRoot,
    workspace_root: process.env.FUSERA_WORKSPACE_ROOT ?? process.cwd(),
    live,
    live_report: liveReport,
    checks
  };
}

async function capabilityReportCommand(args: string[]): Promise<CliResult> {
  const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? process.cwd();
  const runFlagIndex = args.indexOf("--run");
  const runDir = runFlagIndex === -1
    ? path.join(sourceRoot, ".fusera/runs", makeRunId())
    : args[runFlagIndex + 1];

  if (!runDir) {
    throw new Error(`capability-report --run requires a run directory\n\n${usage()}`);
  }

  const report = await writeCapabilityReport({
    rootDir: sourceRoot,
    runDir,
    phase: "post_resolution"
  });

  if (args.includes("--json")) {
    return {
      ok: report.ok,
      command: "capability-report",
      report
    };
  }

  return {
    ok: report.ok,
    command: "capability-report",
    text: formatCapabilityReportText(report)
  };
}

async function skillsCommand(subcommand: string | undefined, args: string[]): Promise<CliResult> {
  if (subcommand !== "install") {
    throw new Error(`Unknown skills command: ${subcommand ?? "(missing)"}\n\n${usage()}`);
  }

  const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? process.cwd();
  const scriptPath = path.join(sourceRoot, "scripts/install-skills.mjs");
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: sourceRoot,
    env: process.env,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || result.error?.message || "skills install failed");
  }

  return JSON.parse(result.stdout) as CliResult;
}

async function graphCommand(subcommand: string | undefined, _args: string[]): Promise<CliResult> {
  const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? process.cwd();

  if (subcommand === "harness") {
    const result = await writeHarnessTopologyGraph({
      rootDir: sourceRoot
    });

    return {
      ok: true,
      command: "graph harness",
      graph_path: result.graph_path,
      report_path: result.report_path,
      summary: {
        nodes: result.graph.nodes.length,
        links: result.graph.links.length,
        diagnostics: result.graph.diagnostics.length
      }
    };
  }

  if (subcommand === "run") {
    const runDir = positional(_args, 0);

    if (!runDir) {
      throw new Error(`graph run requires a run directory\n\n${usage()}`);
    }

    const result = await writeRunEvidenceGraph({
      rootDir: sourceRoot,
      runDir
    });

    return {
      ok: true,
      command: "graph run",
      graph_path: result.graph_path,
      report_path: result.report_path,
      summary: {
        nodes: result.graph.nodes.length,
        links: result.graph.links.length,
        diagnostics: result.graph.diagnostics.length
      }
    };
  }

  throw new Error(`Unknown graph target: ${subcommand ?? "(missing)"}\n\n${usage()}`);
}

function usage(): string {
  return [
    "Usage:",
    "  node --experimental-strip-types superpowers/runner/cli.ts run mock-publish [input.json]",
    "  node --experimental-strip-types superpowers/runner/cli.ts run live-publish [input.json]",
    "  node --experimental-strip-types superpowers/runner/cli.ts run qa-failure [input.json]",
    "  node --experimental-strip-types superpowers/runner/cli.ts proof <target-stage> [input.json] [--live|--mock]",
    "  node --experimental-strip-types superpowers/runner/cli.ts continue <run-dir> <target-stage> [--live|--mock]",
    "  node --experimental-strip-types superpowers/runner/cli.ts resume <run-dir> [--live|--mock]",
    "  node --experimental-strip-types superpowers/runner/cli.ts inspect <run-dir> [--json] [--recent-events <n>] [--graph]",
    "  node --experimental-strip-types superpowers/runner/cli.ts capability-report [--json] [--run <run-dir>]",
    "  node --experimental-strip-types superpowers/runner/cli.ts doctor [--deep] [--live] [--auth-probe]",
    "  node --experimental-strip-types superpowers/runner/cli.ts verify p0",
    "  node --experimental-strip-types superpowers/runner/cli.ts verify live-preview <run-dir>",
    "  node --experimental-strip-types superpowers/runner/cli.ts verify live-quality <run-dir> [target-stage]",
    "  node --experimental-strip-types superpowers/runner/cli.ts ci topology",
    "  node --experimental-strip-types superpowers/runner/cli.ts ci mock",
    "  node --experimental-strip-types superpowers/runner/cli.ts ci live [input.json]",
    "  node --experimental-strip-types superpowers/runner/cli.ts ci isolated-live [case-ids] [target-stage]",
    "  node --experimental-strip-types superpowers/runner/cli.ts live-stability [--runs <n>] [input.json] [--mock]",
    "  node --experimental-strip-types superpowers/runner/cli.ts graph harness",
    "  node --experimental-strip-types superpowers/runner/cli.ts graph run <run-dir>",
    "  node --experimental-strip-types superpowers/runner/cli.ts skills install --scope <codex-global|repo-local> [--workspace-root <path>] [--dry-run]"
  ].join("\n");
}

function positional(args: string[], index: number): string | undefined {
  return args.filter((arg) => !arg.startsWith("--"))[index];
}

function positionalWithoutValueFlags(args: string[], index: number, valueFlags: string[]): string | undefined {
  const values: string[] = [];

  for (let argIndex = 0; argIndex < args.length; argIndex += 1) {
    const arg = args[argIndex];

    if (valueFlags.includes(arg)) {
      argIndex += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      values.push(arg);
    }
  }

  return values[index];
}

function numberFlag(args: string[], flag: string): number | undefined {
  const flagIndex = args.indexOf(flag);

  if (flagIndex === -1) {
    return undefined;
  }

  const value = Number(args[flagIndex + 1]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
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

function makeRunId(): string {
  return `run_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function adapterModeFlag(args: string[]): CodexAdapterMode | undefined {
  const live = args.includes("--live");
  const mock = args.includes("--mock");

  if (live && mock) {
    throw new Error("Choose only one adapter mode flag: --live or --mock");
  }

  if (live) {
    return "real";
  }

  if (mock) {
    return "mock";
  }

  return undefined;
}

async function checkReadable(name: string, targetPath: string): Promise<DoctorCheck> {
  try {
    await access(targetPath, constants.R_OK);
    return { name, ok: true, details: { path: targetPath } };
  } catch (error) {
    return {
      name,
      ok: false,
      details: { path: targetPath },
      error: (error as Error).message
    };
  }
}

async function checkWritableRuntime(sourceRoot: string): Promise<DoctorCheck> {
  const runtimeDir = path.join(sourceRoot, ".fusera/runs");

  try {
    await mkdir(runtimeDir, { recursive: true });
    await access(runtimeDir, constants.R_OK | constants.W_OK);
    return { name: "runtime-directory", ok: true, details: { path: runtimeDir } };
  } catch (error) {
    return {
      name: "runtime-directory",
      ok: false,
      details: { path: runtimeDir },
      error: (error as Error).message
    };
  }
}

async function checkHarnessTopologyGraph(sourceRoot: string): Promise<DoctorCheck> {
  try {
    const graph = await buildHarnessTopologyGraph({ rootDir: sourceRoot });
    const criticalDiagnostics = graph.diagnostics.filter((diagnostic) => diagnostic.severity === "critical");

    return {
      name: "harness-topology-graph",
      ok: criticalDiagnostics.length === 0,
      details: {
        schema_version: graph.schema_version,
        nodes: graph.nodes.length,
        links: graph.links.length,
        diagnostics: graph.diagnostics.length,
        critical_diagnostics: criticalDiagnostics.map((diagnostic) => ({
          code: diagnostic.code,
          message: diagnostic.message
        }))
      },
      error:
        criticalDiagnostics.length === 0
          ? undefined
          : `Harness topology graph has ${criticalDiagnostics.length} critical diagnostic(s).`
    };
  } catch (error) {
    return {
      name: "harness-topology-graph",
      ok: false,
      error: (error as Error).message
    };
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
  try {
    const result = await runCli();

    if (typeof result.text === "string" && Object.keys(result).length === 3) {
      console.log(result.text);
    } else if (typeof result.usage === "string") {
      console.log(result.usage);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

    process.exit(result.ok === false ? 1 : 0);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
