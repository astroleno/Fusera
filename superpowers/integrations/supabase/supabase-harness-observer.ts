import type { HarnessRunObserver } from "../../runner/run-observer.ts";
import type { RunEvent } from "../../runner/write-run-event.ts";
import {
  mirrorRunEvidence,
  type EvidenceStore
} from "./mirror-run-evidence.ts";

export type GenerationRunEventRow = {
  event_id: string;
  run_id: string;
  event_type: string;
  stage: string | null;
  from_state: string | null;
  to_state: string | null;
  data: Record<string, unknown>;
  occurred_at: string;
};

export type RunProjection = {
  updateRun(runId: string, values: Record<string, unknown>): Promise<void>;
  upsertEvent(row: GenerationRunEventRow): Promise<void>;
};

type SupabaseError = { message?: string };
type SupabaseResult = { error: SupabaseError | null };

export type SupabaseRunProjectionClient = {
  from(table: "generation_runs"): {
    update(values: Record<string, unknown>): {
      eq(column: "id", value: string): PromiseLike<SupabaseResult>;
    };
  };
  from(table: "generation_run_events"): {
    upsert(
      row: GenerationRunEventRow,
      options: { onConflict: "event_id" }
    ): PromiseLike<SupabaseResult>;
  };
};

export function createHarnessObserver(options: {
  projectId: string;
  runId: string;
  projection: RunProjection;
  evidenceStore: EvidenceStore;
}): HarnessRunObserver {
  const mirrorEvidence = async (runDir: string): Promise<void> => {
    await mirrorRunEvidence({
      store: options.evidenceStore,
      projectId: options.projectId,
      runId: options.runId,
      runDir
    });
  };

  return {
    async onRunRecord({ runDir, record }) {
      assertRunId(record.run_id, options.runId, "Run record");
      await options.projection.updateRun(options.runId, projectRunRecord(record));
      await mirrorEvidence(runDir);
    },
    async onRunEvent({ runDir, event }) {
      assertRunId(event.run_id, options.runId, "Run event");
      const row = projectRunEvent(event, options.runId);
      await options.projection.upsertEvent(row);

      const update = projectEventLifecycle(event);
      if (Object.keys(update).length > 0) {
        await options.projection.updateRun(options.runId, update);
      }

      await mirrorEvidence(runDir);
    }
  };
}

export function createSupabaseRunProjection(client: SupabaseRunProjectionClient): RunProjection {
  return {
    async updateRun(runId, values) {
      const result = await client.from("generation_runs").update(values).eq("id", runId);
      throwOnSupabaseError(result, `update generation run ${runId}`);
    },
    async upsertEvent(row) {
      const result = await client
        .from("generation_run_events")
        .upsert(row, { onConflict: "event_id" });
      throwOnSupabaseError(result, `upsert generation run event ${row.event_id}`);
    }
  };
}

function projectRunRecord(record: Record<string, unknown>): Record<string, unknown> {
  const state = stringValue(record.state);
  const values: Record<string, unknown> = {
    ...lifecycleForState(state),
    updated_at: stringValue(record.updated_at) ?? new Date().toISOString()
  };

  copyString(record, values, "backend");
  copyString(record, values, "adapter_mode");
  copyString(record, values, "failed_stage");
  copyString(record, values, "failure_mode");
  copyString(record, values, "failure_message");

  return values;
}

function projectRunEvent(event: RunEvent, runId: string): GenerationRunEventRow {
  if (!event.event_id) {
    throw new Error("Run event is missing event_id");
  }
  if (!event.ts) {
    throw new Error(`Run event ${event.event_id} is missing ts`);
  }

  return {
    event_id: event.event_id,
    run_id: runId,
    event_type: event.type,
    stage: event.stage ?? null,
    from_state: event.from_state ?? null,
    to_state: event.to_state ?? null,
    data: event.data ?? {},
    occurred_at: event.ts
  };
}

function projectEventLifecycle(event: RunEvent): Record<string, unknown> {
  const updatedAt = event.ts ?? new Date().toISOString();

  if (event.type === "run_failed") {
    return {
      status: "failed",
      review_state: "none",
      export_state: "none",
      failed_stage: event.stage ?? null,
      failure_mode: stringValue(event.data?.failure_mode) ?? null,
      failure_message: stringValue(event.data?.message) ?? null,
      updated_at: updatedAt
    };
  }

  if (event.type === "start_run") {
    return {
      status: "running",
      review_state: "validating",
      export_state: "none",
      updated_at: updatedAt
    };
  }

  if (event.type === "stage_started" || event.type === "stage_completed") {
    return {
      status: "running",
      current_stage: event.stage ?? null,
      review_state: "validating",
      export_state: "none",
      updated_at: updatedAt
    };
  }

  return { updated_at: updatedAt };
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

function assertRunId(candidate: unknown, runId: string, source: string): void {
  if (candidate !== runId) {
    throw new Error(`${source} run_id ${String(candidate)} does not match Web run ${runId}`);
  }
}

function copyString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  key: string
): void {
  const value = stringValue(source[key]);
  if (value !== undefined) {
    target[key] = value;
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function throwOnSupabaseError(result: SupabaseResult, action: string): void {
  if (result.error) {
    throw new Error(`Supabase failed to ${action}: ${result.error.message ?? "unknown error"}`);
  }
}
