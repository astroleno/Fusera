import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("harness run evidence migration", () => {
  it("adds operational run, append-only event, evidence, and executor correlation contracts", async () => {
    const sql = await readFile(
      path.join(process.cwd(), "supabase/migrations/0006_harness_run_evidence.sql"),
      "utf8"
    );

    for (const column of [
      "backend",
      "adapter_mode",
      "current_stage",
      "failed_stage",
      "failure_mode",
      "failure_message",
      "run_evidence_prefix",
      "trigger_run_handle_id",
      "executor_kind",
      "executor_run_id",
      "executor_run_url",
      "updated_at"
    ]) {
      expect(sql).toMatch(new RegExp(`add column ${column}\\b`));
    }

    expect(sql).toContain("create table generation_run_events");
    expect(sql).toContain("event_id text primary key");
    expect(sql).toContain("run_id uuid not null references generation_runs(id) on delete cascade");
    expect(sql).toContain("create index generation_run_events_run_time_idx");
    expect(sql).not.toMatch(/update\s+generation_run_events/i);
    expect(sql).not.toMatch(/delete\s+from\s+generation_run_events/i);

    expect(sql).toContain("create table run_evidence_objects");
    expect(sql).toContain("unique (run_id, relative_path)");
    expect(sql).toContain("unique (storage_key)");
    expect(sql).toContain("'fusera-run-evidence', 'fusera-run-evidence', false, 52428800");
    expect(sql).not.toMatch(/create policy/i);
    expect(sql).toContain("check (executor_kind is null or executor_kind in ('github-actions'))");
  });
});
