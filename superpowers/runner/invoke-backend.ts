import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createCodexAdapter,
  type CodexAdapterMode,
  type CodexInvocationBundle,
  type CodexInvocationResult
} from "../adapters/codex/adapter.ts";
import { assembleContext } from "./assemble-context.ts";
import { compilePack } from "./compile-pack.ts";

type PreparedBackendInvocation = {
  adapterMode: CodexAdapterMode;
  adapterId: "codex";
  bundle: CodexInvocationBundle;
  invoke: () => Promise<CodexInvocationResult>;
};

export async function invokeBackend(options: {
  rootDir?: string;
  runDir: string;
  stage: string;
  backend?: string;
  adapterMode?: CodexAdapterMode;
}): Promise<CodexInvocationResult> {
  const prepared = await prepareBackendInvocation(options);
  const result = await prepared.invoke();

  return persistBackendEvidence({
    runDir: options.runDir,
    stage: options.stage,
    adapterId: prepared.adapterId,
    mode: prepared.adapterMode,
    bundle: prepared.bundle,
    result
  });
}

export async function invokeNoopBackend(options: {
  rootDir?: string;
  runDir: string;
  stage: string;
  backend?: string;
  adapterMode?: CodexAdapterMode;
  reason?: string;
}): Promise<CodexInvocationResult> {
  const prepared = await prepareBackendInvocation(options);
  const result: CodexInvocationResult = {
    status: "ok",
    stdout: "",
    stderr: "",
    usage: {
      mode: "runner-owned-noop",
      configured_adapter_mode: prepared.adapterMode,
      skipped_backend: true,
      reason: options.reason ?? "runner-owned-stage"
    },
    attachments: [],
    produced_artifact_candidates: []
  };

  return persistBackendEvidence({
    runDir: options.runDir,
    stage: options.stage,
    adapterId: prepared.adapterId,
    mode: "runner-owned-noop",
    bundle: prepared.bundle,
    result
  });
}

async function prepareBackendInvocation(options: {
  rootDir?: string;
  runDir: string;
  stage: string;
  backend?: string;
  adapterMode?: CodexAdapterMode;
}): Promise<PreparedBackendInvocation> {
  const rootDir = options.rootDir ?? process.cwd();
  const backend = options.backend ?? "codex";

  if (backend !== "codex") {
    throw new Error(`Unsupported P0 backend: ${backend}`);
  }

  const context = await assembleContext({
    rootDir,
    runDir: options.runDir,
    stage: options.stage,
    backend
  });
  const compiledPacks = await Promise.all(
    context.selected_pack_ids.map((packId) =>
      compilePack({
        rootDir,
        packId,
        backend
      })
    )
  );
  const adapterMode = options.adapterMode ?? adapterModeFromEnv();
  const adapter = createCodexAdapter(adapterMode);
  const bundle = {
    ...context,
    capabilities: adapter.capabilities,
    compiled_packs: compiledPacks
  };

  return {
    adapterMode,
    adapterId: adapter.id,
    bundle,
    invoke: () => adapter.invoke({ ...bundle })
  };
}

async function persistBackendEvidence(options: {
  runDir: string;
  stage: string;
  adapterId: "codex";
  mode: CodexAdapterMode | "runner-owned-noop";
  bundle: CodexInvocationBundle;
  result: CodexInvocationResult;
}): Promise<CodexInvocationResult> {
  const stageDir = path.join(options.runDir, "stages", options.stage);
  const attemptId = makeAttemptId(options.stage);
  const attemptDir = path.join(stageDir, "attempts", attemptId);
  const attemptDirRef = path.relative(options.runDir, attemptDir);
  const result = {
    ...options.result,
    usage: {
      ...options.result.usage,
      attempt_id: attemptId,
      attempt_dir: attemptDirRef
    }
  };
  const rawRequest = {
    adapter: options.adapterId,
    mode: options.mode,
    attempt_id: attemptId,
    bundle: options.bundle
  };

  await mkdir(stageDir, { recursive: true });
  await mkdir(attemptDir, { recursive: true });
  await mkdir(path.join(options.runDir, "bundles"), { recursive: true });
  await writeFile(
    path.join(options.runDir, "bundles", `${options.stage}.json`),
    `${JSON.stringify(options.bundle, null, 2)}\n`,
    "utf8"
  );
  await writeFile(path.join(attemptDir, "bundle.json"), `${JSON.stringify(options.bundle, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(stageDir, "adapter-raw-request.json"),
    `${JSON.stringify(rawRequest, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    path.join(stageDir, "adapter-stdout.txt"),
    result.stdout,
    "utf8"
  );
  await writeFile(
    path.join(stageDir, "adapter-stderr.txt"),
    result.stderr,
    "utf8"
  );
  await writeFile(path.join(stageDir, "adapter-result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await writeFile(path.join(attemptDir, "adapter-raw-request.json"), `${JSON.stringify(rawRequest, null, 2)}\n`, "utf8");
  await writeFile(path.join(attemptDir, "adapter-stdout.txt"), result.stdout, "utf8");
  await writeFile(path.join(attemptDir, "adapter-stderr.txt"), result.stderr, "utf8");
  await writeFile(path.join(attemptDir, "adapter-result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");

  return result;
}

function makeAttemptId(stage: string): string {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8);
  const normalizedStage = stage.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

  return `attempt_${stamp}_${normalizedStage}_${suffix}`;
}

export function adapterModeFromEnv(): CodexAdapterMode {
  return process.env.FUSERA_CODEX_ADAPTER === "real" ? "real" : "mock";
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir, stage, backend = "codex"] = process.argv.slice(2);

  if (!runDir || !stage) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/invoke-backend.ts <runDir> <stage> [backend]");
    process.exit(1);
  }

  console.log(JSON.stringify(await invokeBackend({ runDir, stage, backend }), null, 2));
}
