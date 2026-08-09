import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  mirrorRunEvidence,
  type EvidenceManifest,
  type EvidenceStore,
  type EvidenceUpload
} from "../../superpowers/integrations/supabase/mirror-run-evidence.ts";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("mirrorRunEvidence", () => {
  it("mirrors regular files with deterministic keys, hashes, sizes, and content types", async () => {
    const runDir = await mkdtemp(path.join(os.tmpdir(), "fusera-evidence-"));
    temporaryRoots.push(runDir);
    await mkdir(path.join(runDir, "artifacts"));
    await mkdir(path.join(runDir, "logs"));
    await writeFile(path.join(runDir, "run.json"), '{"state":"running"}\n');
    await writeFile(path.join(runDir, "artifacts", "page-spec.json"), '{"artifact_type":"PageSpec"}\n');
    await writeFile(path.join(runDir, "logs", "runner.txt"), "runner ok\n");
    await symlink(path.join(runDir, "run.json"), path.join(runDir, "logs", "run-link.json"));

    const uploads: EvidenceUpload[] = [];
    const manifests: EvidenceManifest[] = [];
    const store: EvidenceStore = {
      async upload(input) {
        uploads.push(input);
      },
      async upsertManifest(input) {
        manifests.push(input);
      }
    };

    await mirrorRunEvidence({
      store,
      projectId: "11111111-1111-4111-8111-111111111111",
      runId: "22222222-2222-4222-8222-222222222222",
      runDir
    });

    expect(uploads.map((upload) => upload.storageKey)).toEqual([
      "projects/11111111-1111-4111-8111-111111111111/runs/22222222-2222-4222-8222-222222222222/artifacts/page-spec.json",
      "projects/11111111-1111-4111-8111-111111111111/runs/22222222-2222-4222-8222-222222222222/logs/runner.txt",
      "projects/11111111-1111-4111-8111-111111111111/runs/22222222-2222-4222-8222-222222222222/run.json"
    ]);
    expect(uploads.every((upload) => upload.bucket === "fusera-run-evidence" && upload.upsert)).toBe(true);
    expect(uploads.map((upload) => upload.contentType)).toEqual([
      "application/json",
      "text/plain; charset=utf-8",
      "application/json"
    ]);
    expect(manifests.map((manifest) => manifest.relative_path)).toEqual([
      "artifacts/page-spec.json",
      "logs/runner.txt",
      "run.json"
    ]);

    for (const manifest of manifests) {
      const bytes = await readFile(path.join(runDir, manifest.relative_path));
      expect(manifest).toMatchObject({
        project_id: "11111111-1111-4111-8111-111111111111",
        run_id: "22222222-2222-4222-8222-222222222222",
        sha256: createHash("sha256").update(bytes).digest("hex"),
        size_bytes: bytes.byteLength
      });
    }
  });
});
