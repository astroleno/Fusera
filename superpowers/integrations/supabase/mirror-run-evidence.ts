import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const RUN_EVIDENCE_BUCKET = "fusera-run-evidence";

export type EvidenceUpload = {
  bucket: typeof RUN_EVIDENCE_BUCKET;
  storageKey: string;
  bytes: Uint8Array;
  contentType: string;
  upsert: true;
};

export type EvidenceManifest = {
  project_id: string;
  run_id: string;
  relative_path: string;
  storage_key: string;
  sha256: string;
  size_bytes: number;
  content_type: string;
};

export type EvidenceStore = {
  upload(input: EvidenceUpload): Promise<void>;
  upsertManifest(input: EvidenceManifest): Promise<void>;
};

type SupabaseError = { message?: string };
type SupabaseResult = { error: SupabaseError | null };

export type SupabaseEvidenceClient = {
  storage: {
    from(bucket: string): {
      upload(
        storageKey: string,
        bytes: Uint8Array,
        options: { contentType: string; upsert: boolean }
      ): PromiseLike<SupabaseResult>;
    };
  };
  from(table: "run_evidence_objects"): {
    upsert(
      row: EvidenceManifest,
      options: { onConflict: "run_id,relative_path" }
    ): PromiseLike<SupabaseResult>;
  };
};

export async function mirrorRunEvidence(options: {
  store: EvidenceStore;
  projectId: string;
  runId: string;
  runDir: string;
}): Promise<void> {
  const relativePaths = await listRegularFiles(options.runDir);

  for (const relativePath of relativePaths) {
    const bytes = await readFile(path.join(options.runDir, ...relativePath.split("/")));
    const contentType = contentTypeFor(relativePath);
    const storageKey = `projects/${options.projectId}/runs/${options.runId}/${relativePath}`;
    const manifest: EvidenceManifest = {
      project_id: options.projectId,
      run_id: options.runId,
      relative_path: relativePath,
      storage_key: storageKey,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size_bytes: bytes.byteLength,
      content_type: contentType
    };

    await options.store.upload({
      bucket: RUN_EVIDENCE_BUCKET,
      storageKey,
      bytes,
      contentType,
      upsert: true
    });
    await options.store.upsertManifest(manifest);
  }
}

export function createSupabaseEvidenceStore(client: SupabaseEvidenceClient): EvidenceStore {
  return {
    async upload(input) {
      const result = await client.storage.from(input.bucket).upload(
        input.storageKey,
        input.bytes,
        { contentType: input.contentType, upsert: input.upsert }
      );
      throwOnSupabaseError(result, `upload run evidence ${input.storageKey}`);
    },
    async upsertManifest(input) {
      const result = await client
        .from("run_evidence_objects")
        .upsert(input, { onConflict: "run_id,relative_path" });
      throwOnSupabaseError(result, `upsert run evidence manifest ${input.relative_path}`);
    }
  };
}

async function listRegularFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];

  async function visit(directory: string, relativeDirectory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isSymbolicLink()) {
        continue;
      }

      const relativePath = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      const absolutePath = path.join(directory, entry.name);
      const stats = await lstat(absolutePath);

      if (stats.isSymbolicLink()) {
        continue;
      }

      if (stats.isDirectory()) {
        await visit(absolutePath, relativePath);
      } else if (stats.isFile()) {
        files.push(relativePath);
      }
    }
  }

  await visit(rootDir, "");
  return files.sort();
}

function contentTypeFor(fileName: string): string {
  switch (path.extname(fileName).toLowerCase()) {
    case ".json":
    case ".ndjson":
      return "application/json";
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".md":
      return "text/markdown; charset=utf-8";
    case ".txt":
    case ".log":
      return "text/plain; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function throwOnSupabaseError(result: SupabaseResult, action: string): void {
  if (result.error) {
    throw new Error(`Supabase failed to ${action}: ${result.error.message ?? "unknown error"}`);
  }
}
