import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { RunEvent } from "../../superpowers/runner/write-run-event.ts";
import type { EvidenceStore } from "../../superpowers/integrations/supabase/mirror-run-evidence.ts";
import {
  createHarnessObserver,
  type GenerationRunEventRow,
  type RunProjection
} from "../../superpowers/integrations/supabase/supabase-harness-observer.ts";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const RUN_ID = "22222222-2222-4222-8222-222222222222";
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("createHarnessObserver", () => {
  it("projects run lifecycle and idempotent events after local evidence is durable", async () => {
    const runDir = await mkdtemp(path.join(os.tmpdir(), "fusera-observer-"));
    temporaryRoots.push(runDir);
    await mkdir(path.join(runDir, "artifacts"));
    const runRecord = { run_id: RUN_ID, state: "queued", backend: "codex", adapter_mode: "real" };
    await writeFile(path.join(runDir, "run.json"), `${JSON.stringify(runRecord)}\n`);
    const event: RunEvent = {
      event_id: "evt_start",
      run_id: RUN_ID,
      type: "start_run",
      from_state: "queued",
      to_state: "assembling",
      ts: "2026-08-09T00:00:00.000Z",
      data: { backend: "codex" }
    };
    await writeFile(path.join(runDir, "events.ndjson"), `${JSON.stringify(event)}\n`);

    const runUpdates: Array<{ runId: string; values: Record<string, unknown> }> = [];
    const events = new Map<string, GenerationRunEventRow>();
    const projection: RunProjection = {
      async updateRun(runId, values) {
        runUpdates.push({ runId, values });
      },
      async upsertEvent(row) {
        events.set(row.event_id, row);
      }
    };
    let durableUploadObserved = false;
    const evidenceStore: EvidenceStore = {
      async upload(input) {
        if (input.storageKey.endsWith("events.ndjson")) {
          durableUploadObserved = input.bytes.toString().includes("evt_start");
        }
      },
      async upsertManifest() {}
    };
    const observer = createHarnessObserver({
      projectId: PROJECT_ID,
      runId: RUN_ID,
      projection,
      evidenceStore
    });

    await observer.onRunRecord?.({ runDir, record: runRecord });
    await observer.onRunEvent?.({ runDir, event });
    await observer.onRunEvent?.({ runDir, event });

    expect(runUpdates[0]).toEqual({
      runId: RUN_ID,
      values: expect.objectContaining({
        status: "queued",
        backend: "codex",
        adapter_mode: "real",
        review_state: "none",
        export_state: "none"
      })
    });
    expect(runUpdates.at(-1)).toEqual({
      runId: RUN_ID,
      values: expect.objectContaining({
        status: "running",
        review_state: "validating",
        export_state: "none"
      })
    });
    expect(events.size).toBe(1);
    expect(events.get("evt_start")).toMatchObject({
      run_id: RUN_ID,
      event_type: "start_run",
      occurred_at: "2026-08-09T00:00:00.000Z"
    });
    expect(durableUploadObserved).toBe(true);
  });

  it("updates active stages and records safe failure fields", async () => {
    const runDir = await mkdtemp(path.join(os.tmpdir(), "fusera-observer-stage-"));
    temporaryRoots.push(runDir);
    await writeFile(path.join(runDir, "events.ndjson"), "{}\n");
    const updates: Array<Record<string, unknown>> = [];
    const projection: RunProjection = {
      async updateRun(_runId, values) {
        updates.push(values);
      },
      async upsertEvent() {}
    };
    const evidenceStore: EvidenceStore = {
      async upload() {},
      async upsertManifest() {}
    };
    const observer = createHarnessObserver({ projectId: PROJECT_ID, runId: RUN_ID, projection, evidenceStore });

    await observer.onRunEvent?.({
      runDir,
      event: {
        event_id: "evt_stage",
        run_id: RUN_ID,
        type: "stage_started",
        stage: "page-strategy",
        ts: "2026-08-09T00:01:00.000Z"
      }
    });
    await observer.onRunEvent?.({
      runDir,
      event: {
        event_id: "evt_failed",
        run_id: RUN_ID,
        type: "run_failed",
        stage: "page-strategy",
        to_state: "failed",
        ts: "2026-08-09T00:02:00.000Z",
        data: { failure_mode: "validation_failure", message: "PagePlan invalid" }
      }
    });

    expect(updates[0]).toMatchObject({
      status: "running",
      current_stage: "page-strategy",
      review_state: "validating"
    });
    expect(updates[1]).toMatchObject({
      status: "failed",
      failed_stage: "page-strategy",
      failure_mode: "validation_failure",
      failure_message: "PagePlan invalid"
    });
  });

  it("rejects events from another Harness run", async () => {
    const observer = createHarnessObserver({
      projectId: PROJECT_ID,
      runId: RUN_ID,
      projection: { async updateRun() {}, async upsertEvent() {} },
      evidenceStore: { async upload() {}, async upsertManifest() {} }
    });

    await expect(
      observer.onRunEvent?.({
        runDir: "/tmp/not-used",
        event: {
          event_id: "evt_wrong",
          run_id: "33333333-3333-4333-8333-333333333333",
          type: "start_run",
          ts: "2026-08-09T00:00:00.000Z"
        }
      })
    ).rejects.toThrow("does not match Web run");
  });
});
