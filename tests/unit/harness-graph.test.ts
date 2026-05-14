import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildHarnessTopologyGraph } from "../../superpowers/runner/harness-graph.ts";
import { runCli } from "../../superpowers/runner/cli.ts";

const GENERATED_AT = "2026-05-13T00:00:00.000Z";

describe("harness topology graph", () => {
  it("emits the 1.0.0 topology graph contract with stable ids", async () => {
    const rootDir = await createFixture({
      registryYaml: validRegistryYaml(),
      stageProfilesYaml: validStageProfilesYaml(),
      packPaths: [
        "superpowers/packs/base/context/SKILL.md",
        "superpowers/packs/tasks/start/SKILL.md",
        "superpowers/packs/tasks/done/SKILL.md",
        "superpowers/packs/verifiers/done/SKILL.md"
      ]
    });

    const graph = await buildHarnessTopologyGraph({
      rootDir,
      generatedAt: GENERATED_AT
    });

    expect(graph).toMatchObject({
      schema_version: "1.0.0",
      graph_type: "harness-topology",
      generated_at: GENERATED_AT,
      source_refs: ["superpowers/packs/registry.yaml", "superpowers/packs/stage-profiles.yaml"]
    });
    expect(graph.nodes.map((node) => node.id)).toEqual([
      "artifact-type:ProductBrief",
      "pack:base/context",
      "pack:tasks/done",
      "pack:tasks/start",
      "pack:verifiers/done",
      "stage:done",
      "stage:start",
      "terminal:end"
    ]);
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "stage:start",
        target: "artifact-type:ProductBrief",
        relation: "stage_allows_output",
        confidence: "EXTRACTED"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "stage:done",
        target: "terminal:end",
        relation: "next_stage",
        confidence: "EXTRACTED"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "stage:start",
        target: "pack:base/context",
        relation: "uses_context_pack",
        confidence: "EXTRACTED"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "stage:done",
        target: "pack:verifiers/done",
        relation: "uses_verifier_pack",
        confidence: "EXTRACTED"
      })
    );
    expect(graph.diagnostics).toEqual([]);
  });

  it("emits deterministic hard diagnostics for topology consistency problems", async () => {
    const rootDir = await createFixture({
      registryYaml: invalidRegistryYaml(),
      stageProfilesYaml: invalidStageProfilesYaml(),
      packPaths: ["superpowers/packs/tasks/b/SKILL.md"]
    });

    const graph = await buildHarnessTopologyGraph({
      rootDir,
      generatedAt: GENERATED_AT
    });
    const diagnosticsByCode = new Map(graph.diagnostics.map((diagnostic) => [diagnostic.code, diagnostic]));

    expect(diagnosticsByCode.get("missing_pack_path")).toMatchObject({
      severity: "critical",
      check_kind: "hard",
      target_ids: ["pack:tasks/a"]
    });
    expect(diagnosticsByCode.get("duplicate_artifact_producer_stage")).toMatchObject({
      severity: "critical",
      check_kind: "hard",
      target_ids: ["artifact-type:Shared", "stage:a", "stage:b"]
    });
    expect(diagnosticsByCode.get("unknown_next_stage")).toMatchObject({
      severity: "critical",
      check_kind: "hard"
    });
    expect(diagnosticsByCode.get("pack_stage_output_not_allowed")).toMatchObject({
      severity: "critical",
      check_kind: "hard"
    });
    expect(diagnosticsByCode.get("pack_produced_artifact_not_allowed")).toMatchObject({
      severity: "critical",
      check_kind: "hard"
    });
    expect(diagnosticsByCode.get("stage_output_without_producer")).toMatchObject({
      severity: "warning",
      check_kind: "hard",
      target_ids: ["artifact-type:Orphan", "stage:a"]
    });
    expect(graph.diagnostics.some((diagnostic) => diagnostic.message.includes("next_stage end"))).toBe(false);
    expect(graph.nodes.filter((node) => node.type === "diagnostic")).toHaveLength(graph.diagnostics.length);
  });

  it("writes harness graph diagnostics through the canonical CLI entry", async () => {
    const rootDir = await createFixture({
      registryYaml: validRegistryYaml(),
      stageProfilesYaml: validStageProfilesYaml(),
      packPaths: [
        "superpowers/packs/base/context/SKILL.md",
        "superpowers/packs/tasks/start/SKILL.md",
        "superpowers/packs/tasks/done/SKILL.md",
        "superpowers/packs/verifiers/done/SKILL.md"
      ]
    });
    const priorSourceRoot = process.env.FUSERA_SOURCE_ROOT;

    process.env.FUSERA_SOURCE_ROOT = rootDir;

    try {
      const result = await runCli(["graph", "harness"]);

      expect(result).toMatchObject({
        ok: true,
        command: "graph harness",
        summary: {
          diagnostics: 0
        }
      });

      const graphPath = path.join(rootDir, ".fusera/analysis/harness-graph.json");
      const reportPath = path.join(rootDir, ".fusera/analysis/harness-graph-report.md");
      const graph = JSON.parse(await readFile(graphPath, "utf8"));
      const report = await readFile(reportPath, "utf8");

      expect(graph.schema_version).toBe("1.0.0");
      expect(report).toContain("# Harness Graph Report");
    } finally {
      if (priorSourceRoot === undefined) {
        delete process.env.FUSERA_SOURCE_ROOT;
      } else {
        process.env.FUSERA_SOURCE_ROOT = priorSourceRoot;
      }
    }
  });
});

async function createFixture(options: {
  registryYaml: string;
  stageProfilesYaml: string;
  packPaths: string[];
}): Promise<string> {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "fusera-harness-graph-"));

  await mkdir(path.join(rootDir, "superpowers/packs"), { recursive: true });
  await writeFile(path.join(rootDir, "superpowers/packs/registry.yaml"), options.registryYaml, "utf8");
  await writeFile(path.join(rootDir, "superpowers/packs/stage-profiles.yaml"), options.stageProfilesYaml, "utf8");

  for (const packPath of options.packPaths) {
    const absolutePath = path.join(rootDir, packPath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, "# Fixture pack\n", "utf8");
  }

  return rootDir;
}

function validRegistryYaml(): string {
  return `
packs:
  - id: tasks/start
    path: superpowers/packs/tasks/start/SKILL.md
    kind: task
    stage: start
    output_modes:
      - landing-page
    backend_support:
      adapters:
        - codex
      preferred_adapters:
        - codex
    capabilities_required: []
    required_artifacts: []
    produces_artifacts:
      - ProductBrief
    stage_outputs:
      - ProductBrief
    task_role: primary
  - id: base/context
    path: superpowers/packs/base/context/SKILL.md
    kind: base
    stage: start
    output_modes:
      - landing-page
    backend_support:
      adapters:
        - codex
      preferred_adapters:
        - codex
    capabilities_required: []
    required_artifacts: []
    produces_artifacts: []
    stage_outputs: []
    task_role: context
  - id: tasks/done
    path: superpowers/packs/tasks/done/SKILL.md
    kind: task
    stage: done
    output_modes:
      - landing-page
    backend_support:
      adapters:
        - codex
      preferred_adapters:
        - codex
    capabilities_required: []
    required_artifacts:
      - artifact_type: ProductBrief
        allowed_statuses:
          - validated
        version_range: ^1.0.0
    produces_artifacts: []
    stage_outputs: []
    task_role: primary
  - id: verifiers/done
    path: superpowers/packs/verifiers/done/SKILL.md
    kind: verifier
    stage: done
    output_modes:
      - landing-page
    backend_support:
      adapters:
        - codex
      preferred_adapters:
        - codex
    capabilities_required: []
    required_artifacts:
      - artifact_type: ProductBrief
        allowed_statuses:
          - validated
        version_range: ^1.0.0
    produces_artifacts: []
    stage_outputs: []
    task_role: verifier
`;
}

function validStageProfilesYaml(): string {
  return `
stages:
  - stage: start
    primary_task: tasks/start
    allowed_auxiliary_tasks: []
    context_packs:
      - base/context
    allowed_outputs:
      - ProductBrief
    default_verifier: none
    default_backend: codex
    next_stage: done
  - stage: done
    primary_task: tasks/done
    allowed_auxiliary_tasks: []
    allowed_outputs: []
    default_verifier: verifiers/done
    default_backend: codex
    next_stage: end
`;
}

function invalidRegistryYaml(): string {
  return `
packs:
  - id: tasks/a
    path: superpowers/packs/tasks/a/SKILL.md
    kind: task
    stage: a
    output_modes:
      - landing-page
    backend_support:
      adapters:
        - codex
      preferred_adapters:
        - codex
    capabilities_required: []
    required_artifacts: []
    produces_artifacts:
      - Shared
      - Rogue
    stage_outputs:
      - Shared
      - Rogue
    task_role: primary
  - id: tasks/b
    path: superpowers/packs/tasks/b/SKILL.md
    kind: task
    stage: b
    output_modes:
      - landing-page
    backend_support:
      adapters:
        - codex
      preferred_adapters:
        - codex
    capabilities_required: []
    required_artifacts: []
    produces_artifacts:
      - Shared
    stage_outputs:
      - Shared
    task_role: primary
`;
}

function invalidStageProfilesYaml(): string {
  return `
stages:
  - stage: a
    primary_task: tasks/a
    allowed_auxiliary_tasks: []
    allowed_outputs:
      - Shared
      - Orphan
    default_verifier: none
    default_backend: codex
    next_stage: missing-stage
  - stage: b
    primary_task: tasks/b
    allowed_auxiliary_tasks: []
    allowed_outputs:
      - Shared
    default_verifier: none
    default_backend: codex
    next_stage: end
`;
}
