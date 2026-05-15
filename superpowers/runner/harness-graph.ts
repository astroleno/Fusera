import { constants } from "node:fs";
import { access, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
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
export const HARNESS_GRAPH_RELATIONS = [
  "primary_task",
  "allows_auxiliary_task",
  "uses_context_pack",
  "uses_verifier_pack",
  "requires_artifact",
  "produces_artifact",
  "stage_allows_output",
  "adapter_produced_candidate",
  "adapter_persisted_artifact",
  "runner_persisted_artifact",
  "attempt_has_status",
  "next_stage",
  "validated_as",
  "rejected_as",
  "consumes",
  "resolves_input_ref",
  "references_run_file",
  "emits_event",
  "attempted_by",
  "compiled_from",
  "published_from",
  "diagnostic_relates_to"
] as const;

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
export type HarnessGraphRelation = (typeof HARNESS_GRAPH_RELATIONS)[number];
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

type RunGraphBuildOptions = {
  rootDir?: string;
  runDir: string;
  generatedAt?: string;
};

type RunGraphWriteResult = {
  graph: HarnessGraph;
  graph_path: string;
  report_path: string;
};

export type HarnessGraphSummary = {
  graph_type: HarnessGraphType;
  schema_version: string;
  generated_at: string;
  nodes: number;
  links: number;
  diagnostics: number;
  critical_diagnostics: number;
  warning_diagnostics: number;
  info_diagnostics: number;
  graph_path?: string;
  report_path?: string;
};

type PendingDiagnostic = Omit<HarnessGraphDiagnostic, "id">;

const REGISTRY_REF = "superpowers/packs/registry.yaml";
const STAGE_PROFILES_REF = "superpowers/packs/stage-profiles.yaml";
const HARNESS_ANALYSIS_DIR = ".fusera/analysis";
const RUN_ANALYSIS_DIR = "analysis";
const RUNNER_OWNED_ARTIFACT_TYPES = new Set(["PageSpec", "QAReport", "PublishVersion"]);

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

export async function buildRunEvidenceGraph(options: RunGraphBuildOptions): Promise<HarnessGraph> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const run = await readJson(path.join(runDir, "run.json"));
  const stageProfiles = await loadStageProfiles(rootDir);
  const events = await readRunEvents(runDir);
  const artifacts = await readRunArtifacts(runDir);
  const attempts = await readRunAttempts(runDir);
  const previewBuild = await readRunJsonIfPresent(runDir, "compiled/preview-build.json");
  const publishHandoff = await readRunJsonIfPresent(runDir, "previews/publish-handoff.json");
  const knownRunFiles = await knownRunFileRefs(runDir, previewBuild, publishHandoff);
  const sourceRefs = new Set<string>([
    "run.json",
    STAGE_PROFILES_REF,
    events.source_ref,
    ...artifacts.map((artifact) => artifact.source_ref),
    ...attempts.map((attempt) => attempt.source_ref),
    ...knownRunFiles.map((file) => file.source_ref)
  ]);
  const builder = new GraphBuilder();
  const stageNames = uniqueStrings([
    ...stageProfiles.stages.map((profile) => profile.stage),
    ...(await listRunStageNames(runDir)),
    ...events.records
      .map((event) => stringOrUndefined(event.record.stage))
      .filter((stage): stage is string => Boolean(stage)),
    ...artifacts.map((record) => stringOrUndefined(record.artifact.producer_stage)).filter((stage): stage is string => Boolean(stage))
  ]);
  const stageProfilesByName = new Map(stageProfiles.stages.map((profile) => [profile.stage, profile]));

  for (const stage of stageNames) {
    const profile = stageProfilesByName.get(stage);
    builder.addNode(profile ? stageNode(profile) : runStageNode(stage));

    for (const artifactType of profile?.allowed_outputs ?? []) {
      builder.addNode(artifactTypeNode(artifactType, STAGE_PROFILES_REF));
      builder.addLink({
        source: stageId(stage),
        target: artifactTypeId(artifactType),
        relation: "stage_allows_output",
        confidence: "EXTRACTED",
        source_ref: STAGE_PROFILES_REF,
        metadata: {}
      });
    }
  }

  const runState = stringOrUndefined(run.state);

  if (runState) {
    builder.addNode(statusNode("run", runState, "run.json"));
  }

  const artifactIndex = buildArtifactIndex(artifacts);
  const refIndex = new Map<string, { node_id: string; kind: string; source_ref: string }>();

  for (const record of artifacts) {
    const artifactId = stringOrUndefined(record.artifact.artifact_id);
    const artifactType = stringOrUndefined(record.artifact.artifact_type);
    const status = stringOrUndefined(record.artifact.status);

    if (!artifactId || !artifactType) {
      continue;
    }

    const artifactNodeId = artifactInstanceId(artifactId);
    builder.addNode(artifactInstanceNode(record));
    builder.addNode(artifactTypeNode(artifactType, record.source_ref));
    builder.addLink({
      source: artifactNodeId,
      target: artifactTypeId(artifactType),
      relation: status === "rejected" ? "rejected_as" : "validated_as",
      confidence: "EXTRACTED",
      source_ref: record.source_ref,
      metadata: {
        status: status ?? "unknown"
      }
    });

    if (status) {
      builder.addNode(statusNode("artifact", status, record.source_ref));
    }

    const producerStage = stringOrUndefined(record.artifact.producer_stage);

    if (producerStage) {
      builder.addLink({
        source: stageId(producerStage),
        target: artifactNodeId,
        relation: RUNNER_OWNED_ARTIFACT_TYPES.has(artifactType)
          ? "runner_persisted_artifact"
          : "adapter_persisted_artifact",
        confidence: "EXTRACTED",
        source_ref: record.source_ref,
        metadata: {
          artifact_type: artifactType
        }
      });
    }

    refIndex.set(artifactId, {
      node_id: artifactNodeId,
      kind: "artifact",
      source_ref: record.source_ref
    });
  }

  for (const file of knownRunFiles) {
    builder.addNode(file.node);
    refIndex.set(file.ref, {
      node_id: file.node.id,
      kind: file.kind,
      source_ref: file.source_ref
    });
  }

  if (previewBuild) {
    const previewBuildRef = stringOrUndefined(previewBuild.value.preview_build_ref);

    if (previewBuildRef) {
      builder.addNode(previewBuildNode(previewBuild.value, previewBuild.source_ref));
      refIndex.set(previewBuildRef, {
        node_id: previewBuildId(previewBuildRef),
        kind: "preview_build",
        source_ref: previewBuild.source_ref
      });

      const pageSpecRef = stringOrUndefined(previewBuild.value.page_spec_ref);

      if (pageSpecRef) {
        const target = refIndex.get(pageSpecRef);

        if (target) {
          builder.addLink({
            source: previewBuildId(previewBuildRef),
            target: target.node_id,
            relation: "compiled_from",
            confidence: "EXTRACTED",
            source_ref: previewBuild.source_ref,
            metadata: {
              ref_kind: target.kind
            }
          });
        }
      }
    }
  }

  if (publishHandoff) {
    const publishVersionRef = stringOrUndefined(publishHandoff.value.publish_version_ref);
    const previewBuildRef = stringOrUndefined(publishHandoff.value.preview_build_ref);
    const handoffNode = publishHandoffNode(publishHandoff.value, publishHandoff.source_ref);

    builder.addNode(handoffNode);

    if (publishVersionRef) {
      const target = refIndex.get(publishVersionRef);

      if (target) {
        builder.addLink({
          source: handoffNode.id,
          target: target.node_id,
          relation: "published_from",
          confidence: "EXTRACTED",
          source_ref: publishHandoff.source_ref,
          metadata: {
            ref_kind: target.kind
          }
        });
      }
    }

    if (previewBuildRef) {
      const target = refIndex.get(previewBuildRef);

      if (target) {
        builder.addLink({
          source: handoffNode.id,
          target: target.node_id,
          relation: "published_from",
          confidence: "EXTRACTED",
          source_ref: publishHandoff.source_ref,
          metadata: {
            ref_kind: target.kind
          }
        });
      }
    }
  }

  for (const event of events.records) {
    const eventNode = runEventNode(event.record, event.ordinal, events.source_ref);
    builder.addNode(eventNode);

    const stage = stringOrUndefined(event.record.stage);
    const fromState = stringOrUndefined(event.record.from_state);
    const toState = stringOrUndefined(event.record.to_state);

    if (fromState) {
      builder.addNode(statusNode("run", fromState, events.source_ref));
    }

    if (toState) {
      builder.addNode(statusNode("run", toState, events.source_ref));
    }

    if (stage) {
      builder.addLink({
        source: stageId(stage),
        target: eventNode.id,
        relation: "emits_event",
        confidence: "EXTRACTED",
        source_ref: events.source_ref,
        metadata: {
          event_type: stringOrUndefined(event.record.type) ?? "unknown"
        }
      });
    }
  }

  for (const attempt of attempts) {
    const attemptNode = adapterAttemptNode(attempt);
    builder.addNode(attemptNode);
    builder.addLink({
      source: stageId(attempt.stage),
      target: attemptNode.id,
      relation: "attempted_by",
      confidence: "EXTRACTED",
      source_ref: attempt.source_ref,
      metadata: {}
    });

    const status = stringOrUndefined(attempt.result.status);

    if (status) {
      builder.addNode(statusNode("adapter", status, attempt.source_ref));
      builder.addLink({
        source: attemptNode.id,
        target: statusId("adapter", status),
        relation: "attempt_has_status",
        confidence: "EXTRACTED",
        source_ref: attempt.source_ref,
        metadata: {}
      });
    }

    for (const candidate of candidateArtifacts(attempt.result)) {
      builder.addNode(artifactTypeNode(candidate.artifact_type, attempt.source_ref));
      builder.addLink({
        source: attemptNode.id,
        target: artifactTypeId(candidate.artifact_type),
        relation: "adapter_produced_candidate",
        confidence: "EXTRACTED",
        source_ref: attempt.source_ref,
        metadata: {
          target_kind: "artifact_type"
        }
      });

      if (candidate.artifact_id) {
        const persistedArtifact = artifactIndex.by_id.get(candidate.artifact_id);

        if (persistedArtifact) {
          builder.addLink({
            source: attemptNode.id,
            target: artifactInstanceId(candidate.artifact_id),
            relation: "adapter_produced_candidate",
            confidence: "EXTRACTED",
            source_ref: attempt.source_ref,
            metadata: {
              target_kind: "artifact_instance",
              artifact_type: stringOrUndefined(persistedArtifact.artifact.artifact_type) ?? candidate.artifact_type
            }
          });
        }
      }
    }
  }

  for (const record of artifacts) {
    linkArtifactRefs(builder, record, refIndex);
  }

  const diagnostics = finalizeDiagnostics(
    collectRunDiagnostics({
      run,
      stageProfiles,
      events,
      artifacts,
      artifactIndex,
      refIndex,
      previewBuild,
      publishHandoff
    })
  );

  for (const diagnostic of diagnostics) {
    builder.addDiagnostic(diagnostic);
  }

  return {
    schema_version: HARNESS_GRAPH_SCHEMA_VERSION,
    graph_type: "run-evidence",
    generated_at: options.generatedAt ?? new Date().toISOString(),
    source_refs: [...sourceRefs].filter(Boolean).sort(),
    nodes: builder.nodes(),
    links: builder.links(),
    diagnostics
  };
}

export async function writeRunEvidenceGraph(options: RunGraphBuildOptions): Promise<RunGraphWriteResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const graph = await buildRunEvidenceGraph({ ...options, rootDir, runDir });
  const analysisDir = path.join(runDir, RUN_ANALYSIS_DIR);
  const graphPath = path.join(analysisDir, "run-graph.json");
  const reportPath = path.join(analysisDir, "run-graph-report.md");

  await mkdir(analysisDir, { recursive: true });
  await writeFile(graphPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
  await writeFile(reportPath, renderHarnessGraphReport(graph), "utf8");

  return {
    graph,
    graph_path: graphPath,
    report_path: reportPath
  };
}

export async function readRunGraphSummary(options: {
  rootDir?: string;
  runDir: string;
}): Promise<HarnessGraphSummary | null> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const graphPath = path.join(runDir, RUN_ANALYSIS_DIR, "run-graph.json");
  const graph = await readJsonIfPresent(graphPath);

  if (!graph) {
    return null;
  }

  return summarizeHarnessGraph(graph as HarnessGraph, {
    graph_path: graphPath,
    report_path: path.join(runDir, RUN_ANALYSIS_DIR, "run-graph-report.md")
  });
}

export function summarizeHarnessGraph(
  graph: HarnessGraph,
  paths: {
    graph_path?: string;
    report_path?: string;
  } = {}
): HarnessGraphSummary {
  return {
    graph_type: graph.graph_type,
    schema_version: graph.schema_version,
    generated_at: graph.generated_at,
    nodes: graph.nodes.length,
    links: graph.links.length,
    diagnostics: graph.diagnostics.length,
    critical_diagnostics: graph.diagnostics.filter((diagnostic) => diagnostic.severity === "critical").length,
    warning_diagnostics: graph.diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length,
    info_diagnostics: graph.diagnostics.filter((diagnostic) => diagnostic.severity === "info").length,
    graph_path: paths.graph_path,
    report_path: paths.report_path
  };
}

export function renderHarnessGraphReport(graph: HarnessGraph): string {
  const counts = countNodesByType(graph.nodes);
  const godNodes = graphDegree(graph).slice(0, 8);
  const diagnostics = graph.diagnostics;
  const confidenceCounts = countLinksByConfidence(graph.links);
  const diagnosticCounts = countDiagnostics(graph.diagnostics);
  const keyArtifactLinks = keyArtifactChainLinks(graph);
  const surprising = surprisingConnections(graph);
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
    `- Artifact instances: ${counts.artifact_instance ?? 0}`,
    `- Adapter attempts: ${counts.adapter_attempt ?? 0}`,
    `- Run events: ${counts.run_event ?? 0}`,
    `- Compiled outputs: ${counts.compiled_output ?? 0}`,
    `- Links: ${graph.links.length}`,
    `- Diagnostics: ${diagnostics.length}`,
    "",
    "## Source Confidence",
    `- EXTRACTED links: ${confidenceCounts.EXTRACTED ?? 0}`,
    `- INFERRED links: ${confidenceCounts.INFERRED ?? 0}`,
    `- AMBIGUOUS links: ${confidenceCounts.AMBIGUOUS ?? 0}`,
    `- Critical hard diagnostics: ${diagnosticCounts.critical_hard}`,
    "",
    "Authoritative facts are labeled EXTRACTED and come directly from repository configuration or run evidence. INFERRED observations are explanatory joins. AMBIGUOUS observations need human review before action.",
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

  lines.push("", "## Surprising Connections");

  if (surprising.length === 0) {
    lines.push("- None.");
  } else {
    lines.push(...surprising.map((item) => `- ${item}`));
  }

  if (keyArtifactLinks.length > 0) {
    lines.push("", "## Key Artifact Chain");
    lines.push(...keyArtifactLinks.map((item) => `- ${item}`));
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
  if (graph.graph_type === "harness-topology") {
    lines.push("- Are stage allowed outputs still aligned with actual producer packs?");
    lines.push("- Do next-stage transitions form the expected workflow chain?");
    lines.push("- Are critical topology diagnostics candidates for CI promotion?");
  } else {
    lines.push("- Do adapter attempts resolve to the persisted artifacts they claimed to produce?");
    lines.push("- Do runner-owned artifacts bind to the preview build and publish handoff expected by downstream stages?");
    lines.push("- Are hard diagnostics supported by direct evidence and actionable without inference?");
  }
  lines.push("");

  return lines.join("\n");
}

type RunEventRecord = {
  ordinal: number;
  record: Record<string, unknown>;
};

function countLinksByConfidence(links: HarnessGraphLink[]): Partial<Record<HarnessGraphConfidence, number>> {
  const counts: Partial<Record<HarnessGraphConfidence, number>> = {};

  for (const link of links) {
    counts[link.confidence] = (counts[link.confidence] ?? 0) + 1;
  }

  return counts;
}

function countDiagnostics(diagnostics: HarnessGraphDiagnostic[]): {
  critical_hard: number;
} {
  return {
    critical_hard: diagnostics.filter(
      (diagnostic) => diagnostic.severity === "critical" && diagnostic.check_kind === "hard"
    ).length
  };
}

function surprisingConnections(graph: HarnessGraph): string[] {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const findings: string[] = [];

  for (const diagnostic of graph.diagnostics.filter((item) => item.severity === "critical").slice(0, 5)) {
    findings.push(`[${diagnostic.confidence}] ${diagnostic.message}`);
  }

  if (graph.graph_type === "run-evidence") {
    const crossStageRefs = graph.links
      .filter((link) => link.relation === "resolves_input_ref" && link.target.startsWith("artifact:"))
      .filter((link) => {
        const sourceStage = stringOrUndefined(nodeById.get(link.source)?.metadata.producer_stage);
        const targetStage = stringOrUndefined(nodeById.get(link.target)?.metadata.producer_stage);
        return sourceStage && targetStage && sourceStage !== targetStage;
      })
      .slice(0, 5);

    for (const link of crossStageRefs) {
      const sourceStage = stringOrUndefined(nodeById.get(link.source)?.metadata.producer_stage) ?? "unknown";
      const targetStage = stringOrUndefined(nodeById.get(link.target)?.metadata.producer_stage) ?? "unknown";
      findings.push(
        `[${link.confidence}] ${link.source} consumes ${link.target} across ${targetStage} -> ${sourceStage}`
      );
    }
  }

  if (graph.graph_type === "harness-topology") {
    const contextLinks = graph.links
      .filter((link) => link.relation === "uses_context_pack" || link.relation === "uses_verifier_pack")
      .slice(0, 5);

    for (const link of contextLinks) {
      findings.push(`[${link.confidence}] ${link.source} ${link.relation} ${link.target}`);
    }
  }

  return findings;
}

function keyArtifactChainLinks(graph: HarnessGraph): string[] {
  if (graph.graph_type !== "run-evidence") {
    return [];
  }

  return graph.links
    .filter((link) => link.relation === "adapter_persisted_artifact" || link.relation === "runner_persisted_artifact")
    .slice(0, 12)
    .map((link) => `[${link.confidence}] ${link.source} ${link.relation} ${link.target}`);
}

type RunEvents = {
  source_ref: string;
  records: RunEventRecord[];
};

type RunArtifactRecord = {
  source_ref: string;
  rejected: boolean;
  artifact: Record<string, unknown>;
};

type RunAttemptRecord = {
  stage: string;
  attempt_id: string;
  source_ref: string;
  result: Record<string, unknown>;
};

type JsonEvidenceFile = {
  source_ref: string;
  value: Record<string, unknown>;
};

type KnownRunFileRef = {
  ref: string;
  kind: string;
  source_ref: string;
  node: HarnessGraphNode;
};

type ArtifactIndex = {
  by_id: Map<string, RunArtifactRecord>;
  validated_by_type: Map<string, RunArtifactRecord>;
};

async function readRunEvents(runDir: string): Promise<RunEvents> {
  const ndjson = await readTextIfPresent(path.join(runDir, "events.ndjson"));

  if (ndjson !== null) {
    return {
      source_ref: "events.ndjson",
      records: parseEventLines(ndjson)
    };
  }

  const jsonl = await readTextIfPresent(path.join(runDir, "events.jsonl"));

  return {
    source_ref: jsonl === null ? "events.ndjson" : "events.jsonl",
    records: jsonl === null ? [] : parseEventLines(jsonl)
  };
}

function parseEventLines(text: string): RunEventRecord[] {
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line, ordinal) => ({
      ordinal,
      record: JSON.parse(line) as Record<string, unknown>
    }));
}

async function readRunArtifacts(runDir: string): Promise<RunArtifactRecord[]> {
  const artifactsDir = path.join(runDir, "artifacts");
  const artifactFiles = (await readDirIfPresent(artifactsDir))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => ({ fileName, rejected: false }));
  const rejectedFiles = (await readDirIfPresent(path.join(artifactsDir, "rejected")))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) => ({ fileName: path.join("rejected", fileName), rejected: true }));

  return Promise.all(
    [...artifactFiles, ...rejectedFiles].map(async (file) => ({
      source_ref: path.join("artifacts", file.fileName),
      rejected: file.rejected,
      artifact: await readJson(path.join(artifactsDir, file.fileName))
    }))
  );
}

async function readRunAttempts(runDir: string): Promise<RunAttemptRecord[]> {
  const attempts: RunAttemptRecord[] = [];

  for (const stage of await listRunStageNames(runDir)) {
    const stageDir = path.join(runDir, "stages", stage);

    for (const attemptId of await listAttemptIds(stageDir)) {
      const sourceRef = path.join("stages", stage, "attempts", attemptId, "adapter-result.json");
      const result = await readRunJsonIfPresent(runDir, sourceRef);

      if (result) {
        attempts.push({
          stage,
          attempt_id: attemptId,
          source_ref: sourceRef,
          result: result.value
        });
      }
    }

    const stageResult = await readRunJsonIfPresent(runDir, path.join("stages", stage, "adapter-result.json"));
    const latestUsage = isRecord(stageResult?.value.usage) ? stageResult.value.usage : {};
    const latestAttemptId = stringOrUndefined(latestUsage.attempt_id);

    if (stageResult && latestAttemptId && !attempts.some((attempt) => attempt.stage === stage && attempt.attempt_id === latestAttemptId)) {
      attempts.push({
        stage,
        attempt_id: latestAttemptId,
        source_ref: stageResult.source_ref,
        result: stageResult.value
      });
    }
  }

  return attempts.sort(
    (left, right) => left.stage.localeCompare(right.stage) || left.attempt_id.localeCompare(right.attempt_id)
  );
}

async function knownRunFileRefs(
  runDir: string,
  previewBuild: JsonEvidenceFile | null,
  publishHandoff: JsonEvidenceFile | null
): Promise<KnownRunFileRef[]> {
  const refs: KnownRunFileRef[] = [];

  if (await fileExists(path.join(runDir, "stages/normalize-input/normalized-input.json"))) {
    refs.push(runFileRef("stages/normalize-input/normalized-input.json", "normalized_input"));
  }

  if (previewBuild) {
    refs.push({
      ref: previewBuild.source_ref,
      kind: "preview_build_file",
      source_ref: previewBuild.source_ref,
      node: previewBuildNode(previewBuild.value, previewBuild.source_ref)
    });
  }

  if (publishHandoff) {
    refs.push({
      ref: publishHandoff.source_ref,
      kind: "publish_handoff_file",
      source_ref: publishHandoff.source_ref,
      node: publishHandoffNode(publishHandoff.value, publishHandoff.source_ref)
    });
  }

  return refs;
}

function runFileRef(sourceRef: string, kind: string): KnownRunFileRef {
  return {
    ref: sourceRef,
    kind,
    source_ref: sourceRef,
    node: {
      id: runFileNodeId(sourceRef),
      type: "compiled_output",
      label: sourceRef,
      source_ref: sourceRef,
      metadata: {
        kind
      }
    }
  };
}

function buildArtifactIndex(artifacts: RunArtifactRecord[]): ArtifactIndex {
  const byId = new Map<string, RunArtifactRecord>();
  const validatedByType = new Map<string, RunArtifactRecord>();

  for (const record of artifacts) {
    const artifactId = stringOrUndefined(record.artifact.artifact_id);
    const artifactType = stringOrUndefined(record.artifact.artifact_type);
    const status = stringOrUndefined(record.artifact.status);

    if (artifactId) {
      byId.set(artifactId, record);
    }

    if (artifactType && status === "validated" && !record.rejected) {
      validatedByType.set(artifactType, record);
    }
  }

  return {
    by_id: byId,
    validated_by_type: validatedByType
  };
}

function linkArtifactRefs(
  builder: GraphBuilder,
  record: RunArtifactRecord,
  refIndex: Map<string, { node_id: string; kind: string; source_ref: string }>
): void {
  const artifactId = stringOrUndefined(record.artifact.artifact_id);

  if (!artifactId) {
    return;
  }

  const artifactNodeId = artifactInstanceId(artifactId);

  for (const inputRef of stringArray(record.artifact.input_refs)) {
    const target = refIndex.get(inputRef);

    if (!target) {
      continue;
    }

    builder.addLink({
      source: artifactNodeId,
      target: target.node_id,
      relation: "resolves_input_ref",
      confidence: "EXTRACTED",
      source_ref: record.source_ref,
      metadata: {
        input_ref: inputRef,
        ref_kind: target.kind
      }
    });
  }

  for (const evidenceRef of evidenceRefs(record.artifact)) {
    const target = refIndex.get(evidenceRef);

    if (!target) {
      continue;
    }

    builder.addLink({
      source: artifactNodeId,
      target: target.node_id,
      relation: "references_run_file",
      confidence: "EXTRACTED",
      source_ref: record.source_ref,
      metadata: {
        evidence_ref: evidenceRef,
        ref_kind: target.kind
      }
    });
  }
}

function collectRunDiagnostics(options: {
  run: Record<string, unknown>;
  stageProfiles: StageProfiles;
  events: RunEvents;
  artifacts: RunArtifactRecord[];
  artifactIndex: ArtifactIndex;
  refIndex: Map<string, { node_id: string; kind: string; source_ref: string }>;
  previewBuild: JsonEvidenceFile | null;
  publishHandoff: JsonEvidenceFile | null;
}): PendingDiagnostic[] {
  return [
    ...missingExpectedArtifactDiagnostics(options),
    ...missingInputRefDiagnostics(options),
    ...runStateDiagnostics(options),
    ...publishHandoffDiagnostics(options),
    ...rejectedArtifactDiagnostics(options.artifacts),
    ...bindingDiagnostics(options)
  ];
}

function missingExpectedArtifactDiagnostics(options: {
  stageProfiles: StageProfiles;
  events: RunEvents;
  artifactIndex: ArtifactIndex;
}): PendingDiagnostic[] {
  const completedStages = new Set(
    options.events.records
      .filter((event) => stringOrUndefined(event.record.type) === "stage_completed")
      .map((event) => stringOrUndefined(event.record.stage))
      .filter((stage): stage is string => Boolean(stage))
  );
  const diagnostics: PendingDiagnostic[] = [];

  for (const profile of options.stageProfiles.stages) {
    if (!completedStages.has(profile.stage)) {
      continue;
    }

    for (const artifactType of profile.allowed_outputs ?? []) {
      const artifact = options.artifactIndex.validated_by_type.get(artifactType);

      if (artifact && stringOrUndefined(artifact.artifact.producer_stage) === profile.stage) {
        continue;
      }

      diagnostics.push({
        code: "completed_stage_missing_expected_artifact",
        message: `Completed stage ${profile.stage} is missing validated ${artifactType}`,
        severity: "critical",
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

  return diagnostics;
}

function missingInputRefDiagnostics(options: {
  artifacts: RunArtifactRecord[];
  refIndex: Map<string, { node_id: string; kind: string; source_ref: string }>;
}): PendingDiagnostic[] {
  const diagnostics: PendingDiagnostic[] = [];

  for (const record of options.artifacts) {
    const artifactId = stringOrUndefined(record.artifact.artifact_id);

    if (!artifactId) {
      continue;
    }

    for (const inputRef of stringArray(record.artifact.input_refs)) {
      if (options.refIndex.has(inputRef)) {
        continue;
      }

      diagnostics.push({
        code: "artifact_input_ref_not_found",
        message: `Artifact ${artifactId} input_ref ${inputRef} does not resolve to known run evidence`,
        severity: "critical",
        check_kind: "hard",
        confidence: "EXTRACTED",
        source_ref: record.source_ref,
        target_ids: [artifactInstanceId(artifactId)],
        metadata: {
          artifact_id: artifactId,
          input_ref: inputRef
        }
      });
    }
  }

  return diagnostics;
}

function runStateDiagnostics(options: {
  run: Record<string, unknown>;
  events: RunEvents;
}): PendingDiagnostic[] {
  const runState = stringOrUndefined(options.run.state);
  const finalEventState = [...options.events.records]
    .reverse()
    .map((event) => stringOrUndefined(event.record.to_state))
    .find(Boolean);

  if (!runState || !finalEventState || runState === finalEventState) {
    return [];
  }

  return [
    {
      code: "run_state_disagrees_with_final_event",
      message: `run.json state ${runState} disagrees with final event state ${finalEventState}`,
      severity: "critical",
      check_kind: "hard",
      confidence: "EXTRACTED",
      source_ref: "run.json",
      target_ids: [statusId("run", runState), statusId("run", finalEventState)],
      metadata: {
        run_state: runState,
        final_event_state: finalEventState
      }
    }
  ];
}

function publishHandoffDiagnostics(options: {
  run: Record<string, unknown>;
  publishHandoff: JsonEvidenceFile | null;
}): PendingDiagnostic[] {
  const runState = stringOrUndefined(options.run.state);

  if (runState !== "published" || options.publishHandoff) {
    return [];
  }

  return [
    {
      code: "published_run_missing_publish_handoff",
      message: "Published run is missing previews/publish-handoff.json",
      severity: "critical",
      check_kind: "hard",
      confidence: "EXTRACTED",
      source_ref: "run.json",
      target_ids: [statusId("run", "published")],
      metadata: {}
    }
  ];
}

function rejectedArtifactDiagnostics(artifacts: RunArtifactRecord[]): PendingDiagnostic[] {
  const diagnostics: PendingDiagnostic[] = [];

  for (const record of artifacts) {
    const status = stringOrUndefined(record.artifact.status);
    const artifactId = stringOrUndefined(record.artifact.artifact_id);

    if (status !== "rejected" || !artifactId) {
      continue;
    }

    const validation = isRecord(record.artifact.validation) ? record.artifact.validation : {};
    const errors = stringArray(validation.errors);

    if (errors.length > 0) {
      continue;
    }

    diagnostics.push({
      code: "rejected_artifact_missing_validation_errors",
      message: `Rejected artifact ${artifactId} has no validation errors`,
      severity: "critical",
      check_kind: "hard",
      confidence: "EXTRACTED",
      source_ref: record.source_ref,
      target_ids: [artifactInstanceId(artifactId)],
      metadata: {
        artifact_id: artifactId
      }
    });
  }

  return diagnostics;
}

function bindingDiagnostics(options: {
  artifactIndex: ArtifactIndex;
  previewBuild: JsonEvidenceFile | null;
  publishHandoff: JsonEvidenceFile | null;
}): PendingDiagnostic[] {
  const diagnostics: PendingDiagnostic[] = [];
  const pageSpec = options.artifactIndex.validated_by_type.get("PageSpec");
  const qaReport = options.artifactIndex.validated_by_type.get("QAReport");
  const publishVersion = options.artifactIndex.validated_by_type.get("PublishVersion");
  const qaReportPayload = isRecord(qaReport?.artifact.payload) ? qaReport.artifact.payload : {};
  const publishVersionPayload = isRecord(publishVersion?.artifact.payload) ? publishVersion.artifact.payload : {};
  const pageSpecId = stringOrUndefined(pageSpec?.artifact.artifact_id);
  const qaReportId = stringOrUndefined(qaReport?.artifact.artifact_id);
  const publishVersionId = stringOrUndefined(publishVersion?.artifact.artifact_id);
  const previewBuildRef = stringOrUndefined(options.previewBuild?.value.preview_build_ref);

  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "preview_build_page_spec_ref_mismatch",
      message: "compiled/preview-build.json page_spec_ref does not match persisted PageSpec",
      source_ref: options.previewBuild?.source_ref,
      left: stringOrUndefined(options.previewBuild?.value.page_spec_ref),
      right: pageSpecId,
      target_ids: [
        previewBuildRef ? previewBuildId(previewBuildRef) : undefined,
        pageSpecId ? artifactInstanceId(pageSpecId) : undefined
      ]
    })
  );
  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "qa_report_page_spec_ref_mismatch",
      message: "QAReport payload page_spec_ref does not match persisted PageSpec",
      source_ref: qaReport?.source_ref,
      left: stringOrUndefined(qaReportPayload.page_spec_ref),
      right: pageSpecId,
      target_ids: [
        qaReportId ? artifactInstanceId(qaReportId) : undefined,
        pageSpecId ? artifactInstanceId(pageSpecId) : undefined
      ]
    })
  );
  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "qa_report_preview_build_ref_mismatch",
      message: "QAReport payload preview_build_ref does not match compiled preview build",
      source_ref: qaReport?.source_ref,
      left: stringOrUndefined(qaReportPayload.preview_build_ref),
      right: previewBuildRef,
      target_ids: [
        qaReportId ? artifactInstanceId(qaReportId) : undefined,
        previewBuildRef ? previewBuildId(previewBuildRef) : undefined
      ]
    })
  );
  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "publish_version_page_spec_ref_mismatch",
      message: "PublishVersion payload page_spec_ref does not match persisted PageSpec",
      source_ref: publishVersion?.source_ref,
      left: stringOrUndefined(publishVersionPayload.page_spec_ref),
      right: pageSpecId,
      target_ids: [
        publishVersionId ? artifactInstanceId(publishVersionId) : undefined,
        pageSpecId ? artifactInstanceId(pageSpecId) : undefined
      ]
    })
  );
  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "publish_version_qa_report_ref_mismatch",
      message: "PublishVersion payload qa_report_ref does not match persisted QAReport",
      source_ref: publishVersion?.source_ref,
      left: stringOrUndefined(publishVersionPayload.qa_report_ref),
      right: qaReportId,
      target_ids: [
        publishVersionId ? artifactInstanceId(publishVersionId) : undefined,
        qaReportId ? artifactInstanceId(qaReportId) : undefined
      ]
    })
  );
  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "publish_handoff_publish_version_ref_mismatch",
      message: "publish-handoff publish_version_ref does not match persisted PublishVersion",
      source_ref: options.publishHandoff?.source_ref,
      left: stringOrUndefined(options.publishHandoff?.value.publish_version_ref),
      right: publishVersionId,
      target_ids: [
        publishVersionId ? artifactInstanceId(publishVersionId) : undefined,
        stringOrUndefined(options.publishHandoff?.value.publish_version_ref)
          ? publishHandoffId(stringOrUndefined(options.publishHandoff?.value.publish_version_ref) ?? "unknown")
          : undefined
      ]
    })
  );
  diagnostics.push(
    ...bindingMismatchDiagnostic({
      code: "publish_handoff_preview_build_ref_mismatch",
      message: "publish-handoff preview_build_ref does not match compiled preview build",
      source_ref: options.publishHandoff?.source_ref,
      left: stringOrUndefined(options.publishHandoff?.value.preview_build_ref),
      right: previewBuildRef,
      target_ids: [
        previewBuildRef ? previewBuildId(previewBuildRef) : undefined,
        stringOrUndefined(options.publishHandoff?.value.publish_version_ref)
          ? publishHandoffId(stringOrUndefined(options.publishHandoff?.value.publish_version_ref) ?? "unknown")
          : undefined
      ]
    })
  );

  return diagnostics;
}

function bindingMismatchDiagnostic(options: {
  code: string;
  message: string;
  source_ref?: string;
  left?: string;
  right?: string;
  target_ids: Array<string | undefined>;
}): PendingDiagnostic[] {
  if (!options.source_ref || !options.left || !options.right || options.left === options.right) {
    return [];
  }

  return [
    {
      code: options.code,
      message: options.message,
      severity: "critical",
      check_kind: "hard",
      confidence: "EXTRACTED",
      source_ref: options.source_ref,
      target_ids: options.target_ids.filter((id): id is string => Boolean(id)),
      metadata: {
        observed: options.left,
        expected: options.right
      }
    }
  ];
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

function runStageNode(stage: string): HarnessGraphNode {
  return {
    id: stageId(stage),
    type: "stage",
    label: stage,
    source_ref: `stages/${stage}`,
    metadata: {
      allowed_outputs: []
    }
  };
}

function statusNode(kind: string, value: string, sourceRef: string): HarnessGraphNode {
  return {
    id: statusId(kind, value),
    type: "status",
    label: `${kind}:${value}`,
    source_ref: sourceRef,
    metadata: {
      kind,
      value
    }
  };
}

function artifactInstanceNode(record: RunArtifactRecord): HarnessGraphNode {
  const artifactId = stringOrUndefined(record.artifact.artifact_id) ?? "unknown";
  const artifactType = stringOrUndefined(record.artifact.artifact_type) ?? "unknown";
  const validation = isRecord(record.artifact.validation) ? record.artifact.validation : {};

  return {
    id: artifactInstanceId(artifactId),
    type: "artifact_instance",
    label: artifactId,
    source_ref: record.source_ref,
    metadata: {
      artifact_type: artifactType,
      status: stringOrUndefined(record.artifact.status) ?? "unknown",
      producer_stage: stringOrUndefined(record.artifact.producer_stage),
      validation_valid: typeof validation.valid === "boolean" ? validation.valid : undefined,
      validation_errors: stringArray(validation.errors),
      rejected: record.rejected
    }
  };
}

function previewBuildNode(previewBuild: Record<string, unknown>, sourceRef: string): HarnessGraphNode {
  const previewBuildRef = stringOrUndefined(previewBuild.preview_build_ref) ?? stableHash(sourceRef);

  return {
    id: previewBuildId(previewBuildRef),
    type: "compiled_output",
    label: previewBuildRef,
    source_ref: sourceRef,
    metadata: {
      kind: "preview_build",
      preview_build_ref: previewBuildRef,
      page_spec_ref: stringOrUndefined(previewBuild.page_spec_ref),
      route_id: stringOrUndefined(previewBuild.route_id)
    }
  };
}

function publishHandoffNode(handoff: Record<string, unknown>, sourceRef: string): HarnessGraphNode {
  const publishVersionRef = stringOrUndefined(handoff.publish_version_ref) ?? stableHash(sourceRef);

  return {
    id: publishHandoffId(publishVersionRef),
    type: "compiled_output",
    label: sourceRef,
    source_ref: sourceRef,
    metadata: {
      kind: "publish_handoff",
      publish_version_ref: stringOrUndefined(handoff.publish_version_ref),
      preview_build_ref: stringOrUndefined(handoff.preview_build_ref),
      preview_url: stringOrUndefined(handoff.preview_url)
    }
  };
}

function runEventNode(event: Record<string, unknown>, ordinal: number, sourceRef: string): HarnessGraphNode {
  const eventName = stringOrUndefined(event.event_id) ?? stringOrUndefined(event.type) ?? "unknown";

  return {
    id: `event:${ordinal}:${eventName}`,
    type: "run_event",
    label: eventName,
    source_ref: sourceRef,
    metadata: {
      ordinal,
      event_id: stringOrUndefined(event.event_id),
      event_type: stringOrUndefined(event.type),
      stage: stringOrUndefined(event.stage),
      from_state: stringOrUndefined(event.from_state),
      to_state: stringOrUndefined(event.to_state),
      ts: stringOrUndefined(event.ts)
    }
  };
}

function adapterAttemptNode(attempt: RunAttemptRecord): HarnessGraphNode {
  const usage = isRecord(attempt.result.usage) ? attempt.result.usage : {};

  return {
    id: adapterAttemptId(attempt.stage, attempt.attempt_id),
    type: "adapter_attempt",
    label: attempt.attempt_id,
    source_ref: attempt.source_ref,
    metadata: {
      stage: attempt.stage,
      status: stringOrUndefined(attempt.result.status),
      usage_mode: stringOrUndefined(usage.mode),
      failure_mode: stringOrUndefined(attempt.result.failure_mode),
      duration_ms: numberOrUndefined(usage.duration_ms),
      timeout_ms: numberOrUndefined(usage.timeout_ms)
    }
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

function artifactInstanceId(artifactId: string): string {
  return `artifact:${artifactId}`;
}

function adapterAttemptId(stage: string, attemptId: string): string {
  return `attempt:${stage}:${attemptId}`;
}

function previewBuildId(previewBuildRef: string): string {
  return `compiled:preview-build:${previewBuildRef}`;
}

function publishHandoffId(publishVersionRef: string): string {
  return `compiled:publish-handoff:${publishVersionRef}`;
}

function runFileNodeId(sourceRef: string): string {
  return `compiled:run-file:${stableHash(sourceRef)}`;
}

function statusId(kind: string, value: string): string {
  return `status:${kind}:${value}`;
}

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
}

async function readJsonIfPresent(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    return await readJson(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function readRunJsonIfPresent(runDir: string, sourceRef: string): Promise<JsonEvidenceFile | null> {
  const value = await readJsonIfPresent(path.join(runDir, sourceRef));

  return value
    ? {
        source_ref: sourceRef,
        value
      }
    : null;
}

async function readTextIfPresent(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
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

async function listRunStageNames(runDir: string): Promise<string[]> {
  const stagesDir = path.join(runDir, "stages");
  const fileNames = await readDirIfPresent(stagesDir);
  const stageNames: string[] = [];

  for (const fileName of fileNames) {
    if (fileName === "repairing" || fileName === "retrying") {
      continue;
    }

    const fileStat = await stat(path.join(stagesDir, fileName));

    if (fileStat.isDirectory()) {
      stageNames.push(fileName);
    }
  }

  return stageNames.sort();
}

async function listAttemptIds(stageDir: string): Promise<string[]> {
  const attemptDir = path.join(stageDir, "attempts");
  const fileNames = await readDirIfPresent(attemptDir);
  const attemptIds: string[] = [];

  for (const fileName of fileNames) {
    const fileStat = await stat(path.join(attemptDir, fileName));

    if (fileStat.isDirectory()) {
      attemptIds.push(fileName);
    }
  }

  return attemptIds.sort();
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

function candidateArtifacts(result: Record<string, unknown>): Array<{ artifact_type: string; artifact_id?: string }> {
  if (!Array.isArray(result.produced_artifact_candidates)) {
    return [];
  }

  const candidates = new Map<string, { artifact_type: string; artifact_id?: string }>();

  for (const candidate of result.produced_artifact_candidates) {
    if (!isRecord(candidate)) {
      continue;
    }

    const artifactType = stringOrUndefined(candidate.artifact_type);

    if (!artifactType) {
      continue;
    }

    const artifactId = stringOrUndefined(candidate.artifact_id);
    const key = `${artifactType}:${artifactId ?? ""}`;
    candidates.set(key, {
      artifact_type: artifactType,
      artifact_id: artifactId
    });
  }

  return [...candidates.values()];
}

function evidenceRefs(artifact: Record<string, unknown>): string[] {
  const payload = isRecord(artifact.payload) ? artifact.payload : {};
  const refs = new Set<string>(stringArray(payload.evidence_refs));

  if (Array.isArray(payload.gate_results)) {
    for (const gate of payload.gate_results) {
      if (isRecord(gate)) {
        for (const ref of stringArray(gate.evidence_refs)) {
          refs.add(ref);
        }
      }
    }
  }

  return [...refs];
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function finalizeDiagnostics(diagnostics: PendingDiagnostic[]): HarnessGraphDiagnostic[] {
  const seen = new Map<string, HarnessGraphDiagnostic>();

  for (const diagnostic of diagnostics) {
    const normalized = {
      ...diagnostic,
      target_ids: uniqueStrings(diagnostic.target_ids).sort(),
      metadata: sortObject(diagnostic.metadata) as Record<string, unknown>
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
