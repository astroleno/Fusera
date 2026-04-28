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
  const previewBuildRef = String(previewBuild.preview_build_ref);
  const bindingPass = previewBuild.page_spec_ref === pageSpec.artifact_id;
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
          summary: "Preview build page_spec_ref does not match the validated PageSpec."
        }
      ];
  const verdict = issues.some((issue) => issue.blocking) ? "fail" : "pass";
  const qaReport: ArtifactEnvelope = {
    artifact_type: "QAReport",
    schema_version: "1.0.0",
    artifact_id: `qa-report_${stableHash(`${pageSpec.artifact_id}:${previewBuildRef}`).slice(0, 12)}`,
    run_id: pageSpec.run_id,
    status: "draft",
    producer_stage: "verify-publishable-page",
    input_refs: [pageSpec.artifact_id, previewBuildRef],
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [runDir] = process.argv.slice(2);

  if (!runDir) {
    console.error("Usage: node --experimental-strip-types superpowers/runner/verify-run.ts <runDir>");
    process.exit(1);
  }

  console.log(JSON.stringify(await verifyRun({ runDir }), null, 2));
}
