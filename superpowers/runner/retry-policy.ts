import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type RetryFailureMode =
  | "invocation_failure"
  | "extraction_failure"
  | "validation_failure"
  | "missing_output"
  | "unknown";

export type RetryDecision = {
  transition: "retrying" | "needs_review";
  retryable: boolean;
  reason: string;
  stage: string;
  failure_mode: RetryFailureMode;
  failure_message: string;
  prior_attempt_count: number;
  next_attempt_number: number | null;
  max_retry_attempts: number;
  remaining_retry_attempts: number;
  reuse_context: true;
  repair_directives: unknown[];
};

const RETRYABLE_FAILURE_MODES = new Set<RetryFailureMode>([
  "invocation_failure",
  "extraction_failure",
  "validation_failure",
  "missing_output"
]);
const MODEL_OWNED_STAGES = new Set([
  "normalize-input",
  "product-and-brand-brief",
  "page-strategy",
  "section-planning",
  "design-system-pass"
]);

export function decideRetry(options: {
  stage: string;
  failureMode?: string | null;
  failureMessage?: string | null;
  priorAttemptCount: number;
  maxRetryAttempts?: number;
}): RetryDecision {
  const maxRetryAttempts = options.maxRetryAttempts ?? 2;
  const priorRetries = Math.max(0, options.priorAttemptCount - 1);
  const remainingRetryAttempts = Math.max(0, maxRetryAttempts - priorRetries);
  const failureMode = normalizeFailureMode(options.failureMode);
  const failureMessage = options.failureMessage ?? "";
  const stageRetryable = MODEL_OWNED_STAGES.has(options.stage);
  const modeRetryable = RETRYABLE_FAILURE_MODES.has(failureMode);
  const retryable = stageRetryable && modeRetryable && remainingRetryAttempts > 0;

  if (!stageRetryable) {
    return decision({
      options,
      failureMode,
      failureMessage,
      retryable: false,
      remainingRetryAttempts,
      reason: `Stage ${options.stage} is runner-owned or outside the model-owned retry boundary.`
    });
  }

  if (!modeRetryable) {
    return decision({
      options,
      failureMode,
      failureMessage,
      retryable: false,
      remainingRetryAttempts,
      reason: `Failure mode ${failureMode} is not retryable.`
    });
  }

  if (remainingRetryAttempts <= 0) {
    return decision({
      options,
      failureMode,
      failureMessage,
      retryable: false,
      remainingRetryAttempts,
      reason: "Retry budget exhausted."
    });
  }

  return decision({
    options,
    failureMode,
    failureMessage,
    retryable,
    remainingRetryAttempts,
    reason: "Retryable model-owned stage failure; retry will reassemble context from validated artifacts."
  });
}

export async function persistRetryDecision(options: {
  runDir: string;
  decision: RetryDecision;
}): Promise<string> {
  const retryDir = path.join(options.runDir, "stages", "retrying");
  const filePath = path.join(retryDir, "retry-decision.json");

  await mkdir(retryDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(options.decision, null, 2)}\n`, "utf8");

  return filePath;
}

function decision(options: {
  options: {
    stage: string;
    priorAttemptCount: number;
    maxRetryAttempts?: number;
  };
  failureMode: RetryFailureMode;
  failureMessage: string;
  retryable: boolean;
  remainingRetryAttempts: number;
  reason: string;
}): RetryDecision {
  return {
    transition: options.retryable ? "retrying" : "needs_review",
    retryable: options.retryable,
    reason: options.reason,
    stage: options.options.stage,
    failure_mode: options.failureMode,
    failure_message: options.failureMessage,
    prior_attempt_count: options.options.priorAttemptCount,
    next_attempt_number: options.retryable ? options.options.priorAttemptCount + 1 : null,
    max_retry_attempts: options.options.maxRetryAttempts ?? 2,
    remaining_retry_attempts: options.remainingRetryAttempts,
    reuse_context: true,
    repair_directives: [
      {
        kind: "retry_stage",
        stage: options.options.stage,
        prior_attempt_count: options.options.priorAttemptCount,
        failure_mode: options.failureMode
      }
    ]
  };
}

function normalizeFailureMode(value: unknown): RetryFailureMode {
  return value === "invocation_failure" ||
    value === "extraction_failure" ||
    value === "validation_failure" ||
    value === "missing_output"
    ? value
    : "unknown";
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  console.log(
    JSON.stringify(
      {
        retryable_failure_modes: [...RETRYABLE_FAILURE_MODES],
        model_owned_stages: [...MODEL_OWNED_STAGES],
        default_max_retry_attempts: 2
      },
      null,
      2
    )
  );
}
