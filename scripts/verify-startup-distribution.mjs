#!/usr/bin/env node
import { access, cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

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
runCheck("npm-doctor-bootstrap", root, "npm", ["run", "fusera", "--", "doctor", "--bootstrap-only"], '"command": "doctor"');
runCheck("verify-p0", root, "npm", ["run", "harness:verify"], '"ok": true');
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
    checks.push({
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    });
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
    checks.push({
      name: "npm-link",
      ok: false,
      error: `${link.stdout}\n${link.stderr}`.trim()
    });
    return;
  }

  try {
    runCheck("installed-help", callerDir, "fusera", ["help"], "Usage:");
    runCheck("installed-doctor", callerDir, "fusera", ["doctor", "--bootstrap-only"], '"command": "doctor"');

    const run = runCheck(
      "installed-run-relative-input",
      callerDir,
      "fusera",
      ["run", "mock-publish", "input.json"],
      '"command": "run mock-publish"'
    );

    if (run.ok) {
      try {
        const jsonStart = run.output.indexOf("{");
        const parsed = JSON.parse(run.output.slice(jsonStart));
        const runDir = parsed.result.run_dir;
        const linkPath = path.join(callerDir, "run-under-test");

        await symlink(runDir, linkPath);
        runCheck(
          "installed-inspect-relative-run-dir",
          callerDir,
          "fusera",
          ["inspect", "run-under-test", "--json"],
          '"command": "inspect"'
        );
      } catch (error) {
        checks.push({
          name: "installed-inspect-relative-run-dir",
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const dryRun = runCheck(
      "installed-skills-repo-local-target",
      callerDir,
      "fusera",
      ["skills", "install", "--scope", "repo-local", "--dry-run"],
      '"scope": "repo-local"'
    );

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
