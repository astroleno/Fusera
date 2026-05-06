#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot =
  process.env.FUSERA_SOURCE_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const scope = valueFlag("--scope");
const dryRun = args.includes("--dry-run");
const workspaceRoot =
  valueFlag("--workspace-root") ?? process.env.FUSERA_WORKSPACE_ROOT ?? findGitRoot(process.cwd()) ?? process.cwd();

if (!scope) {
  fail("skills install requires --scope <codex-global|repo-local>");
}

if (!["codex-global", "repo-local"].includes(scope)) {
  fail(`Unsupported or deferred skills install scope: ${scope}`);
}

const targetRoot =
  scope === "codex-global"
    ? path.join(os.homedir(), ".codex/skills/fusera")
    : path.join(workspaceRoot, ".agents/skills/fusera");
const skillPaths = await listFiles(path.join(sourceRoot, "superpowers/packs"), (filePath) => filePath.endsWith("SKILL.md"));
const bundleFiles = [
  { kind: "generated", relativePath: "SKILL.md", body: companionSkill() },
  { kind: "generated", relativePath: "README.md", body: companionReadme() },
  {
    kind: "copy",
    sourcePath: path.join(sourceRoot, "docs/superpowers/harness/2026-05-05-startup-distribution-contract.md"),
    relativePath: "docs/startup-distribution-contract.md"
  },
  ...skillPaths.map((sourcePath) => ({
    kind: "copy",
    sourcePath,
    relativePath: path.join("pack-index", path.relative(path.join(sourceRoot, "superpowers/packs"), sourcePath))
  }))
];
const ownedFiles = [...bundleFiles.map((file) => file.relativePath), "fusera-skills-manifest.json"].sort();
const files = [
  ...bundleFiles,
  {
    kind: "generated",
    relativePath: "fusera-skills-manifest.json",
    body: JSON.stringify(manifest(ownedFiles, skillPaths), null, 2) + "\n"
  }
].sort((left, right) => left.relativePath.localeCompare(right.relativePath));

if (!dryRun) {
  await replaceOwnedFiles();
  await mkdir(targetRoot, { recursive: true });

  for (const file of files) {
    const targetPath = path.join(targetRoot, file.relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });

    if (file.kind === "generated") {
      await writeFile(targetPath, file.body, "utf8");
    } else {
      await cp(file.sourcePath, targetPath);
    }
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      command: "skills install",
      dry_run: dryRun,
      scope,
      source_root: sourceRoot,
      workspace_root: workspaceRoot,
      target_root: targetRoot,
      files: files.map((file) => file.relativePath)
    },
    null,
    2
  )
);

function valueFlag(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function findGitRoot(startDir) {
  let current = path.resolve(startDir);

  while (true) {
    if (existsSync(path.join(current, ".git"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

async function listFiles(rootDir, predicate) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await listFiles(entryPath, predicate)));
    } else if (predicate(entryPath)) {
      results.push(entryPath);
    }
  }

  return results.sort();
}

async function replaceOwnedFiles() {
  const manifestPath = path.join(targetRoot, "fusera-skills-manifest.json");

  if (!existsSync(manifestPath)) {
    return;
  }

  const prior = JSON.parse(await readFile(manifestPath, "utf8"));
  const priorFiles = Array.isArray(prior.files) ? prior.files : [];

  for (const relativePath of priorFiles) {
    await rm(path.join(targetRoot, relativePath), { force: true });
  }
}

function manifest(ownedFiles, skillPaths) {
  return {
    bundle_type: "fusera-companion-skills",
    generated_at: new Date().toISOString(),
    source_root: sourceRoot,
    workspace_root: scope === "repo-local" ? workspaceRoot : null,
    scope,
    target_root: targetRoot,
    runtime_supported_backends: ["codex"],
    instruction_only_backends: ["claude-code"],
    resolution: {
      mode: "source-root-required",
      copied_pack_files_are: "index-only",
      registry: path.join(sourceRoot, "superpowers/packs/registry.yaml"),
      stage_profiles: path.join(sourceRoot, "superpowers/packs/stage-profiles.yaml"),
      artifact_schemas: path.join(sourceRoot, "superpowers/contracts/artifacts"),
      references: path.join(sourceRoot, "reference"),
      runner: path.join(sourceRoot, "superpowers/runner")
    },
    pack_index_refs: skillPaths.map((filePath) => path.relative(sourceRoot, filePath)),
    schema_resolution: "source-root-only",
    files: ownedFiles
  };
}

function companionSkill() {
  return `# Fusera Companion Skills

This is a companion bundle for a local Fusera checkout.

Authoritative source root:

\`${sourceRoot}\`

Copied pack files in this bundle are a reading index for host agents. Resolve pack registry, references, contracts, and runner behavior from the source root.

\`\`\`bash
fusera doctor
fusera verify p0
fusera run mock-publish
\`\`\`

Runtime-supported backend: codex.
Instruction-only backend: claude-code.
`;
}

function companionReadme() {
  return `# Fusera Companion Bundle

This bundle is not self-contained. It points host agents back to:

\`${sourceRoot}\`

Do not treat copied pack files as standalone runtime packs.
`;
}
