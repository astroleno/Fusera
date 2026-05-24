#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
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
    const deep = spawnRunner(["doctor", "--deep", ...forwardedArgs], {
      capture: true,
      normalize: false
    });
    const deepReport = parseJsonOutput(deep.stdout);

    report.deep = deepReport;
    report.ok = deep.status === 0 && Boolean(deepReport?.ok);

    if (!deepReport) {
      report.deep_error = [
        spawnErrorText(deep),
        deep.stdout,
        deep.stderr
      ]
        .filter(Boolean)
        .join("\n")
        .trim();
    }
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

function runRunner(runnerArgs) {
  const result = spawnRunner(runnerArgs, { capture: false, normalize: true });

  if (result.error) {
    console.error(result.error.message);
  }

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
  } else if (command === "graph" && next[1] === "run") {
    normalizeFixedPath(next, 2);
  } else if (command === "capability-report") {
    normalizeValueFlag(next, "--run");
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
  const required = "22.22.0";
  const version = process.versions.node;
  const ok = compareVersions(version, required) >= 0;

  return {
    name: "node-version",
    ok,
    details: {
      version: process.version,
      required_min: required,
      package_engine: `>=${required}`
    },
    error: ok ? undefined : `Fusera requires Node >=${required} for startup.`
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

function compareVersions(left, right) {
  const leftParts = left.split(".").map((part) => Number(part));
  const rightParts = right.split(".").map((part) => Number(part));
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue > rightValue ? 1 : -1;
    }
  }

  return 0;
}

function spawnErrorText(result) {
  return result.error instanceof Error ? result.error.message : "";
}
