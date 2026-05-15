import type {
  BrandProfilePayload,
  ProductBriefPayload,
} from "@/lib/domain/page-artifacts";
import type { ProjectInput } from "@/lib/domain/project-input";
import { resolveVisualDirectionPreset } from "@/lib/domain/visual-directions";

export function buildProductBrief(input: ProjectInput): ProductBriefPayload {
  const proofSources = input.proofSources.map((proofSource, index) => ({
    proof_ref: `proof:${index + 1}`,
    claim: proofSource.claim,
    source: proofSource.source,
    url: proofSource.url ?? null,
  }));
  const claimRefs = input.trustSignals.map((claim, index) => ({
    claim_ref: `claim:${index + 1}`,
    claim,
    proof_refs: proofSources
      .filter(
        (proofSource) =>
          proofSource.claim.toLowerCase().includes(claim.toLowerCase()) ||
          claim.toLowerCase().includes(proofSource.claim.toLowerCase()),
      )
      .map((proofSource) => proofSource.proof_ref),
  }));

  return {
    product_name: input.productName,
    audiences: [input.targetAudience],
    core_problem: input.sellingPoints[0] ?? "Positioning to be refined",
    value_props: input.sellingPoints,
    product_details: input.productDetails,
    cta_goal: input.cta,
    proof_inputs: input.trustSignals,
    proof_sources: proofSources,
    claim_refs: claimRefs,
    claim_policy:
      input.trustSignals.length > 0 || input.proofSources.length > 0
        ? "proof-required"
        : "low-proof",
  };
}

export function buildBrandProfile(input: ProjectInput): BrandProfilePayload {
  const toneKeywords = input.tone
    ? [input.tone, ...input.brandKeywords]
    : input.brandKeywords;
  const visualDirection = resolveVisualDirectionPreset(input.visualDirectionId);

  return {
    brand_traits: input.brandKeywords,
    tone_keywords: toneKeywords,
    visual_directions: [
      visualDirection.name,
      `${input.brandKeywords.join(", ")} product presentation`,
      visualDirection.designDirectives.visualThesis,
    ],
    positioning: `${input.productName} for ${input.targetAudience}`,
    do_not_use: ["unverified claims", "generic AI copy"],
  };
}
