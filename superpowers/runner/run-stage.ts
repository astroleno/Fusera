import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { CodexAdapterMode, CodexInvocationResult } from "../adapters/codex/adapter.ts";
import { assertCapabilityReportOk, writeCapabilityReport } from "./capability-report.ts";
import { compilePage } from "./compile-page.ts";
import { adapterModeFromEnv, invokeBackend, invokeNoopBackend } from "./invoke-backend.ts";
import { publishPreview } from "./publish-preview.ts";
import { persistRepairDecision } from "./repair-run.ts";
import { decideRetry, persistRetryDecision } from "./retry-policy.ts";
import { resolveStage, type StageResolution } from "./resolve-packs.ts";
import type { HarnessRunObserver } from "./run-observer.ts";
import {
  readValidatedArtifact,
  validateAndPersistArtifact,
  type ArtifactEnvelope
} from "./validate-artifact.ts";
import { verifyRun } from "./verify-run.ts";
import { writeRunEvent } from "./write-run-event.ts";

const RUNNER_OWNED_ARTIFACTS = new Set(["PageSpec", "QAReport", "PublishVersion"]);

export type RunGenerationOptions = {
  rootDir?: string;
  runsRoot?: string;
  runId?: string;
  input: Record<string, unknown>;
  inputRef?: string | null;
  mode?: "publish" | "qa-failure";
  stopAfterStage?: string;
  adapterMode?: CodexAdapterMode;
  observer?: HarnessRunObserver;
};

export type GenerationRunResult = {
  run_id: string;
  run_dir: string;
  final_state: string;
  artifacts: string[];
  preview_build_ref?: string;
};

export type FixtureRunResult = GenerationRunResult;

export async function runGeneration(options: RunGenerationOptions): Promise<GenerationRunResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const runsRoot = options.runsRoot ?? path.join(rootDir, ".fusera/runs");
  const runId = options.runId ?? makeRunId();
  const runDir = path.join(runsRoot, runId);
  const input = structuredClone(options.input);
  const inputRef = options.inputRef ?? null;
  const mode = options.mode ?? "publish";
  const contractsDir = path.join(rootDir, "superpowers/contracts/artifacts");
  await writeCapabilityReport({
    rootDir,
    runDir,
    phase: "pre_resolution"
  });

  let stageSequence: string[];

  try {
    stageSequence = await resolveStageSequence(rootDir);
  } catch (error) {
    const report = await writeCapabilityReport({
      rootDir,
      runDir,
      phase: "post_resolution"
    });
    assertCapabilityReportOk(report);
    throw error;
  }

  assertCapabilityReportOk(await writeCapabilityReport({
    rootDir,
    runDir,
    phase: "post_resolution"
  }));

  const stopAfterStage = options.stopAfterStage;
  const adapterMode = options.adapterMode ?? adapterModeFromEnv();

  if (stopAfterStage && !stageSequence.includes(stopAfterStage)) {
    throw new Error(`Unknown proof target stage: ${stopAfterStage}`);
  }

  const runRecord = {
    run_id: runId,
    output_mode: "landing-page",
    backend: "codex",
    adapter_mode: adapterMode,
    state: "queued",
    repair_attempts: 0,
    max_repair_attempts: 2,
    max_backend_retry_attempts: 2,
    created_at: new Date().toISOString(),
    input_ref: inputRef,
    input_payload: input,
    proof_target_stage: stopAfterStage ?? null
  };
  let finalState = "published";
  let failedStage: string | null = null;
  let failureMessage: string | null = null;
  let failureMode: string | null = null;

  await createRunSkeleton(runDir, stageSequence);
  await writeRunRecord(runDir, runRecord, options.observer);
  await writeRunEvent(runDir, {
    run_id: runId,
    type: "start_run",
    from_state: "queued",
    to_state: "assembling",
    data: {
      backend: "codex",
      adapter_mode: adapterMode,
      output_mode: "landing-page"
    }
  }, options.observer);

  try {
    for (const stage of stageSequence) {
      const result = await executeStage({
        rootDir,
        runDir,
        runId,
        contractsDir,
        stage,
        mode,
        adapterMode,
        observer: options.observer
      });

      if (mode === "qa-failure" && stage === "page-compile") {
        await corruptPreviewBuildBinding(runDir);
        await writeRunEvent(runDir, {
          run_id: runId,
          type: "fixture_preview_binding_corrupted",
          stage,
          data: {
            reason: "negative QA fixture"
          }
        }, options.observer);
      }

      if (result.stop) {
        finalState = result.final_state;
        break;
      }

      if (stopAfterStage === stage) {
        finalState = proofFinalStateFor(stage);
        await writeRunEvent(runDir, {
          run_id: runId,
          type: "proof_stage_reached",
          stage,
          from_state: "running",
          to_state: finalState,
          data: {
            proof_target_stage: stage,
            next_stage: await nextStageFor(rootDir, stage)
          }
        }, options.observer);
        break;
      }
    }
  } catch (error) {
    finalState = "failed";
    failedStage = extractStageFromErrorContext(error) ?? "unknown";
    failureMessage = (error as Error).message;
    failureMode = extractFailureModeFromErrorContext(error) ?? "unknown";
    await writeRunEvent(runDir, {
      run_id: runId,
      type: "run_failed",
      stage: failedStage,
      to_state: "failed",
      data: {
        message: failureMessage,
        failure_mode: failureMode
      }
    }, options.observer);
  }

  const previewBuild = await readJsonIfPresent(path.join(runDir, "compiled/preview-build.json"));
  const pageSpec = await readJsonIfPresent(path.join(runDir, "artifacts/page-spec.json"));
  const publishVersion = await readJsonIfPresent(path.join(runDir, "artifacts/publish-version.json"));
  const finalRecord = {
    ...runRecord,
    state: finalState,
    updated_at: new Date().toISOString(),
    proof_completed: proofCompleted(finalState, stopAfterStage ?? null),
    latest_page_spec_ref: pageSpec?.artifact_id,
    latest_publish_version_ref: publishVersion?.artifact_id,
    preview_build_ref: previewBuild?.preview_build_ref,
    failed_stage: failedStage,
    failure_message: failureMessage,
    failure_mode: failureMode
  };

  await writeRunRecord(runDir, finalRecord, options.observer);

  return {
    run_id: runId,
    run_dir: runDir,
    final_state: finalState,
    artifacts: await listMaterializedArtifactFiles(runDir),
    preview_build_ref: typeof previewBuild?.preview_build_ref === "string" ? previewBuild.preview_build_ref : undefined
  };
}

export async function runFixture(options: {
  rootDir?: string;
  inputPath?: string;
  mode?: "publish" | "qa-failure";
  stopAfterStage?: string;
  adapterMode?: CodexAdapterMode;
} = {}): Promise<FixtureRunResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const inputPath = options.inputPath ?? path.join(
    rootDir,
    "superpowers/runner/fixtures/landing-input.json"
  );
  const input = JSON.parse(await readFile(inputPath, "utf8")) as Record<string, unknown>;

  return runGeneration({
    rootDir,
    input,
    inputRef: path.relative(rootDir, inputPath),
    mode: options.mode,
    stopAfterStage: options.stopAfterStage,
    adapterMode: options.adapterMode
  });
}

export async function runStageProof(options: {
  rootDir?: string;
  inputPath?: string;
  targetStage: string;
  adapterMode?: CodexAdapterMode;
}): Promise<FixtureRunResult> {
  return runFixture({
    rootDir: options.rootDir,
    inputPath: options.inputPath,
    mode: "publish",
    stopAfterStage: options.targetStage,
    adapterMode: options.adapterMode
  });
}

export async function continueStageProof(options: {
  rootDir?: string;
  runDir: string;
  targetStage: string;
  adapterMode?: CodexAdapterMode;
}): Promise<FixtureRunResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const contractsDir = path.join(rootDir, "superpowers/contracts/artifacts");
  const stageSequence = await resolveStageSequence(rootDir);
  const targetIndex = stageSequence.indexOf(options.targetStage);

  if (targetIndex === -1) {
    throw new Error(`Unknown proof target stage: ${options.targetStage}`);
  }

  await createRunSkeleton(runDir, stageSequence);

  const runRecord = (await readJsonIfPresent(path.join(runDir, "run.json"))) ?? {};
  const runId = stringFrom(runRecord.run_id, "");
  const lockedAdapterMode = await resolveContinueAdapterMode({
    runDir,
    runRecord,
    explicitAdapterMode: options.adapterMode
  });

  if (!runId) {
    throw new Error(`Run record at ${runDir} is missing run_id`);
  }

  const completedStages = await readCompletedStages(runDir);
  const startIndex = stageSequence.findIndex((stage, index) => index <= targetIndex && !completedStages.has(stage));
  let finalState = proofFinalStateFor(options.targetStage);
  let failedStage: string | null = null;
  let failureMessage: string | null = null;
  let failureMode: string | null = null;

  await writeRunEvent(runDir, {
    run_id: runId,
    type: "resume_stage_proof",
    from_state: stringFrom(runRecord.state, "unknown"),
    to_state: "running",
    data: {
      proof_target_stage: options.targetStage,
      adapter_mode: lockedAdapterMode,
      completed_stages: [...completedStages]
    }
  });

  try {
    if (startIndex !== -1) {
      for (const stage of stageSequence.slice(startIndex, targetIndex + 1)) {
        const result = await executeStage({
          rootDir,
          runDir,
          runId,
          contractsDir,
          stage,
          mode: "publish",
          adapterMode: lockedAdapterMode
        });

        if (result.stop) {
          finalState = result.final_state;
          break;
        }

        if (stage === options.targetStage) {
          finalState = proofFinalStateFor(stage);
          await writeRunEvent(runDir, {
            run_id: runId,
            type: "proof_stage_reached",
            stage,
            from_state: "running",
            to_state: finalState,
            data: {
              proof_target_stage: stage,
              next_stage: await nextStageFor(rootDir, stage)
            }
          });
          break;
        }
      }
    } else {
      await writeRunEvent(runDir, {
        run_id: runId,
        type: "proof_stage_reached",
        stage: options.targetStage,
        from_state: "running",
        to_state: finalState,
        data: {
          proof_target_stage: options.targetStage,
          next_stage: await nextStageFor(rootDir, options.targetStage),
          already_completed: true
        }
      });
    }
  } catch (error) {
    finalState = "failed";
    failedStage = extractStageFromErrorContext(error) ?? "unknown";
    failureMessage = (error as Error).message;
    failureMode = extractFailureModeFromErrorContext(error) ?? "unknown";
    await writeRunEvent(runDir, {
      run_id: runId,
      type: "run_failed",
      stage: failedStage,
      to_state: "failed",
      data: {
        message: failureMessage,
        failure_mode: failureMode
      }
    });
  }

  const previewBuild = await readJsonIfPresent(path.join(runDir, "compiled/preview-build.json"));
  const pageSpec = await readJsonIfPresent(path.join(runDir, "artifacts/page-spec.json"));
  const publishVersion = await readJsonIfPresent(path.join(runDir, "artifacts/publish-version.json"));
  const finalRecord = {
    ...runRecord,
    state: finalState,
    updated_at: new Date().toISOString(),
    proof_target_stage: options.targetStage,
    adapter_mode: lockedAdapterMode,
    proof_completed: proofCompleted(finalState, options.targetStage),
    latest_page_spec_ref: pageSpec?.artifact_id,
    latest_publish_version_ref: publishVersion?.artifact_id,
    preview_build_ref: previewBuild?.preview_build_ref,
    failed_stage: failedStage,
    failure_message: failureMessage,
    failure_mode: failureMode
  };

  await writeRunRecord(runDir, finalRecord);

  return {
    run_id: runId,
    run_dir: runDir,
    final_state: finalState,
    artifacts: await listMaterializedArtifactFiles(runDir),
    preview_build_ref: typeof previewBuild?.preview_build_ref === "string" ? previewBuild.preview_build_ref : undefined
  };
}

export async function resumeFailedRun(options: {
  rootDir?: string;
  runDir: string;
  adapterMode?: CodexAdapterMode;
}): Promise<FixtureRunResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const runDir = path.resolve(rootDir, options.runDir);
  const contractsDir = path.join(rootDir, "superpowers/contracts/artifacts");
  const stageSequence = await resolveStageSequence(rootDir);
  const runRecord = (await readJsonIfPresent(path.join(runDir, "run.json"))) ?? {};
  const runId = stringFrom(runRecord.run_id, "");
  const failedStage = stringFrom(runRecord.failed_stage, "");
  const failedIndex = stageSequence.indexOf(failedStage);
  const proofTargetStage = typeof runRecord.proof_target_stage === "string" ? runRecord.proof_target_stage : null;
  const resumeTargetStage = proofTargetStage ?? stageSequence[stageSequence.length - 1];
  const resumeTargetIndex = stageSequence.indexOf(resumeTargetStage);
  const lockedAdapterMode = await resolveContinueAdapterMode({
    runDir,
    runRecord,
    explicitAdapterMode: options.adapterMode
  });

  if (!runId) {
    throw new Error(`Run record at ${runDir} is missing run_id`);
  }

  if (runRecord.state !== "failed") {
    throw new Error(`Run ${runId} is not failed; current state is ${stringFrom(runRecord.state, "unknown")}`);
  }

  if (failedIndex === -1) {
    throw new Error(`Run ${runId} has unknown failed_stage ${failedStage || "(missing)"}`);
  }

  if (resumeTargetIndex === -1) {
    throw new Error(`Run ${runId} has unknown proof_target_stage ${resumeTargetStage}`);
  }

  if (failedIndex > resumeTargetIndex) {
    throw new Error(
      `Run ${runId} failed at ${failedStage}, which is after proof target ${resumeTargetStage}`
    );
  }

  await createRunSkeleton(runDir, stageSequence);

  const priorAttemptCount = await countStageAttempts(runDir, failedStage);
  const decision = decideRetry({
    stage: failedStage,
    failureMode: stringOrNull(runRecord.failure_mode),
    failureMessage: stringOrNull(runRecord.failure_message),
    priorAttemptCount,
    maxRetryAttempts: numberFrom(runRecord.max_backend_retry_attempts, 2)
  });
  const decisionPath = await persistRetryDecision({
    runDir,
    decision
  });

  await writeRunEvent(runDir, {
    run_id: runId,
    type: "retry_decision_persisted",
    stage: failedStage,
    from_state: "failed",
    to_state: decision.transition,
    data: {
      retry_decision_path: path.relative(runDir, decisionPath),
      transition: decision.transition,
      retryable: decision.retryable,
      failure_mode: decision.failure_mode,
      prior_attempt_count: decision.prior_attempt_count,
      next_attempt_number: decision.next_attempt_number,
      remaining_retry_attempts: decision.remaining_retry_attempts,
      reason: decision.reason
    }
  });

  if (!decision.retryable) {
    const finalRecord = {
      ...runRecord,
      state: "needs_review",
      updated_at: new Date().toISOString(),
      adapter_mode: lockedAdapterMode,
      last_retry_decision: decision,
      failed_stage: failedStage,
      failure_message: stringOrNull(runRecord.failure_message),
      failure_mode: decision.failure_mode
    };

    await writeRunEvent(runDir, {
      run_id: runId,
      type: "resume_failed_run_blocked",
      stage: failedStage,
      from_state: "failed",
      to_state: "needs_review",
      data: {
        reason: decision.reason,
        failure_mode: decision.failure_mode
      }
    });
    await writeRunEvent(runDir, {
      run_id: runId,
      type: "stage_blocked",
      stage: failedStage,
      from_state: "failed",
      to_state: "needs_review",
      data: {
        reason: decision.reason,
        blocked_by: ["retry_policy"],
        artifact_refs: []
      }
    });
    await writeRunRecord(runDir, finalRecord);

    return {
      run_id: runId,
      run_dir: runDir,
      final_state: "needs_review",
      artifacts: await listMaterializedArtifactFiles(runDir)
    };
  }

  await writeRunRecord(runDir, {
    ...runRecord,
    state: "retrying",
    updated_at: new Date().toISOString(),
    adapter_mode: lockedAdapterMode,
    last_retry_decision: decision
  });
  await writeRunEvent(runDir, {
    run_id: runId,
    type: "stage_unblocked",
    stage: failedStage,
    from_state: "failed",
    to_state: "retrying",
    data: {
      reason: decision.reason,
      artifact_refs: []
    }
  });
  await writeRunEvent(runDir, {
    run_id: runId,
    type: "resume_failed_run",
    stage: failedStage,
    from_state: "failed",
    to_state: "retrying",
    data: {
      adapter_mode: lockedAdapterMode,
      failure_mode: decision.failure_mode,
      prior_attempt_count: decision.prior_attempt_count,
      next_attempt_number: decision.next_attempt_number,
      resume_from_stage: failedStage,
      resume_target_stage: resumeTargetStage,
      proof_target_stage: proofTargetStage
    }
  });

  let finalState = proofTargetStage ? proofFinalStateFor(proofTargetStage) : "published";
  let currentFailedStage: string | null = null;
  let failureMessage: string | null = null;
  let failureMode: string | null = null;

  try {
    for (const stage of stageSequence.slice(failedIndex, resumeTargetIndex + 1)) {
      const result = await executeStage({
        rootDir,
        runDir,
        runId,
        contractsDir,
        stage,
        mode: "publish",
        adapterMode: lockedAdapterMode
      });

      if (result.stop) {
        finalState = result.final_state;
        break;
      }

      if (proofTargetStage && stage === resumeTargetStage) {
        finalState = proofFinalStateFor(stage);
        await writeRunEvent(runDir, {
          run_id: runId,
          type: "proof_stage_reached",
          stage,
          from_state: "retrying",
          to_state: finalState,
          data: {
            proof_target_stage: stage,
            next_stage: await nextStageFor(rootDir, stage),
            resumed_from_failed_run: true
          }
        });
        break;
      }
    }
  } catch (error) {
    finalState = "failed";
    currentFailedStage = extractStageFromErrorContext(error) ?? "unknown";
    failureMessage = (error as Error).message;
    failureMode = extractFailureModeFromErrorContext(error) ?? "unknown";
    await writeRunEvent(runDir, {
      run_id: runId,
      type: "run_failed",
      stage: currentFailedStage,
      to_state: "failed",
      data: {
        message: failureMessage,
        failure_mode: failureMode
      }
    });
  }

  const previewBuild = await readJsonIfPresent(path.join(runDir, "compiled/preview-build.json"));
  const pageSpec = await readJsonIfPresent(path.join(runDir, "artifacts/page-spec.json"));
  const publishVersion = await readJsonIfPresent(path.join(runDir, "artifacts/publish-version.json"));
  const finalRecord = {
    ...runRecord,
    state: finalState,
    updated_at: new Date().toISOString(),
    adapter_mode: lockedAdapterMode,
    proof_completed: proofCompleted(finalState, typeof runRecord.proof_target_stage === "string" ? runRecord.proof_target_stage : null),
    latest_page_spec_ref: pageSpec?.artifact_id,
    latest_publish_version_ref: publishVersion?.artifact_id,
    preview_build_ref: previewBuild?.preview_build_ref,
    failed_stage: currentFailedStage,
    failure_message: failureMessage,
    failure_mode: failureMode,
    last_retry_decision: decision
  };

  await writeRunRecord(runDir, finalRecord);

  return {
    run_id: runId,
    run_dir: runDir,
    final_state: finalState,
    artifacts: await listMaterializedArtifactFiles(runDir),
    preview_build_ref: typeof previewBuild?.preview_build_ref === "string" ? previewBuild.preview_build_ref : undefined
  };
}

async function executeStage(options: {
  rootDir: string;
  runDir: string;
  runId: string;
  contractsDir: string;
  stage: string;
  mode: "publish" | "qa-failure";
  adapterMode: CodexAdapterMode;
  observer?: HarnessRunObserver;
}): Promise<{ stop: boolean; final_state: string }> {
  try {
    const resolution = await resolveStage({
      rootDir: options.rootDir,
      stage: options.stage,
      backend: "codex"
    });

    await writeRunEvent(options.runDir, {
      run_id: options.runId,
      type: "stage_started",
      stage: options.stage,
      data: {
        primary_task: resolution.primary_task.id,
        selected_packs: resolution.selected_packs.map((pack) => pack.id),
        allowed_outputs: resolution.stage_profile.allowed_outputs,
        next_stage: resolution.next_stage,
        adapter_mode: options.adapterMode
      }
    }, options.observer);

    const needsBackend = shouldInvokeBackend(options.stage, resolution);
    const adapterResult = needsBackend
      ? await invokeBackend({
          rootDir: options.rootDir,
          runDir: options.runDir,
          stage: options.stage,
          backend: "codex",
          adapterMode: options.adapterMode
        })
      : await invokeNoopBackend({
          rootDir: options.rootDir,
          runDir: options.runDir,
          stage: options.stage,
          backend: "codex",
          adapterMode: options.adapterMode,
          reason: "runner-owned-stage"
        });

    if (!needsBackend) {
      await writeRunEvent(options.runDir, {
        run_id: options.runId,
        type: "backend_skipped",
        stage: options.stage,
        data: {
          reason: "runner-owned-stage",
          attempt_id: attemptIdFrom(adapterResult),
          attempt_dir: attemptDirFrom(adapterResult)
        }
      }, options.observer);
    }

    if (adapterResult.status !== "ok") {
      await writeRunEvent(options.runDir, {
        run_id: options.runId,
        type: "backend_failed",
        stage: options.stage,
        data: {
          attempt_id: attemptIdFrom(adapterResult),
          attempt_dir: attemptDirFrom(adapterResult),
          failure_mode: adapterResult.failure_mode,
          stderr: adapterResult.stderr
        }
      }, options.observer);

      throw new StageExecutionError(
        options.stage,
        `Backend failed for stage ${options.stage}: ${adapterResult.failure_mode ?? "unknown"}`,
        adapterResult.failure_mode ?? "unknown"
      );
    }

    try {
      await persistStageOutputs({
        ...options,
        resolution,
        adapterResult
      });
    } catch (error) {
      if (error instanceof StageStopError) {
        await writeRunEvent(options.runDir, {
          run_id: options.runId,
          type: "stage_blocked",
          stage: options.stage,
          from_state: "running",
          to_state: error.final_state,
          data: {
            reason: `Stage stopped in ${error.final_state}`,
            blocked_by: ["runner_stage_stop"],
            artifact_refs: [],
            attempt_id: attemptIdFrom(adapterResult)
          }
        }, options.observer);
        await writeRunEvent(options.runDir, {
          run_id: options.runId,
          type: "stage_completed",
          stage: options.stage,
          data: {
            attempt_id: attemptIdFrom(adapterResult),
            next_stage: resolution.next_stage,
            stopped_in: error.final_state
          }
        }, options.observer);

        return { stop: true, final_state: error.final_state };
      }

      throw new StageExecutionError(options.stage, (error as Error).message, "validation_failure");
    }

    const joinReadyData = await stageJoinReadyData({
      runDir: options.runDir,
      resolution
    });

    if (joinReadyData) {
      await writeRunEvent(options.runDir, {
        run_id: options.runId,
        type: "stage_join_ready",
        stage: options.stage,
        data: joinReadyData
      }, options.observer);
    }

    await writeRunEvent(options.runDir, {
      run_id: options.runId,
      type: "stage_completed",
      stage: options.stage,
      data: {
        attempt_id: attemptIdFrom(adapterResult),
        next_stage: resolution.next_stage
      }
    }, options.observer);

    return { stop: false, final_state: "running" };
  } catch (error) {
    if (error instanceof StageExecutionError) {
      throw error;
    }

    throw new StageExecutionError(options.stage, (error as Error).message, "unknown");
  }
}

async function stageJoinReadyData(options: {
  runDir: string;
  resolution: StageResolution;
}): Promise<Record<string, unknown> | null> {
  const requiredArtifacts = options.resolution.stage_profile.allowed_outputs;

  if (requiredArtifacts.length === 0 || options.resolution.next_stage === "end") {
    return null;
  }

  const validatedArtifactRefs: string[] = [];

  for (const artifactType of requiredArtifacts) {
    const artifact = await readValidatedArtifact(options.runDir, artifactType);
    validatedArtifactRefs.push(artifact.artifact_id);
  }

  return {
    required_artifacts: requiredArtifacts,
    validated_artifact_refs: validatedArtifactRefs,
    next_stage: options.resolution.next_stage
  };
}

async function persistStageOutputs(options: {
  rootDir: string;
  runDir: string;
  runId: string;
  contractsDir: string;
  stage: string;
  mode: "publish" | "qa-failure";
  resolution: StageResolution;
  adapterResult: CodexInvocationResult;
  observer?: HarnessRunObserver;
}): Promise<void> {
  if (options.stage === "normalize-input") {
    await persistNormalizedInput(options.runDir, options.adapterResult);
    return;
  }

  const adapterExpectedOutputs = options.resolution.stage_profile.allowed_outputs.filter(
    (artifactType) => !RUNNER_OWNED_ARTIFACTS.has(artifactType)
  );

  if (adapterExpectedOutputs.length > 0) {
    await persistAdapterArtifactCandidates({
      runDir: options.runDir,
      runId: options.runId,
      contractsDir: options.contractsDir,
      stage: options.stage,
      expectedArtifactTypes: adapterExpectedOutputs,
      candidates: options.adapterResult.produced_artifact_candidates
    });
    return;
  }

  if (options.adapterResult.produced_artifact_candidates.length > 0) {
    throw new Error(
      `Stage ${options.stage} is runner-owned but adapter returned artifact candidates: ${options.adapterResult.produced_artifact_candidates.length}`
    );
  }

  if (options.stage === "page-compile") {
    const compiled = await compilePage({
      runDir: options.runDir,
      contractsDir: options.contractsDir
    });

    await writeRunEvent(options.runDir, {
      run_id: options.runId,
      type: "compiled_preview",
      stage: options.stage,
      data: {
        page_spec_ref: compiled.page_spec.artifact_id,
        preview_build_ref: compiled.preview_build_ref,
        attempt_id: attemptIdFrom(options.adapterResult)
      }
    }, options.observer);
    return;
  }

  if (options.stage === "verify-publishable-page") {
    const repairBudget = await readRepairBudget(options.runDir);
    const verified = await verifyRun({
      runDir: options.runDir,
      contractsDir: options.contractsDir,
      repairAttempts: repairBudget.repair_attempts,
      maxRepairAttempts: repairBudget.max_repair_attempts
    });

    if (verified.repair_decision) {
      const decisionPath = await persistRepairDecision({
        runDir: options.runDir,
        decision: verified.repair_decision
      });

      await writeRunEvent(options.runDir, {
        run_id: options.runId,
        type: "repair_decision_persisted",
        stage: options.stage,
        data: {
          repair_decision_path: path.relative(options.runDir, decisionPath),
          transition: verified.repair_decision.transition,
          reason: verified.repair_decision.reason
        }
      }, options.observer);
    }

    await writeRunEvent(options.runDir, {
      run_id: options.runId,
      type: verified.transition === "approved" ? "qa_passed" : "qa_failed_review",
      stage: options.stage,
      from_state: "verifying",
      to_state: verified.transition,
      data: {
        qa_report_ref: verified.qa_report.artifact_id,
        verdict: verified.qa_report.payload.verdict,
        attempt_id: attemptIdFrom(options.adapterResult)
      }
    }, options.observer);

    if (verified.transition !== "approved") {
      throw new StageStopError(verified.transition);
    }

    return;
  }

  if (options.stage === "publish-preview") {
    const published = await publishPreview({
      runDir: options.runDir,
      contractsDir: options.contractsDir
    });

    await writeRunEvent(options.runDir, {
      run_id: options.runId,
      type: "publish_succeeded",
      stage: options.stage,
      from_state: "publishing",
      to_state: "published",
      data: {
        publish_version_ref: published.publish_version.artifact_id,
        handoff_path: path.relative(options.runDir, published.handoff_path),
        attempt_id: attemptIdFrom(options.adapterResult)
      }
    }, options.observer);
  }
}

export async function persistAdapterArtifactCandidates(options: {
  runDir: string;
  runId: string;
  contractsDir: string;
  stage: string;
  expectedArtifactTypes: string[];
  candidates: unknown[];
}): Promise<ArtifactEnvelope[]> {
  const expected = new Set(options.expectedArtifactTypes);
  const seen = new Set<string>();
  const persisted: ArtifactEnvelope[] = [];
  const failures: string[] = [];

  if (options.candidates.length === 0) {
    throw new Error(`Stage ${options.stage} expected adapter artifact candidates: ${options.expectedArtifactTypes.join(", ")}`);
  }

  for (const candidate of options.candidates) {
    if (!isArtifactEnvelope(candidate)) {
      failures.push(`Stage ${options.stage} received a non-artifact candidate`);
      continue;
    }

    const routeErrors: string[] = [];

    if (!expected.has(candidate.artifact_type)) {
      routeErrors.push(`Artifact ${candidate.artifact_type} is not allowed for stage ${options.stage}`);
    }

    if (candidate.run_id !== options.runId) {
      routeErrors.push(
        `Artifact ${candidate.artifact_type} run_id ${candidate.run_id} does not match current run ${options.runId}`
      );
    }

    if (seen.has(candidate.artifact_type)) {
      routeErrors.push(`Duplicate adapter candidate for artifact type ${candidate.artifact_type}`);
    }

    const validation = await validateAndPersistArtifact({
      artifact: candidate,
      contractsDir: options.contractsDir,
      runDir: options.runDir,
      additionalErrors: [
        ...routeErrors,
        ...(await crossArtifactErrorsForCandidate({
          runDir: options.runDir,
          candidate
        }))
      ]
    });

    if (!validation.valid) {
      failures.push(`${candidate.artifact_type}: ${validation.errors.join("; ")}`);
      continue;
    }

    seen.add(candidate.artifact_type);
    persisted.push(validation.artifact);
  }

  const missing = options.expectedArtifactTypes.filter((artifactType) => !seen.has(artifactType));

  if (missing.length > 0) {
    failures.push(`Missing required adapter artifacts: ${missing.join(", ")}`);
  }

  if (failures.length > 0) {
    throw new Error(`Stage ${options.stage} adapter candidate validation failed: ${failures.join(" | ")}`);
  }

  return persisted;
}

async function crossArtifactErrorsForCandidate(options: {
  runDir: string;
  candidate: ArtifactEnvelope;
}): Promise<string[]> {
  if (options.candidate.artifact_type !== "DesignSpec") {
    return [];
  }

  return designSpecCrossArtifactErrors(options.runDir, options.candidate);
}

async function designSpecCrossArtifactErrors(runDir: string, candidate: ArtifactEnvelope): Promise<string[]> {
  const requiredArtifactTypes = ["ProductBrief", "BrandProfile", "PagePlan", "SectionGraph", "ThemeTokens"];
  const errors: string[] = [];
  const upstreamArtifacts = new Map<string, ArtifactEnvelope>();

  for (const artifactType of requiredArtifactTypes) {
    try {
      upstreamArtifacts.set(artifactType, await readValidatedArtifact(runDir, artifactType));
    } catch (error) {
      errors.push(`DesignSpec requires current validated ${artifactType}: ${(error as Error).message}`);
    }
  }

  const inputRefs = new Set(Array.isArray(candidate.input_refs) ? candidate.input_refs : []);

  for (const artifactType of requiredArtifactTypes) {
    const artifact = upstreamArtifacts.get(artifactType);

    if (artifact && !inputRefs.has(artifact.artifact_id)) {
      errors.push(`DesignSpec.input_refs must include current ${artifactType} artifact_id ${artifact.artifact_id}`);
    }
  }

  const productBrief = upstreamArtifacts.get("ProductBrief");
  const sectionGraph = upstreamArtifacts.get("SectionGraph");
  const candidatePayload = isRecord(candidate.payload) ? candidate.payload : {};
  const constraints = isRecord(candidatePayload.claim_and_proof_constraints)
    ? candidatePayload.claim_and_proof_constraints
    : {};

  if (productBrief) {
    const expectedClaimPolicy = productBrief.payload.claim_policy;

    if (
      typeof expectedClaimPolicy === "string" &&
      constraints.claim_policy !== expectedClaimPolicy
    ) {
      errors.push(
        `DesignSpec.claim_and_proof_constraints.claim_policy must match ProductBrief.claim_policy ${expectedClaimPolicy}`
      );
    }
  }

  if (sectionGraph) {
    const sectionOrder = stringArray(sectionGraph.payload.section_order);
    const expectedSections = new Set(sectionOrder);
    const sectionIntents = Array.isArray(candidatePayload.section_design_intents)
      ? candidatePayload.section_design_intents
      : [];
    const intentSectionIds = sectionIntents
      .map((intent) => (isRecord(intent) && typeof intent.section_id === "string" ? intent.section_id : ""))
      .filter(Boolean);
    const intentSectionSet = new Set(intentSectionIds);
    const duplicateSectionIds = intentSectionIds.filter((sectionId, index) => intentSectionIds.indexOf(sectionId) !== index);
    const unknownSectionIds = [...intentSectionSet].filter((sectionId) => !expectedSections.has(sectionId));
    const omittedSectionIds = sectionOrder.filter((sectionId) => !intentSectionSet.has(sectionId));

    if (duplicateSectionIds.length > 0) {
      errors.push(`DesignSpec.section_design_intents contains duplicate section_id values: ${[...new Set(duplicateSectionIds)].join(", ")}`);
    }

    if (unknownSectionIds.length > 0) {
      errors.push(`DesignSpec.section_design_intents contains unknown section_id values: ${unknownSectionIds.join(", ")}`);
    }

    if (omittedSectionIds.length > 0) {
      errors.push(`DesignSpec.section_design_intents omits SectionGraph sections: ${omittedSectionIds.join(", ")}`);
    }
  }

  return errors;
}

export type RepairBudget = {
  repair_attempts: number;
  max_repair_attempts: number;
};

export async function readRepairBudget(runDir: string): Promise<RepairBudget> {
  const runRecord = (await readJsonIfPresent(path.join(runDir, "run.json"))) ?? {};

  return {
    repair_attempts: numberFrom(runRecord.repair_attempts, 0),
    max_repair_attempts: numberFrom(runRecord.max_repair_attempts, 2)
  };
}

async function persistNormalizedInput(runDir: string, adapterResult: CodexInvocationResult): Promise<void> {
  const attachment = adapterResult.attachments.find(
    (item): item is { kind: string; body: Record<string, unknown> } =>
      typeof item === "object" &&
      item !== null &&
      (item as Record<string, unknown>).kind === "normalized_input_bundle" &&
      typeof (item as Record<string, unknown>).body === "object" &&
      (item as Record<string, unknown>).body !== null
  );

  if (!attachment) {
    throw new Error("normalize-input adapter result did not include normalized_input_bundle attachment");
  }

  await writeFile(
    path.join(runDir, "stages/normalize-input/normalized-input.json"),
    `${JSON.stringify(attachment.body, null, 2)}\n`,
    "utf8"
  );
}

async function resolveStageSequence(rootDir: string, firstStage = "normalize-input"): Promise<string[]> {
  const sequence: string[] = [];
  const visited = new Set<string>();
  let stage = firstStage;

  while (stage !== "end") {
    if (visited.has(stage)) {
      throw new Error(`Stage profile cycle detected at ${stage}`);
    }

    visited.add(stage);
    sequence.push(stage);

    const resolution = await resolveStage({
      rootDir,
      stage,
      backend: "codex"
    });

    stage = resolution.next_stage;
  }

  return sequence;
}

async function nextStageFor(rootDir: string, stage: string): Promise<string> {
  const resolution = await resolveStage({
    rootDir,
    stage,
    backend: "codex"
  });

  return resolution.next_stage;
}

async function resolveContinueAdapterMode(options: {
  runDir: string;
  runRecord: Record<string, unknown>;
  explicitAdapterMode?: CodexAdapterMode;
}): Promise<CodexAdapterMode> {
  const persistedMode = adapterModeFromValue(options.runRecord.adapter_mode);
  const inferredMode = await inferAdapterModeFromEvidence(options.runDir);

  if (persistedMode && inferredMode && persistedMode !== inferredMode) {
    throw new Error(
      `Run adapter mode mismatch: run.json declares ${persistedMode}, but existing stage evidence indicates ${inferredMode}`
    );
  }

  const lockedMode = persistedMode ?? inferredMode;

  if (lockedMode && options.explicitAdapterMode && lockedMode !== options.explicitAdapterMode) {
    throw new Error(
      `Run is locked to ${lockedMode} adapter mode; requested ${options.explicitAdapterMode}`
    );
  }

  return lockedMode ?? options.explicitAdapterMode ?? adapterModeFromEnv();
}

async function inferAdapterModeFromEvidence(runDir: string): Promise<CodexAdapterMode | null> {
  const modes = new Set<CodexAdapterMode>();

  for (const stage of [
    "normalize-input",
    "product-and-brand-brief",
    "page-strategy",
    "section-planning",
    "design-system-pass",
    "design-spec-pass",
    "page-compile",
    "verify-publishable-page",
    "publish-preview"
  ]) {
    for (const mode of await adapterModesFromStageEvidence(runDir, stage)) {
      modes.add(mode);
    }
  }

  if (modes.size > 1) {
    throw new Error(`Run has mixed adapter mode evidence: ${[...modes].join(", ")}`);
  }

  return [...modes][0] ?? null;
}

async function adapterModesFromStageEvidence(runDir: string, stage: string): Promise<CodexAdapterMode[]> {
  const stageDir = path.join(runDir, "stages", stage);
  const modes = new Set<CodexAdapterMode>();
  const stageLevelResult = await readJsonIfPresent(path.join(stageDir, "adapter-result.json"));
  const stageLevelMode = adapterModeFromAdapterResult(stageLevelResult);

  if (stageLevelMode) {
    modes.add(stageLevelMode);
  }

  try {
    const attemptIds = await readdir(path.join(stageDir, "attempts"));

    for (const attemptId of attemptIds) {
      const attemptResult = await readJsonIfPresent(path.join(stageDir, "attempts", attemptId, "adapter-result.json"));
      const attemptMode = adapterModeFromAdapterResult(attemptResult);

      if (attemptMode) {
        modes.add(attemptMode);
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return [...modes];
}

function adapterModeFromAdapterResult(adapterResult: Record<string, unknown> | null): CodexAdapterMode | null {
  const usage = typeof adapterResult?.usage === "object" && adapterResult.usage !== null
    ? adapterResult.usage as Record<string, unknown>
    : {};
  const usageMode = usage.mode;

  if (usageMode === "real") {
    return "real";
  }

  if (usageMode === "stub" || usageMode === "mock") {
    return "mock";
  }

  return adapterModeFromValue(usage.configured_adapter_mode);
}

function adapterModeFromValue(value: unknown): CodexAdapterMode | null {
  return value === "real" || value === "mock" ? value : null;
}

function shouldInvokeBackend(stage: string, resolution: StageResolution): boolean {
  if (stage === "normalize-input") {
    return true;
  }

  return adapterOwnedOutputs(resolution).length > 0;
}

function adapterOwnedOutputs(resolution: StageResolution): string[] {
  return resolution.stage_profile.allowed_outputs.filter(
    (artifactType) => !RUNNER_OWNED_ARTIFACTS.has(artifactType)
  );
}

function proofFinalStateFor(stage: string): string {
  return stage === "publish-preview" ? "published" : "stage_proved";
}

function proofCompleted(finalState: string, targetStage: string | null): boolean {
  return targetStage !== null && finalState === proofFinalStateFor(targetStage);
}

function attemptIdFrom(result: CodexInvocationResult): string | undefined {
  const attemptId = result.usage?.attempt_id;

  return typeof attemptId === "string" ? attemptId : undefined;
}

function attemptDirFrom(result: CodexInvocationResult): string | undefined {
  const attemptDir = result.usage?.attempt_dir;

  return typeof attemptDir === "string" ? attemptDir : undefined;
}

async function createRunSkeleton(runDir: string, stageSequence: string[]): Promise<void> {
  await mkdir(runDir, { recursive: true });

  for (const dir of [
    "bundles",
    "artifacts",
    "compiled",
    "previews",
    "logs",
    ...stageSequence.map((stage) => `stages/${stage}`),
    "stages/repairing"
  ]) {
    await mkdir(path.join(runDir, dir), { recursive: true });
  }
}

async function corruptPreviewBuildBinding(runDir: string): Promise<void> {
  const previewBuildPath = path.join(runDir, "compiled/preview-build.json");
  const previewBuild = JSON.parse(await readFile(previewBuildPath, "utf8")) as Record<string, unknown>;
  const corrupted = {
    ...previewBuild,
    page_spec_ref: "page-spec_corrupted_negative_fixture"
  };

  await writeFile(previewBuildPath, `${JSON.stringify(corrupted, null, 2)}\n`, "utf8");
}

async function writeRunRecord(
  runDir: string,
  record: Record<string, unknown>,
  observer?: HarnessRunObserver
): Promise<void> {
  await writeFile(path.join(runDir, "run.json"), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  await observer?.onRunRecord?.({ runDir, record });
}

function makeRunId(): string {
  return `run_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

async function readJsonIfPresent(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function listMaterializedArtifactFiles(runDir: string): Promise<string[]> {
  try {
    return (await readdir(path.join(runDir, "artifacts"))).filter((fileName) => fileName.endsWith(".json")).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function countStageAttempts(runDir: string, stage: string): Promise<number> {
  try {
    const attemptIds = await readdir(path.join(runDir, "stages", stage, "attempts"));

    return attemptIds.length;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return 0;
    }

    throw error;
  }
}

async function readCompletedStages(runDir: string): Promise<Set<string>> {
  const eventsPath = path.join(runDir, "events.ndjson");
  const completed = new Set<string>();

  try {
    const lines = (await readFile(eventsPath, "utf8")).trim().split("\n").filter(Boolean);

    for (const line of lines) {
      const event = JSON.parse(line) as Record<string, unknown>;

      if (event.type === "stage_completed" && typeof event.stage === "string") {
        completed.add(event.stage);
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return completed;
}

function isArtifactEnvelope(value: unknown): value is ArtifactEnvelope {
  return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>).artifact_type === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function numberFrom(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringFrom(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

class StageStopError extends Error {
  final_state: string;

  constructor(finalState: string) {
    super(`Stage stopped in ${finalState}`);
    this.name = "StageStopError";
    this.final_state = finalState;
  }
}

class StageExecutionError extends Error {
  stage: string;
  failure_mode: string;

  constructor(stage: string, message: string, failureMode = "unknown") {
    super(message);
    this.name = "StageExecutionError";
    this.stage = stage;
    this.failure_mode = failureMode;
  }
}

function extractStageFromErrorContext(error: unknown): string | null {
  return error instanceof StageExecutionError ? error.stage : null;
}

function extractFailureModeFromErrorContext(error: unknown): string | null {
  return error instanceof StageExecutionError ? error.failure_mode : null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [command, firstArg, secondArg, thirdArg] = process.argv.slice(2);

  if (
    command !== "smoke" &&
    command !== "qa-failure" &&
    command !== "stage-proof" &&
    command !== "stage-proof-continue"
  ) {
    console.error(
      "Usage: node --experimental-strip-types superpowers/runner/run-stage.ts <smoke|qa-failure> [input.json]\n" +
        "       node --experimental-strip-types superpowers/runner/run-stage.ts stage-proof <target-stage> [input.json]\n" +
        "       node --experimental-strip-types superpowers/runner/run-stage.ts stage-proof-continue <run-dir> <target-stage>"
    );
    process.exit(1);
  }

  if (command === "stage-proof" && !firstArg) {
    console.error("stage-proof requires a target stage");
    process.exit(1);
  }

  if (command === "stage-proof-continue" && (!firstArg || !secondArg)) {
    console.error("stage-proof-continue requires a run directory and target stage");
    process.exit(1);
  }

  try {
    const result =
      command === "stage-proof"
        ? await runStageProof({
            targetStage: firstArg,
            inputPath: secondArg
          })
        : command === "stage-proof-continue"
          ? await continueStageProof({
              runDir: firstArg,
              targetStage: secondArg
            })
        : await runFixture({
            inputPath: firstArg,
            mode: command === "qa-failure" ? "qa-failure" : "publish"
          });

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );
  } catch (error) {
    if (error instanceof StageStopError) {
      console.log(JSON.stringify({ final_state: error.final_state }, null, 2));
      process.exit(0);
    }

    throw error;
  }
}
