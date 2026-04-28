import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolveStage, type StageResolution } from "./resolve-packs.ts";
import { artifactTypeToFileName, type ArtifactEnvelope } from "./validate-artifact.ts";

export type InvocationContext = {
  stage: string;
  backend: string;
  stage_profile: StageResolution["stage_profile"];
  selected_pack_ids: string[];
  run: Record<string, unknown>;
  normalized_input_bundle: Record<string, unknown> | null;
  input_artifact_refs: string[];
  materialized_artifacts: Record<string, ArtifactEnvelope>;
  output_contract_refs: string[];
  repair_directives: unknown[];
};

export async function assembleContext(options: {
  rootDir?: string;
  runDir: string;
  stage: string;
  outputMode?: string;
  backend?: string;
  repairDirectives?: unknown[];
}): Promise<InvocationContext> {
  const rootDir = options.rootDir ?? process.cwd();
  const resolution = await resolveStage({
    rootDir,
    stage: options.stage,
    outputMode: options.outputMode,
    backend: options.backend
  });
  const run = (await readJsonIfPresent(path.join(options.runDir, "run.json"))) ?? {};
  const normalizedInputBundle = await readJsonIfPresent(
    path.join(options.runDir, "stages/normalize-input/normalized-input.json"),
    null
  );
  const requirements = dedupeArtifactRequirements(
    resolution.selected_packs.flatMap((pack) => pack.required_artifacts ?? [])
  );
  const materializedArtifacts: Record<string, ArtifactEnvelope> = {};

  for (const requirement of requirements) {
    const artifactType = requirement.artifact_type;
    const artifactPath = path.join(options.runDir, "artifacts", artifactTypeToFileName(artifactType));
    const artifact = JSON.parse(await readFile(artifactPath, "utf8")) as ArtifactEnvelope;

    if (!requirement.allowed_statuses.includes(artifact.status)) {
      throw new Error(
        `Stage ${options.stage} cannot consume ${artifactType} with status ${artifact.status}; allowed statuses: ${requirement.allowed_statuses.join(", ")}`
      );
    }

    if (artifact.status === "validated" && artifact.validation?.valid !== true) {
      throw new Error(`Stage ${options.stage} found invalid validation state on ${artifactType}`);
    }

    if (!satisfiesVersionRange(artifact.schema_version, requirement.version_range)) {
      throw new Error(
        `Stage ${options.stage} cannot consume ${artifactType} schema_version ${artifact.schema_version}; required ${requirement.version_range}`
      );
    }

    materializedArtifacts[artifactType] = artifact;
  }

  return {
    stage: resolution.stage,
    backend: resolution.backend,
    stage_profile: resolution.stage_profile,
    selected_pack_ids: resolution.selected_packs.map((pack) => pack.id),
    run,
    normalized_input_bundle: normalizedInputBundle,
    input_artifact_refs: Object.values(materializedArtifacts).map((artifact) => artifact.artifact_id),
    materialized_artifacts: materializedArtifacts,
    output_contract_refs: resolution.selected_packs
      .map((pack) => pack.output_contract)
      .filter((contract): contract is string => typeof contract === "string" && contract !== "none"),
    repair_directives: options.repairDirectives ?? []
  };
}

type ArtifactRequirement = {
  artifact_type: string;
  allowed_statuses: string[];
  version_range: string;
};

function dedupeArtifactRequirements(requirements: ArtifactRequirement[]): ArtifactRequirement[] {
  const merged = new Map<string, ArtifactRequirement>();

  for (const requirement of requirements) {
    const existing = merged.get(requirement.artifact_type);

    if (!existing) {
      merged.set(requirement.artifact_type, requirement);
      continue;
    }

    merged.set(requirement.artifact_type, {
      artifact_type: requirement.artifact_type,
      allowed_statuses: [...new Set([...existing.allowed_statuses, ...requirement.allowed_statuses])],
      version_range:
        existing.version_range === requirement.version_range
          ? existing.version_range
          : `${existing.version_range} || ${requirement.version_range}`
    });
  }

  return [...merged.values()];
}

export function satisfiesVersionRange(version: string, range: string): boolean {
  if (range === "*" || range === version) {
    return true;
  }

  if (range.includes("||")) {
    return range.split("||").some((item) => satisfiesVersionRange(version, item.trim()));
  }

  const parsedVersion = parseSemver(version);

  if (!parsedVersion) {
    return false;
  }

  if (range.startsWith("^")) {
    const minimum = parseSemver(range.slice(1));

    if (!minimum) {
      return false;
    }

    return parsedVersion.major === minimum.major && compareSemver(parsedVersion, minimum) >= 0;
  }

  return false;
}

function parseSemver(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

function compareSemver(
  left: { major: number; minor: number; patch: number },
  right: { major: number; minor: number; patch: number }
): number {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

async function readJsonIfPresent(
  filePath: string,
  fallback: Record<string, unknown> | null = {}
): Promise<Record<string, unknown> | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir, stage = "normalize-input"] = process.argv.slice(2);

  if (!runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/assemble-context.ts <runDir> [stage]");
    process.exit(1);
  }

  const context = await assembleContext({ runDir, stage });
  console.log(JSON.stringify(context, null, 2));
}
