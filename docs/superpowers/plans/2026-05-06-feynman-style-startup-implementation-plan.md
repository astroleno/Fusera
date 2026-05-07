# Feynman-Style Startup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an installed `fusera` CLI and companion skills installer that work from caller workspaces while keeping the existing harness rooted in the Fusera checkout.

**Architecture:** `bin/fusera.mjs` is the plain-JS startup boundary: it resolves `source_root`, resolves caller `workspace_root`, normalizes caller-relative path arguments to absolute paths, and then invokes the TypeScript runner from `source_root`. The runner owns harness behavior, deep doctor checks, and installer delegation; live readiness composes the existing `checkLiveRunner()` preflight instead of adding a weaker parallel health model.

**Tech Stack:** Node ESM JavaScript for bootstrap/install/verification scripts, existing TypeScript runner via `node --experimental-strip-types`, existing `checkLiveRunner()` preflight, existing JSON/YAML harness files, no new npm dependencies. Startup support intentionally has two Node thresholds: local bootstrap and mock harness commands require Node `>=22.22.0`; live readiness is governed by `checkLiveRunner()` and currently requires Node `>=24`.

---

## File Structure

- Create: `bin/fusera.mjs`
  - Plain JavaScript executable wrapper.
  - Resolves `source_root`, `workspace_root`, and `invoke_cwd`.
  - Normalizes caller-relative positional path args before runner delegation.
  - Supports bootstrap-only `doctor` without importing TypeScript.

- Create: `scripts/install-skills.mjs`
  - Generates companion bundles for `codex-global` and `repo-local`.
  - Requires explicit `--scope`.
  - Writes a source-root resolution contract into `fusera-skills-manifest.json`.

- Create: `scripts/verify-startup-distribution.mjs`
  - Verifies npm script usage, installed binary usage, caller-relative input paths, caller-relative run-dir paths, and repo-local target resolution.

- Create: `docs/superpowers/harness/2026-05-05-startup-distribution-contract.md`
  - Documents companion semantics, supported scopes, source-root resolution, and backend claims.

- Modify: `.gitignore`
  - Ignore `.agents/` and `.opencode/`.

- Modify: `package.json`
  - Add `bin.fusera`, `engines.node`, and harness startup scripts. `engines.node` documents the local bootstrap threshold, not live-runner readiness.

- Modify: `AGENTS.md`
  - Add a short startup distribution pointer.

- Modify: `superpowers/runner/cli.ts`
  - Add `doctor --deep`.
  - Compose `checkLiveRunner()` for `doctor --live`.
  - Add `skills install` delegation.

- Modify: `README.md`
  - Document installed CLI, caller path semantics, companion skills install, and non-goals.

---

## Task 1: Package Metadata And Ignored Host Outputs

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Add package metadata**

Patch `package.json` so these entries exist while preserving the existing app scripts:

```json
{
  "bin": {
    "fusera": "./bin/fusera.mjs"
  },
  "engines": {
    "node": ">=22.22.0"
  },
  "scripts": {
    "fusera": "node ./bin/fusera.mjs",
    "harness:verify": "node ./bin/fusera.mjs verify p0",
    "harness:mock": "node ./bin/fusera.mjs run mock-publish",
    "harness:live": "node ./bin/fusera.mjs run live-publish",
    "harness:startup": "node scripts/verify-startup-distribution.mjs"
  }
}
```

- [ ] **Step 2: Document the Node threshold split**

Add this note near the local command or harness CLI documentation in `README.md`:

```markdown
Node policy:

- Local `fusera` startup, `doctor --bootstrap-only`, and mock harness commands require Node `>=22.22.0`.
- Live Codex readiness is checked by `fusera doctor --live`, which composes the existing live-runner preflight and may require a stricter Node version. As of this plan, `checkLiveRunner()` requires Node `>=24`.
```

- [ ] **Step 3: Refresh package lock**

Run:

```bash
npm install --package-lock-only
```

Expected:

```text
up to date
```

- [ ] **Step 4: Ignore generated host bundles**

Add these lines to `.gitignore` near the local/generated output section:

```gitignore
.agents/
.opencode/
```

- [ ] **Step 5: Verify metadata**

Run:

```bash
node -e "const p=require('./package.json'); console.log(p.bin.fusera, p.engines.node, p.scripts['harness:startup'])"
```

Expected output includes:

```text
./bin/fusera.mjs >=22.22.0 node scripts/verify-startup-distribution.mjs
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore README.md
git commit -m "chore: define fusera startup metadata"
```

---

## Task 2: Add Bootstrap Wrapper With Caller Path Normalization

**Files:**
- Create: `bin/fusera.mjs`

- [ ] **Step 1: Create `bin/fusera.mjs`**

Create the wrapper with this implementation:

```js
#!/usr/bin/env node
import { accessSync, constants, existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const sourceRoot = findSourceRoot(path.dirname(realpathSync(fileURLToPath(import.meta.url))));
const invokeCwd = process.cwd();
const workspaceRoot = findGitRoot(invokeCwd) ?? invokeCwd;
const args = process.argv.slice(2);

if (args.length === 0 || ["help", "--help", "-h"].includes(args[0])) {
  runRunner(args.length === 0 ? ["help"] : args);
}

if (args[0] === "doctor") {
  runDoctor(args.slice(1));
}

runRunner(args);

function runDoctor(doctorArgs) {
  const bootstrapOnly = doctorArgs.includes("--bootstrap-only");
  const forwardedArgs = doctorArgs.filter((arg) => arg !== "--bootstrap-only");
  const bootstrapChecks = [
    checkNodeVersion(),
    checkPath("source-root", sourceRoot, constants.R_OK),
    checkPath("workspace-root", workspaceRoot, constants.R_OK | constants.W_OK),
    checkPackageBin(),
    checkPath("runner-cli", path.join(sourceRoot, "superpowers/runner/cli.ts"), constants.R_OK),
    checkPath("pack-registry", path.join(sourceRoot, "superpowers/packs/registry.yaml"), constants.R_OK),
    checkPath("stage-profiles", path.join(sourceRoot, "superpowers/packs/stage-profiles.yaml"), constants.R_OK)
  ];
  const report = {
    ok: bootstrapChecks.every((check) => check.ok),
    command: "doctor",
    source_root: sourceRoot,
    workspace_root: workspaceRoot,
    invoke_cwd: invokeCwd,
    checks: bootstrapChecks
  };

  if (report.ok && !bootstrapOnly) {
    const deep = spawnRunner(["doctor", "--deep", ...forwardedArgs], { capture: true, normalize: false });
    report.deep = parseJsonOutput(deep.stdout);
    report.ok = deep.status === 0 && Boolean(report.deep?.ok);
    if (!report.deep) {
      report.deep_error = [deep.stdout, deep.stderr].filter(Boolean).join("\n").trim();
    }
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

function runRunner(runnerArgs) {
  const result = spawnRunner(runnerArgs, { capture: false, normalize: true });
  process.exit(result.status ?? 1);
}

function spawnRunner(runnerArgs, options) {
  const finalArgs = options.normalize ? normalizeRunnerArgs(runnerArgs) : runnerArgs;

  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", path.join(sourceRoot, "superpowers/runner/cli.ts"), ...finalArgs],
    {
      cwd: sourceRoot,
      env: {
        ...process.env,
        FUSERA_SOURCE_ROOT: sourceRoot,
        FUSERA_WORKSPACE_ROOT: workspaceRoot,
        FUSERA_INVOKE_CWD: invokeCwd
      },
      encoding: "utf8",
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
    }
  );
}

function normalizeRunnerArgs(rawArgs) {
  const next = [...rawArgs];
  const command = next[0];

  if (command === "run") {
    normalizeFirstPathAfter(next, 2);
  } else if (command === "proof") {
    normalizeFirstPathAfter(next, 2, new Set(["--live", "--mock"]));
  } else if (["continue", "resume", "inspect"].includes(command)) {
    normalizeFixedPath(next, 1);
  } else if (command === "verify" && ["live-preview", "live-quality"].includes(next[1])) {
    normalizeFixedPath(next, 2);
  } else if (command === "ci" && next[1] === "live") {
    normalizeFirstPathAfter(next, 2);
  } else if (command === "live-stability") {
    normalizeFirstPathAfter(next, 1, new Set(["--mock"]), new Set(["--runs"]));
  } else if (command === "skills" && next[1] === "install") {
    normalizeValueFlag(next, "--workspace-root");
  }

  return next;
}

function normalizeFirstPathAfter(tokens, startIndex, booleanFlags = new Set(), valueFlags = new Set()) {
  for (let index = startIndex; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (valueFlags.has(token)) {
      index += 1;
      continue;
    }

    if (booleanFlags.has(token) || token.startsWith("--")) {
      continue;
    }

    tokens[index] = normalizePath(token);
    return;
  }
}

function normalizeFixedPath(tokens, index) {
  if (tokens[index] && !tokens[index].startsWith("--")) {
    tokens[index] = normalizePath(tokens[index]);
  }
}

function normalizeValueFlag(tokens, flag) {
  const index = tokens.indexOf(flag);

  if (index !== -1 && tokens[index + 1]) {
    tokens[index + 1] = normalizePath(tokens[index + 1]);
  }
}

function normalizePath(value) {
  return path.isAbsolute(value) ? value : path.resolve(invokeCwd, value);
}

function findSourceRoot(startDir) {
  let current = path.resolve(startDir);

  while (true) {
    if (
      existsSync(path.join(current, "package.json")) &&
      existsSync(path.join(current, "superpowers/runner/cli.ts"))
    ) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Unable to find Fusera source root from ${startDir}`);
    }

    current = parent;
  }
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

function checkNodeVersion() {
  const major = Number(process.versions.node.split(".")[0]);
  const ok = Number.isFinite(major) && major >= 22;

  return {
    name: "node-version",
    ok,
    details: {
      version: process.version,
      required_major_min: 22,
      package_engine: ">=22.22.0"
    },
    error: ok ? undefined : "Fusera requires Node 22 or newer for startup."
  };
}

function checkPath(name, targetPath, mode) {
  try {
    accessSync(targetPath, mode);
    return { name, ok: true, details: { path: targetPath } };
  } catch (error) {
    return {
      name,
      ok: false,
      details: { path: targetPath },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function checkPackageBin() {
  const packagePath = path.join(sourceRoot, "package.json");

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    const ok = packageJson.bin?.fusera === "./bin/fusera.mjs";

    return {
      name: "package-bin",
      ok,
      details: { path: packagePath, bin: packageJson.bin?.fusera },
      error: ok ? undefined : "Expected package.json bin.fusera to be ./bin/fusera.mjs."
    };
  } catch (error) {
    return {
      name: "package-bin",
      ok: false,
      details: { path: packagePath },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function parseJsonOutput(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Make the wrapper executable**

Run:

```bash
chmod +x bin/fusera.mjs
```

- [ ] **Step 3: Verify help**

Run:

```bash
npm run fusera -- help
```

Expected output starts with:

```text
Usage:
```

- [ ] **Step 4: Verify bootstrap-only doctor**

Run:

```bash
npm run fusera -- doctor --bootstrap-only
```

Expected JSON includes:

```json
{
  "ok": true,
  "command": "doctor"
}
```

- [ ] **Step 5: Commit**

```bash
git add bin/fusera.mjs
git commit -m "feat: add fusera bootstrap wrapper"
```

---

## Task 3: Add Deep Doctor That Composes Live Preflight

**Files:**
- Modify: `superpowers/runner/cli.ts`

- [ ] **Step 1: Add imports**

At the top of `superpowers/runner/cli.ts`, add:

```ts
import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { checkLiveRunner } from "./check-live-runner.ts";
```

- [ ] **Step 2: Add command routing**

Inside `runCli`, before the unknown-command error, add:

```ts
  if (command === "doctor") {
    return doctorCommand([subcommand, ...rest].filter((arg): arg is string => typeof arg === "string"));
  }

  if (command === "skills") {
    return skillsCommand(subcommand, rest);
  }
```

- [ ] **Step 3: Add `doctorCommand`**

Add this helper near the other command helpers:

```ts
type DoctorCheck = {
  name: string;
  ok: boolean;
  details?: Record<string, unknown>;
  error?: string;
};

async function doctorCommand(args: string[]): Promise<CliResult> {
  const live = args.includes("--live");
  const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? process.cwd();
  const checks = [
    await checkReadable("artifact-schemas", path.join(sourceRoot, "superpowers/contracts/artifacts")),
    await checkReadable("pack-registry", path.join(sourceRoot, "superpowers/packs/registry.yaml")),
    await checkReadable("stage-profiles", path.join(sourceRoot, "superpowers/packs/stage-profiles.yaml")),
    await checkWritableRuntime(sourceRoot)
  ];

  let liveReport: Record<string, unknown> | undefined;

  if (live) {
    const report = await checkLiveRunner({
      rootDir: sourceRoot,
      authProbe: args.includes("--auth-probe"),
      strictGithubActions: args.includes("--strict-github-actions")
    });
    liveReport = report as unknown as Record<string, unknown>;
    checks.push(
      ...report.checks.map((check) => ({
        ...check,
        name: `live:${check.name}`
      }))
    );
  }

  return {
    ok: checks.every((check) => check.ok),
    command: "doctor --deep",
    source_root: sourceRoot,
    workspace_root: process.env.FUSERA_WORKSPACE_ROOT ?? process.cwd(),
    live,
    live_report: liveReport,
    checks
  };
}
```

- [ ] **Step 4: Add `skillsCommand`**

Add this helper near `doctorCommand`:

```ts
async function skillsCommand(subcommand: string | undefined, args: string[]): Promise<CliResult> {
  if (subcommand !== "install") {
    throw new Error(`Unknown skills command: ${subcommand ?? "(missing)"}\n\n${usage()}`);
  }

  const scriptPath = path.join(process.env.FUSERA_SOURCE_ROOT ?? process.cwd(), "scripts/install-skills.mjs");
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: process.env.FUSERA_SOURCE_ROOT ?? process.cwd(),
    env: process.env,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "skills install failed");
  }

  return JSON.parse(result.stdout) as CliResult;
}
```

- [ ] **Step 5: Add check helpers**

Add these helpers near the existing CLI utility functions:

```ts
async function checkReadable(name: string, targetPath: string): Promise<DoctorCheck> {
  try {
    await access(targetPath, constants.R_OK);
    return { name, ok: true, details: { path: targetPath } };
  } catch (error) {
    return {
      name,
      ok: false,
      details: { path: targetPath },
      error: (error as Error).message
    };
  }
}

async function checkWritableRuntime(sourceRoot: string): Promise<DoctorCheck> {
  const runtimeDir = path.join(sourceRoot, ".fusera/runs");

  try {
    await mkdir(runtimeDir, { recursive: true });
    await access(runtimeDir, constants.R_OK | constants.W_OK);
    return { name: "runtime-directory", ok: true, details: { path: runtimeDir } };
  } catch (error) {
    return {
      name: "runtime-directory",
      ok: false,
      details: { path: runtimeDir },
      error: (error as Error).message
    };
  }
}
```

- [ ] **Step 6: Update usage text**

Add these lines to `usage()`:

```text
  node --experimental-strip-types superpowers/runner/cli.ts doctor [--deep] [--live] [--auth-probe]
  node --experimental-strip-types superpowers/runner/cli.ts skills install --scope <codex-global|repo-local> [--workspace-root <path>] [--dry-run]
```

- [ ] **Step 7: Verify normal doctor**

Run:

```bash
npm run fusera -- doctor
```

Expected JSON includes:

```json
{
  "ok": true,
  "command": "doctor"
}
```

- [ ] **Step 8: Verify missing Codex is structured**

Run:

```bash
mkdir -p .tmp
FUSERA_CODEX_COMMAND=fusera-missing-codex-command node ./bin/fusera.mjs doctor --live > .tmp/fusera-doctor-live.json || true
node -e "const r=require('./.tmp/fusera-doctor-live.json'); console.log(Boolean(r.deep), r.ok, JSON.stringify(r).includes('fusera-missing-codex-command'))"
```

Expected:

```text
true false true
```

- [ ] **Step 9: Commit**

```bash
git add superpowers/runner/cli.ts
git commit -m "feat: add fusera deep doctor"
```

---

## Task 4: Define Companion Distribution Contract

**Files:**
- Create: `docs/superpowers/harness/2026-05-05-startup-distribution-contract.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Create the contract document**

Create `docs/superpowers/harness/2026-05-05-startup-distribution-contract.md`:

````markdown
# Startup Distribution Contract

Date: 2026-05-05
Status: P1 implementation contract

## Scope

Fusera skills-only install creates a companion bundle. It is not a self-contained runtime distribution. It requires a local Fusera `source_root`.

## Roots

- `source_root`: Fusera checkout containing `superpowers/`.
- `workspace_root`: caller workspace receiving repo-local host integration files.

## Supported Scopes

- `codex-global`: writes to `~/.codex/skills/fusera`.
- `repo-local`: writes to `<workspace_root>/.agents/skills/fusera`.

`opencode` is deferred.

## Resolution Contract

Copied pack `SKILL.md` files are index snapshots for host reading. They are not standalone pack distributions.

Authoritative resolution must go through `source_root`:

- pack registry: `<source_root>/superpowers/packs/registry.yaml`
- stage profiles: `<source_root>/superpowers/packs/stage-profiles.yaml`
- artifact schemas: `<source_root>/superpowers/contracts/artifacts/`
- reference material: `<source_root>/reference/`
- runner source: `<source_root>/superpowers/runner/`

## Backend Claims

Generated bundle metadata must contain:

```json
{
  "runtime_supported_backends": ["codex"],
  "instruction_only_backends": ["claude-code"]
}
```

The companion bundle must not claim Claude Code runtime parity.

## Installer Contract

The installer must require `--scope`, support `--dry-run`, be idempotent, and replace only files listed in the previous generated manifest.

The installer must not copy canonical artifact schemas into the companion bundle. The manifest points to `source_root` for schemas so there is only one authoritative contract surface.
````

- [ ] **Step 2: Add AGENTS pointer**

Add this section to `AGENTS.md`:

```markdown
## Startup Distribution

- Startup distribution follows `docs/superpowers/harness/2026-05-05-startup-distribution-contract.md`.
- Skills-only installs are companion bundles for a local Fusera checkout, not self-contained external pack distributions.
- Copied pack files in a companion bundle are reading indexes; authoritative pack resolution remains under `superpowers/`.
```

- [ ] **Step 3: Verify contract text**

Run:

```bash
rg -n "Resolution Contract|source_root|runtime_supported_backends|instruction_only_backends|not standalone" docs/superpowers/harness/2026-05-05-startup-distribution-contract.md AGENTS.md
```

Expected output contains all searched phrases.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md docs/superpowers/harness/2026-05-05-startup-distribution-contract.md
git commit -m "docs: define fusera companion distribution contract"
```

---

## Task 5: Implement Companion Skills Installer

**Files:**
- Create: `scripts/install-skills.mjs`

- [ ] **Step 1: Create installer**

Create `scripts/install-skills.mjs` with an explicit `--scope` requirement and a source-root resolution manifest:

```js
#!/usr/bin/env node
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = process.env.FUSERA_SOURCE_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const scope = valueFlag("--scope");
const dryRun = args.includes("--dry-run");
const workspaceRoot = valueFlag("--workspace-root") ?? process.env.FUSERA_WORKSPACE_ROOT ?? findGitRoot(process.cwd()) ?? process.cwd();

if (!scope) {
  fail("skills install requires --scope <codex-global|repo-local>");
}

if (!["codex-global", "repo-local"].includes(scope)) {
  fail(`Unsupported or deferred skills install scope: ${scope}`);
}

const targetRoot = scope === "codex-global"
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

console.log(JSON.stringify({
  ok: true,
  command: "skills install",
  dry_run: dryRun,
  scope,
  source_root: sourceRoot,
  workspace_root: workspaceRoot,
  target_root: targetRoot,
  files: files.map((file) => file.relativePath)
}, null, 2));

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
  const entries = await import("node:fs/promises").then((fs) => fs.readdir(rootDir, { withFileTypes: true }));
  const results = [];
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await listFiles(entryPath, predicate));
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

Copied pack files in this bundle are an index for host reading. Resolve pack registry, references, contracts, and runner behavior from the source root.

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
```

- [ ] **Step 2: Make installer executable**

Run:

```bash
chmod +x scripts/install-skills.mjs
```

- [ ] **Step 3: Verify missing scope fails**

Run:

```bash
npm run fusera -- skills install --dry-run
```

Expected:

```text
skills install requires --scope <codex-global|repo-local>
```

- [ ] **Step 4: Verify repo-local dry run**

Run:

```bash
npm run fusera -- skills install --scope repo-local --dry-run
```

Expected JSON includes:

```json
{
  "ok": true,
  "scope": "repo-local",
  "dry_run": true
}
```

- [ ] **Step 5: Verify deferred scope fails**

Run:

```bash
npm run fusera -- skills install --scope opencode
```

Expected:

```text
Unsupported or deferred skills install scope: opencode
```

- [ ] **Step 6: Verify real install is ignored by git**

Run:

```bash
npm run fusera -- skills install --scope repo-local
node -e "const m=require('./.agents/skills/fusera/fusera-skills-manifest.json'); console.log(m.resolution.mode, m.resolution.copied_pack_files_are, m.schema_resolution, m.runtime_supported_backends.join(','))"
git status --short
```

Expected output includes:

```text
source-root-required index-only source-root-only codex
```

`git status --short` must not list `.agents/`.

- [ ] **Step 7: Commit**

```bash
git add scripts/install-skills.mjs
git commit -m "feat: add fusera companion skills installer"
```

---

## Task 6: Verify Startup Distribution And Caller Paths

**Files:**
- Create: `scripts/verify-startup-distribution.mjs`

- [ ] **Step 1: Create verification script**

Create `scripts/verify-startup-distribution.mjs`:

```js
#!/usr/bin/env node
import { access, cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { constants } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const callerDir = await mkdtemp(path.join(os.tmpdir(), "fusera-startup-caller-"));
const checks = [];

await cp("superpowers/runner/fixtures/landing-input.json", path.join(callerDir, "input.json"));
runCheck("caller-git-init", callerDir, "git", ["init"], "Initialized");

await check("bin-executable", async () => access("bin/fusera.mjs", constants.X_OK));
await check("package-bin", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  if (packageJson.bin?.fusera !== "./bin/fusera.mjs") {
    throw new Error("package.json bin.fusera is not ./bin/fusera.mjs");
  }
});

runCheck("npm-help", root, "npm", ["run", "fusera", "--", "help"], "Usage:");
runCheck("npm-doctor-bootstrap", root, "npm", ["run", "fusera", "--", "doctor", "--bootstrap-only"], "\"command\": \"doctor\"");
runCheck("verify-p0", root, "npm", ["run", "harness:verify"], "\"ok\": true");
await runInstalledBinaryChecks();

const report = {
  ok: checks.every((item) => item.ok),
  command: "verify-startup-distribution",
  caller_dir: callerDir,
  checks
};

try {
  await rm(callerDir, { recursive: true, force: true });
} catch (error) {
  report.ok = false;
  report.cleanup_error = error instanceof Error ? error.message : String(error);
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
  } catch (error) {
    checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}

function runCheck(name, cwd, command, args, expectedText) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  const output = `${result.stdout}\n${result.stderr}`;
  const ok = result.status === 0 && output.includes(expectedText);
  checks.push({
    name,
    ok,
    details: { status: result.status, expected_text: expectedText },
    error: ok ? undefined : output.trim()
  });
  return { result, output, ok };
}

async function runInstalledBinaryChecks() {
  const link = spawnSync("npm", ["link"], { cwd: root, encoding: "utf8" });
  if (link.status !== 0) {
    checks.push({ name: "npm-link", ok: false, error: `${link.stdout}\n${link.stderr}`.trim() });
    return;
  }

  try {
    runCheck("installed-help", callerDir, "fusera", ["help"], "Usage:");
    runCheck("installed-doctor", callerDir, "fusera", ["doctor", "--bootstrap-only"], "\"command\": \"doctor\"");

    const run = runCheck("installed-run-relative-input", callerDir, "fusera", ["run", "mock-publish", "input.json"], "\"command\": \"run mock-publish\"");
    if (run.ok) {
      try {
        const jsonStart = run.output.indexOf("{");
        const parsed = JSON.parse(run.output.slice(jsonStart));
        const runDir = parsed.result.run_dir;
        const linkPath = path.join(callerDir, "run-under-test");
        await symlink(runDir, linkPath);
        runCheck("installed-inspect-relative-run-dir", callerDir, "fusera", ["inspect", "run-under-test", "--json"], "\"command\": \"inspect\"");
      } catch (error) {
        checks.push({
          name: "installed-inspect-relative-run-dir",
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const dryRun = runCheck("installed-skills-repo-local-target", callerDir, "fusera", ["skills", "install", "--scope", "repo-local", "--dry-run"], "\"scope\": \"repo-local\"");
    if (dryRun.ok && !dryRun.output.includes(path.join(callerDir, ".agents/skills/fusera"))) {
      checks.push({
        name: "installed-skills-target-is-caller-workspace",
        ok: false,
        error: "repo-local dry-run did not target caller workspace"
      });
    } else if (dryRun.ok) {
      checks.push({ name: "installed-skills-target-is-caller-workspace", ok: true });
    }
  } finally {
    const unlink = spawnSync("npm", ["unlink", "-g", "fusera"], { cwd: root, encoding: "utf8" });
    checks.push({
      name: "npm-unlink-global",
      ok: unlink.status === 0,
      error: unlink.status === 0 ? undefined : `${unlink.stdout}\n${unlink.stderr}`.trim()
    });
  }
}
```

- [ ] **Step 2: Make script executable**

Run:

```bash
chmod +x scripts/verify-startup-distribution.mjs
```

- [ ] **Step 3: Run startup verification**

Run:

```bash
npm run harness:startup
```

Expected JSON includes:

```json
{
  "ok": true,
  "command": "verify-startup-distribution"
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-startup-distribution.mjs
git commit -m "test: verify fusera installed startup"
```

---

## Task 7: Document User Flows And Boundaries

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-05-05-feynman-style-startup-plan.md`

- [ ] **Step 1: Add README CLI section**

Add this section under local commands:

````markdown
## Fusera Harness CLI

```bash
npm link
fusera doctor
fusera verify p0
fusera run mock-publish path/to/input.json
fusera inspect path/to/run-dir --json
```

The installed CLI resolves its Fusera `source_root` from the linked package. It resolves caller-provided relative paths from the directory where `fusera` was invoked before delegating to the harness runner.
````

- [ ] **Step 2: Add README companion skills section**

Add:

````markdown
## Companion Skills Install

```bash
fusera skills install --scope codex-global
fusera skills install --scope repo-local
```

`codex-global` writes to `~/.codex/skills/fusera`.

`repo-local` writes to `<workspace_root>/.agents/skills/fusera`.

The skills install is a companion bundle for a local Fusera checkout. Copied pack files are only a reading index; authoritative registry, references, contracts, and runner behavior resolve through `source_root`. Runtime execution is Codex-first. Claude Code usage is instruction-only until a future `superpowers/adapters/claude-code/` adapter exists.
````

- [ ] **Step 3: Update decision plan coverage**

Update `docs/superpowers/plans/2026-05-05-feynman-style-startup-plan.md` so it explicitly states:

- local startup targets Node `>=22.22.0`
- live readiness follows `checkLiveRunner()` and currently requires Node `>=24`
- caller-relative path arguments are normalized by the wrapper before runner delegation
- companion bundle schemas are source-root-only and are not copied into the bundle
- startup verification uses a repo-external temporary git root for caller workspace checks

- [ ] **Step 4: Verify docs**

Run:

```bash
rg -n "caller-provided relative paths|source_root|workspace_root|reading index|not self-contained|schema|Node|checkLiveRunner|repo-external|claude-code|codex-global|repo-local" README.md docs/superpowers/plans/2026-05-05-feynman-style-startup-plan.md
```

Expected output includes all searched phrases.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/superpowers/plans/2026-05-05-feynman-style-startup-plan.md
git commit -m "docs: document fusera startup semantics"
```

---

## Final Verification

- [ ] **Step 1: Run startup verification**

```bash
npm run harness:startup
```

Expected:

```json
{
  "ok": true
}
```

- [ ] **Step 2: Run harness verification**

```bash
npm run harness:verify
```

Expected:

```json
{
  "ok": true
}
```

- [ ] **Step 3: Confirm git status**

```bash
git status --short
```

Expected:
- Source changes are limited to the files in this plan.
- `.agents/` is not listed.

## Review Finding Coverage

- `[P1] Installed CLI still breaks caller-relative paths`: Task 2 normalizes caller-relative path arguments; Task 6 verifies relative input and relative run-dir usage from a separate caller workspace.
- `[P1] doctor weaker than canonical live check`: Task 3 composes `checkLiveRunner()` for `doctor --live`.
- `[P1] missing codex crashes doctor`: Task 3 removes the unsafe custom spawn helper and verifies missing Codex returns structured JSON.
- `[P1] companion bundle lacks stable resolution`: Task 4 defines source-root resolution; Task 5 writes it into the manifest.
- `[P1] harness startup verifier self-fails`: Task 6 creates a repo-external temporary git root, so `repo-local` correctly targets the caller workspace.
- `[P1] companion bundle copies canonical schemas`: Task 5 keeps schemas source-root-only and records `schema_resolution: "source-root-only"` in the manifest.
- `[P2] Node policy split`: Task 1 documents local `>=22.22.0` startup support separately from live `checkLiveRunner()` readiness.
- `[P2] Task 2 verification contradiction`: Task 2 verifies `doctor --bootstrap-only`, so pre-deep and post-deep behavior no longer conflict.
- `--scope` ambiguity: Task 5 requires explicit `--scope`.
- Task 7 plan-file ambiguity: Task 7 specifies exact README and decision-plan documentation changes.
