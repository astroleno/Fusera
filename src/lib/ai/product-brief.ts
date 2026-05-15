import type {
  BrandProfilePayload,
  ProductBriefPayload,
} from "@/lib/domain/page-artifacts";
import type { ProjectInput } from "@/lib/domain/project-input";
import { resolveVisualDirectionPreset } from "@/lib/domain/visual-directions";

export function buildProductBrief(input: ProjectInput): ProductBriefPayload {
  return {
    product_name: input.productName,
    audiences: [input.targetAudience],
    core_problem: input.sellingPoints[0] ?? "Positioning to be refined",
    value_props: input.sellingPoints,
    cta_goal: input.cta,
    proof_inputs: input.trustSignals,
    claim_policy: input.trustSignals.length > 0 ? "proof-required" : "low-proof",
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
