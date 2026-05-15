import type { AntiSlopFinding } from "./anti-slop-linter";

export function scorePageQuality(input: {
  sectionTypes: string[];
  hasTrustSignals: boolean;
  advisoryFindings?: AntiSlopFinding[];
}) {
  const structure = Math.min(40, input.sectionTypes.length * 10);
  const proof = input.hasTrustSignals ? 20 : 10;
  const lintPenalty = (input.advisoryFindings ?? []).reduce((total, finding) => {
    if (finding.severity === "critical") {
      return total + 24;
    }

    if (finding.severity === "high") {
      return total + 16;
    }

    if (finding.severity === "medium") {
      return total + 8;
    }

    return total + 3;
  }, 0);
  const visual = Math.max(0, 28 - lintPenalty);
  const mobile = 12;

  return {
    total: Math.min(100, structure + proof + visual + mobile),
    breakdown: {
      structure,
      proof,
      visual,
      mobile,
      advisoryFindings: input.advisoryFindings?.length ?? 0,
    },
  };
}
