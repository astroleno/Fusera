export type WebProjectInput = {
  productName: string;
  sellingPoints: string[];
  productDetails: Array<{ label: string; value: string }>;
  targetAudience: string;
  brandKeywords: string[];
  cta: string;
  visualDirectionId: string;
  imageUrls: string[];
  price?: string;
  trustSignals: string[];
  proofSources: Array<{ claim: string; source: string; url?: string }>;
  tone?: string;
  referenceUrls: string[];
};

export function projectInputToHarness(input: WebProjectInput): Record<string, unknown> {
  const proofSources = input.proofSources.map((proof, index) => ({
    proof_ref: `proof:${index + 1}`,
    claim: proof.claim,
    source: proof.source,
    url: proof.url ?? null
  }));

  return {
    product_name: input.productName,
    audiences: [input.targetAudience],
    core_problem: `${input.targetAudience}需要一个能够清晰呈现${input.productName}价值的购买页面。`,
    value_props: [...input.sellingPoints],
    product_details: input.productDetails.map((item) => ({ ...item })),
    cta_goal: input.cta,
    proof_inputs: [...input.trustSignals],
    proof_sources: proofSources,
    claim_policy: proofSources.length > 0 ? "proof-required" : "low-proof",
    brand_traits: [...input.brandKeywords],
    tone_keywords: input.tone ? [input.tone] : [...input.brandKeywords],
    visual_directions: [input.visualDirectionId],
    positioning: input.sellingPoints.join("；"),
    do_not_use: ["未经证实的数据声明", "与已提供素材不一致的产品承诺"],
    image_urls: [...input.imageUrls],
    reference_urls: [...input.referenceUrls],
    price: input.price ?? null
  };
}
