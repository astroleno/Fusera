import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ArtifactEnvelope } from "./validate-artifact.ts";

export type RepairDecision = {
  transition: "repairing" | "needs_review";
  reason: string;
  remaining_attempts: number;
  repair_directives: unknown[];
};

export function decideRepair(options: {
  qaReport: ArtifactEnvelope;
  repairAttempts: number;
  maxRepairAttempts?: number;
}): RepairDecision {
  const maxRepairAttempts = options.maxRepairAttempts ?? 2;
  const remainingAttempts = Math.max(0, maxRepairAttempts - options.repairAttempts);
  const issues = Array.isArray(options.qaReport.payload.issues) ? options.qaReport.payload.issues : [];
  const blockingIssues = issues.filter(
    (issue): issue is Record<string, unknown> =>
      typeof issue === "object" && issue !== null && issue.blocking === true
  );
  const repairDirectives = Array.isArray(options.qaReport.payload.repair_directives)
    ? options.qaReport.payload.repair_directives
    : [];

  if (blockingIssues.length === 0) {
    return {
      transition: "needs_review",
      reason: "No blocking issues are available for repair.",
      remaining_attempts: remainingAttempts,
      repair_directives: repairDirectives
    };
  }

  if (remainingAttempts <= 0) {
    return {
      transition: "needs_review",
      reason: "Repair budget exhausted.",
      remaining_attempts: remainingAttempts,
      repair_directives: repairDirectives
    };
  }

  if (blockingIssues.some((issue) => issue.repairability !== "machine-repairable")) {
    return {
      transition: "needs_review",
      reason: "At least one blocking issue is manual-only.",
      remaining_attempts: remainingAttempts,
      repair_directives: repairDirectives
    };
  }

  if (repairDirectives.length === 0) {
    return {
      transition: "needs_review",
      reason: "Repairable issues require explicit repair directives.",
      remaining_attempts: remainingAttempts,
      repair_directives: repairDirectives
    };
  }

  return {
    transition: "repairing",
    reason: "Blocking issues are machine-repairable and budget remains.",
    remaining_attempts: remainingAttempts,
    repair_directives: repairDirectives
  };
}

export async function persistRepairDecision(options: {
  runDir: string;
  decision: RepairDecision;
}): Promise<string> {
  const repairDir = path.join(options.runDir, "stages", "repairing");
  const filePath = path.join(repairDir, "repair-decision.json");

  await mkdir(repairDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(options.decision, null, 2)}\n`, "utf8");

  return filePath;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  console.log(
    JSON.stringify(
      {
        max_repair_attempts: 2,
        behavior: "repairing only when all blocking issues are machine-repairable and directives exist"
      },
      null,
      2
    )
  );
}
