export type RunEventStatus = "implemented" | "adoption-v0" | "future";

export type RunEventDefinition = {
  status: RunEventStatus;
  scope: "run" | "stage" | "worker";
  required_fields: readonly string[];
  data_fields: readonly string[];
  authority: "event-only" | "runner-decision";
};

export const RUN_EVENT_TYPE_DEFINITIONS = {
  start_run: {
    status: "implemented",
    scope: "run",
    required_fields: ["type"],
    data_fields: ["backend", "adapter_mode", "output_mode"],
    authority: "event-only"
  },
  stage_started: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["primary_task", "selected_packs", "allowed_outputs", "next_stage", "adapter_mode"],
    authority: "event-only"
  },
  stage_completed: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["attempt_id", "next_stage", "stopped_in"],
    authority: "event-only"
  },
  stage_blocked: {
    status: "adoption-v0",
    scope: "stage",
    required_fields: ["type", "stage", "data.reason"],
    data_fields: ["reason", "blocked_by", "artifact_refs", "attempt_id"],
    authority: "event-only"
  },
  stage_unblocked: {
    status: "adoption-v0",
    scope: "stage",
    required_fields: ["type", "stage", "data.reason"],
    data_fields: ["reason", "artifact_refs", "attempt_id"],
    authority: "event-only"
  },
  stage_join_ready: {
    status: "adoption-v0",
    scope: "stage",
    required_fields: ["type", "stage", "data.required_artifacts", "data.validated_artifact_refs"],
    data_fields: ["required_artifacts", "validated_artifact_refs", "next_stage"],
    authority: "event-only"
  },
  agent_message: {
    status: "adoption-v0",
    scope: "run",
    required_fields: ["type", "data.message"],
    data_fields: ["message", "from", "to", "stage", "artifact_refs", "attempt_id"],
    authority: "event-only"
  },
  amendment_requested: {
    status: "implemented",
    scope: "run",
    required_fields: ["type", "data.request"],
    data_fields: ["request", "affected_artifact_hints"],
    authority: "event-only"
  },
  backend_skipped: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["reason", "attempt_id", "attempt_dir"],
    authority: "runner-decision"
  },
  backend_failed: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["attempt_id", "attempt_dir", "failure_mode", "stderr"],
    authority: "event-only"
  },
  compiled_preview: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["page_spec_ref", "preview_build_ref", "attempt_id"],
    authority: "runner-decision"
  },
  qa_passed: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["qa_report_ref", "verdict", "attempt_id"],
    authority: "runner-decision"
  },
  qa_failed_review: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["qa_report_ref", "verdict", "attempt_id"],
    authority: "runner-decision"
  },
  repair_decision_persisted: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["repair_decision_path", "transition", "reason"],
    authority: "runner-decision"
  },
  retry_decision_persisted: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: [
      "retry_decision_path",
      "transition",
      "retryable",
      "failure_mode",
      "prior_attempt_count",
      "next_attempt_number",
      "remaining_retry_attempts",
      "reason"
    ],
    authority: "runner-decision"
  },
  resume_failed_run: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: [
      "adapter_mode",
      "failure_mode",
      "prior_attempt_count",
      "next_attempt_number",
      "resume_from_stage",
      "resume_target_stage",
      "proof_target_stage"
    ],
    authority: "runner-decision"
  },
  resume_failed_run_blocked: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["reason", "failure_mode"],
    authority: "runner-decision"
  },
  resume_stage_proof: {
    status: "implemented",
    scope: "run",
    required_fields: ["type"],
    data_fields: ["proof_target_stage", "adapter_mode", "completed_stages"],
    authority: "runner-decision"
  },
  proof_stage_reached: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["proof_target_stage", "next_stage", "already_completed", "resumed_from_failed_run"],
    authority: "runner-decision"
  },
  run_failed: {
    status: "implemented",
    scope: "run",
    required_fields: ["type"],
    data_fields: ["message", "failure_mode"],
    authority: "runner-decision"
  },
  fixture_preview_binding_corrupted: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["reason"],
    authority: "event-only"
  },
  publish_succeeded: {
    status: "implemented",
    scope: "stage",
    required_fields: ["type", "stage"],
    data_fields: ["publish_version_ref", "handoff_path", "attempt_id"],
    authority: "runner-decision"
  },
  worker_started: {
    status: "future",
    scope: "worker",
    required_fields: ["type", "stage", "data.worker_id"],
    data_fields: ["worker_id", "child_id", "task_pack_id", "expected_outputs"],
    authority: "event-only"
  },
  worker_completed: {
    status: "future",
    scope: "worker",
    required_fields: ["type", "stage", "data.worker_id"],
    data_fields: ["worker_id", "child_id", "outputs", "candidate_refs"],
    authority: "event-only"
  },
  worker_blocked: {
    status: "future",
    scope: "worker",
    required_fields: ["type", "stage", "data.worker_id", "data.reason"],
    data_fields: ["worker_id", "child_id", "reason", "blocked_by"],
    authority: "event-only"
  },
  worker_failed: {
    status: "future",
    scope: "worker",
    required_fields: ["type", "stage", "data.worker_id"],
    data_fields: ["worker_id", "child_id", "failure_mode", "retryable"],
    authority: "event-only"
  },
  worker_idle: {
    status: "future",
    scope: "worker",
    required_fields: ["type", "stage", "data.worker_id"],
    data_fields: ["worker_id", "child_id", "reason"],
    authority: "event-only"
  },
  worker_joined: {
    status: "future",
    scope: "worker",
    required_fields: ["type", "stage", "data.worker_id"],
    data_fields: ["worker_id", "child_id", "accepted_outputs", "rejected_outputs", "join_decision_ref"],
    authority: "runner-decision"
  }
} as const satisfies Record<string, RunEventDefinition>;

export type RunEventType = keyof typeof RUN_EVENT_TYPE_DEFINITIONS;

export const RUN_EVENT_TYPES = Object.keys(RUN_EVENT_TYPE_DEFINITIONS) as RunEventType[];

export const ADOPTION_V0_COORDINATION_EVENT_TYPES = RUN_EVENT_TYPES.filter(
  (type) => RUN_EVENT_TYPE_DEFINITIONS[type].status === "adoption-v0"
);

export const FUTURE_WORKER_EVENT_TYPES = RUN_EVENT_TYPES.filter(
  (type) => RUN_EVENT_TYPE_DEFINITIONS[type].status === "future"
);

export function isRunEventType(value: string): value is RunEventType {
  return value in RUN_EVENT_TYPE_DEFINITIONS;
}

export function validateRunEventRecord(event: Record<string, unknown>): string[] {
  const type = event.type;

  if (typeof type !== "string") {
    return ["Run event type must be a string"];
  }

  if (!isRunEventType(type)) {
    return [`Unsupported run event type: ${type}`];
  }

  const definition = RUN_EVENT_TYPE_DEFINITIONS[type];
  const errors: string[] = [];

  for (const field of definition.required_fields) {
    if (!hasRequiredField(event, field)) {
      errors.push(`Run event ${type} requires ${field}`);
    }
  }

  errors.push(...validateEventFields(type, definition, event));

  return errors;
}

function hasRequiredField(event: Record<string, unknown>, field: string): boolean {
  if (field === "type") {
    return isNonEmptyString(event.type);
  }

  if (field === "stage") {
    return isNonEmptyString(event.stage);
  }

  if (!field.startsWith("data.")) {
    return field in event;
  }

  const data = event.data;
  const key = field.slice("data.".length);

  return isRecord(data) && key in data && data[key] !== undefined;
}

function validateEventFields(
  type: RunEventType,
  definition: RunEventDefinition,
  event: Record<string, unknown>
): string[] {
  const errors: string[] = [];

  if ("stage" in event && !isNonEmptyString(event.stage)) {
    errors.push(`Run event ${type} field stage must be a non-empty string`);
  }

  if (!("data" in event)) {
    return errors;
  }

  const data = event.data;

  if (!isRecord(data)) {
    errors.push(`Run event ${type} field data must be an object`);
    return errors;
  }

  for (const field of definition.data_fields) {
    if (field in data && data[field] !== undefined) {
      const fieldError = validateDataField(type, field, data[field]);

      if (fieldError) {
        errors.push(fieldError);
      }
    }
  }

  for (const field of definition.required_fields) {
    if (!field.startsWith("data.")) {
      continue;
    }

    const key = field.slice("data.".length);
    const requiredFieldError = validateRequiredDataField(type, key, data[key]);

    if (requiredFieldError) {
      errors.push(requiredFieldError);
    }
  }

  return errors;
}

function validateRequiredDataField(type: RunEventType, field: string, value: unknown): string | null {
  if (STRING_ARRAY_FIELDS.has(field)) {
    if (!isNonEmptyStringArray(value)) {
      return `Run event ${type} data.${field} must be a non-empty string array`;
    }

    return null;
  }

  if (STRING_FIELDS.has(field) && !isNonEmptyString(value)) {
    return `Run event ${type} data.${field} must be a non-empty string`;
  }

  return null;
}

function validateDataField(type: RunEventType, field: string, value: unknown): string | null {
  if (STRING_FIELDS.has(field) && !isNullableStringField(field, value) && typeof value !== "string") {
    return `Run event ${type} data.${field} must be a string`;
  }

  if (STRING_ARRAY_FIELDS.has(field) && !isStringArray(value)) {
    return `Run event ${type} data.${field} must be a string array`;
  }

  if (BOOLEAN_FIELDS.has(field) && typeof value !== "boolean") {
    return `Run event ${type} data.${field} must be a boolean`;
  }

  if (NUMBER_FIELDS.has(field) && !isNullableNumberField(field, value) && !isFiniteNumber(value)) {
    return `Run event ${type} data.${field} must be a finite number`;
  }

  if (ARRAY_FIELDS.has(field) && !Array.isArray(value)) {
    return `Run event ${type} data.${field} must be an array`;
  }

  return null;
}

function isNullableStringField(field: string, value: unknown): boolean {
  return field === "proof_target_stage" && value === null;
}

function isNullableNumberField(field: string, value: unknown): boolean {
  return field === "next_attempt_number" && value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return isStringArray(value) && value.length > 0 && value.every((item) => item.trim().length > 0);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const STRING_FIELDS = new Set([
  "adapter_mode",
  "attempt_dir",
  "attempt_id",
  "backend",
  "child_id",
  "failure_mode",
  "from",
  "handoff_path",
  "join_decision_ref",
  "message",
  "next_stage",
  "output_mode",
  "page_spec_ref",
  "preview_build_ref",
  "primary_task",
  "proof_target_stage",
  "publish_version_ref",
  "qa_report_ref",
  "reason",
  "repair_decision_path",
  "request",
  "resume_from_stage",
  "resume_target_stage",
  "retry_decision_path",
  "stage",
  "stderr",
  "stopped_in",
  "task_pack_id",
  "to",
  "transition",
  "verdict",
  "worker_id"
]);

const STRING_ARRAY_FIELDS = new Set([
  "accepted_outputs",
  "affected_artifact_hints",
  "allowed_outputs",
  "artifact_refs",
  "blocked_by",
  "candidate_refs",
  "completed_stages",
  "expected_outputs",
  "rejected_outputs",
  "required_artifacts",
  "selected_packs",
  "validated_artifact_refs"
]);

const BOOLEAN_FIELDS = new Set([
  "already_completed",
  "resumed_from_failed_run",
  "retryable"
]);

const NUMBER_FIELDS = new Set([
  "next_attempt_number",
  "prior_attempt_count",
  "remaining_retry_attempts"
]);

const ARRAY_FIELDS = new Set(["outputs"]);
