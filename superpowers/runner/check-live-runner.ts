import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

type CheckResult = {
  name: string;
  ok: boolean;
  details?: Record<string, unknown>;
  error?: string;
};

type PreflightReport = {
  ok: boolean;
  generated_at: string;
  root_dir: string;
  checks: CheckResult[];
};

const ROOT_DIR = process.cwd();
const MIN_NODE_MAJOR = 24;

export async function checkLiveRunner(options: {
  rootDir?: string;
  strictGithubActions?: boolean;
  authProbe?: boolean;
} = {}): Promise<PreflightReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const checks: CheckResult[] = [];

  checks.push(checkNodeVersion());
  checks.push(await checkGithubActionsContext(Boolean(options.strictGithubActions)));
  checks.push(await checkRuntimeDirectory(rootDir));
  checks.push(await checkCodexVersion());

  if (options.authProbe) {
    checks.push(await checkCodexAuthProbe());
  }

  return {
    ok: checks.every((check) => check.ok),
    generated_at: new Date().toISOString(),
    root_dir: rootDir,
    checks
  };
}

function checkNodeVersion(): CheckResult {
  const major = Number(process.versions.node.split(".")[0]);

  return {
    name: "node-version",
    ok: Number.isFinite(major) && major >= MIN_NODE_MAJOR,
    details: {
      version: process.version,
      required_major_min: MIN_NODE_MAJOR
    }
  };
}

async function checkGithubActionsContext(strict: boolean): Promise<CheckResult> {
  const inActions = process.env.GITHUB_ACTIONS === "true";
  const details = {
    strict,
    github_actions: inActions,
    runner_name: process.env.RUNNER_NAME,
    runner_os: process.env.RUNNER_OS,
    runner_arch: process.env.RUNNER_ARCH,
    runner_temp: process.env.RUNNER_TEMP,
    github_workspace: process.env.GITHUB_WORKSPACE
  };

  return {
    name: "github-actions-context",
    ok: strict ? inActions : true,
    details,
    error: strict && !inActions ? "Expected GITHUB_ACTIONS=true on the live runner." : undefined
  };
}

async function checkRuntimeDirectory(rootDir: string): Promise<CheckResult> {
  const runtimeDir = path.join(rootDir, ".fusera/runs");
  const probePath = path.join(runtimeDir, `.runner-preflight-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);

  try {
    await mkdir(runtimeDir, { recursive: true });
    await writeFile(probePath, "ok\n", "utf8");
    await access(probePath, constants.R_OK | constants.W_OK);
    await rm(probePath, { force: true });

    return {
      name: "runtime-directory",
      ok: true,
      details: {
        runtime_dir: runtimeDir,
        writable: true
      }
    };
  } catch (error) {
    return {
      name: "runtime-directory",
      ok: false,
      details: {
        runtime_dir: runtimeDir,
        writable: false
      },
      error: errorMessage(error)
    };
  }
}

async function checkCodexVersion(): Promise<CheckResult> {
  const command = process.env.FUSERA_CODEX_COMMAND ?? "codex";
  const result = await runProcess({
    command,
    args: ["--version"],
    timeoutMs: 15000
  });

  return {
    name: "codex-version",
    ok: result.exit_code === 0,
    details: {
      command,
      exit_code: result.exit_code,
      signal: result.signal,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim()
    },
    error: result.exit_code === 0 ? undefined : result.stderr.trim() || result.error
  };
}

async function checkCodexAuthProbe(): Promise<CheckResult> {
  const command = process.env.FUSERA_CODEX_COMMAND ?? "codex";
  const model = process.env.FUSERA_CODEX_MODEL ?? "gpt-5.2";
  const reasoningEffort = process.env.FUSERA_CODEX_REASONING_EFFORT ?? "medium";
  const timeoutMs = numberFromEnv("FUSERA_CODEX_TIMEOUT_MS", 120000);
  const expectedMarker = "FUSERA_CODEX_AUTH_OK";
  const args = [
    "exec",
    "--skip-git-repo-check",
    "--sandbox",
    "read-only",
    "--model",
    model,
    "--config",
    `model_reasoning_effort="${reasoningEffort}"`,
    "-"
  ];
  const result = await runProcess({
    command,
    args,
    stdin: `Return exactly this text and nothing else: ${expectedMarker}\n`,
    timeoutMs
  });
  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  const markerObserved = combinedOutput.includes(expectedMarker);

  return {
    name: "codex-auth-probe",
    ok: result.exit_code === 0 && markerObserved,
    details: {
      command,
      model,
      reasoning_effort: reasoningEffort,
      timeout_ms: timeoutMs,
      exit_code: result.exit_code,
      signal: result.signal,
      marker_observed: markerObserved,
      stdout_excerpt: result.stdout.slice(0, 500),
      stderr_excerpt: result.stderr.slice(0, 500)
    },
    error:
      result.exit_code === 0 && markerObserved
        ? undefined
        : result.error ?? (result.stderr.trim() || "Codex auth probe did not return the expected marker.")
  };
}

function parseArgs(argv: string[]): {
  strictGithubActions: boolean;
  authProbe: boolean;
} {
  return {
    strictGithubActions: argv.includes("--strict-github-actions"),
    authProbe: argv.includes("--auth-probe")
  };
}

function numberFromEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runProcess(options: {
  command: string;
  args: string[];
  stdin?: string;
  timeoutMs: number;
}): Promise<{
  exit_code: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const child = spawn(options.command, options.args, {
      cwd: ROOT_DIR,
      env: process.env
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
    }, options.timeoutMs);

    function settle(result: {
      exit_code: number | null;
      signal: NodeJS.Signals | null;
      error?: string;
    }): void {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolve({
        ...result,
        stdout,
        stderr
      });
    }

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      settle({
        exit_code: null,
        signal: null,
        error: error.message
      });
    });
    child.on("close", (code, signal) => {
      settle({
        exit_code: code,
        signal
      });
    });
    child.stdin.on("error", () => {
      // Early process exit is reported by close/error. Avoid crashing on EPIPE.
    });
    child.stdin.end(options.stdin ?? "");
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const options = parseArgs(process.argv.slice(2));
  const report = await checkLiveRunner(options);

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
