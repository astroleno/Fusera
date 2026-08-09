import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { scorePageQuality } from "../../../src/lib/ai/quality-score.ts";
import type { ArtifactEnvelope } from "../../runner/validate-artifact.ts";

export type ArtifactRow = {
  artifact_id: string;
  project_id: string;
  run_id: string;
  artifact_type: string;
  schema_version: string;
  status: ArtifactEnvelope["status"];
  producer_stage: string;
  input_refs: string[];
  validation: ArtifactEnvelope["validation"];
  payload: Record<string, unknown>;
};

export type ArtifactProjection = {
  upsertArtifacts(rows: ArtifactRow[]): Promise<void>;
  updateRun(runId: string, values: Record<string, unknown>): Promise<void>;
};

export type ArtifactSyncResult = {
  artifacts: ArtifactRow[];
  latestRefs: Record<string, string>;
  runUpdate: Record<string, unknown>;
};

type SupabaseError = { message?: string };
type SupabaseResult = { error: SupabaseError | null };

export type SupabaseArtifactProjectionClient = {
  from(table: "artifacts"): {
    upsert(
      rows: ArtifactRow[],
      options: { onConflict: "artifact_id" }
    ): PromiseLike<SupabaseResult>;
  };
  from(table: "generation_runs"): {
    update(values: Record<string, unknown>): {
      eq(column: "id", value: string): PromiseLike<SupabaseResult>;
    };
  };
};

const LATEST_REF_COLUMNS: Readonly<Record<string, string>> = {
  ProductBrief: "latest_product_brief_ref",
  BrandProfile: "latest_brand_profile_ref",
  PagePlan: "latest_page_plan_ref",
  SectionGraph: "latest_section_graph_ref",
  ThemeTokens: "latest_theme_tokens_ref",
  DesignSpec: "latest_design_spec_ref",
  PageSpec: "latest_page_spec_ref",
  QAReport: "latest_qa_report_ref",
  PublishVersion: "latest_publish_version_ref"
};

export async function syncHarnessArtifacts(options: {
  projectId: string;
  runId: string;
  runDir: string;
  projection: ArtifactProjection;
}): Promise<ArtifactSyncResult> {
  const runRecord = await readJson(path.join(options.runDir, "run.json"));
  assertRunId(runRecord.run_id, options.runId, "Run record");

  const artifactFiles = await listJsonFiles(path.join(options.runDir, "artifacts"));
  const envelopes: ArtifactEnvelope[] = [];

  for (const artifactFile of artifactFiles) {
    const envelope = await readJson(artifactFile) as ArtifactEnvelope;
    assertRunId(envelope.run_id, options.runId, `Artifact ${envelope.artifact_id}`);
    envelopes.push(envelope);
  }

  const rows = envelopes.map((envelope) => toArtifactRow(envelope, options.projectId, options.runId));
  if (rows.length > 0) {
    await options.projection.upsertArtifacts(rows);
  }

  const latestRefs = latestValidatedRefs(envelopes);
  const runUpdate: Record<string, unknown> = {
    ...lifecycleForState(stringValue(runRecord.state)),
    ...latestRefs,
    updated_at: stringValue(runRecord.updated_at) ?? new Date().toISOString()
  };
  const qualityScore = qualityScoreFrom(envelopes);
  if (qualityScore !== undefined) {
    runUpdate.quality_score = qualityScore;
  }

  await options.projection.updateRun(options.runId, runUpdate);

  return { artifacts: rows, latestRefs, runUpdate };
}

export function createSupabaseArtifactProjection(
  client: SupabaseArtifactProjectionClient
): ArtifactProjection {
  return {
    async upsertArtifacts(rows) {
      const result = await client.from("artifacts").upsert(rows, { onConflict: "artifact_id" });
      throwOnSupabaseError(result, "upsert Harness artifacts");
    },
    async updateRun(runId, values) {
      const result = await client.from("generation_runs").update(values).eq("id", runId);
      throwOnSupabaseError(result, `update generation run ${runId}`);
    }
  };
}

function toArtifactRow(
  envelope: ArtifactEnvelope,
  projectId: string,
  runId: string
): ArtifactRow {
  return {
    artifact_id: envelope.artifact_id,
    project_id: projectId,
    run_id: runId,
    artifact_type: envelope.artifact_type,
    schema_version: envelope.schema_version,
    status: envelope.status,
    producer_stage: envelope.producer_stage,
    input_refs: envelope.input_refs,
    validation: envelope.validation,
    payload: envelope.payload
  };
}

function latestValidatedRefs(envelopes: ArtifactEnvelope[]): Record<string, string> {
  const latestRefs: Record<string, string> = {};

  for (const envelope of envelopes) {
    if (
      envelope.status !== "validated"
      || envelope.validation.valid !== true
      || envelope.validation.errors.length > 0
    ) {
      continue;
    }

    const column = LATEST_REF_COLUMNS[envelope.artifact_type];
    if (column) {
      latestRefs[column] = envelope.artifact_id;
    }
  }

  return latestRefs;
}

function qualityScoreFrom(envelopes: ArtifactEnvelope[]): number | undefined {
  const pageSpec = validatedArtifact(envelopes, "PageSpec");
  if (!pageSpec) {
    return undefined;
  }

  const sections = Array.isArray(pageSpec.payload.sections) ? pageSpec.payload.sections : [];
  const sectionTypes = sections.flatMap((section) => {
    if (!isRecord(section)) {
      return [];
    }

    const sectionType = stringValue(section.section_type);
    return sectionType ? [sectionType] : [];
  });
  const productBrief = validatedArtifact(envelopes, "ProductBrief");
  const hasTrustSignals = productBrief
    ? hasEntries(productBrief.payload.proof_inputs) || hasEntries(productBrief.payload.proof_sources)
    : false;

  return scorePageQuality({ sectionTypes, hasTrustSignals }).total;
}

function validatedArtifact(
  envelopes: ArtifactEnvelope[],
  artifactType: string
): ArtifactEnvelope | undefined {
  return envelopes.find((envelope) =>
    envelope.artifact_type === artifactType
    && envelope.status === "validated"
    && envelope.validation.valid === true
    && envelope.validation.errors.length === 0
  );
}

function lifecycleForState(state: string | undefined): Record<string, string> {
  switch (state) {
    case "published":
      return { status: "completed", review_state: "review_ready", export_state: "export_ready" };
    case "needs_review":
      return { status: "completed", review_state: "qa_failed", export_state: "none" };
    case "failed":
      return { status: "failed", review_state: "none", export_state: "none" };
    case "queued":
      return { status: "queued", review_state: "none", export_state: "none" };
    default:
      return { status: "running", review_state: "validating", export_state: "none" };
  }
}

async function listJsonFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];

  async function visit(directory: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw error;
    }

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isSymbolicLink()) {
        continue;
      }

      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(absolutePath);
      }
    }
  }

  await visit(rootDir);
  return files.sort();
}

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
}

function assertRunId(candidate: unknown, runId: string, source: string): void {
  if (candidate !== runId) {
    throw new Error(`${source} run_id ${String(candidate)} does not match Web run ${runId}`);
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function hasEntries(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function throwOnSupabaseError(result: SupabaseResult, action: string): void {
  if (result.error) {
    throw new Error(`Supabase failed to ${action}: ${result.error.message ?? "unknown error"}`);
  }
}
