import {
  createArtifactEnvelope,
  type ArtifactEnvelope,
  type BrandProfilePayload,
  type PagePlanPayload,
  type ProductBriefPayload,
  type SectionGraphPayload,
  type ThemeTokensPayload,
} from "@/lib/domain/page-artifacts";
import type { ProjectInput } from "@/lib/domain/project-input";
import { buildBrandProfile, buildProductBrief } from "./product-brief";

export type BuildPageArtifactsParams = {
  runId: string;
} & ProjectInput;

export type GeneratedPageArtifacts = {
  artifacts: [
    ArtifactEnvelope<ProductBriefPayload>,
    ArtifactEnvelope<BrandProfilePayload>,
    ArtifactEnvelope<PagePlanPayload>,
    ArtifactEnvelope<SectionGraphPayload>,
    ArtifactEnvelope<ThemeTokensPayload>,
  ];
  latestRefs: {
    productBriefRef: string;
    brandProfileRef: string;
    pagePlanRef: string;
    sectionGraphRef: string;
    themeTokensRef: string;
  };
  payloads: {
    productBrief: ProductBriefPayload;
    brandProfile: BrandProfilePayload;
    pagePlan: PagePlanPayload;
    sectionGraph: SectionGraphPayload;
    themeTokens: ThemeTokensPayload;
  };
};

export async function buildPageArtifacts({
  runId,
  ...input
}: BuildPageArtifactsParams): Promise<GeneratedPageArtifacts> {
  const productBriefPayload = buildProductBrief(input);
  const productBrief = createArtifactEnvelope({
    artifactType: "ProductBrief",
    runId,
    producerStage: "product-and-brand-brief",
    inputRefs: [],
    payload: productBriefPayload,
  });

  const brandProfilePayload = buildBrandProfile(input);
  const brandProfile = createArtifactEnvelope({
    artifactType: "BrandProfile",
    runId,
    producerStage: "product-and-brand-brief",
    inputRefs: [],
    payload: brandProfilePayload,
  });

  const pagePlanPayload: PagePlanPayload = {
    page_goal: `Create a premium landing page for ${input.productName}.`,
    narrative_arc: "Lead with product clarity, prove benefits, then ask for action.",
    section_intents: [
      {
        section_id: "hero",
        intent: `Introduce ${input.productName} and the primary action.`,
      },
      {
        section_id: "features",
        intent: "Translate selling points into concrete product benefits.",
      },
      {
        section_id: "proof",
        intent:
          input.trustSignals.length > 0
            ? "Bind trust signals to proof claims."
            : "Keep proof restrained when no trust signals are provided.",
      },
      {
        section_id: "cta",
        intent: "Close with the requested conversion action.",
      },
    ],
    cta_strategy: input.cta,
    proof_strategy:
      input.trustSignals.length > 0
        ? "Use only supplied trust signals as proof."
        : "Avoid quantified proof claims until evidence is supplied.",
  };
  const pagePlan = createArtifactEnvelope({
    artifactType: "PagePlan",
    runId,
    producerStage: "page-strategy",
    inputRefs: [productBrief.artifact_id, brandProfile.artifact_id],
    payload: pagePlanPayload,
  });

  const sectionGraphPayload: SectionGraphPayload = {
    nodes: [
      {
        section_id: "hero",
        section_type: "hero",
        title: input.productName,
        props: {
          eyebrow: input.brandKeywords.join(" / "),
          headline: input.productName,
          subhead: productBriefPayload.value_props[0],
          cta_label: input.cta,
          image_urls: input.imageUrls,
        },
      },
      {
        section_id: "features",
        section_type: "features",
        title: "Core benefits",
        props: {
          items: input.sellingPoints,
        },
      },
      {
        section_id: "proof",
        section_type: "proof",
        title: "Proof points",
        props: {
          trust_signals: input.trustSignals,
          claim_policy: productBriefPayload.claim_policy,
        },
      },
      {
        section_id: "cta",
        section_type: "cta",
        title: input.cta,
        props: {
          cta_label: input.cta,
        },
      },
    ],
    edges: [
      { from: "hero", to: "features", relationship: "supports" },
      { from: "features", to: "proof", relationship: "substantiates" },
      { from: "proof", to: "cta", relationship: "converts" },
    ],
    section_order: ["hero", "features", "proof", "cta"],
    required_props: {
      hero: ["headline", "cta_label", "image_urls"],
      features: ["items"],
      proof: ["trust_signals", "claim_policy"],
      cta: ["cta_label"],
    },
    proof_bindings: input.trustSignals.map((proofRef) => ({
      section_id: "proof",
      proof_ref: proofRef,
    })),
    claim_policy: productBriefPayload.claim_policy,
  };
  const sectionGraph = createArtifactEnvelope({
    artifactType: "SectionGraph",
    runId,
    producerStage: "section-planning",
    inputRefs: [productBrief.artifact_id, brandProfile.artifact_id, pagePlan.artifact_id],
    payload: sectionGraphPayload,
  });

  const themeTokensPayload: ThemeTokensPayload = {
    colors: {
      background: "#f7f3ec",
      surface: "#fffaf2",
      text: "#171513",
      accent: "#315f52",
      signal: "#d7f264",
    },
    typography: {
      display: { fontFamily: "Georgia, Times New Roman, serif" },
      body: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
    },
    spacing: {
      page: "clamp(24px, 5vw, 64px)",
      section: "clamp(40px, 7vw, 80px)",
    },
    radii: {
      control: "8px",
      pill: "999px",
    },
    shadows: {
      preview: "0 28px 70px rgba(23, 21, 19, 0.14)",
    },
    motion: {
      hover: "180ms ease",
      focus: "160ms ease",
    },
  };
  const themeTokens = createArtifactEnvelope({
    artifactType: "ThemeTokens",
    runId,
    producerStage: "design-system-pass",
    inputRefs: [
      productBrief.artifact_id,
      brandProfile.artifact_id,
      pagePlan.artifact_id,
      sectionGraph.artifact_id,
    ],
    payload: themeTokensPayload,
  });

  return {
    artifacts: [productBrief, brandProfile, pagePlan, sectionGraph, themeTokens],
    latestRefs: {
      productBriefRef: productBrief.artifact_id,
      brandProfileRef: brandProfile.artifact_id,
      pagePlanRef: pagePlan.artifact_id,
      sectionGraphRef: sectionGraph.artifact_id,
      themeTokensRef: themeTokens.artifact_id,
    },
    payloads: {
      productBrief: productBriefPayload,
      brandProfile: brandProfilePayload,
      pagePlan: pagePlanPayload,
      sectionGraph: sectionGraphPayload,
      themeTokens: themeTokensPayload,
    },
  };
}
