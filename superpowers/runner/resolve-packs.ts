import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { missingCodexCapabilities } from "../adapters/codex/capabilities.ts";

export type PackRegistry = {
  packs: PackManifest[];
};

export type StageProfiles = {
  stages: StageProfile[];
};

export type PackManifest = {
  id: string;
  path: string;
  kind: string;
  stage: string;
  output_modes: string[];
  backend_support: {
    adapters: string[];
    preferred_adapters: string[];
  };
  capabilities_required: string[];
  required_artifacts: Array<{
    artifact_type: string;
    allowed_statuses: string[];
    version_range: string;
  }>;
  produces_artifacts: string[];
  stage_outputs: string[];
  task_role: string;
  [key: string]: unknown;
};

export type StageProfile = {
  stage: string;
  primary_task: string;
  allowed_auxiliary_tasks: string[];
  context_packs?: string[];
  allowed_outputs: string[];
  default_verifier: string;
  default_backend: string;
  next_stage: string;
};

export type StageResolution = {
  stage: string;
  backend: string;
  stage_profile: StageProfile;
  primary_task: PackManifest;
  auxiliary_tasks: PackManifest[];
  context_packs: PackManifest[];
  verifier_pack: PackManifest | null;
  selected_packs: PackManifest[];
  next_stage: string;
};

export type RegistryStageCompositionIssue = {
  code: string;
  message: string;
  source_ref: string;
  stage?: string;
  pack_id?: string;
  artifact_type?: string;
  target_ids?: string[];
  metadata?: Record<string, unknown>;
};

export class PackResolutionError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super(errors.join("; "));
    this.name = "PackResolutionError";
    this.errors = errors;
  }
}

export async function loadRegistry(rootDir = process.cwd()): Promise<PackRegistry> {
  return parseConfigFile(path.join(rootDir, "superpowers/packs/registry.yaml")) as Promise<PackRegistry>;
}

export async function loadStageProfiles(rootDir = process.cwd()): Promise<StageProfiles> {
  return parseConfigFile(path.join(rootDir, "superpowers/packs/stage-profiles.yaml")) as Promise<StageProfiles>;
}

export async function resolveStage(options: {
  rootDir?: string;
  stage: string;
  outputMode?: string;
  backend?: string;
}): Promise<StageResolution> {
  const rootDir = options.rootDir ?? process.cwd();
  const outputMode = options.outputMode ?? "landing-page";
  const registry = await loadRegistry(rootDir);
  const stageProfiles = await loadStageProfiles(rootDir);
  const profile = stageProfiles.stages.find((item) => item.stage === options.stage);

  if (!profile) {
    throw new PackResolutionError([`Missing stage profile for ${options.stage}`]);
  }

  const packsById = new Map(registry.packs.map((pack) => [pack.id, pack]));
  const primaryTask = packsById.get(profile.primary_task);
  const auxiliaryTasks = profile.allowed_auxiliary_tasks
    .map((packId) => packsById.get(packId))
    .filter(Boolean) as PackManifest[];
  const contextPacks = (profile.context_packs ?? [])
    .map((packId) => packsById.get(packId))
    .filter(Boolean) as PackManifest[];

  const verifierPack =
    profile.default_verifier === "none" ? null : packsById.get(profile.default_verifier) ?? null;

  const selectedPacks = uniquePacks(
    [primaryTask, ...auxiliaryTasks, ...contextPacks, verifierPack].filter(Boolean) as PackManifest[]
  );
  const backend = options.backend ?? profile.default_backend;
  const errors = validateRegistryStageComposition({
    registry,
    stageProfiles,
    stage: profile.stage,
    outputMode,
    backend,
    scope: "resolver"
  }).map((issue) => issue.message);

  if (errors.length > 0 || !primaryTask) {
    throw new PackResolutionError(errors);
  }

  return {
    stage: profile.stage,
    backend,
    stage_profile: profile,
    primary_task: primaryTask,
    auxiliary_tasks: auxiliaryTasks,
    context_packs: contextPacks,
    verifier_pack: verifierPack,
    selected_packs: selectedPacks,
    next_stage: profile.next_stage
  };
}

export function validateRegistryStageComposition(options: {
  registry: PackRegistry;
  stageProfiles: StageProfiles;
  stage?: string;
  outputMode?: string;
  backend?: string;
  scope?: "resolver" | "topology";
}): RegistryStageCompositionIssue[] {
  const issues: RegistryStageCompositionIssue[] = [];
  const scope = options.scope ?? "topology";
  const packsById = new Map(options.registry.packs.map((pack) => [pack.id, pack]));
  const profilesByStage = new Map(options.stageProfiles.stages.map((profile) => [profile.stage, profile]));
  const profilesToValidate = options.stage
    ? options.stageProfiles.stages.filter((profile) => profile.stage === options.stage)
    : options.stageProfiles.stages;

  validateUniqueArtifactProducerStages(options.stageProfiles.stages, issues);

  for (const profile of profilesToValidate) {
    const selectedPacks = selectedPacksForProfile(profile, packsById, issues);
    const contextPacks = (profile.context_packs ?? [])
      .map((packId) => packsById.get(packId))
      .filter(Boolean) as PackManifest[];

    validateContextPackComposition(profile, contextPacks, issues);

    for (const pack of selectedPacks) {
      validatePackAgainstStageProfile(pack, profile, options.outputMode, options.backend, issues, {
        includeOutputChecks: scope === "resolver"
      });
    }

    if (scope === "topology" && profile.next_stage !== "end" && !profilesByStage.has(profile.next_stage)) {
      issues.push({
        code: "unknown_next_stage",
        message: `Stage ${profile.stage} next_stage ${profile.next_stage} is not registered`,
        source_ref: "superpowers/packs/stage-profiles.yaml",
        stage: profile.stage,
        target_ids: [`stage:${profile.stage}`],
        metadata: {
          next_stage: profile.next_stage
        }
      });
    }
  }

  if (scope === "topology") {
    for (const pack of options.registry.packs) {
      const profile = profilesByStage.get(pack.stage);

      if (!profile) {
        continue;
      }

      validatePackOutputsAgainstStage(pack, profile, issues);
    }
  }

  return issues;
}

function missingCapabilitiesForBackend(backend: string, requiredCapabilities: string[]): string[] {
  if (backend === "codex") {
    return missingCodexCapabilities(requiredCapabilities);
  }

  return requiredCapabilities.length > 0
    ? [`capability checks for backend ${backend} are not implemented in P0`]
    : [];
}

export async function parseConfigFile(filePath: string): Promise<unknown> {
  const text = await readFile(filePath, "utf8");
  return parseSimpleYaml(text);
}

export function parseSimpleYaml(text: string): unknown {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, "  "))
    .filter((line) => line.trim().length > 0 && !line.trimStart().startsWith("#"))
    .map((line) => ({
      indent: line.match(/^ */)?.[0].length ?? 0,
      text: line.trim()
    }));

  if (lines.length === 0) {
    return {};
  }

  const [value] = parseBlock(lines, 0, lines[0].indent);
  return value;
}

function parseBlock(
  lines: Array<{ indent: number; text: string }>,
  index: number,
  indent: number
): [unknown, number] {
  if (lines[index]?.text.startsWith("- ")) {
    return parseArray(lines, index, indent);
  }

  return parseObject(lines, index, indent);
}

function parseArray(
  lines: Array<{ indent: number; text: string }>,
  index: number,
  indent: number
): [unknown[], number] {
  const values: unknown[] = [];
  let cursor = index;

  while (cursor < lines.length && lines[cursor].indent === indent && lines[cursor].text.startsWith("- ")) {
    const rest = lines[cursor].text.slice(2).trim();

    if (rest.length === 0) {
      const [child, next] = parseBlock(lines, cursor + 1, indent + 2);
      values.push(child);
      cursor = next;
      continue;
    }

    if (isKeyValue(rest)) {
      const objectValue: Record<string, unknown> = {};
      cursor = assignKeyValue(objectValue, rest, lines, cursor, indent + 2);

      while (
        cursor < lines.length &&
        lines[cursor].indent === indent + 2 &&
        !lines[cursor].text.startsWith("- ")
      ) {
        cursor = assignKeyValue(objectValue, lines[cursor].text, lines, cursor, indent + 4);
      }

      values.push(objectValue);
      continue;
    }

    values.push(parseScalar(rest));
    cursor += 1;
  }

  return [values, cursor];
}

function parseObject(
  lines: Array<{ indent: number; text: string }>,
  index: number,
  indent: number
): [Record<string, unknown>, number] {
  const objectValue: Record<string, unknown> = {};
  let cursor = index;

  while (cursor < lines.length && lines[cursor].indent === indent && !lines[cursor].text.startsWith("- ")) {
    cursor = assignKeyValue(objectValue, lines[cursor].text, lines, cursor, indent + 2);
  }

  return [objectValue, cursor];
}

function assignKeyValue(
  objectValue: Record<string, unknown>,
  text: string,
  lines: Array<{ indent: number; text: string }>,
  index: number,
  childIndent: number
): number {
  const separator = text.indexOf(":");

  if (separator === -1) {
    throw new Error(`Invalid YAML line: ${text}`);
  }

  const key = text.slice(0, separator).trim();
  const rawValue = text.slice(separator + 1).trim();

  if (rawValue.length > 0) {
    objectValue[key] = parseScalar(rawValue);
    return index + 1;
  }

  if (index + 1 >= lines.length || lines[index + 1].indent < childIndent) {
    objectValue[key] = null;
    return index + 1;
  }

  const [child, next] = parseBlock(lines, index + 1, childIndent);
  objectValue[key] = child;
  return next;
}

function parseScalar(rawValue: string): unknown {
  if (rawValue === "[]") {
    return [];
  }

  if (rawValue === "null") {
    return null;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }

  return rawValue;
}

function isKeyValue(text: string): boolean {
  const separator = text.indexOf(":");
  return separator > 0;
}

function validateUniqueArtifactProducerStages(
  stageProfiles: StageProfile[],
  issues: RegistryStageCompositionIssue[]
): void {
  const producerStages = new Map<string, string>();

  for (const profile of stageProfiles) {
    for (const artifactType of profile.allowed_outputs ?? []) {
      const priorStage = producerStages.get(artifactType);

      if (priorStage && priorStage !== profile.stage) {
        issues.push({
          code: "duplicate_artifact_producer_stage",
          message: `Artifact ${artifactType} is produced by both ${priorStage} and ${profile.stage}`,
          source_ref: "superpowers/packs/stage-profiles.yaml",
          stage: profile.stage,
          artifact_type: artifactType,
          target_ids: [`artifact-type:${artifactType}`, `stage:${priorStage}`, `stage:${profile.stage}`],
          metadata: {
            producer_stages: [priorStage, profile.stage]
          }
        });
      }

      producerStages.set(artifactType, profile.stage);
    }
  }
}

function validateContextPackComposition(
  profile: StageProfile,
  contextPacks: PackManifest[],
  issues: RegistryStageCompositionIssue[]
): void {
  const basePacks = contextPacks.filter((pack) => pack.kind === "base");
  const stylePacks = contextPacks.filter((pack) => pack.kind === "style");
  const invalidContextPacks = contextPacks.filter((pack) => pack.kind === "task" || pack.kind === "deploy");

  if (basePacks.length > 1) {
    const packIds = basePacks.map((pack) => pack.id);
    issues.push({
      code: "multiple_base_context_packs",
      message: `Stage ${profile.stage} selects more than one base context pack: ${packIds.join(", ")}`,
      source_ref: "superpowers/packs/stage-profiles.yaml",
      stage: profile.stage,
      target_ids: [`stage:${profile.stage}`, ...packIds.map((packId) => `pack:${packId}`)],
      metadata: {
        pack_ids: packIds
      }
    });
  }

  if (stylePacks.length > 1) {
    const packIds = stylePacks.map((pack) => pack.id);
    issues.push({
      code: "multiple_style_context_packs",
      message: `Stage ${profile.stage} selects more than one style context pack: ${packIds.join(", ")}`,
      source_ref: "superpowers/packs/stage-profiles.yaml",
      stage: profile.stage,
      target_ids: [`stage:${profile.stage}`, ...packIds.map((packId) => `pack:${packId}`)],
      metadata: {
        pack_ids: packIds
      }
    });
  }

  if (invalidContextPacks.length > 0) {
    const packIds = invalidContextPacks.map((pack) => pack.id);
    issues.push({
      code: "invalid_context_pack_kind",
      message: `Stage ${profile.stage} context_packs cannot include task or deploy packs: ${packIds.join(", ")}`,
      source_ref: "superpowers/packs/stage-profiles.yaml",
      stage: profile.stage,
      target_ids: [`stage:${profile.stage}`, ...packIds.map((packId) => `pack:${packId}`)],
      metadata: {
        pack_ids: packIds
      }
    });
  }
}

function selectedPacksForProfile(
  profile: StageProfile,
  packsById: Map<string, PackManifest>,
  issues: RegistryStageCompositionIssue[]
): PackManifest[] {
  const primaryTask = packsById.get(profile.primary_task);

  if (!primaryTask) {
    issues.push({
      code: "missing_primary_task",
      message: `Stage ${profile.stage} primary_task ${profile.primary_task} is not registered`,
      source_ref: "superpowers/packs/stage-profiles.yaml",
      stage: profile.stage,
      pack_id: profile.primary_task,
      target_ids: [`stage:${profile.stage}`, `pack:${profile.primary_task}`]
    });
  }

  const auxiliaryTasks = profile.allowed_auxiliary_tasks
    .map((packId) => {
      const pack = packsById.get(packId);

      if (!pack) {
        issues.push({
          code: "missing_auxiliary_task",
          message: `Stage ${profile.stage} auxiliary task ${packId} is not registered`,
          source_ref: "superpowers/packs/stage-profiles.yaml",
          stage: profile.stage,
          pack_id: packId,
          target_ids: [`stage:${profile.stage}`, `pack:${packId}`]
        });
      }

      return pack;
    })
    .filter(Boolean) as PackManifest[];

  const contextPacks = (profile.context_packs ?? [])
    .map((packId) => {
      const pack = packsById.get(packId);

      if (!pack) {
        issues.push({
          code: "missing_context_pack",
          message: `Stage ${profile.stage} context pack ${packId} is not registered`,
          source_ref: "superpowers/packs/stage-profiles.yaml",
          stage: profile.stage,
          pack_id: packId,
          target_ids: [`stage:${profile.stage}`, `pack:${packId}`]
        });
      }

      return pack;
    })
    .filter(Boolean) as PackManifest[];

  const verifierPack =
    profile.default_verifier === "none" ? null : packsById.get(profile.default_verifier) ?? null;

  if (profile.default_verifier !== "none" && !verifierPack) {
    issues.push({
      code: "missing_verifier_pack",
      message: `Stage ${profile.stage} verifier ${profile.default_verifier} is not registered`,
      source_ref: "superpowers/packs/stage-profiles.yaml",
      stage: profile.stage,
      pack_id: profile.default_verifier,
      target_ids: [`stage:${profile.stage}`, `pack:${profile.default_verifier}`]
    });
  }

  return uniquePacks(
    [primaryTask, ...auxiliaryTasks, ...contextPacks, verifierPack].filter(Boolean) as PackManifest[]
  );
}

function validatePackAgainstStageProfile(
  pack: PackManifest,
  profile: StageProfile,
  outputMode: string | undefined,
  backend: string | undefined,
  issues: RegistryStageCompositionIssue[],
  options: {
    includeOutputChecks: boolean;
  }
): void {
  if (pack.stage !== profile.stage) {
    issues.push({
      code: "pack_stage_mismatch",
      message: `Pack ${pack.id} is registered for stage ${pack.stage}, not ${profile.stage}`,
      source_ref: "superpowers/packs/registry.yaml",
      stage: profile.stage,
      pack_id: pack.id,
      target_ids: [`stage:${profile.stage}`, `pack:${pack.id}`],
      metadata: {
        registered_stage: pack.stage
      }
    });
  }

  if (outputMode && !pack.output_modes.includes(outputMode)) {
    issues.push({
      code: "pack_output_mode_unsupported",
      message: `Pack ${pack.id} does not support output mode ${outputMode}`,
      source_ref: "superpowers/packs/registry.yaml",
      stage: profile.stage,
      pack_id: pack.id,
      target_ids: [`stage:${profile.stage}`, `pack:${pack.id}`],
      metadata: {
        output_mode: outputMode
      }
    });
  }

  if (backend && !pack.backend_support.adapters.includes(backend)) {
    issues.push({
      code: "pack_backend_unsupported",
      message: `Pack ${pack.id} does not support backend ${backend}`,
      source_ref: "superpowers/packs/registry.yaml",
      stage: profile.stage,
      pack_id: pack.id,
      target_ids: [`stage:${profile.stage}`, `pack:${pack.id}`],
      metadata: {
        backend
      }
    });
  }

  if (backend) {
    const missingCapabilities = missingCapabilitiesForBackend(backend, pack.capabilities_required ?? []);

    if (missingCapabilities.length > 0) {
      issues.push({
        code: "pack_backend_capability_unsupported",
        message: `Pack ${pack.id} requires unsupported ${backend} capabilities: ${missingCapabilities.join(", ")}`,
        source_ref: "superpowers/packs/registry.yaml",
        stage: profile.stage,
        pack_id: pack.id,
        target_ids: [`stage:${profile.stage}`, `pack:${pack.id}`],
        metadata: {
          backend,
          missing_capabilities: missingCapabilities
        }
      });
    }
  }

  if (options.includeOutputChecks) {
    validatePackOutputsAgainstStage(pack, profile, issues);
  }
}

function validatePackOutputsAgainstStage(
  pack: PackManifest,
  profile: StageProfile,
  issues: RegistryStageCompositionIssue[]
): void {
  const disallowedOutputs = (pack.stage_outputs ?? []).filter(
    (artifactType) => !profile.allowed_outputs.includes(artifactType)
  );

  if (disallowedOutputs.length > 0) {
    issues.push({
      code: "pack_stage_output_not_allowed",
      message: `Pack ${pack.id} stage_outputs exceed ${profile.stage} allowed_outputs: ${disallowedOutputs.join(", ")}`,
      source_ref: "superpowers/packs/registry.yaml",
      stage: profile.stage,
      pack_id: pack.id,
      artifact_type: disallowedOutputs[0],
      target_ids: [
        `stage:${profile.stage}`,
        `pack:${pack.id}`,
        ...disallowedOutputs.map((artifactType) => `artifact-type:${artifactType}`)
      ],
      metadata: {
        artifact_types: disallowedOutputs
      }
    });
  }

  const disallowedProduced = (pack.produces_artifacts ?? []).filter(
    (artifactType) => !profile.allowed_outputs.includes(artifactType)
  );

  if (disallowedProduced.length > 0) {
    issues.push({
      code: "pack_produced_artifact_not_allowed",
      message: `Pack ${pack.id} produces artifacts outside ${profile.stage} allowed_outputs: ${disallowedProduced.join(", ")}`,
      source_ref: "superpowers/packs/registry.yaml",
      stage: profile.stage,
      pack_id: pack.id,
      artifact_type: disallowedProduced[0],
      target_ids: [
        `stage:${profile.stage}`,
        `pack:${pack.id}`,
        ...disallowedProduced.map((artifactType) => `artifact-type:${artifactType}`)
      ],
      metadata: {
        artifact_types: disallowedProduced
      }
    });
  }
}

function uniquePacks(packs: PackManifest[]): PackManifest[] {
  const seen = new Set<string>();
  const unique: PackManifest[] = [];

  for (const pack of packs) {
    if (seen.has(pack.id)) {
      continue;
    }

    seen.add(pack.id);
    unique.push(pack);
  }

  return unique;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [stage = "normalize-input", backend = "codex"] = process.argv.slice(2);
  const resolution = await resolveStage({ stage, backend });
  console.log(JSON.stringify(resolution, null, 2));
}
