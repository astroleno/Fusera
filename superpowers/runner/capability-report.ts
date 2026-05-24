import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  CODEX_CAPABILITY_MODEL,
  CODEX_CAPABILITIES
} from "../adapters/codex/capabilities.ts";
import {
  loadRegistry,
  loadStageProfiles,
  type PackManifest,
  type StageProfile
} from "./resolve-packs.ts";

type CapabilityProbe = {
  ok: boolean;
  status: "available" | "missing" | "not_configured";
  capabilities: string[];
  path?: string;
  detail?: string;
};

export type CapabilityReport = {
  schema_version: "1.0.0";
  generated_at: string;
  phase: "pre_resolution" | "post_resolution";
  run_id: string;
  run_dir: string;
  declared_adapter_capabilities: string[];
  runner_managed_capabilities: string[];
  experimental_adapter_capabilities: string[];
  probe_results: Record<string, CapabilityProbe>;
  reconciled_capabilities: string[];
  required_by_stage: Record<string, string[]>;
  missing_required: Record<string, string[]>;
  errors: string[];
  ok: boolean;
  report_path: string;
};

export async function writeCapabilityReport(options: {
  rootDir?: string;
  runDir: string;
  phase?: "pre_resolution" | "post_resolution";
}): Promise<CapabilityReport> {
  const report = await buildCapabilityReport(options);

  await mkdir(path.dirname(report.report_path), { recursive: true });
  await writeFile(report.report_path, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return report;
}

export function assertCapabilityReportOk(report: CapabilityReport): void {
  if (report.ok) {
    return;
  }

  const missing = Object.entries(report.missing_required)
    .map(([stage, capabilities]) => `${stage}: ${capabilities.join(", ")}`)
    .join("; ");
  const details = [
    missing.length > 0 ? `missing required capabilities after reconciliation: ${missing}` : "",
    ...report.errors
  ]
    .filter(Boolean)
    .join("; ");

  throw new Error(`Capability preflight failed closed (${report.report_path})${details ? `: ${details}` : ""}`);
}

export async function buildCapabilityReport(options: {
  rootDir?: string;
  runDir: string;
  phase?: "pre_resolution" | "post_resolution";
}): Promise<CapabilityReport> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const runId = path.basename(runDir);
  const probeResults = await probeCapabilities({
    rootDir,
    runDir
  });
  const reconciledCapabilities = reconciledCapabilitySet(probeResults);
  const stageRequirements = options.phase === "pre_resolution"
    ? { required_by_stage: {}, errors: [] }
    : await requiredCapabilitiesByStage(rootDir);
  const missingRequired = missingRequiredCapabilities({
    requiredByStage: stageRequirements.required_by_stage,
    reconciledCapabilities
  });
  const reportPath = path.join(runDir, "logs/capability-report.json");
  const errors = [
    ...stageRequirements.errors,
    ...Object.entries(probeResults)
      .filter(([, probe]) => !probe.ok && probe.status !== "not_configured")
      .map(([name, probe]) => `${name}: ${probe.detail ?? probe.status}`)
  ];

  return {
    schema_version: "1.0.0",
    generated_at: new Date().toISOString(),
    phase: options.phase ?? "post_resolution",
    run_id: runId,
    run_dir: runDir,
    declared_adapter_capabilities: [...CODEX_CAPABILITY_MODEL.adapter_runtime_capabilities],
    runner_managed_capabilities: [...CODEX_CAPABILITY_MODEL.runner_managed_capabilities],
    experimental_adapter_capabilities: [...CODEX_CAPABILITY_MODEL.experimental_capabilities],
    probe_results: probeResults,
    reconciled_capabilities: [...reconciledCapabilities].sort(),
    required_by_stage: stageRequirements.required_by_stage,
    missing_required: missingRequired,
    errors,
    ok: errors.length === 0 && Object.keys(missingRequired).length === 0,
    report_path: reportPath
  };
}

export function formatCapabilityReportText(report: CapabilityReport): string {
  const lines = [
    `capability_report: ${report.run_id}`,
    `phase: ${report.phase}`,
    `ok: ${report.ok}`,
    `run_dir: ${report.run_dir}`,
    `report_path: ${report.report_path}`,
    `declared_adapter_capabilities: ${report.declared_adapter_capabilities.join(", ") || "none"}`,
    `runner_managed_capabilities: ${report.runner_managed_capabilities.join(", ") || "none"}`,
    `reconciled_capabilities: ${report.reconciled_capabilities.join(", ") || "none"}`,
    "",
    "probes:"
  ];

  for (const [name, probe] of Object.entries(report.probe_results)) {
    lines.push(
      `- ${name}: ${probe.status}; capabilities=${probe.capabilities.join(", ") || "none"}${probe.detail ? `; ${probe.detail}` : ""}`
    );
  }

  lines.push("", "required_by_stage:");

  for (const [stage, capabilities] of Object.entries(report.required_by_stage)) {
    lines.push(`- ${stage}: ${capabilities.join(", ") || "none"}`);
  }

  if (Object.keys(report.missing_required).length > 0) {
    lines.push("", "missing_required:");

    for (const [stage, capabilities] of Object.entries(report.missing_required)) {
      lines.push(`- ${stage}: ${capabilities.join(", ")}`);
    }
  }

  if (report.errors.length > 0) {
    lines.push("", "errors:", ...report.errors.map((error) => `- ${error}`));
  }

  return `${lines.join("\n")}\n`;
}

async function probeCapabilities(options: {
  rootDir: string;
  runDir: string;
}): Promise<Record<string, CapabilityProbe>> {
  const runProbe = await accessProbe({
    name: "run_directory",
    targetPath: options.runDir,
    mode: constants.R_OK | constants.W_OK,
    capabilities: ["workspace.write"],
    ensureDirectory: true
  });
  const workspaceProbe = await accessProbe({
    name: "workspace_root",
    targetPath: options.rootDir,
    mode: constants.R_OK,
    capabilities: ["workspace.read", "workspace.search"]
  });
  const contractsProbe = await accessProbe({
    name: "artifact_contracts",
    targetPath: path.join(options.rootDir, "superpowers/contracts/artifacts"),
    mode: constants.R_OK,
    capabilities: ["artifact.attach"]
  });
  const processProbe = await accessProbe({
    name: "process_exec",
    targetPath: process.execPath,
    mode: constants.X_OK,
    capabilities: ["process.exec"]
  });

  return {
    run_directory: runProbe,
    workspace_root: workspaceProbe,
    artifact_contracts: contractsProbe,
    process_exec: processProbe,
    external_preview: {
      ok: true,
      status: process.env.FUSERA_PREVIEW_URL ? "available" : "not_configured",
      capabilities: [],
      detail: process.env.FUSERA_PREVIEW_URL
        ? "FUSERA_PREVIEW_URL is configured"
        : "No external preview target configured; preview remains runner-owned handoff only."
    },
    screenshot_browser: {
      ok: true,
      status: process.env.FUSERA_SCREENSHOT_CAPTURE === "1" ? "available" : "not_configured",
      capabilities: ["screenshot.capture"],
      detail: process.env.FUSERA_SCREENSHOT_CAPTURE === "1"
        ? "FUSERA_SCREENSHOT_CAPTURE=1"
        : "Screenshot/browser capture is not configured in this runner mode."
    },
    image_inspection: {
      ok: true,
      status: process.env.FUSERA_IMAGE_INSPECT === "1" ? "available" : "not_configured",
      capabilities: ["image.inspect"],
      detail: process.env.FUSERA_IMAGE_INSPECT === "1"
        ? "FUSERA_IMAGE_INSPECT=1"
        : "Image inspection is not configured in this runner mode."
    }
  };
}

async function accessProbe(options: {
  name: string;
  targetPath: string;
  mode: number;
  capabilities: string[];
  ensureDirectory?: boolean;
}): Promise<CapabilityProbe> {
  try {
    if (options.ensureDirectory) {
      await mkdir(options.targetPath, { recursive: true });
    }

    await access(options.targetPath, options.mode);

    return {
      ok: true,
      status: "available",
      capabilities: options.capabilities,
      path: options.targetPath
    };
  } catch (error) {
    return {
      ok: false,
      status: "missing",
      capabilities: options.capabilities,
      path: options.targetPath,
      detail: (error as Error).message
    };
  }
}

function reconciledCapabilitySet(probeResults: Record<string, CapabilityProbe>): Set<string> {
  const declared = new Set<string>(CODEX_CAPABILITIES);
  const capabilities = new Set<string>();

  for (const probe of Object.values(probeResults)) {
    if (probe.ok && probe.status === "available") {
      for (const capability of probe.capabilities) {
        if (declared.has(capability)) {
          capabilities.add(capability);
        }
      }
    }
  }

  return capabilities;
}

async function requiredCapabilitiesByStage(rootDir: string): Promise<{
  required_by_stage: Record<string, string[]>;
  errors: string[];
}> {
  try {
    const registry = await loadRegistry(rootDir);
    const stageProfiles = await loadStageProfiles(rootDir);
    const packsById = new Map(registry.packs.map((pack) => [pack.id, pack]));
    const requiredByStage: Record<string, string[]> = {};
    const errors: string[] = [];

    for (const profile of stageProfiles.stages) {
      const packs = selectedPacksForProfile(profile, packsById, errors);
      requiredByStage[profile.stage] = uniqueStrings(
        packs.flatMap((pack) => pack.capabilities_required ?? [])
      );
    }

    return {
      required_by_stage: requiredByStage,
      errors
    };
  } catch (error) {
    return {
      required_by_stage: {},
      errors: [(error as Error).message]
    };
  }
}

function selectedPacksForProfile(
  profile: StageProfile,
  packsById: Map<string, PackManifest>,
  errors: string[]
): PackManifest[] {
  const ids = [
    profile.primary_task,
    ...(profile.allowed_auxiliary_tasks ?? []),
    ...(profile.context_packs ?? []),
    ...(profile.default_verifier === "none" ? [] : [profile.default_verifier])
  ];
  const seen = new Set<string>();
  const packs: PackManifest[] = [];

  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    const pack = packsById.get(id);

    if (!pack) {
      errors.push(`Stage ${profile.stage} references missing pack ${id}`);
      continue;
    }

    packs.push(pack);
  }

  return packs;
}

function missingRequiredCapabilities(options: {
  requiredByStage: Record<string, string[]>;
  reconciledCapabilities: Set<string>;
}): Record<string, string[]> {
  const missing: Record<string, string[]> = {};

  for (const [stage, capabilities] of Object.entries(options.requiredByStage)) {
    const stageMissing = capabilities.filter((capability) => !options.reconciledCapabilities.has(capability));

    if (stageMissing.length > 0) {
      missing[stage] = stageMissing;
    }
  }

  return missing;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const runFlag = args.indexOf("--run");
  const runDir = runFlag === -1 ? path.join(".fusera/runs", makeRunId()) : args[runFlag + 1];
  const phase = args.includes("--pre-resolution") ? "pre_resolution" : "post_resolution";

  if (!runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/capability-report.ts [--run <run-dir>] [--json]");
    process.exit(1);
  }

  const report = await writeCapabilityReport({
    runDir,
    phase
  });

  console.log(args.includes("--json") ? JSON.stringify(report, null, 2) : formatCapabilityReportText(report));
}

function makeRunId(): string {
  return `run_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
