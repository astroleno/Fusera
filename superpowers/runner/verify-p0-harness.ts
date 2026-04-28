import { chmod, cp, mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { extractAdapterOutputFromText } from "../adapters/codex/extract-artifacts.ts";
import { assembleContext } from "./assemble-context.ts";
import { runLiveStability } from "./ci-gates.ts";
import { compilePack } from "./compile-pack.ts";
import { invokeBackend } from "./invoke-backend.ts";
import { resolveStage } from "./resolve-packs.ts";
import { continueStageProof, resumeFailedRun, runFixture, runStageProof } from "./run-stage.ts";
import { persistAdapterArtifactCandidates } from "./run-stage.ts";
import {
  loadArtifactSchema,
  validateArtifactEnvelope,
  type ArtifactEnvelope
} from "./validate-artifact.ts";

type CheckResult = {
  name: string;
  ok: boolean;
  details?: Record<string, unknown>;
};

type VerificationSummary = {
  ok: boolean;
  publish_run_dir: string;
  qa_failure_run_dir: string;
  checks: CheckResult[];
};

const ROOT_DIR = process.cwd();
const CONTRACTS_DIR = path.join(ROOT_DIR, "superpowers/contracts/artifacts");

export async function verifyP0Harness(): Promise<VerificationSummary> {
  const checks: CheckResult[] = [];
  const publishRun = await runFixture({ rootDir: ROOT_DIR, mode: "publish" });
  const qaFailureRun = await runFixture({ rootDir: ROOT_DIR, mode: "qa-failure" });

  checks.push(await checkPublishRun(publishRun.run_dir));
  checks.push(await checkRunnerOwnedStagesUseNoopBackend(publishRun.run_dir));
  checks.push(await checkArtifactsValidate(publishRun.run_dir, 8));
  checks.push(await checkCompiledPackBundle(publishRun.run_dir));
  checks.push(await checkAttemptScopedEvidence(publishRun.run_dir));
  checks.push(await checkDesignContextPacks(publishRun.run_dir));
  checks.push(await checkReferenceBudgetPolicy());
  checks.push(await checkQaFailureRun(qaFailureRun.run_dir));
  checks.push(await checkStageProofStop());
  checks.push(await checkStageProofContinue());
  checks.push(await checkLiveContinueKeepsAdapterMode());
  checks.push(await checkFailedRunResumeRetry());
  checks.push(await checkFailedProofResumeDoesNotPublish());
  checks.push(await checkBackendRetryBudgetExhausted());
  checks.push(await checkLiveStabilityMockReport());
  checks.push(await checkLiveStabilityFailureDiagnostics());
  checks.push(await checkLiveStabilityCanonicalDefaults());
  checks.push(await checkUnsupportedCapabilityRejected());
  checks.push(await checkContextStatusAndVersionRejected(publishRun.run_dir));
  checks.push(await checkAdapterCandidateGuards());
  checks.push(await checkArtifactExtractor());
  checks.push(await checkRealAdapterArtifactPositivePath());
  checks.push(await checkRealAdapterCatBoundary());
  checks.push(await checkRealAdapterNormalizeAttachmentBoundary());
  checks.push(await checkRealAdapterEarlyExitBoundary());
  checks.push(await checkRealAdapterInvalidConfigBoundary());

  return {
    ok: checks.every((check) => check.ok),
    publish_run_dir: publishRun.run_dir,
    qa_failure_run_dir: qaFailureRun.run_dir,
    checks
  };
}

async function checkStageProofContinue(): Promise<CheckResult> {
  const proofRun = await runStageProof({
    rootDir: ROOT_DIR,
    targetStage: "product-and-brand-brief"
  });
  const continuedRun = await continueStageProof({
    rootDir: ROOT_DIR,
    runDir: proofRun.run_dir,
    targetStage: "page-strategy"
  });
  const run = await readJson(path.join(continuedRun.run_dir, "run.json"));
  const pagePlan = await readJson(path.join(continuedRun.run_dir, "artifacts/page-plan.json"));
  const artifactFiles = await readdir(path.join(continuedRun.run_dir, "artifacts"));
  const events = await readEvents(continuedRun.run_dir);
  const ok =
    continuedRun.run_dir === proofRun.run_dir &&
    run.state === "stage_proved" &&
    run.proof_target_stage === "page-strategy" &&
    pagePlan.status === "validated" &&
    !artifactFiles.includes("section-graph.json") &&
    events.some((event) => event.type === "resume_stage_proof") &&
    events.some((event) => event.type === "proof_stage_reached" && event.stage === "page-strategy");

  return {
    name: "stage-proof-continue",
    ok,
    details: {
      run_dir: continuedRun.run_dir,
      same_run: continuedRun.run_dir === proofRun.run_dir,
      final_state: run.state,
      proof_target_stage: run.proof_target_stage,
      page_plan_status: pagePlan.status,
      has_section_graph: artifactFiles.includes("section-graph.json"),
      has_resume_event: events.some((event) => event.type === "resume_stage_proof"),
      has_page_strategy_proof_event: events.some(
        (event) => event.type === "proof_stage_reached" && event.stage === "page-strategy"
      )
    }
  };
}

async function checkStageProofStop(): Promise<CheckResult> {
  const proofRun = await runStageProof({
    rootDir: ROOT_DIR,
    targetStage: "product-and-brand-brief"
  });
  const run = await readJson(path.join(proofRun.run_dir, "run.json"));
  const productBrief = await readJson(path.join(proofRun.run_dir, "artifacts/product-brief.json"));
  const brandProfile = await readJson(path.join(proofRun.run_dir, "artifacts/brand-profile.json"));
  const artifactFiles = await readdir(path.join(proofRun.run_dir, "artifacts"));
  const events = await readEvents(proofRun.run_dir);
  const ok =
    run.state === "stage_proved" &&
    run.proof_target_stage === "product-and-brand-brief" &&
    run.proof_completed === true &&
    productBrief.status === "validated" &&
    brandProfile.status === "validated" &&
    !artifactFiles.includes("page-plan.json") &&
    events.some((event) => event.type === "proof_stage_reached" && event.stage === "product-and-brand-brief");

  return {
    name: "stage-proof-stop",
    ok,
    details: {
      run_dir: proofRun.run_dir,
      final_state: run.state,
      proof_target_stage: run.proof_target_stage,
      proof_completed: run.proof_completed,
      has_page_plan: artifactFiles.includes("page-plan.json"),
      has_proof_event: events.some(
        (event) => event.type === "proof_stage_reached" && event.stage === "product-and-brand-brief"
      )
    }
  };
}

async function checkLiveContinueKeepsAdapterMode(): Promise<CheckResult> {
  const scriptPath = await writePositiveRealAdapterScript();
  const proofRun = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([scriptPath])
    },
    () =>
      runStageProof({
        rootDir: ROOT_DIR,
        targetStage: "product-and-brand-brief",
        adapterMode: "real"
      })
  );
  const runPath = path.join(proofRun.run_dir, "run.json");
  const legacyRunRecord = await readJson(runPath);

  delete legacyRunRecord.adapter_mode;
  await writeFile(runPath, `${JSON.stringify(legacyRunRecord, null, 2)}\n`, "utf8");

  let conflictingModeRejected = false;

  try {
    await continueStageProof({
      rootDir: ROOT_DIR,
      runDir: proofRun.run_dir,
      targetStage: "page-strategy",
      adapterMode: "mock"
    });
  } catch (error) {
    conflictingModeRejected = String(error).includes("locked to real adapter mode");
  }

  const continuedRun = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "mock",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([scriptPath])
    },
    () =>
      continueStageProof({
        rootDir: ROOT_DIR,
        runDir: proofRun.run_dir,
        targetStage: "page-strategy"
      })
  );
  const run = await readJson(path.join(continuedRun.run_dir, "run.json"));
  const pageStrategyResult = await readJson(path.join(continuedRun.run_dir, "stages/page-strategy/adapter-result.json"));
  const pagePlan = await readJson(path.join(continuedRun.run_dir, "artifacts/page-plan.json"));
  const ok =
    conflictingModeRejected &&
    continuedRun.run_dir === proofRun.run_dir &&
    run.adapter_mode === "real" &&
    pageStrategyResult.usage?.mode === "real" &&
    pagePlan.status === "validated";

  return {
    name: "live-continue-keeps-adapter-mode",
    ok,
    details: {
      run_dir: continuedRun.run_dir,
      same_run: continuedRun.run_dir === proofRun.run_dir,
      conflicting_mode_rejected: conflictingModeRejected,
      final_adapter_mode: run.adapter_mode,
      page_strategy_usage_mode: pageStrategyResult.usage?.mode,
      page_plan_status: pagePlan.status
    }
  };
}

async function checkFailedRunResumeRetry(): Promise<CheckResult> {
  const failingScriptPath = await writePageStrategyInvalidAdapterScript();
  const failedRun = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([failingScriptPath])
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const failedRunRecord = await readJson(path.join(failedRun.run_dir, "run.json"));
  const rejectedDir = path.join(failedRun.run_dir, "artifacts/rejected");
  const rejectedFiles = await readdir(rejectedDir);
  const rejectedPagePlanFile = rejectedFiles.find((fileName) => fileName.startsWith("page-plan-"));
  const rejectedPagePlan = rejectedPagePlanFile
    ? await readJson(path.join(rejectedDir, rejectedPagePlanFile))
    : null;
  const canonicalExistsAfterFailure = await fileExists(path.join(failedRun.run_dir, "artifacts/page-plan.json"));
  const successScriptPath = await writePositiveRealAdapterScript();
  const resumedRun = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "mock",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([successScriptPath])
    },
    () =>
      resumeFailedRun({
        rootDir: ROOT_DIR,
        runDir: failedRun.run_dir
      })
  );
  const resumedRunRecord = await readJson(path.join(resumedRun.run_dir, "run.json"));
  const pagePlan = await readJson(path.join(resumedRun.run_dir, "artifacts/page-plan.json"));
  const pageStrategyAttempts = await readdir(path.join(resumedRun.run_dir, "stages/page-strategy/attempts"));
  const firstAttemptResult = await readJson(
    path.join(resumedRun.run_dir, "stages/page-strategy/attempts", pageStrategyAttempts[0], "adapter-result.json")
  );
  const latestPageStrategyResult = await readJson(path.join(resumedRun.run_dir, "stages/page-strategy/adapter-result.json"));
  const retryDecision = await readJson(path.join(resumedRun.run_dir, "stages/retrying/retry-decision.json"));
  const events = await readEvents(resumedRun.run_dir);
  const ok =
    failedRun.run_dir === resumedRun.run_dir &&
    failedRunRecord.state === "failed" &&
    failedRunRecord.failed_stage === "page-strategy" &&
    failedRunRecord.failure_mode === "validation_failure" &&
    canonicalExistsAfterFailure === false &&
    rejectedPagePlan?.status === "rejected" &&
    resumedRunRecord.state === "published" &&
    resumedRunRecord.adapter_mode === "real" &&
    pagePlan.status === "validated" &&
    pagePlan.artifact_id !== rejectedPagePlan?.artifact_id &&
    pageStrategyAttempts.length === 2 &&
    firstAttemptResult.status === "ok" &&
    latestPageStrategyResult.status === "ok" &&
    latestPageStrategyResult.usage?.mode === "real" &&
    retryDecision.transition === "retrying" &&
    retryDecision.failure_mode === "validation_failure" &&
    events.some((event) => event.type === "retry_decision_persisted" && event.stage === "page-strategy") &&
    events.some((event) => event.type === "resume_failed_run" && event.stage === "page-strategy") &&
    events.some((event) => event.type === "publish_succeeded");

  return {
    name: "failed-run-resume-retry",
    ok,
    details: {
      run_dir: resumedRun.run_dir,
      same_run: failedRun.run_dir === resumedRun.run_dir,
      failed_state: failedRunRecord.state,
      failed_stage: failedRunRecord.failed_stage,
      failed_failure_mode: failedRunRecord.failure_mode,
      canonical_exists_after_failure: canonicalExistsAfterFailure,
      rejected_page_plan_status: rejectedPagePlan?.status,
      final_state: resumedRunRecord.state,
      adapter_mode: resumedRunRecord.adapter_mode,
      page_plan_status: pagePlan.status,
      rejected_artifact_id: rejectedPagePlan?.artifact_id,
      canonical_artifact_id: pagePlan.artifact_id,
      page_strategy_attempt_count: pageStrategyAttempts.length,
      latest_page_strategy_mode: latestPageStrategyResult.usage?.mode,
      retry_transition: retryDecision.transition,
      retry_failure_mode: retryDecision.failure_mode
    }
  };
}

async function checkFailedProofResumeDoesNotPublish(): Promise<CheckResult> {
  const failingScriptPath = await writePageStrategyInvalidAdapterScript();
  const failedProof = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([failingScriptPath])
    },
    () =>
      runStageProof({
        rootDir: ROOT_DIR,
        targetStage: "page-strategy",
        adapterMode: "real"
      })
  );
  const failedRunRecord = await readJson(path.join(failedProof.run_dir, "run.json"));
  const successScriptPath = await writePositiveRealAdapterScript();
  const resumedProof = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "mock",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([successScriptPath])
    },
    () =>
      resumeFailedRun({
        rootDir: ROOT_DIR,
        runDir: failedProof.run_dir
      })
  );
  const resumedRunRecord = await readJson(path.join(resumedProof.run_dir, "run.json"));
  const pagePlan = await readJson(path.join(resumedProof.run_dir, "artifacts/page-plan.json"));
  const pageStrategyAttempts = await readdir(path.join(resumedProof.run_dir, "stages/page-strategy/attempts"));
  const events = await readEvents(resumedProof.run_dir);
  const hasSectionGraph = await fileExists(path.join(resumedProof.run_dir, "artifacts/section-graph.json"));
  const hasPageSpec = await fileExists(path.join(resumedProof.run_dir, "artifacts/page-spec.json"));
  const hasPublishVersion = await fileExists(path.join(resumedProof.run_dir, "artifacts/publish-version.json"));
  const hasPreviewBuild = await fileExists(path.join(resumedProof.run_dir, "compiled/preview-build.json"));
  const hasSectionPlanningStart = events.some((event) => event.type === "stage_started" && event.stage === "section-planning");
  const ok =
    failedProof.run_dir === resumedProof.run_dir &&
    failedRunRecord.state === "failed" &&
    failedRunRecord.proof_target_stage === "page-strategy" &&
    resumedRunRecord.state === "stage_proved" &&
    resumedRunRecord.proof_target_stage === "page-strategy" &&
    resumedRunRecord.proof_completed === true &&
    resumedRunRecord.adapter_mode === "real" &&
    pagePlan.status === "validated" &&
    pageStrategyAttempts.length === 2 &&
    hasSectionGraph === false &&
    hasPageSpec === false &&
    hasPublishVersion === false &&
    hasPreviewBuild === false &&
    hasSectionPlanningStart === false &&
    events.some(
      (event) =>
        event.type === "proof_stage_reached" &&
        event.stage === "page-strategy" &&
        event.data?.resumed_from_failed_run === true
    ) &&
    !events.some((event) => event.type === "publish_succeeded");

  return {
    name: "failed-proof-resume-does-not-publish",
    ok,
    details: {
      run_dir: resumedProof.run_dir,
      same_run: failedProof.run_dir === resumedProof.run_dir,
      failed_state: failedRunRecord.state,
      proof_target_stage: resumedRunRecord.proof_target_stage,
      final_state: resumedRunRecord.state,
      proof_completed: resumedRunRecord.proof_completed,
      adapter_mode: resumedRunRecord.adapter_mode,
      page_plan_status: pagePlan.status,
      page_strategy_attempt_count: pageStrategyAttempts.length,
      has_section_graph: hasSectionGraph,
      has_page_spec: hasPageSpec,
      has_publish_version: hasPublishVersion,
      has_preview_build: hasPreviewBuild,
      has_section_planning_start: hasSectionPlanningStart,
      has_publish_succeeded: events.some((event) => event.type === "publish_succeeded")
    }
  };
}

async function checkBackendRetryBudgetExhausted(): Promise<CheckResult> {
  const failingScriptPath = await writePageStrategyInvalidAdapterScript();
  const failedRun = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([failingScriptPath])
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const runPath = path.join(failedRun.run_dir, "run.json");
  const failedRunRecord = await readJson(runPath);
  failedRunRecord.max_backend_retry_attempts = 0;
  await writeFile(runPath, `${JSON.stringify(failedRunRecord, null, 2)}\n`, "utf8");

  const attemptCountBefore = (await readdir(path.join(failedRun.run_dir, "stages/page-strategy/attempts"))).length;
  const resumedRun = await resumeFailedRun({
    rootDir: ROOT_DIR,
    runDir: failedRun.run_dir
  });
  const resumedRunRecord = await readJson(runPath);
  const retryDecision = await readJson(path.join(resumedRun.run_dir, "stages/retrying/retry-decision.json"));
  const attemptCountAfter = (await readdir(path.join(resumedRun.run_dir, "stages/page-strategy/attempts"))).length;
  const events = await readEvents(resumedRun.run_dir);
  const ok =
    resumedRun.final_state === "needs_review" &&
    resumedRunRecord.state === "needs_review" &&
    retryDecision.transition === "needs_review" &&
    retryDecision.remaining_retry_attempts === 0 &&
    attemptCountBefore === attemptCountAfter &&
    events.some((event) => event.type === "resume_failed_run_blocked" && event.stage === "page-strategy");

  return {
    name: "backend-retry-budget-exhausted",
    ok,
    details: {
      run_dir: resumedRun.run_dir,
      final_state: resumedRun.final_state,
      retry_transition: retryDecision.transition,
      remaining_retry_attempts: retryDecision.remaining_retry_attempts,
      attempt_count_before: attemptCountBefore,
      attempt_count_after: attemptCountAfter,
      has_blocked_event: events.some((event) => event.type === "resume_failed_run_blocked" && event.stage === "page-strategy")
    }
  };
}

async function checkLiveStabilityMockReport(): Promise<CheckResult> {
  const report = await runLiveStability({
    rootDir: ROOT_DIR,
    adapterMode: "mock",
    iterations: 1
  });
  const persistedReport = await readJson(report.report_path ?? "");
  const markdownExists = report.markdown_report_path
    ? await fileExists(report.markdown_report_path)
    : false;
  const ok =
    report.ok === true &&
    report.adapter_mode === "mock" &&
    report.iterations === 1 &&
    report.summary.total === 1 &&
    report.summary.ok === 1 &&
    report.summary.published === 1 &&
    report.summary.preview_ok === 1 &&
    report.summary.quality_ok === 1 &&
    report.summary.tool_use_observed === 0 &&
    typeof report.report_path === "string" &&
    markdownExists &&
    persistedReport.summary?.ok === 1 &&
    Object.keys(report.summary.artifact_score_drift).includes("ProductBrief");

  return {
    name: "live-stability-mock-report",
    ok,
    details: {
      report_path: report.report_path,
      markdown_report_path: report.markdown_report_path,
      adapter_mode: report.adapter_mode,
      total: report.summary.total,
      ok_count: report.summary.ok,
      published: report.summary.published,
      preview_ok: report.summary.preview_ok,
      quality_ok: report.summary.quality_ok,
      tool_use_observed: report.summary.tool_use_observed,
      markdown_exists: markdownExists,
      artifact_score_drift_keys: Object.keys(report.summary.artifact_score_drift)
    }
  };
}

async function checkLiveStabilityFailureDiagnostics(): Promise<CheckResult> {
  const report = await withEnv(
    {
      FUSERA_CODEX_COMMAND: "/bin/cat",
      FUSERA_CODEX_ARGS_JSON: "[]"
    },
    () =>
      runLiveStability({
        rootDir: ROOT_DIR,
        adapterMode: "real",
        iterations: 1
      })
  );
  const result = report.run_results[0];
  const markdownExists = report.markdown_report_path
    ? await fileExists(report.markdown_report_path)
    : false;
  const ok =
    report.ok === false &&
    report.summary.failed === 1 &&
    report.summary.failure_modes.missing_output >= 1 &&
    result.ok === false &&
    typeof result.run_id === "string" &&
    typeof result.run_dir === "string" &&
    result.final_state === "failed" &&
    result.run_failure_mode === "missing_output" &&
    result.failure_modes.missing_output >= 1 &&
    result.stderr_excerpt_count >= 0 &&
    typeof result.preview_error === "string" &&
    result.preview_error.length > 0 &&
    result.findings.some((finding) => finding.criterion === "live-preview-verifier-error") &&
    markdownExists;

  return {
    name: "live-stability-failure-diagnostics",
    ok,
    details: {
      report_path: report.report_path,
      markdown_report_path: report.markdown_report_path,
      markdown_exists: markdownExists,
      report_ok: report.ok,
      failed_count: report.summary.failed,
      summary_failure_modes: report.summary.failure_modes,
      run_id: result.run_id,
      run_dir: result.run_dir,
      final_state: result.final_state,
      run_failure_mode: result.run_failure_mode,
      failure_modes: result.failure_modes,
      retry_attempts: result.retry_attempts,
      model_owned_duration_ms: result.model_owned_duration_ms,
      preview_error: result.preview_error,
      quality_error: result.quality_error
    }
  };
}

async function checkLiveStabilityCanonicalDefaults(): Promise<CheckResult> {
  const scriptPath = await writePositiveRealAdapterScript();
  const report = await withEnv(
    {
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([scriptPath])
    },
    async () => {
      const prior = new Map<string, string | undefined>();

      for (const key of ["FUSERA_CODEX_MODEL", "FUSERA_CODEX_REASONING_EFFORT", "FUSERA_CODEX_TIMEOUT_MS"]) {
        prior.set(key, process.env[key]);
        delete process.env[key];
      }

      try {
        return await runLiveStability({
          rootDir: ROOT_DIR,
          adapterMode: "real",
          iterations: 1
        });
      } finally {
        for (const [key, value] of prior.entries()) {
          if (value === undefined) {
            delete process.env[key];
          } else {
            process.env[key] = value;
          }
        }
      }
    }
  );
  const result = report.run_results[0];
  const runDir = stringFrom(result.run_dir, "");
  const productStageResult = await readJson(path.join(runDir, "stages/product-and-brand-brief/adapter-result.json"));
  const designStageResult = await readJson(path.join(runDir, "stages/design-system-pass/adapter-result.json"));
  const ok =
    report.adapter_mode === "real" &&
    report.iterations === 1 &&
    report.canonical_live_defaults?.FUSERA_CODEX_MODEL === "gpt-5.2" &&
    report.canonical_live_defaults?.FUSERA_CODEX_REASONING_EFFORT === "medium" &&
    report.canonical_live_defaults?.FUSERA_CODEX_TIMEOUT_MS === "240000" &&
    productStageResult.usage?.configured_model === "gpt-5.2" &&
    productStageResult.usage?.configured_reasoning_effort === "medium" &&
    productStageResult.usage?.timeout_ms === 240000 &&
    designStageResult.usage?.configured_model === "gpt-5.2" &&
    designStageResult.usage?.configured_reasoning_effort === "medium" &&
    designStageResult.usage?.timeout_ms === 240000;

  return {
    name: "live-stability-canonical-defaults",
    ok,
    details: {
      report_path: report.report_path,
      report_ok: report.ok,
      run_dir: runDir,
      canonical_live_defaults: report.canonical_live_defaults,
      product_stage: {
        configured_model: productStageResult.usage?.configured_model,
        configured_reasoning_effort: productStageResult.usage?.configured_reasoning_effort,
        timeout_ms: productStageResult.usage?.timeout_ms
      },
      design_stage: {
        configured_model: designStageResult.usage?.configured_model,
        configured_reasoning_effort: designStageResult.usage?.configured_reasoning_effort,
        timeout_ms: designStageResult.usage?.timeout_ms
      }
    }
  };
}

async function checkPublishRun(runDir: string): Promise<CheckResult> {
  const run = await readJson(path.join(runDir, "run.json"));
  const pageSpec = await readJson(path.join(runDir, "artifacts/page-spec.json"));
  const qaReport = await readJson(path.join(runDir, "artifacts/qa-report.json"));
  const publishVersion = await readJson(path.join(runDir, "artifacts/publish-version.json"));
  const previewBuild = await readJson(path.join(runDir, "compiled/preview-build.json"));
  const ok =
    run.state === "published" &&
    qaReport.payload.verdict === "pass" &&
    qaReport.payload.page_spec_ref === pageSpec.artifact_id &&
    qaReport.payload.preview_build_ref === previewBuild.preview_build_ref &&
    publishVersion.payload.publish_target === "preview" &&
    publishVersion.payload.previous_active_pointer === null;

  return {
    name: "publish-run",
    ok,
    details: {
      final_state: run.state,
      qa_verdict: qaReport.payload.verdict,
      publish_target: publishVersion.payload.publish_target,
      previous_active_pointer: publishVersion.payload.previous_active_pointer,
      qa_page_binding: qaReport.payload.page_spec_ref === pageSpec.artifact_id,
      qa_preview_binding: qaReport.payload.preview_build_ref === previewBuild.preview_build_ref
    }
  };
}

async function checkRunnerOwnedStagesUseNoopBackend(runDir: string): Promise<CheckResult> {
  const runnerOwnedStages = ["page-compile", "verify-publishable-page", "publish-preview"];
  const stageResults = await Promise.all(
    runnerOwnedStages.map(async (stage) => ({
      stage,
      result: await readJson(path.join(runDir, "stages", stage, "adapter-result.json"))
    }))
  );
  const events = await readEvents(runDir);
  const skippedStages = new Set(
    events
      .filter((event) => event.type === "backend_skipped" && typeof event.stage === "string")
      .map((event) => event.stage)
  );
  const ok = stageResults.every(({ stage, result }) => {
    const candidates = Array.isArray(result.produced_artifact_candidates)
      ? result.produced_artifact_candidates
      : [];

    return (
      result.status === "ok" &&
      result.usage?.mode === "runner-owned-noop" &&
      result.usage?.skipped_backend === true &&
      typeof result.usage?.attempt_id === "string" &&
      skippedStages.has(stage) &&
      candidates.length === 0
    );
  });

  return {
    name: "runner-owned-stages-use-noop-backend",
    ok,
    details: {
      stage_modes: stageResults.map(({ stage, result }) => ({
        stage,
        status: result.status,
        usage_mode: result.usage?.mode,
        skipped_backend: result.usage?.skipped_backend,
        attempt_id: result.usage?.attempt_id,
        has_backend_skipped_event: skippedStages.has(stage)
      }))
    }
  };
}

async function checkArtifactsValidate(runDir: string, expectedCount: number): Promise<CheckResult> {
  const artifactDir = path.join(runDir, "artifacts");
  const artifactFiles = (await readdir(artifactDir)).filter((fileName) => fileName.endsWith(".json")).sort();
  const validationResults = await Promise.all(
    artifactFiles.map(async (fileName) => {
      const artifact = (await readJson(path.join(artifactDir, fileName))) as ArtifactEnvelope;
      const schema = await loadArtifactSchema(CONTRACTS_DIR, artifact.artifact_type);
      const errors = validateArtifactEnvelope(artifact, schema);

      return {
        fileName,
        valid: errors.length === 0,
        errors
      };
    })
  );
  const ok =
    artifactFiles.length === expectedCount &&
    validationResults.every((result) => result.valid);

  return {
    name: "artifact-validation",
    ok,
    details: {
      artifact_count: artifactFiles.length,
      expected_count: expectedCount,
      invalid: validationResults.filter((result) => !result.valid)
    }
  };
}

async function checkCompiledPackBundle(runDir: string): Promise<CheckResult> {
  const bundle = await readJson(path.join(runDir, "bundles/product-and-brand-brief.json"));
  const adapterResult = await readJson(path.join(runDir, "stages/product-and-brand-brief/adapter-result.json"));
  const compiledPacks = Array.isArray(bundle.compiled_packs) ? bundle.compiled_packs : [];
  const candidates = Array.isArray(adapterResult.produced_artifact_candidates)
    ? adapterResult.produced_artifact_candidates
    : [];
  const candidateTypes = candidates.map((candidate: Record<string, unknown>) => candidate.artifact_type);
  const hasSkillSource = compiledPacks.every(
    (pack: Record<string, unknown>) =>
      typeof pack.skill_source === "string" &&
      pack.skill_source.length > 0
  );
  const ok =
    hasSkillSource &&
    candidateTypes.includes("ProductBrief") &&
    candidateTypes.includes("BrandProfile");

  return {
    name: "compiled-pack-to-adapter-candidates",
    ok,
    details: {
      compiled_pack_ids: compiledPacks.map((pack: Record<string, unknown>) => pack.pack_id),
      has_skill_source: hasSkillSource,
      candidate_types: candidateTypes
    }
  };
}

async function checkAttemptScopedEvidence(runDir: string): Promise<CheckResult> {
  const stage = "product-and-brand-brief";
  const first = await invokeBackend({
    rootDir: ROOT_DIR,
    runDir,
    stage,
    backend: "codex"
  });
  const second = await invokeBackend({
    rootDir: ROOT_DIR,
    runDir,
    stage,
    backend: "codex"
  });
  const firstAttemptId = stringFrom(first.usage?.attempt_id, "");
  const secondAttemptId = stringFrom(second.usage?.attempt_id, "");
  const attemptRoot = path.join(runDir, "stages", stage, "attempts");
  const attempts = (await readdir(attemptRoot)).sort();
  const firstAttemptResult = await readJson(path.join(attemptRoot, firstAttemptId, "adapter-result.json"));
  const secondAttemptResult = await readJson(path.join(attemptRoot, secondAttemptId, "adapter-result.json"));
  const latestResult = await readJson(path.join(runDir, "stages", stage, "adapter-result.json"));
  const ok =
    first.status === "ok" &&
    second.status === "ok" &&
    firstAttemptId.length > 0 &&
    secondAttemptId.length > 0 &&
    firstAttemptId !== secondAttemptId &&
    attempts.includes(firstAttemptId) &&
    attempts.includes(secondAttemptId) &&
    firstAttemptResult.usage?.attempt_id === firstAttemptId &&
    secondAttemptResult.usage?.attempt_id === secondAttemptId &&
    latestResult.usage?.attempt_id === secondAttemptId;

  return {
    name: "attempt-scoped-backend-evidence",
    ok,
    details: {
      stage,
      first_attempt_id: firstAttemptId,
      second_attempt_id: secondAttemptId,
      attempt_count: attempts.length,
      latest_attempt_id: latestResult.usage?.attempt_id
    }
  };
}

async function checkDesignContextPacks(runDir: string): Promise<CheckResult> {
  const bundle = await readJson(path.join(runDir, "bundles/design-system-pass.json"));
  const themeTokens = await readJson(path.join(runDir, "artifacts/theme-tokens.json"));
  const expectedContextPackIds = [
    "base/web-design-engineer",
    "styles/designprompts-directions",
    "modifiers/anti-slop"
  ];
  const selectedPackIds = Array.isArray(bundle.selected_pack_ids) ? bundle.selected_pack_ids : [];
  const compiledPacks = Array.isArray(bundle.compiled_packs) ? bundle.compiled_packs : [];
  const compiledPackIds = compiledPacks.map((pack: Record<string, unknown>) => pack.pack_id);
  const sourcePackIds = Array.isArray(themeTokens.payload?.typography?.source_pack_ids)
    ? themeTokens.payload.typography.source_pack_ids
    : [];
  const hasContextPackSkillSource = expectedContextPackIds.every((packId) =>
    compiledPacks.some(
      (pack: Record<string, unknown>) =>
        pack.pack_id === packId &&
        typeof pack.skill_source === "string" &&
        pack.skill_source.length > 0
    )
  );
  const hasMaterializedReferenceSources = expectedContextPackIds.every((packId) =>
    compiledPacks.some((pack: Record<string, unknown>) => {
      const referenceSources = Array.isArray(pack.reference_sources) ? pack.reference_sources : [];

      return (
        pack.pack_id === packId &&
        referenceSources.some(
          (reference: Record<string, unknown>) =>
            reference.kind === "file" &&
            typeof reference.text === "string" &&
            reference.text.length > 0
        )
      );
    })
  );
  const ok =
    expectedContextPackIds.every((packId) => selectedPackIds.includes(packId)) &&
    expectedContextPackIds.every((packId) => compiledPackIds.includes(packId)) &&
    expectedContextPackIds.every((packId) => sourcePackIds.includes(packId)) &&
    hasContextPackSkillSource &&
    hasMaterializedReferenceSources;

  return {
    name: "design-context-packs",
    ok,
    details: {
      expected_context_pack_ids: expectedContextPackIds,
      selected_pack_ids: selectedPackIds,
      compiled_pack_ids: compiledPackIds,
      source_pack_ids: sourcePackIds,
      has_context_pack_skill_source: hasContextPackSkillSource,
      has_materialized_reference_sources: hasMaterializedReferenceSources
    }
  };
}

async function checkReferenceBudgetPolicy(): Promise<CheckResult> {
  const pack = await withEnv(
    {
      FUSERA_PACK_REFERENCE_BUDGET_BYTES: "5000"
    },
    () => compilePack({ rootDir: ROOT_DIR, packId: "base/web-design-engineer", backend: "codex" })
  );
  const firstReference = pack.reference_sources[0];
  const skippedCount = pack.reference_sources.filter((source) => source.kind === "skipped").length;
  const ok =
    pack.reference_budget.policy === "manifest-order" &&
    pack.reference_budget.max_bytes === 5000 &&
    pack.reference_budget.used_bytes <= 5000 &&
    firstReference?.kind === "file" &&
    firstReference.truncated === true &&
    firstReference.inline_byte_length === 5000 &&
    skippedCount > 0 &&
    pack.reference_budget.skipped_count === skippedCount;

  return {
    name: "reference-budget-policy",
    ok,
    details: {
      policy: pack.reference_budget.policy,
      max_bytes: pack.reference_budget.max_bytes,
      used_bytes: pack.reference_budget.used_bytes,
      first_reference: {
        path: firstReference?.path,
        kind: firstReference?.kind,
        truncated: firstReference?.truncated,
        inline_byte_length: firstReference?.inline_byte_length
      },
      skipped_count: skippedCount,
      budget_skipped_count: pack.reference_budget.skipped_count
    }
  };
}

async function checkQaFailureRun(runDir: string): Promise<CheckResult> {
  const run = await readJson(path.join(runDir, "run.json"));
  const qaReport = await readJson(path.join(runDir, "artifacts/qa-report.json"));
  const repairDecision = await readJson(path.join(runDir, "stages/repairing/repair-decision.json"));
  const events = (await readFile(path.join(runDir, "events.ndjson"), "utf8"))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const artifactFiles = await readdir(path.join(runDir, "artifacts"));
  const ok =
    run.state === "needs_review" &&
    qaReport.payload.verdict === "fail" &&
    repairDecision.transition === "needs_review" &&
    !artifactFiles.includes("publish-version.json") &&
    events.some((event) => event.type === "repair_decision_persisted") &&
    events.some((event) => event.type === "qa_failed_review");

  return {
    name: "qa-failure-repair-decision",
    ok,
    details: {
      final_state: run.state,
      qa_verdict: qaReport.payload.verdict,
      repair_transition: repairDecision.transition,
      has_publish_version: artifactFiles.includes("publish-version.json"),
      has_repair_event: events.some((event) => event.type === "repair_decision_persisted"),
      has_qa_failed_event: events.some((event) => event.type === "qa_failed_review")
    }
  };
}

async function checkUnsupportedCapabilityRejected(): Promise<CheckResult> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "fusera-capability-check-"));
  await mkdir(path.join(tempRoot, "superpowers/packs"), { recursive: true });
  await cp(
    path.join(ROOT_DIR, "superpowers/packs/stage-profiles.yaml"),
    path.join(tempRoot, "superpowers/packs/stage-profiles.yaml")
  );
  let registry = await readFile(path.join(ROOT_DIR, "superpowers/packs/registry.yaml"), "utf8");
  registry = registry.replace(
    "capabilities_required:\n      - workspace.read\n      - workspace.write\n    required_inputs:\n      - normalized_input_bundle\n    required_artifacts:\n      - artifact_type: ProductBrief",
    "capabilities_required:\n      - workspace.read\n      - workspace.write\n      - browser.teleport\n    required_inputs:\n      - normalized_input_bundle\n    required_artifacts:\n      - artifact_type: ProductBrief"
  );
  await writeFile(path.join(tempRoot, "superpowers/packs/registry.yaml"), registry, "utf8");

  let rejected = false;

  try {
    await resolveStage({
      rootDir: tempRoot,
      stage: "page-strategy",
      backend: "codex"
    });
  } catch (error) {
    rejected = String(error).includes("browser.teleport");
  }

  return {
    name: "unsupported-capability-rejected",
    ok: rejected,
    details: {
      rejected
    }
  };
}

async function checkContextStatusAndVersionRejected(sourceRunDir: string): Promise<CheckResult> {
  const versionRunDir = await copyBriefRun(sourceRunDir);
  const productPath = path.join(versionRunDir, "artifacts/product-brief.json");
  const product = await readJson(productPath);
  product.schema_version = "2.0.0";
  await writeFile(productPath, `${JSON.stringify(product, null, 2)}\n`, "utf8");

  let versionRejected = false;

  try {
    await assembleContext({
      rootDir: ROOT_DIR,
      runDir: versionRunDir,
      stage: "page-strategy",
      backend: "codex"
    });
  } catch (error) {
    versionRejected = String(error).includes("schema_version 2.0.0");
  }

  const statusRunDir = await copyBriefRun(sourceRunDir);
  const brandPath = path.join(statusRunDir, "artifacts/brand-profile.json");
  const brand = await readJson(brandPath);
  brand.status = "draft";
  await writeFile(brandPath, `${JSON.stringify(brand, null, 2)}\n`, "utf8");

  let statusRejected = false;

  try {
    await assembleContext({
      rootDir: ROOT_DIR,
      runDir: statusRunDir,
      stage: "page-strategy",
      backend: "codex"
    });
  } catch (error) {
    statusRejected = String(error).includes("status draft");
  }

  return {
    name: "context-status-version-rejected",
    ok: versionRejected && statusRejected,
    details: {
      version_rejected: versionRejected,
      status_rejected: statusRejected
    }
  };
}

async function checkAdapterCandidateGuards(): Promise<CheckResult> {
  const staleRunDir = await mkdtemp(path.join(os.tmpdir(), "fusera-stale-candidate-check-"));
  const staleCandidate = makeProbeProductBrief("product-brief_stale_probe", "run_other", "Probe");
  let staleRejected = false;

  try {
    await persistAdapterArtifactCandidates({
      runDir: staleRunDir,
      runId: "run_current",
      contractsDir: CONTRACTS_DIR,
      stage: "product-and-brand-brief",
      expectedArtifactTypes: ["ProductBrief"],
      candidates: [staleCandidate]
    });
  } catch (error) {
    staleRejected = String(error).includes("does not match current run run_current");
  }

  const duplicateRunDir = await mkdtemp(path.join(os.tmpdir(), "fusera-duplicate-candidate-check-"));
  let duplicateRejected = false;

  try {
    await persistAdapterArtifactCandidates({
      runDir: duplicateRunDir,
      runId: "run_current",
      contractsDir: CONTRACTS_DIR,
      stage: "product-and-brand-brief",
      expectedArtifactTypes: ["ProductBrief"],
      candidates: [
        makeProbeProductBrief("product-brief_first", "run_current", "Probe"),
        makeProbeProductBrief("product-brief_second", "run_current", "Overwriter")
      ]
    });
  } catch (error) {
    duplicateRejected = String(error).includes("Duplicate adapter candidate for artifact type ProductBrief");
  }

  const canonical = await readJson(path.join(duplicateRunDir, "artifacts/product-brief.json"));

  return {
    name: "adapter-candidate-guards",
    ok: staleRejected && duplicateRejected && canonical.artifact_id === "product-brief_first",
    details: {
      stale_run_candidate_rejected: staleRejected,
      duplicate_candidate_rejected: duplicateRejected,
      duplicate_canonical_artifact_id: canonical.artifact_id
    }
  };
}

async function checkArtifactExtractor(): Promise<CheckResult> {
  const validArtifact = makeProbeProductBrief("product-brief_extract_probe", "run_extract", "Extract Probe");
  const validText = [
    "Adapter output",
    "```fusera-attachment-json",
    JSON.stringify({
      kind: "normalized_input_bundle",
      file_name: "normalized-input.json",
      body: {
        bundle_type: "normalized_input_bundle",
        payload: {
          product_name: "Extractor Attachment"
        }
      }
    }),
    "```",
    "```fusera-artifact-json",
    JSON.stringify(validArtifact),
    "```"
  ].join("\n");
  const malformedText = [
    "Adapter output",
    "```fusera-artifact-json",
    "{ not valid json",
    "```"
  ].join("\n");
  const validExtraction = extractAdapterOutputFromText(validText);
  const malformedExtraction = extractAdapterOutputFromText(malformedText);
  const ok =
    validExtraction.candidates.length === 1 &&
    validExtraction.attachments.length === 1 &&
    validExtraction.errors.length === 0 &&
    malformedExtraction.candidates.length === 0 &&
    malformedExtraction.attachments.length === 0 &&
    malformedExtraction.errors.length === 1;

  return {
    name: "artifact-extractor",
    ok,
    details: {
      valid_candidate_count: validExtraction.candidates.length,
      valid_attachment_count: validExtraction.attachments.length,
      valid_error_count: validExtraction.errors.length,
      malformed_candidate_count: malformedExtraction.candidates.length,
      malformed_attachment_count: malformedExtraction.attachments.length,
      malformed_error_count: malformedExtraction.errors.length
    }
  };
}

async function checkRealAdapterArtifactPositivePath(): Promise<CheckResult> {
  const scriptPath = await writePositiveRealAdapterScript();
  const workDir = await mkdtemp(path.join(os.tmpdir(), "fusera-real-adapter-workdir-"));
  const run = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: process.execPath,
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([scriptPath]),
      FUSERA_CODEX_WORKDIR: workDir
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const runRecord = await readJson(path.join(run.run_dir, "run.json"));
  const productStageResult = await readJson(path.join(run.run_dir, "stages/product-and-brand-brief/adapter-result.json"));
  const designStageResult = await readJson(path.join(run.run_dir, "stages/design-system-pass/adapter-result.json"));
  const productBrief = await readJson(path.join(run.run_dir, "artifacts/product-brief.json"));
  const brandProfile = await readJson(path.join(run.run_dir, "artifacts/brand-profile.json"));
  const pagePlan = await readJson(path.join(run.run_dir, "artifacts/page-plan.json"));
  const sectionGraph = await readJson(path.join(run.run_dir, "artifacts/section-graph.json"));
  const themeTokens = await readJson(path.join(run.run_dir, "artifacts/theme-tokens.json"));
  const publishVersion = await readJson(path.join(run.run_dir, "artifacts/publish-version.json"));
  const events = await readEvents(run.run_dir);
  const stageStatuses = [
    productBrief.status,
    brandProfile.status,
    pagePlan.status,
    sectionGraph.status,
    themeTokens.status
  ];
  const realProducedTypes = Array.isArray(productStageResult.produced_artifact_candidates)
    ? productStageResult.produced_artifact_candidates.map((candidate: Record<string, unknown>) => candidate.artifact_type)
    : [];
  const ok =
    runRecord.state === "published" &&
    productStageResult.status === "ok" &&
    productStageResult.usage?.mode === "real" &&
    productStageResult.usage?.workdir === workDir &&
    typeof productStageResult.usage?.tool_use_observed === "boolean" &&
    designStageResult.status === "ok" &&
    designStageResult.usage?.mode === "real" &&
    designStageResult.usage?.workdir === workDir &&
    typeof designStageResult.usage?.tool_use_observed === "boolean" &&
    realProducedTypes.includes("ProductBrief") &&
    realProducedTypes.includes("BrandProfile") &&
    stageStatuses.every((status) => status === "validated") &&
    publishVersion.payload?.publish_target === "preview" &&
    events.some((event) => event.type === "publish_succeeded");

  return {
    name: "real-adapter-artifact-positive-path",
    ok,
    details: {
      final_state: runRecord.state,
      product_stage_status: productStageResult.status,
      product_stage_usage_mode: productStageResult.usage?.mode,
      product_stage_workdir: productStageResult.usage?.workdir,
      product_stage_tool_use_observed: productStageResult.usage?.tool_use_observed,
      design_stage_status: designStageResult.status,
      design_stage_usage_mode: designStageResult.usage?.mode,
      design_stage_workdir: designStageResult.usage?.workdir,
      design_stage_tool_use_observed: designStageResult.usage?.tool_use_observed,
      expected_workdir: workDir,
      real_produced_types: realProducedTypes,
      validated_stage_artifact_statuses: stageStatuses,
      publish_target: publishVersion.payload?.publish_target
    }
  };
}

async function checkRealAdapterCatBoundary(): Promise<CheckResult> {
  const run = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: "/bin/cat",
      FUSERA_CODEX_ARGS_JSON: "[]"
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const runRecord = await readJson(path.join(run.run_dir, "run.json"));
  const adapterResult = await readJson(path.join(run.run_dir, "stages/normalize-input/adapter-result.json"));
  const stdout = await readFile(path.join(run.run_dir, "stages/normalize-input/adapter-stdout.txt"), "utf8");
  const events = await readEvents(run.run_dir);
  const ok =
    runRecord.state === "failed" &&
    adapterResult.status === "failed" &&
    adapterResult.failure_mode === "missing_output" &&
    !stdout.includes("```fusera-artifact-json") &&
    events.some((event) => event.type === "backend_failed");

  return {
    name: "real-adapter-cat-boundary",
    ok,
    details: {
      final_state: runRecord.state,
      adapter_status: adapterResult.status,
      failure_mode: adapterResult.failure_mode,
      prompt_contains_exact_artifact_fence: stdout.includes("```fusera-artifact-json")
    }
  };
}

async function checkRealAdapterNormalizeAttachmentBoundary(): Promise<CheckResult> {
  const scriptPath = await writeNormalizeAttachmentScript();
  const run = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: "/bin/sh",
      FUSERA_CODEX_ARGS_JSON: JSON.stringify([scriptPath])
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const runRecord = await readJson(path.join(run.run_dir, "run.json"));
  const adapterResult = await readJson(path.join(run.run_dir, "stages/normalize-input/adapter-result.json"));
  const normalizedInput = await readJson(path.join(run.run_dir, "stages/normalize-input/normalized-input.json"));
  const ok =
    adapterResult.status === "ok" &&
    Array.isArray(adapterResult.attachments) &&
    adapterResult.attachments.length === 1 &&
    normalizedInput.payload?.product_name === "Real Attachment Probe" &&
    runRecord.state === "failed" &&
    runRecord.failed_stage === "product-and-brand-brief";

  return {
    name: "real-adapter-normalize-attachment",
    ok,
    details: {
      final_state: runRecord.state,
      failed_stage: runRecord.failed_stage,
      normalize_adapter_status: adapterResult.status,
      attachment_count: Array.isArray(adapterResult.attachments) ? adapterResult.attachments.length : 0,
      normalized_product_name: normalizedInput.payload?.product_name
    }
  };
}

async function checkRealAdapterEarlyExitBoundary(): Promise<CheckResult> {
  const run = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: "/usr/bin/true",
      FUSERA_CODEX_ARGS_JSON: "[]"
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const runRecord = await readJson(path.join(run.run_dir, "run.json"));
  const adapterResult = await readJson(path.join(run.run_dir, "stages/normalize-input/adapter-result.json"));
  const rawFiles = [
    "adapter-raw-request.json",
    "adapter-stdout.txt",
    "adapter-stderr.txt",
    "adapter-result.json"
  ];
  const missingRawFiles = [];

  for (const fileName of rawFiles) {
    try {
      await readFile(path.join(run.run_dir, "stages/normalize-input", fileName), "utf8");
    } catch {
      missingRawFiles.push(fileName);
    }
  }

  const ok =
    runRecord.state === "failed" &&
    adapterResult.status === "failed" &&
    ["missing_output", "invocation_failure"].includes(adapterResult.failure_mode) &&
    missingRawFiles.length === 0;

  return {
    name: "real-adapter-early-exit-boundary",
    ok,
    details: {
      final_state: runRecord.state,
      adapter_status: adapterResult.status,
      failure_mode: adapterResult.failure_mode,
      stdin_error: adapterResult.usage?.stdin_error,
      missing_raw_files: missingRawFiles
    }
  };
}

async function checkRealAdapterInvalidConfigBoundary(): Promise<CheckResult> {
  const run = await withEnv(
    {
      FUSERA_CODEX_ADAPTER: "real",
      FUSERA_CODEX_COMMAND: "/bin/cat",
      FUSERA_CODEX_ARGS_JSON: "{not-json"
    },
    () => runFixture({ rootDir: ROOT_DIR, mode: "publish" })
  );
  const runRecord = await readJson(path.join(run.run_dir, "run.json"));
  const adapterResult = await readJson(path.join(run.run_dir, "stages/normalize-input/adapter-result.json"));
  const rawFiles = [
    "adapter-raw-request.json",
    "adapter-stdout.txt",
    "adapter-stderr.txt",
    "adapter-result.json"
  ];
  const missingRawFiles = [];

  for (const fileName of rawFiles) {
    try {
      await readFile(path.join(run.run_dir, "stages/normalize-input", fileName), "utf8");
    } catch {
      missingRawFiles.push(fileName);
    }
  }

  const ok =
    runRecord.state === "failed" &&
    adapterResult.status === "failed" &&
    adapterResult.failure_mode === "invocation_failure" &&
    missingRawFiles.length === 0;

  return {
    name: "real-adapter-invalid-config-boundary",
    ok,
    details: {
      final_state: runRecord.state,
      adapter_status: adapterResult.status,
      failure_mode: adapterResult.failure_mode,
      stderr: adapterResult.stderr,
      missing_raw_files: missingRawFiles
    }
  };
}

async function copyBriefRun(sourceRunDir: string): Promise<string> {
  const runDir = await mkdtemp(path.join(os.tmpdir(), "fusera-context-check-"));

  await cp(path.join(sourceRunDir, "run.json"), path.join(runDir, "run.json"));
  await mkdir(path.join(runDir, "artifacts"), { recursive: true });
  await mkdir(path.join(runDir, "stages/normalize-input"), { recursive: true });
  await cp(
    path.join(sourceRunDir, "stages/normalize-input/normalized-input.json"),
    path.join(runDir, "stages/normalize-input/normalized-input.json")
  );
  await cp(
    path.join(sourceRunDir, "artifacts/product-brief.json"),
    path.join(runDir, "artifacts/product-brief.json")
  );
  await cp(
    path.join(sourceRunDir, "artifacts/brand-profile.json"),
    path.join(runDir, "artifacts/brand-profile.json")
  );

  return runDir;
}

function makeProbeProductBrief(
  artifactId: string,
  runId: string,
  productName: string
): ArtifactEnvelope {
  return {
    artifact_type: "ProductBrief",
    schema_version: "1.0.0",
    artifact_id: artifactId,
    run_id: runId,
    status: "draft",
    producer_stage: "product-and-brand-brief",
    input_refs: [],
    validation: {
      valid: false,
      errors: []
    },
    payload: {
      product_name: productName,
      audiences: ["operators"],
      core_problem: "Needs harness verification.",
      value_props: ["Deterministic validation"],
      cta_goal: "Preview",
      proof_inputs: [],
      claim_policy: "low-proof"
    }
  };
}

async function writeNormalizeAttachmentScript(): Promise<string> {
  const scriptPath = path.join(
    await mkdtemp(path.join(os.tmpdir(), "fusera-normalize-adapter-")),
    "adapter.sh"
  );
  const attachment = {
    kind: "normalized_input_bundle",
    file_name: "normalized-input.json",
    body: {
      bundle_type: "normalized_input_bundle",
      normalized_at: "2026-04-26T00:00:00.000Z",
      payload: {
        product_name: "Real Attachment Probe",
        audiences: ["operators"],
        core_problem: "Probe normalize real adapter attachment",
        value_props: ["Attachment extraction"],
        cta_goal: "Preview",
        proof_inputs: [],
        brand_traits: ["precise"],
        tone_keywords: ["clear"],
        visual_directions: ["structured"],
        positioning: "Probe",
        do_not_use: []
      }
    }
  };
  const script = [
    "cat >/dev/null",
    "cat <<'EOF'",
    "```fusera-attachment-json",
    JSON.stringify(attachment),
    "```",
    "EOF"
  ].join("\n");

  await writeFile(scriptPath, `${script}\n`, "utf8");
  await chmod(scriptPath, 0o755);

  return scriptPath;
}

async function writePageStrategyInvalidAdapterScript(): Promise<string> {
  const scriptPath = path.join(
    await mkdtemp(path.join(os.tmpdir(), "fusera-invalid-page-plan-adapter-")),
    "adapter.mjs"
  );
  const script = String.raw`
let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) {
  input += chunk;
}

const marker = "Invocation bundle:";
const markerIndex = input.indexOf(marker);

if (markerIndex === -1) {
  process.exit(2);
}

const bundle = JSON.parse(input.slice(markerIndex + marker.length).trim());
const runId = String(bundle.run.run_id);

function fence(name, value) {
  console.log("\x60\x60\x60" + name);
  console.log(JSON.stringify(value));
  console.log("\x60\x60\x60");
}

function artifact(artifactType, producerStage, inputRefs, payload) {
  return {
    artifact_type: artifactType,
    schema_version: "1.0.0",
    artifact_id: artifactType.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() + "_invalid_" + runId.slice(-8),
    run_id: runId,
    status: "draft",
    producer_stage: producerStage,
    input_refs: inputRefs,
    validation: {
      valid: false,
      errors: []
    },
    payload
  };
}

function artifactId(artifactType) {
  return bundle.materialized_artifacts[artifactType].artifact_id;
}

if (bundle.stage === "normalize-input") {
  fence("fusera-attachment-json", {
    kind: "normalized_input_bundle",
    file_name: "normalized-input.json",
    body: {
      bundle_type: "normalized_input_bundle",
      normalized_at: "2026-04-26T00:00:00.000Z",
      payload: {
        product_name: "Retry Probe",
        audiences: ["operators"],
        core_problem: "Need failed-run retry evidence.",
        value_props: ["Attempt retention", "Validated resume"],
        cta_goal: "Retry preview",
        proof_inputs: ["attempt evidence"],
        brand_traits: ["precise"],
        tone_keywords: ["direct"],
        visual_directions: ["structured"],
        positioning: "Retry verification probe",
        do_not_use: []
      }
    }
  });
} else if (bundle.stage === "product-and-brand-brief") {
  fence("fusera-artifact-json", artifact("ProductBrief", "product-and-brand-brief", ["stages/normalize-input/normalized-input.json"], {
    product_name: "Retry Probe",
    audiences: ["operators"],
    core_problem: "Need failed-run retry evidence.",
    value_props: ["Attempt retention", "Validated resume"],
    cta_goal: "Retry preview",
    proof_inputs: ["attempt evidence"],
    claim_policy: "proof-required"
  }));
  fence("fusera-artifact-json", artifact("BrandProfile", "product-and-brand-brief", ["stages/normalize-input/normalized-input.json"], {
    brand_traits: ["precise"],
    tone_keywords: ["direct"],
    visual_directions: ["structured"],
    positioning: "Retry verification probe",
    do_not_use: []
  }));
} else if (bundle.stage === "page-strategy") {
  fence("fusera-artifact-json", artifact("PagePlan", "page-strategy", [artifactId("ProductBrief"), artifactId("BrandProfile")], {
    page_goal: "This candidate is intentionally invalid for retry verification."
  }));
}
`;

  await writeFile(scriptPath, `${script.trim()}\n`, "utf8");
  await chmod(scriptPath, 0o755);

  return scriptPath;
}

async function writePositiveRealAdapterScript(): Promise<string> {
  const scriptPath = path.join(
    await mkdtemp(path.join(os.tmpdir(), "fusera-positive-real-adapter-")),
    "adapter.mjs"
  );
  const script = String.raw`
let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) {
  input += chunk;
}

const marker = "Invocation bundle:";
const markerIndex = input.indexOf(marker);

if (markerIndex === -1) {
  process.exit(2);
}

const bundle = JSON.parse(input.slice(markerIndex + marker.length).trim());
const runId = String(bundle.run.run_id);

function fence(name, value) {
  console.log("\x60\x60\x60" + name);
  console.log(JSON.stringify(value));
  console.log("\x60\x60\x60");
}

function artifact(artifactType, producerStage, inputRefs, payload) {
  return {
    artifact_type: artifactType,
    schema_version: "1.0.0",
    artifact_id: artifactType.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() + "_real_" + runId.slice(-8),
    run_id: runId,
    status: "draft",
    producer_stage: producerStage,
    input_refs: inputRefs,
    validation: {
      valid: false,
      errors: []
    },
    payload
  };
}

function materialized(artifactType) {
  const value = bundle.materialized_artifacts[artifactType];

  if (!value) {
    throw new Error("Missing materialized artifact " + artifactType);
  }

  return value;
}

function artifactId(artifactType) {
  return materialized(artifactType).artifact_id;
}

function payload(artifactType) {
  return materialized(artifactType).payload ?? {};
}

if (bundle.stage === "normalize-input") {
  fence("fusera-attachment-json", {
    kind: "normalized_input_bundle",
    file_name: "normalized-input.json",
    body: {
      bundle_type: "normalized_input_bundle",
      normalized_at: "2026-04-26T00:00:00.000Z",
      payload: {
        product_name: "Fusera",
        audiences: ["founder-led teams", "design-forward operators"],
        core_problem: "Teams need a deterministic path from product intent to a publishable landing page preview.",
        value_props: [
          "Turns messy launch input into stable artifacts",
          "Keeps generation auditable through every stage",
          "Publishes preview handoffs only after QA binding checks"
        ],
        cta_goal: "Start a preview run",
        proof_inputs: ["artifact ledger", "preview publish handoff"],
        brand_traits: ["precise", "calm", "operational"],
        tone_keywords: ["direct", "clear", "credible"],
        visual_directions: ["editorial grid", "high contrast", "restrained accent color"],
        positioning: "Artifact-first landing page generation harness",
        do_not_use: ["vague automation claims", "unverifiable growth promises"]
      }
    }
  });
} else if (bundle.stage === "product-and-brand-brief") {
  fence("fusera-artifact-json", artifact("ProductBrief", "product-and-brand-brief", ["stages/normalize-input/normalized-input.json"], {
    product_name: "Fusera",
    audiences: ["founder-led teams", "design-forward operators"],
    core_problem: "Teams need a deterministic path from product intent to a publishable landing page preview.",
    value_props: [
      "Turns messy launch input into stable artifacts",
      "Keeps generation auditable through every stage",
      "Publishes preview handoffs only after QA binding checks"
    ],
    cta_goal: "Start a preview run",
    proof_inputs: ["artifact ledger", "preview publish handoff"],
    claim_policy: "proof-required"
  }));
  fence("fusera-artifact-json", artifact("BrandProfile", "product-and-brand-brief", ["stages/normalize-input/normalized-input.json"], {
    brand_traits: ["precise", "calm", "operational"],
    tone_keywords: ["direct", "clear", "credible"],
    visual_directions: ["editorial grid", "high contrast", "restrained accent color"],
    positioning: "Artifact-first landing page generation harness",
    do_not_use: ["vague automation claims", "unverifiable growth promises"]
  }));
} else if (bundle.stage === "page-strategy") {
  fence("fusera-artifact-json", artifact("PagePlan", "page-strategy", [artifactId("ProductBrief"), artifactId("BrandProfile")], {
    page_goal: "Show how Fusera turns product intent into a publishable landing page preview.",
    narrative_arc: "Start with deterministic input normalization, prove artifact auditability, then ask teams to start a preview run.",
    section_intents: [
      { section_id: "hero", intent: "State the landing page preview promise." },
      { section_id: "proof", intent: "Show artifact ledger and preview publish handoff evidence." },
      { section_id: "cta", intent: "Request a preview run." }
    ],
    cta_strategy: payload("ProductBrief").cta_goal,
    proof_strategy: "Use artifact ledger and preview publish handoff evidence."
  }));
} else if (bundle.stage === "section-planning") {
  fence("fusera-artifact-json", artifact("SectionGraph", "section-planning", [artifactId("PagePlan")], {
    nodes: [
      {
        section_id: "hero",
        section_type: "hero",
        title: "Deterministic landing page previews",
        props: {
          eyebrow: "Fusera",
          headline: "Turn product intent into a publishable landing page preview.",
          cta_label: "Start a preview run"
        }
      },
      {
        section_id: "proof",
        section_type: "proof",
        title: "Auditable artifact ledger",
        props: {
          proof_ref: "artifact ledger and preview publish handoff"
        }
      },
      {
        section_id: "cta",
        section_type: "cta",
        title: "Start the preview run",
        props: {
          cta_label: "Start a preview run"
        }
      }
    ],
    edges: [
      { from: "hero", to: "proof", relationship: "substantiates" },
      { from: "proof", to: "cta", relationship: "converts" }
    ],
    section_order: ["hero", "proof", "cta"],
    required_props: {
      hero: ["headline", "cta_label"],
      proof: ["proof_ref"],
      cta: ["cta_label"]
    },
    proof_bindings: [
      { section_id: "proof", proof_ref: "artifact ledger" },
      { section_id: "proof", proof_ref: "preview publish handoff" }
    ],
    claim_policy: "proof-required"
  }));
} else if (bundle.stage === "design-system-pass") {
  fence("fusera-artifact-json", artifact("ThemeTokens", "design-system-pass", [artifactId("ProductBrief"), artifactId("BrandProfile"), artifactId("PagePlan")], {
    colors: {
      background: "#f7f4ee",
      surface: "#ffffff",
      text: "#171717",
      accent: "#0f766e"
    },
    typography: {
      heading_family: "Inter",
      body_family: "Inter",
      scale: "compact",
      source_pack_ids: bundle.selected_pack_ids.filter((packId) => packId.startsWith("base/") || packId.startsWith("styles/") || packId.startsWith("modifiers/"))
    },
    spacing: {
      section_y: "72px",
      grid_gap: "24px"
    },
    radii: {
      card: "8px",
      control: "6px"
    },
    shadows: {
      soft: "0 12px 36px rgba(23, 23, 23, 0.10)"
    },
    motion: {
      duration_ms: 160,
      easing: "ease-out"
    }
  }));
}
`;

  await writeFile(scriptPath, `${script.trim()}\n`, "utf8");
  await chmod(scriptPath, 0o755);

  return scriptPath;
}

async function readEvents(runDir: string): Promise<Array<Record<string, any>>> {
  return (await readFile(path.join(runDir, "events.ndjson"), "utf8"))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function withEnv<T>(
  env: Record<string, string>,
  callback: () => Promise<T>
): Promise<T> {
  const prior = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(env)) {
    prior.set(key, process.env[key]);
    process.env[key] = value;
  }

  try {
    return await callback();
  } finally {
    for (const [key, value] of prior.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function readJson(filePath: string): Promise<Record<string, any>> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function stringFrom(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const summary = await verifyP0Harness();
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.ok ? 0 : 1);
}
