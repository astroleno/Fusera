import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadRegistry } from "./resolve-packs.ts";

const DEFAULT_REFERENCE_BUDGET_BYTES = 160_000;

export type CompiledReferenceSource = {
  path: string;
  kind: "file" | "directory" | "missing" | "unsupported" | "skipped";
  text?: string;
  entries?: string[];
  byte_length?: number;
  inline_byte_length?: number;
  truncated?: boolean;
  reason?: string;
};

export type ReferenceBudget = {
  policy: "manifest-order";
  max_bytes: number;
  used_bytes: number;
  truncated_count: number;
  skipped_count: number;
};

export type CompiledPackBundle = {
  pack_id: string;
  backend: string;
  manifest: Record<string, unknown>;
  skill_source: string;
  reference_sources: CompiledReferenceSource[];
  reference_budget: ReferenceBudget;
};

export async function compilePack(options: {
  rootDir?: string;
  packId: string;
  backend?: string;
}): Promise<CompiledPackBundle> {
  const rootDir = options.rootDir ?? process.cwd();
  const backend = options.backend ?? "codex";
  const registry = await loadRegistry(rootDir);
  const manifest = registry.packs.find((pack) => pack.id === options.packId);

  if (!manifest) {
    throw new Error(`Unknown pack: ${options.packId}`);
  }

  if (!manifest.backend_support.adapters.includes(backend)) {
    throw new Error(`Pack ${options.packId} does not support backend ${backend}`);
  }

  const skillPath = path.join(rootDir, manifest.path);
  const references = await materializeReferences(rootDir, manifest.references);

  return {
    pack_id: manifest.id,
    backend,
    manifest: manifest as Record<string, unknown>,
    skill_source: await readFile(skillPath, "utf8"),
    reference_sources: references.sources,
    reference_budget: references.budget
  };
}

async function materializeReferences(
  rootDir: string,
  references: unknown
): Promise<{ sources: CompiledReferenceSource[]; budget: ReferenceBudget }> {
  const maxBytes = positiveIntegerFromEnv("FUSERA_PACK_REFERENCE_BUDGET_BYTES", DEFAULT_REFERENCE_BUDGET_BYTES);
  if (!Array.isArray(references)) {
    return {
      sources: [],
      budget: {
        policy: "manifest-order",
        max_bytes: maxBytes,
        used_bytes: 0,
        truncated_count: 0,
        skipped_count: 0
      }
    };
  }

  const sources: CompiledReferenceSource[] = [];
  let usedBytes = 0;

  for (const reference of references) {
    if (typeof reference !== "string" || reference.length === 0) {
      continue;
    }

    const source = await materializeReference(rootDir, reference, maxBytes - usedBytes);
    sources.push(source);
    usedBytes += source.inline_byte_length ?? 0;
  }

  return {
    sources,
    budget: {
      policy: "manifest-order",
      max_bytes: maxBytes,
      used_bytes: usedBytes,
      truncated_count: sources.filter((source) => source.truncated === true).length,
      skipped_count: sources.filter((source) => source.kind === "skipped").length
    }
  };
}

async function materializeReference(
  rootDir: string,
  referencePath: string,
  remainingBudgetBytes: number
): Promise<CompiledReferenceSource> {
  const absolutePath = path.join(rootDir, referencePath);

  try {
    const referenceStat = await stat(absolutePath);

    if (referenceStat.isDirectory()) {
      const entries = await readdir(absolutePath);

      return {
        path: referencePath,
        kind: "directory",
        entries: entries.sort(),
        reason: "directory reference is listed but not inlined"
      };
    }

    if (!referenceStat.isFile()) {
      return {
        path: referencePath,
        kind: "unsupported",
        reason: "reference is neither a file nor a directory"
      };
    }

    if (remainingBudgetBytes <= 0) {
      return {
        path: referencePath,
        kind: "skipped",
        byte_length: referenceStat.size,
        inline_byte_length: 0,
        truncated: true,
        reason: "pack reference budget exhausted"
      };
    }

    if (referenceStat.size > remainingBudgetBytes) {
      return {
        path: referencePath,
        kind: "file",
        byte_length: referenceStat.size,
        inline_byte_length: remainingBudgetBytes,
        truncated: true,
        reason: "truncated to fit pack reference budget",
        text: await readFileSlice(absolutePath, remainingBudgetBytes)
      };
    }

    return {
      path: referencePath,
      kind: "file",
      byte_length: referenceStat.size,
      inline_byte_length: referenceStat.size,
      truncated: false,
      text: await readFile(absolutePath, "utf8")
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        path: referencePath,
        kind: "missing",
        reason: "reference path does not exist"
      };
    }

    throw error;
  }
}

async function readFileSlice(filePath: string, byteLimit: number): Promise<string> {
  const fileBuffer = await readFile(filePath);
  return fileBuffer.subarray(0, byteLimit).toString("utf8");
}

function positiveIntegerFromEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [packId, backend = "codex"] = process.argv.slice(2);

  if (!packId) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/compile-pack.ts <packId> [backend]");
    process.exit(1);
  }

  console.log(JSON.stringify(await compilePack({ packId, backend }), null, 2));
}
