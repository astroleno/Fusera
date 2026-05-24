import { describe, expect, it } from "vitest";
import { validateRunEventRecord } from "../../superpowers/runner/run-event-types.ts";

describe("run event type validation", () => {
  it("accepts typed stage join evidence", () => {
    expect(
      validateRunEventRecord({
        type: "stage_join_ready",
        stage: "page-strategy",
        data: {
          required_artifacts: ["PagePlan"],
          validated_artifact_refs: ["page-plan_01"],
          next_stage: "section-planning"
        }
      })
    ).toEqual([]);
  });

  it("rejects malformed required data fields", () => {
    expect(
      validateRunEventRecord({
        type: "stage_join_ready",
        stage: "page-strategy",
        data: {
          required_artifacts: "PagePlan",
          validated_artifact_refs: []
        }
      })
    ).toEqual(expect.arrayContaining([
      "Run event stage_join_ready data.required_artifacts must be a string array",
      "Run event stage_join_ready data.required_artifacts must be a non-empty string array",
      "Run event stage_join_ready data.validated_artifact_refs must be a non-empty string array"
    ]));
  });

  it("rejects empty required strings and wrong primitive types", () => {
    expect(
      validateRunEventRecord({
        type: "stage_blocked",
        stage: "page-strategy",
        data: {
          reason: "",
          blocked_by: ["retry_policy"]
        }
      })
    ).toEqual(expect.arrayContaining([
      "Run event stage_blocked data.reason must be a non-empty string"
    ]));

    expect(
      validateRunEventRecord({
        type: "retry_decision_persisted",
        stage: "page-strategy",
        data: {
          retry_decision_path: "stages/retrying/retry-decision.json",
          transition: "retrying",
          retryable: "yes",
          failure_mode: "validation_failure",
          prior_attempt_count: "1"
        }
      })
    ).toEqual(expect.arrayContaining([
      "Run event retry_decision_persisted data.retryable must be a boolean",
      "Run event retry_decision_persisted data.prior_attempt_count must be a finite number"
    ]));
  });

  it("accepts optional undefined fields and policy nulls", () => {
    expect(
      validateRunEventRecord({
        type: "retry_decision_persisted",
        stage: "page-strategy",
        data: {
          retry_decision_path: "stages/retrying/retry-decision.json",
          transition: "needs_review",
          retryable: false,
          failure_mode: "validation_failure",
          next_attempt_number: undefined
        }
      })
    ).toEqual([]);

    expect(
      validateRunEventRecord({
        type: "retry_decision_persisted",
        stage: "page-strategy",
        data: {
          retry_decision_path: "stages/retrying/retry-decision.json",
          transition: "needs_review",
          retryable: false,
          failure_mode: "validation_failure",
          next_attempt_number: null
        }
      })
    ).toEqual([]);
  });
});
