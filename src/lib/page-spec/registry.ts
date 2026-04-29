export const sectionRegistry = {
  hero: {
    requiredProps: ["headline", "cta_label", "image_urls"],
  },
  problem: {
    requiredProps: ["headline"],
  },
  features: {
    requiredProps: ["items"],
  },
  proof: {
    requiredProps: ["trust_signals", "claim_policy"],
  },
  cta: {
    requiredProps: ["cta_label"],
  },
  faq: {
    requiredProps: ["items"],
  },
} as const;

export type RegisteredSectionType = keyof typeof sectionRegistry;
