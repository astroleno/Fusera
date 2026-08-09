import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ArtifactEnvelope } from "../../superpowers/runner/validate-artifact.ts";
import {
  syncHarnessArtifacts,
  type ArtifactProjection,
  type ArtifactRow
} from "../../superpowers/integrations/supabase/sync-harness-artifacts.ts";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const RUN_ID = "22222222-2222-4222-8222-222222222222";
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("syncHarnessArtifacts", () => {
  it("persists validated and rejected envelopes while only advancing valid latest refs", async () => {
    const runDir = await createRun("published", [
      artifact("ProductBrief", "product-brief_01", "validated", {
        proof_inputs: ["Customer evidence"],
        proof_sources: [{ proof_ref: "proof:1" }]
      }),
      artifact("PageSpec", "page-spec_01", "validated", {
        sections: [
          { section_type: "hero" },
          { section_type: "proof" }
        ]
      }),
      artifact("PublishVersion", "publish-version_01", "validated", {}),
      artifact("BrandProfile", "brand-profile_rejected", "rejected", {}, ["Brand profile invalid"])
    ]);
    const rows: ArtifactRow[] = [];
    const runUpdates: Array<Record<string, unknown>> = [];
    const projection: ArtifactProjection = {
      async upsertArtifacts(input) {
        rows.push(...input);
      },
      async updateRun(_runId, values) {
        runUpdates.push(values);
      }
    };

    const result = await syncHarnessArtifacts({
      projectId: PROJECT_ID,
      runId: RUN_ID,
      runDir,
      projection
    });

    expect(rows).toHaveLength(4);
    expect(rows.find((row) => row.artifact_id === "brand-profile_rejected")).toMatchObject({
      status: "rejected",
      validation: { valid: false, errors: ["Brand profile invalid"] }
    });
    expect(result.latestRefs).toEqual({
      latest_product_brief_ref: "product-brief_01",
      latest_page_spec_ref: "page-spec_01",
      latest_publish_version_ref: "publish-version_01"
    });
    expect(runUpdates.at(-1)).toEqual(expect.objectContaining({
      status: "completed",
      review_state: "review_ready",
      export_state: "export_ready",
      quality_score: 80,
      latest_product_brief_ref: "product-brief_01",
      latest_page_spec_ref: "page-spec_01",
      latest_publish_version_ref: "publish-version_01"
    }));
  });

  it.each([
    ["needs_review", true, { status: "completed", review_state: "qa_failed", export_state: "none" }],
    ["failed", false, { status: "failed", review_state: "none", export_state: "none" }]
  ] as const)("maps %s lifecycle without claiming external publication", async (state, includeQa, expected) => {
    const artifacts = includeQa
      ? [artifact("QAReport", "qa-report_01", "validated", { verdict: "fail" })]
      : [];
    const runDir = await createRun(state, artifacts);
    const updates: Array<Record<string, unknown>> = [];

    await syncHarnessArtifacts({
      projectId: PROJECT_ID,
      runId: RUN_ID,
      runDir,
      projection: {
        async upsertArtifacts() {},
        async updateRun(_runId, values) {
          updates.push(values);
        }
      }
    });

    expect(updates.at(-1)).toMatchObject(expected);
    expect(updates.at(-1)).not.toHaveProperty("published");
  });

  it("rejects an artifact bound to a different run UUID", async () => {
    const runDir = await createRun("published", [
      { ...artifact("PageSpec", "page-spec_wrong", "validated", { sections: [{ section_type: "hero" }] }), run_id: "33333333-3333-4333-8333-333333333333" }
    ]);

    await expect(
      syncHarnessArtifacts({
        projectId: PROJECT_ID,
        runId: RUN_ID,
        runDir,
        projection: { async upsertArtifacts() {}, async updateRun() {} }
      })
    ).rejects.toThrow("does not match Web run");
  });
});

async function createRun(state: string, artifacts: ArtifactEnvelope[]): Promise<string> {
  const runDir = await mkdtemp(path.join(os.tmpdir(), "fusera-artifact-sync-"));
  temporaryRoots.push(runDir);
  await mkdir(path.join(runDir, "artifacts", "rejected"), { recursive: true });
  await writeFile(path.join(runDir, "run.json"), `${JSON.stringify({ run_id: RUN_ID, state })}\n`);

  for (const envelope of artifacts) {
    const directory = envelope.status === "rejected" ? path.join(runDir, "artifacts", "rejected") : path.join(runDir, "artifacts");
    await writeFile(path.join(directory, `${envelope.artifact_id}.json`), `${JSON.stringify(envelope)}\n`);
  }

  return runDir;
}

function artifact(
  artifactType: string,
  artifactId: string,
  status: ArtifactEnvelope["status"],
  payload: Record<string, unknown>,
  errors: string[] = []
): ArtifactEnvelope {
  return {
    artifact_type: artifactType,
    schema_version: "1.0.0",
    artifact_id: artifactId,
    run_id: RUN_ID,
    status,
    producer_stage: "fixture",
    input_refs: [],
    validation: { valid: status === "validated" && errors.length === 0, errors },
    payload
  };
}
