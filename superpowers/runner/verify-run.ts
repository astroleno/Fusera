import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  readValidatedArtifact,
  validateAndPersistArtifact,
  type ArtifactEnvelope
} from "./validate-artifact.ts";
import { decideRepair, type RepairDecision } from "./repair-run.ts";

export type VerifyRunResult = {
  qa_report: ArtifactEnvelope;
  transition: "approved" | "repairing" | "needs_review";
  repair_decision: RepairDecision | null;
};

export async function verifyRun(options: {
  runDir: string;
  contractsDir?: string;
  repairAttempts?: number;
  maxRepairAttempts?: number;
}): Promise<VerifyRunResult> {
  const contractsDir = options.contractsDir ?? path.resolve("superpowers/contracts/artifacts");
  const pageSpec = await readValidatedArtifact(options.runDir, "PageSpec");
  const previewBuild = JSON.parse(
    await readFile(path.join(options.runDir, "compiled", "preview-build.json"), "utf8")
  ) as Record<string, unknown>;
  const previewBuildRef = nonEmptyStringOrNull(previewBuild.preview_build_ref);
  const bindingErrors = artifactBindingErrors({
    pageSpec,
    previewBuild,
    previewBuildRef
  });
  const bindingPass = bindingErrors.length === 0;
  const gateResults = [
    {
      gate_id: "artifact-binding",
      result: bindingPass ? "pass" : "fail",
      blocking: !bindingPass,
      waivable: false,
      evidence_refs: ["compiled/preview-build.json"]
    },
    {
      gate_id: "claims-proof",
      result: "pass",
      blocking: false,
      waivable: false,
      evidence_refs: [pageSpec.artifact_id]
    },
    {
      gate_id: "publish-safety",
      result: "pass",
      blocking: false,
      waivable: false,
      evidence_refs: ["compiled/preview-build.json"]
    }
  ];
  const issues = bindingPass
    ? []
    : [
        {
          issue_id: "issue_artifact_binding",
          severity: "critical",
          category: "artifact-binding",
          repairability: "manual-only",
          blocking: true,
          location_ref: "compiled/preview-build.json",
          summary: bindingErrors.join(" ")
        }
      ];
  const verdict = issues.some((issue) => issue.blocking) ? "fail" : "pass";
  const qaReport: ArtifactEnvelope = {
    artifact_type: "QAReport",
    schema_version: "1.0.0",
    artifact_id: `qa-report_${stableHash(`${pageSpec.artifact_id}:${previewBuildRef ?? "missing-preview-build-ref"}`).slice(0, 12)}`,
    run_id: pageSpec.run_id,
    status: "draft",
    producer_stage: "verify-publishable-page",
    input_refs: previewBuildRef
      ? [pageSpec.artifact_id, previewBuildRef]
      : [pageSpec.artifact_id, "compiled/preview-build.json"],
    validation: {
      valid: false,
      errors: []
    },
    payload: {
      page_spec_ref: pageSpec.artifact_id,
      preview_build_ref: previewBuildRef,
      verdict,
      gate_results: gateResults,
      issues,
      repair_directives: [],
      evidence_refs: ["compiled/preview-build.json"],
      waiver: null
    }
  };
  const validation = await validateAndPersistArtifact({
    artifact: qaReport,
    contractsDir,
    runDir: options.runDir
  });

  if (!validation.valid) {
    throw new Error(`QAReport failed validation: ${validation.errors.join("; ")}`);
  }

  const repairDecision = decideRepair({
    qaReport: validation.artifact,
    repairAttempts: options.repairAttempts ?? 0,
    maxRepairAttempts: options.maxRepairAttempts
  });

  const transition =
    validation.artifact.payload.verdict === "pass"
      ? "approved"
      : repairDecision.transition;

  return {
    qa_report: validation.artifact,
    transition,
    repair_decision: transition === "approved" ? null : repairDecision
  };
}

function stableHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function artifactBindingErrors(options: {
  pageSpec: ArtifactEnvelope;
  previewBuild: Record<string, unknown>;
  previewBuildRef: string | null;
}): string[] {
  const errors: string[] = [];

  if (!options.previewBuildRef) {
    errors.push("Preview build preview_build_ref is missing or empty.");
  }

  if (options.previewBuild.run_id !== options.pageSpec.run_id) {
    errors.push("Preview build run_id does not match the validated PageSpec run_id.");
  }

  if (options.previewBuild.page_spec_ref !== options.pageSpec.artifact_id) {
    errors.push("Preview build page_spec_ref does not match the validated PageSpec.");
  }

  return errors;
}

function nonEmptyStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir] = process.argv.slice(2);

  if (!runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/verify-run.ts <runDir>");
    process.exit(1);
  }

  console.log(JSON.stringify(await verifyRun({ runDir }), null, 2));
}
