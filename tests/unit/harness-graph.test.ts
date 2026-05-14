import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildHarnessTopologyGraph, buildRunEvidenceGraph } from "../../superpowers/runner/harness-graph.ts";
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

  it("exposes topology diagnostics through doctor checks", async () => {
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
      const result = await runCli(["doctor", "--deep"]);
      const checks = result.checks as Array<{ name: string; ok: boolean; details?: Record<string, unknown> }>;
      const graphCheck = checks.find((check) => check.name === "harness-topology-graph");

      expect(graphCheck).toMatchObject({
        ok: true,
        details: {
          schema_version: "1.0.0",
          diagnostics: 0
        }
      });
    } finally {
      if (priorSourceRoot === undefined) {
        delete process.env.FUSERA_SOURCE_ROOT;
      } else {
        process.env.FUSERA_SOURCE_ROOT = priorSourceRoot;
      }
    }
  });

  it("builds run evidence graph from events, attempts, artifacts, and runner-owned outputs", async () => {
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
    const runDir = await createRunFixture(rootDir);

    const graph = await buildRunEvidenceGraph({
      rootDir,
      runDir,
      generatedAt: GENERATED_AT
    });

    expect(graph).toMatchObject({
      schema_version: "1.0.0",
      graph_type: "run-evidence",
      generated_at: GENERATED_AT
    });
    expect(graph.source_refs).toContain("events.ndjson");
    expect(graph.nodes).toContainEqual(
      expect.objectContaining({
        id: "attempt:start:attempt_start_1",
        type: "adapter_attempt",
        metadata: expect.objectContaining({
          status: "ok",
          usage_mode: "mock"
        })
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "attempt:start:attempt_start_1",
        target: "status:adapter:ok",
        relation: "attempt_has_status"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "attempt:start:attempt_start_1",
        target: "artifact-type:ProductBrief",
        relation: "adapter_produced_candidate",
        metadata: expect.objectContaining({
          target_kind: "artifact_type"
        })
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "stage:start",
        target: "artifact:product-brief_01",
        relation: "adapter_persisted_artifact"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "attempt:start:attempt_start_1",
        target: "artifact:product-brief_01",
        relation: "adapter_produced_candidate",
        metadata: expect.objectContaining({
          target_kind: "artifact_instance",
          artifact_type: "ProductBrief"
        })
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "stage:page-compile",
        target: "artifact:page-spec_01",
        relation: "runner_persisted_artifact"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "artifact:qa-report_01",
        target: "compiled:preview-build:preview-build_01",
        relation: "resolves_input_ref"
      })
    );
    expect(graph.links).toContainEqual(
      expect.objectContaining({
        source: "artifact:qa-report_01",
        target: "compiled:preview-build:preview-build_01",
        relation: "references_run_file"
      })
    );
    expect(graph.diagnostics).toEqual([]);
  });

  it("emits hard run evidence diagnostics for binding mismatches", async () => {
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
    const runDir = await createRunFixture(rootDir, {
      qaPreviewBuildRef: "preview-build_wrong"
    });

    const graph = await buildRunEvidenceGraph({
      rootDir,
      runDir,
      generatedAt: GENERATED_AT
    });
    const diagnostic = graph.diagnostics.find(
      (item) => item.code === "qa_report_preview_build_ref_mismatch"
    );

    expect(diagnostic).toMatchObject({
      severity: "critical",
      check_kind: "hard",
      confidence: "EXTRACTED",
      metadata: {
        observed: "preview-build_wrong",
        expected: "preview-build_01"
      }
    });
  });

  it("writes run graph through CLI and summarizes existing graph from inspect", async () => {
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
    const runDir = await createRunFixture(rootDir);
    const priorSourceRoot = process.env.FUSERA_SOURCE_ROOT;

    process.env.FUSERA_SOURCE_ROOT = rootDir;

    try {
      const graphResult = await runCli(["graph", "run", runDir]);

      expect(graphResult).toMatchObject({
        ok: true,
        command: "graph run",
        summary: {
          diagnostics: 0
        }
      });

      const graphPath = path.join(runDir, "analysis/run-graph.json");
      const reportPath = path.join(runDir, "analysis/run-graph-report.md");
      const graph = JSON.parse(await readFile(graphPath, "utf8"));
      const report = await readFile(reportPath, "utf8");

      expect(graph.graph_type).toBe("run-evidence");
      expect(report).toContain("# Harness Graph Report");

      const inspectResult = await runCli(["inspect", runDir, "--graph", "--json"]);
      const inspection = inspectResult.inspection as { graph?: Record<string, unknown> };

      expect(inspection.graph).toMatchObject({
        graph_type: "run-evidence",
        diagnostics: 0,
        graph_path: graphPath
      });
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
  await mkdir(path.join(rootDir, "superpowers/contracts/artifacts"), { recursive: true });
  await writeFile(path.join(rootDir, "superpowers/packs/registry.yaml"), options.registryYaml, "utf8");
  await writeFile(path.join(rootDir, "superpowers/packs/stage-profiles.yaml"), options.stageProfilesYaml, "utf8");

  for (const packPath of options.packPaths) {
    const absolutePath = path.join(rootDir, packPath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, "# Fixture pack\n", "utf8");
  }

  return rootDir;
}

async function createRunFixture(rootDir: string, options: {
  qaPreviewBuildRef?: string;
} = {}): Promise<string> {
  const runDir = path.join(rootDir, ".fusera/runs/run_graph_01");

  await mkdir(path.join(runDir, "stages/start/attempts/attempt_start_1"), { recursive: true });
  await mkdir(path.join(runDir, "stages/page-compile"), { recursive: true });
  await mkdir(path.join(runDir, "stages/verify-publishable-page"), { recursive: true });
  await mkdir(path.join(runDir, "stages/publish-preview"), { recursive: true });
  await mkdir(path.join(runDir, "artifacts"), { recursive: true });
  await mkdir(path.join(runDir, "compiled"), { recursive: true });
  await mkdir(path.join(runDir, "previews"), { recursive: true });

  const run = {
    run_id: "run_graph_01",
    state: "published",
    adapter_mode: "mock",
    preview_build_ref: "preview-build_01"
  };
  const adapterResult = {
    status: "ok",
    usage: {
      attempt_id: "attempt_start_1",
      attempt_dir: "stages/start/attempts/attempt_start_1",
      mode: "mock",
      duration_ms: 12,
      timeout_ms: 1000
    },
    produced_artifact_candidates: [
      {
        artifact_type: "ProductBrief",
        artifact_id: "product-brief_01"
      }
    ]
  };
  const productBrief = artifact({
    artifact_type: "ProductBrief",
    artifact_id: "product-brief_01",
    producer_stage: "start",
    input_refs: [],
    payload: {}
  });
  const pageSpec = artifact({
    artifact_type: "PageSpec",
    artifact_id: "page-spec_01",
    producer_stage: "page-compile",
    input_refs: ["product-brief_01"],
    payload: {}
  });
  const qaReport = artifact({
    artifact_type: "QAReport",
    artifact_id: "qa-report_01",
    producer_stage: "verify-publishable-page",
    input_refs: ["page-spec_01", "preview-build_01"],
    payload: {
      page_spec_ref: "page-spec_01",
      preview_build_ref: options.qaPreviewBuildRef ?? "preview-build_01",
      evidence_refs: ["compiled/preview-build.json"],
      gate_results: [
        {
          gate_id: "artifact-binding",
          evidence_refs: ["compiled/preview-build.json"]
        }
      ]
    }
  });
  const publishVersion = artifact({
    artifact_type: "PublishVersion",
    artifact_id: "publish-version_01",
    producer_stage: "publish-preview",
    input_refs: ["page-spec_01", "qa-report_01", "preview-build_01"],
    payload: {
      page_spec_ref: "page-spec_01",
      qa_report_ref: "qa-report_01"
    }
  });

  await writeJson(path.join(runDir, "run.json"), run);
  await writeFile(
    path.join(runDir, "events.ndjson"),
    [
      event("evt_1", "stage_started", "start"),
      event("evt_2", "stage_completed", "start", { attempt_id: "attempt_start_1" }),
      event("evt_3", "stage_completed", "page-compile", { attempt_id: "attempt_page_compile_1" }),
      event("evt_4", "stage_completed", "verify-publishable-page", { attempt_id: "attempt_qa_1" }),
      {
        event_id: "evt_5",
        type: "publish_succeeded",
        stage: "publish-preview",
        to_state: "published",
        data: {
          publish_version_ref: "publish-version_01",
          attempt_id: "attempt_publish_1"
        }
      }
    ].map((item) => JSON.stringify(item)).join("\n") + "\n",
    "utf8"
  );
  await writeJson(path.join(runDir, "stages/start/adapter-result.json"), adapterResult);
  await writeJson(path.join(runDir, "stages/start/attempts/attempt_start_1/adapter-result.json"), adapterResult);
  await writeJson(path.join(runDir, "artifacts/product-brief.json"), productBrief);
  await writeJson(path.join(runDir, "artifacts/page-spec.json"), pageSpec);
  await writeJson(path.join(runDir, "artifacts/qa-report.json"), qaReport);
  await writeJson(path.join(runDir, "artifacts/publish-version.json"), publishVersion);
  await writeJson(path.join(runDir, "compiled/preview-build.json"), {
    preview_build_ref: "preview-build_01",
    run_id: "run_graph_01",
    page_spec_ref: "page-spec_01",
    route_id: "landing-preview"
  });
  await writeJson(path.join(runDir, "previews/publish-handoff.json"), {
    publish_version_ref: "publish-version_01",
    preview_build_ref: "preview-build_01",
    preview_url: "preview://run_graph_01/preview-build_01"
  });

  return runDir;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function artifact(options: {
  artifact_type: string;
  artifact_id: string;
  producer_stage: string;
  input_refs: string[];
  payload: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    artifact_type: options.artifact_type,
    schema_version: "1.0.0",
    artifact_id: options.artifact_id,
    run_id: "run_graph_01",
    status: "validated",
    producer_stage: options.producer_stage,
    input_refs: options.input_refs,
    validation: {
      valid: true,
      errors: []
    },
    payload: options.payload
  };
}

function event(
  eventId: string,
  type: string,
  stage: string,
  data: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    event_id: eventId,
    type,
    stage,
    data
  };
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
