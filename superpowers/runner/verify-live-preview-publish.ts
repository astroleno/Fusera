import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  loadArtifactSchema,
  validateArtifactEnvelope,
  type ArtifactEnvelope
} from "./validate-artifact.ts";

type PreviewPublishCheck = {
  name: string;
  ok: boolean;
  details?: Record<string, unknown>;
};

type LivePreviewPublishReport = {
  ok: boolean;
  run_id: string;
  run_dir: string;
  final_state: string;
  checks: PreviewPublishCheck[];
};

const ROOT_DIR = process.cwd();
const RUNNER_OWNED_STAGES = ["page-compile", "verify-publishable-page", "publish-preview"];

export async function verifyLivePreviewPublish(options: {
  rootDir?: string;
  runDir: string;
}): Promise<LivePreviewPublishReport> {
  const rootDir = options.rootDir ?? ROOT_DIR;
  const runDir = path.resolve(rootDir, options.runDir);
  const contractsDir = path.join(rootDir, "superpowers/contracts/artifacts");
  const run = await readJson(path.join(runDir, "run.json"));
  const checks: PreviewPublishCheck[] = [];

  checks.push(await checkFinalState(run));
  checks.push(await checkRunnerOwnedArtifacts(runDir, contractsDir));
  checks.push(await checkPreviewBindings(runDir));
  checks.push(await checkPreviewPublishScope(runDir));
  checks.push(await checkRunnerOwnedBackendEvidence(runDir));
  checks.push(await checkPublishEvents(runDir));

  const report = {
    ok: checks.every((check) => check.ok),
    run_id: String(run.run_id ?? ""),
    run_dir: runDir,
    final_state: String(run.state ?? ""),
    checks
  };

  await writeFile(
    path.join(runDir, "live-preview-publish-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );

  return report;
}

async function checkFinalState(run: Record<string, unknown>): Promise<PreviewPublishCheck> {
  return {
    name: "final-state-published",
    ok: run.state === "published",
    details: {
      final_state: run.state,
      proof_target_stage: run.proof_target_stage,
      proof_completed: run.proof_completed
    }
  };
}

async function checkRunnerOwnedArtifacts(runDir: string, contractsDir: string): Promise<PreviewPublishCheck> {
  const artifacts = {
    PageSpec: await readJson(path.join(runDir, "artifacts/page-spec.json")),
    QAReport: await readJson(path.join(runDir, "artifacts/qa-report.json")),
    PublishVersion: await readJson(path.join(runDir, "artifacts/publish-version.json"))
  };
  const validation = await Promise.all(
    Object.entries(artifacts).map(async ([artifactType, artifact]) => {
      const schema = await loadArtifactSchema(contractsDir, artifactType);
      const errors = validateArtifactEnvelope(artifact as ArtifactEnvelope, schema);

      return {
        artifact_type: artifactType,
        artifact_id: artifact.artifact_id,
        status: artifact.status,
        valid: errors.length === 0,
        errors
      };
    })
  );

  return {
    name: "runner-owned-artifacts-validate",
    ok: validation.every((item) => item.status === "validated" && item.valid),
    details: {
      validation
    }
  };
}

async function checkPreviewBindings(runDir: string): Promise<PreviewPublishCheck> {
  const pageSpec = await readJson(path.join(runDir, "artifacts/page-spec.json"));
  const qaReport = await readJson(path.join(runDir, "artifacts/qa-report.json"));
  const publishVersion = await readJson(path.join(runDir, "artifacts/publish-version.json"));
  const previewBuild = await readJson(path.join(runDir, "compiled/preview-build.json"));
  const handoff = await readJson(path.join(runDir, "previews/publish-handoff.json"));
  const bindings = {
    qa_page_spec_ref: qaReport.payload?.page_spec_ref === pageSpec.artifact_id,
    qa_preview_build_ref: qaReport.payload?.preview_build_ref === previewBuild.preview_build_ref,
    publish_page_spec_ref: publishVersion.payload?.page_spec_ref === pageSpec.artifact_id,
    publish_qa_report_ref: publishVersion.payload?.qa_report_ref === qaReport.artifact_id,
    handoff_publish_version_ref: handoff.publish_version_ref === publishVersion.artifact_id,
    handoff_preview_build_ref: handoff.preview_build_ref === previewBuild.preview_build_ref,
    same_run:
      pageSpec.run_id === qaReport.run_id &&
      qaReport.run_id === publishVersion.run_id &&
      publishVersion.run_id === previewBuild.run_id
  };

  return {
    name: "preview-binding-chain",
    ok: Object.values(bindings).every(Boolean),
    details: bindings
  };
}

async function checkPreviewPublishScope(runDir: string): Promise<PreviewPublishCheck> {
  const qaReport = await readJson(path.join(runDir, "artifacts/qa-report.json"));
  const publishVersion = await readJson(path.join(runDir, "artifacts/publish-version.json"));
  const payload = publishVersion.payload ?? {};
  const ok =
    qaReport.payload?.verdict === "pass" &&
    payload.publish_target === "preview" &&
    payload.previous_active_pointer === null &&
    typeof payload.preview_url === "string" &&
    payload.preview_url.startsWith("preview://");

  return {
    name: "preview-scope",
    ok,
    details: {
      qa_verdict: qaReport.payload?.verdict,
      publish_target: payload.publish_target,
      previous_active_pointer: payload.previous_active_pointer,
      preview_url: payload.preview_url
    }
  };
}

async function checkRunnerOwnedBackendEvidence(runDir: string): Promise<PreviewPublishCheck> {
  const stageResults = await Promise.all(
    RUNNER_OWNED_STAGES.map(async (stage) => ({
      stage,
      result: await readJson(path.join(runDir, "stages", stage, "adapter-result.json"))
    }))
  );
  const ok = stageResults.every(({ result }) => {
    const candidates = Array.isArray(result.produced_artifact_candidates)
      ? result.produced_artifact_candidates
      : [];

    return (
      result.status === "ok" &&
      result.usage?.mode === "runner-owned-noop" &&
      result.usage?.skipped_backend === true &&
      typeof result.usage?.attempt_id === "string" &&
      typeof result.usage?.attempt_dir === "string" &&
      candidates.length === 0
    );
  });

  return {
    name: "runner-owned-backend-noop-evidence",
    ok,
    details: {
      stage_modes: stageResults.map(({ stage, result }) => ({
        stage,
        status: result.status,
        mode: result.usage?.mode,
        skipped_backend: result.usage?.skipped_backend,
        attempt_id: result.usage?.attempt_id,
        attempt_dir: result.usage?.attempt_dir
      }))
    }
  };
}

async function checkPublishEvents(runDir: string): Promise<PreviewPublishCheck> {
  const events = await readEvents(runDir);
  const skippedStages = new Set(
    events
      .filter((event) => event.type === "backend_skipped" && typeof event.stage === "string")
      .map((event) => event.stage)
  );
  const ok =
    RUNNER_OWNED_STAGES.every((stage) => skippedStages.has(stage)) &&
    events.some((event) => event.type === "publish_succeeded" && event.stage === "publish-preview") &&
    (
      events.some((event) => event.type === "stage_completed" && event.stage === "publish-preview") ||
      events.some((event) => event.type === "proof_stage_reached" && event.stage === "publish-preview")
    );

  return {
    name: "publish-events",
    ok,
    details: {
      backend_skipped_stages: [...skippedStages].filter((stage) => RUNNER_OWNED_STAGES.includes(stage)),
      has_publish_succeeded: events.some(
        (event) => event.type === "publish_succeeded" && event.stage === "publish-preview"
      ),
      has_publish_stage_completed: events.some(
        (event) => event.type === "stage_completed" && event.stage === "publish-preview"
      ),
      has_publish_proof_event: events.some(
        (event) => event.type === "proof_stage_reached" && event.stage === "publish-preview"
      )
    }
  };
}

async function readEvents(runDir: string): Promise<Array<Record<string, any>>> {
  return (await readFile(path.join(runDir, "events.ndjson"), "utf8"))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function readJson(filePath: string): Promise<Record<string, any>> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const runDir = args[0] === "--run-dir" ? args[1] : args[0];

  if (!runDir) {
    console.error(
      "Usage: node --experimental-strip-types superpowers/runner/verify-live-preview-publish.ts --run-dir <run-dir>"
    );
    process.exit(1);
  }

  const report = await verifyLivePreviewPublish({ runDir });

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}
