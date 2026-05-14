import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import {
  loadRegistry,
  loadStageProfiles,
  validateRegistryStageComposition,
  type PackManifest,
  type PackRegistry,
  type RegistryStageCompositionIssue,
  type StageProfile,
  type StageProfiles
} from "./resolve-packs.ts";

export const HARNESS_GRAPH_SCHEMA_VERSION = "1.0.0";

export type HarnessGraphType = "harness-topology" | "run-evidence";
export type HarnessGraphNodeType =
  | "stage"
  | "pack"
  | "artifact_type"
  | "artifact_instance"
  | "run_event"
  | "adapter_attempt"
  | "compiled_output"
  | "status"
  | "terminal"
  | "diagnostic";
export type HarnessGraphRelation =
  | "primary_task"
  | "allows_auxiliary_task"
  | "uses_context_pack"
  | "uses_verifier_pack"
  | "requires_artifact"
  | "produces_artifact"
  | "stage_allows_output"
  | "adapter_produced_candidate"
  | "runner_persisted_artifact"
  | "attempt_has_status"
  | "next_stage"
  | "validated_as"
  | "rejected_as"
  | "consumes"
  | "resolves_input_ref"
  | "references_run_file"
  | "emits_event"
  | "attempted_by"
  | "compiled_from"
  | "published_from"
  | "diagnostic_relates_to";
export type HarnessGraphConfidence = "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
export type HarnessDiagnosticSeverity = "critical" | "warning" | "info";
export type HarnessDiagnosticCheckKind = "hard" | "soft" | "info";

export type HarnessGraphNode = {
  id: string;
  type: HarnessGraphNodeType;
  label: string;
  source_ref?: string;
  metadata: Record<string, unknown>;
};

export type HarnessGraphLink = {
  source: string;
  target: string;
  relation: HarnessGraphRelation;
  confidence: HarnessGraphConfidence;
  source_ref?: string;
  metadata: Record<string, unknown>;
};

export type HarnessGraphDiagnostic = {
  id: string;
  code: string;
  message: string;
  severity: HarnessDiagnosticSeverity;
  check_kind: HarnessDiagnosticCheckKind;
  confidence: HarnessGraphConfidence;
  source_ref: string;
  target_ids: string[];
  metadata: Record<string, unknown>;
};

export type HarnessGraph = {
  schema_version: typeof HARNESS_GRAPH_SCHEMA_VERSION;
  graph_type: HarnessGraphType;
  generated_at: string;
  source_refs: string[];
  nodes: HarnessGraphNode[];
  links: HarnessGraphLink[];
  diagnostics: HarnessGraphDiagnostic[];
};

type TopologyBuildOptions = {
  rootDir?: string;
  generatedAt?: string;
  registry?: PackRegistry;
  stageProfiles?: StageProfiles;
};

type TopologyWriteResult = {
  graph: HarnessGraph;
  graph_path: string;
  report_path: string;
};

type PendingDiagnostic = Omit<HarnessGraphDiagnostic, "id">;

const REGISTRY_REF = "superpowers/packs/registry.yaml";
const STAGE_PROFILES_REF = "superpowers/packs/stage-profiles.yaml";
const HARNESS_ANALYSIS_DIR = ".fusera/analysis";

export async function buildHarnessTopologyGraph(options: TopologyBuildOptions = {}): Promise<HarnessGraph> {
  const rootDir = options.rootDir ?? process.cwd();
  const registry = options.registry ?? (await loadRegistry(rootDir));
  const stageProfiles = options.stageProfiles ?? (await loadStageProfiles(rootDir));
  const diagnostics = await collectTopologyDiagnostics(rootDir, registry, stageProfiles);
  const builder = new GraphBuilder();

  for (const profile of stageProfiles.stages) {
    builder.addNode(stageNode(profile));

    for (const artifactType of profile.allowed_outputs ?? []) {
      builder.addNode(artifactTypeNode(artifactType, STAGE_PROFILES_REF));
      builder.addLink({
        source: stageId(profile.stage),
        target: artifactTypeId(artifactType),
        relation: "stage_allows_output",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }
  }

  for (const pack of registry.packs) {
    builder.addNode(packNode(pack));

    for (const requirement of pack.required_artifacts ?? []) {
      builder.addNode(artifactTypeNode(requirement.artifact_type, REGISTRY_REF));
      builder.addLink({
        source: packId(pack.id),
        target: artifactTypeId(requirement.artifact_type),
        relation: "requires_artifact",
        confidence: "EXTRACTED",
        source_ref: REGISTRY_REF,
        metadata: {
          allowed_statuses: requirement.allowed_statuses ?? [],
          version_range: requirement.version_range
        }
      });
    }

    for (const artifactType of packOutputArtifactTypes(pack)) {
      builder.addNode(artifactTypeNode(artifactType, REGISTRY_REF));
      builder.addLink({
        source: packId(pack.id),
        target: artifactTypeId(artifactType),
        relation: "produces_artifact",
        confidence: "EXTRACTED",
        source_ref: REGISTRY_REF,
        metadata: {
          declarations: outputDeclarationsForPack(pack, artifactType)
        }
      });
    }
  }

  const packsById = new Map(registry.packs.map((pack) => [pack.id, pack]));
  const stagesByName = new Map(stageProfiles.stages.map((profile) => [profile.stage, profile]));

  for (const profile of stageProfiles.stages) {
    if (packsById.has(profile.primary_task)) {
      builder.addLink({
        source: stageId(profile.stage),
        target: packId(profile.primary_task),
        relation: "primary_task",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }

    for (const auxiliaryTask of profile.allowed_auxiliary_tasks ?? []) {
      if (!packsById.has(auxiliaryTask)) {
        continue;
      }

      builder.addLink({
        source: stageId(profile.stage),
        target: packId(auxiliaryTask),
        relation: "allows_auxiliary_task",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }

    for (const contextPack of profile.context_packs ?? []) {
      if (!packsById.has(contextPack)) {
        continue;
      }

      builder.addLink({
        source: stageId(profile.stage),
        target: packId(contextPack),
        relation: "uses_context_pack",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }

    if (profile.default_verifier !== "none" && packsById.has(profile.default_verifier)) {
      builder.addLink({
        source: stageId(profile.stage),
        target: packId(profile.default_verifier),
        relation: "uses_verifier_pack",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }

    if (profile.next_stage === "end") {
      builder.addNode({
        id: "terminal:end",
        type: "terminal",
        label: "end",
        source_ref: STAGE_PROFILES_REF,
        metadata: {
          kind: "workflow-sentinel"
        }
      });
      builder.addLink({
        source: stageId(profile.stage),
        target: "terminal:end",
        relation: "next_stage",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    } else if (stagesByName.has(profile.next_stage)) {
      builder.addLink({
        source: stageId(profile.stage),
        target: stageId(profile.next_stage),
        relation: "next_stage",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }
  }

  const finalizedDiagnostics = finalizeDiagnostics(diagnostics);

  for (const diagnostic of finalizedDiagnostics) {
    builder.addDiagnostic(diagnostic);
  }

  return {
    schema_version: HARNESS_GRAPH_SCHEMA_VERSION,
    graph_type: "harness-topology",
    generated_at: options.generatedAt ?? new Date().toISOString(),
    source_refs: [REGISTRY_REF, STAGE_PROFILES_REF],
    nodes: builder.nodes(),
    links: builder.links(),
    diagnostics: finalizedDiagnostics
  };
}

export async function writeHarnessTopologyGraph(options: TopologyBuildOptions = {}): Promise<TopologyWriteResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const graph = await buildHarnessTopologyGraph({ ...options, rootDir });
  const analysisDir = path.join(rootDir, HARNESS_ANALYSIS_DIR);
  const graphPath = path.join(analysisDir, "harness-graph.json");
  const reportPath = path.join(analysisDir, "harness-graph-report.md");

  await mkdir(analysisDir, { recursive: true });
  await writeFile(graphPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
  await writeFile(reportPath, renderHarnessGraphReport(graph), "utf8");

  return {
    graph,
    graph_path: graphPath,
    report_path: reportPath
  };
}

export function renderHarnessGraphReport(graph: HarnessGraph): string {
  const counts = countNodesByType(graph.nodes);
  const godNodes = graphDegree(graph).slice(0, 8);
  const diagnostics = graph.diagnostics;
  const lines = [
    "# Harness Graph Report",
    "",
    `Generated: ${graph.generated_at}`,
    `Graph type: ${graph.graph_type}`,
    `Schema version: ${graph.schema_version}`,
    "",
    "## Summary",
    `- Stages: ${counts.stage ?? 0}`,
    `- Packs: ${counts.pack ?? 0}`,
    `- Artifact types: ${counts.artifact_type ?? 0}`,
    `- Links: ${graph.links.length}`,
    `- Diagnostics: ${diagnostics.length}`,
    "",
    "## God Nodes"
  ];

  if (godNodes.length === 0) {
    lines.push("- None.");
  } else {
    for (const [index, node] of godNodes.entries()) {
      lines.push(`${index + 1}. \`${node.id}\` - ${node.degree} edges`);
    }
  }

  lines.push("", "## Diagnostics");

  if (diagnostics.length === 0) {
    lines.push("- None.");
  } else {
    for (const diagnostic of diagnostics) {
      lines.push(
        `- [${diagnostic.severity}/${diagnostic.check_kind}] ${diagnostic.message} (${diagnostic.code})`
      );
    }
  }

  lines.push("", "## Suggested Questions");
  lines.push("- Are stage allowed outputs still aligned with actual producer packs?");
  lines.push("- Do next-stage transitions form the expected workflow chain?");
  lines.push("- Are any critical diagnostics candidates for future CI promotion?");
  lines.push("");

  return lines.join("\n");
}

async function collectTopologyDiagnostics(
  rootDir: string,
  registry: PackRegistry,
  stageProfiles: StageProfiles
): Promise<PendingDiagnostic[]> {
  const diagnostics = validateRegistryStageComposition({
    registry,
    stageProfiles,
    scope: "topology"
  }).map(diagnosticFromCompositionIssue);

  diagnostics.push(...stageOutputProducerDiagnostics(registry, stageProfiles));
  diagnostics.push(...(await missingPackPathDiagnostics(rootDir, registry)));

  return diagnostics;
}

function diagnosticFromCompositionIssue(issue: RegistryStageCompositionIssue): PendingDiagnostic {
  return {
    code: issue.code,
    message: issue.message,
    severity: "critical",
    check_kind: "hard",
    confidence: "EXTRACTED",
    source_ref: issue.source_ref,
    target_ids: uniqueStrings(issue.target_ids ?? inferredTargetsForIssue(issue)),
    metadata: issue.metadata ?? {}
  };
}

function stageOutputProducerDiagnostics(registry: PackRegistry, stageProfiles: StageProfiles): PendingDiagnostic[] {
  const packsByStage = new Map<string, PackManifest[]>();

  for (const pack of registry.packs) {
    const packs = packsByStage.get(pack.stage) ?? [];
    packs.push(pack);
    packsByStage.set(pack.stage, packs);
  }

  const diagnostics: PendingDiagnostic[] = [];

  for (const profile of stageProfiles.stages) {
    const stagePacks = packsByStage.get(profile.stage) ?? [];

    for (const artifactType of profile.allowed_outputs ?? []) {
      const producerPacks = stagePacks.filter((pack) =>
        [...(pack.stage_outputs ?? []), ...(pack.produces_artifacts ?? [])].includes(artifactType)
      );

      if (producerPacks.length === 0) {
        diagnostics.push({
          code: "stage_output_without_producer",
          message: `Stage ${profile.stage} allows ${artifactType}, but no pack in that stage produces it`,
          severity: "warning",
          check_kind: "hard",
          confidence: "EXTRACTED",
          source_ref: STAGE_PROFILES_REF,
          target_ids: [stageId(profile.stage), artifactTypeId(artifactType)],
          metadata: {
            stage: profile.stage,
            artifact_type: artifactType
          }
        });
      }
    }
  }

  return diagnostics;
}

async function missingPackPathDiagnostics(rootDir: string, registry: PackRegistry): Promise<PendingDiagnostic[]> {
  const diagnostics: PendingDiagnostic[] = [];

  for (const pack of registry.packs) {
    try {
      await access(path.join(rootDir, pack.path), constants.R_OK);
    } catch {
      diagnostics.push({
        code: "missing_pack_path",
        message: `Pack ${pack.id} path is missing or unreadable: ${pack.path}`,
        severity: "critical",
        check_kind: "hard",
        confidence: "EXTRACTED",
        source_ref: REGISTRY_REF,
        target_ids: [packId(pack.id)],
        metadata: {
          pack_id: pack.id,
          path: pack.path
        }
      });
    }
  }

  return diagnostics;
}

function stageNode(profile: StageProfile): HarnessGraphNode {
  return {
    id: stageId(profile.stage),
    type: "stage",
    label: profile.stage,
    source_ref: STAGE_PROFILES_REF,
    metadata: {
      allowed_outputs: profile.allowed_outputs ?? [],
      primary_task: profile.primary_task,
      allowed_auxiliary_tasks: profile.allowed_auxiliary_tasks ?? [],
      context_packs: profile.context_packs ?? [],
      default_verifier: profile.default_verifier,
      default_backend: profile.default_backend,
      next_stage: profile.next_stage
    }
  };
}

function packNode(pack: PackManifest): HarnessGraphNode {
  return {
    id: packId(pack.id),
    type: "pack",
    label: pack.id,
    source_ref: pack.path,
    metadata: {
      kind: pack.kind,
      stage: pack.stage,
      output_modes: pack.output_modes ?? [],
      backend_support: pack.backend_support,
      required_artifacts: pack.required_artifacts ?? [],
      produces_artifacts: pack.produces_artifacts ?? [],
      stage_outputs: pack.stage_outputs ?? [],
      task_role: pack.task_role
    }
  };
}

function artifactTypeNode(artifactType: string, sourceRef: string): HarnessGraphNode {
  return {
    id: artifactTypeId(artifactType),
    type: "artifact_type",
    label: artifactType,
    source_ref: sourceRef,
    metadata: {}
  };
}

function packOutputArtifactTypes(pack: PackManifest): string[] {
  return uniqueStrings([...(pack.produces_artifacts ?? []), ...(pack.stage_outputs ?? [])]);
}

function outputDeclarationsForPack(pack: PackManifest, artifactType: string): string[] {
  const declarations: string[] = [];

  if ((pack.produces_artifacts ?? []).includes(artifactType)) {
    declarations.push("produces_artifacts");
  }

  if ((pack.stage_outputs ?? []).includes(artifactType)) {
    declarations.push("stage_outputs");
  }

  return declarations;
}

function stageId(stage: string): string {
  return `stage:${stage}`;
}

function packId(id: string): string {
  return `pack:${id}`;
}

function artifactTypeId(artifactType: string): string {
  return `artifact-type:${artifactType}`;
}

function finalizeDiagnostics(diagnostics: PendingDiagnostic[]): HarnessGraphDiagnostic[] {
  const seen = new Map<string, HarnessGraphDiagnostic>();

  for (const diagnostic of diagnostics) {
    const normalized = {
      ...diagnostic,
      target_ids: uniqueStrings(diagnostic.target_ids).sort(),
      metadata: sortObject(diagnostic.metadata)
    };
    const id = `diagnostic:${stableHash(normalized)}`;
    seen.set(id, {
      id,
      ...normalized
    });
  }

  return [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function inferredTargetsForIssue(issue: RegistryStageCompositionIssue): string[] {
  return [
    issue.stage ? stageId(issue.stage) : undefined,
    issue.pack_id ? packId(issue.pack_id) : undefined,
    issue.artifact_type ? artifactTypeId(issue.artifact_type) : undefined
  ].filter((value): value is string => typeof value === "string");
}

function stableHash(value: unknown): string {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex").slice(0, 16);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortObject(child)])
    );
  }

  return value;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function countNodesByType(nodes: HarnessGraphNode[]): Partial<Record<HarnessGraphNodeType, number>> {
  const counts: Partial<Record<HarnessGraphNodeType, number>> = {};

  for (const node of nodes) {
    counts[node.type] = (counts[node.type] ?? 0) + 1;
  }

  return counts;
}

function graphDegree(graph: HarnessGraph): Array<{ id: string; degree: number }> {
  const degree = new Map(graph.nodes.map((node) => [node.id, 0]));

  for (const link of graph.links) {
    degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
    degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
  }

  return [...degree.entries()]
    .map(([id, value]) => ({ id, degree: value }))
    .filter((node) => node.degree > 0)
    .sort((left, right) => right.degree - left.degree || left.id.localeCompare(right.id));
}

class GraphBuilder {
  private readonly nodeMap = new Map<string, HarnessGraphNode>();
  private readonly linkMap = new Map<string, HarnessGraphLink>();

  addNode(node: HarnessGraphNode): void {
    if (!this.nodeMap.has(node.id)) {
      this.nodeMap.set(node.id, node);
    }
  }

  addLink(link: HarnessGraphLink): void {
    const key = [link.source, link.target, link.relation, link.source_ref ?? ""].join("\u0000");

    if (!this.linkMap.has(key)) {
      this.linkMap.set(key, link);
    }
  }

  addDiagnostic(diagnostic: HarnessGraphDiagnostic): void {
    this.addNode({
      id: diagnostic.id,
      type: "diagnostic",
      label: diagnostic.code,
      source_ref: diagnostic.source_ref,
      metadata: {
        severity: diagnostic.severity,
        check_kind: diagnostic.check_kind,
        code: diagnostic.code,
        message: diagnostic.message,
        ...diagnostic.metadata
      }
    });

    for (const targetId of diagnostic.target_ids) {
      if (!this.nodeMap.has(targetId)) {
        continue;
      }

      this.addLink({
        source: diagnostic.id,
        target: targetId,
        relation: "diagnostic_relates_to",
        confidence: diagnostic.confidence,
        source_ref: diagnostic.source_ref,
        metadata: {
          code: diagnostic.code
        }
      });
    }
  }

  nodes(): HarnessGraphNode[] {
    return [...this.nodeMap.values()].sort((left, right) => left.id.localeCompare(right.id));
  }

  links(): HarnessGraphLink[] {
    return [...this.linkMap.values()].sort(
      (left, right) =>
        left.source.localeCompare(right.source) ||
        left.relation.localeCompare(right.relation) ||
        left.target.localeCompare(right.target)
    );
  }
}
