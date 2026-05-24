import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateRunEventRecord, type RunEventType } from "./run-event-types.ts";

export type RunEvent = {
  event_id?: string;
  run_id?: string;
  type: RunEventType;
  stage?: string;
  from_state?: string;
  to_state?: string;
  data?: Record<string, unknown>;
  ts?: string;
};

export async function writeRunEvent(runDir: string, event: RunEvent): Promise<RunEvent> {
  await mkdir(runDir, { recursive: true });

  const normalized: RunEvent = {
    event_id: event.event_id ?? makeEventId(),
    ts: event.ts ?? new Date().toISOString(),
    ...event
  };
  const errors = validateRunEventRecord(normalized as Record<string, unknown>);

  if (errors.length > 0) {
    throw new Error(`Invalid run event: ${errors.join("; ")}`);
  }

  await appendFile(
    path.join(runDir, "events.ndjson"),
    `${JSON.stringify(normalized)}\n`,
    "utf8"
  );

  return normalized;
}

function makeEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir, type] = process.argv.slice(2);

  if (!runDir || !type) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/write-run-event.ts <runDir> <type>");
    process.exit(1);
  }

  await writeRunEvent(runDir, { type: type as RunEventType });
}
