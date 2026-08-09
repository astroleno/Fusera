import type { RunEvent } from "./write-run-event.ts";

export type HarnessRunObserver = {
  onRunRecord?(context: {
    runDir: string;
    record: Record<string, unknown>;
  }): Promise<void>;
  onRunEvent?(context: {
    runDir: string;
    event: RunEvent;
  }): Promise<void>;
};
