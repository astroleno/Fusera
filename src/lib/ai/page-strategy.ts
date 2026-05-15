import {
  createArtifactEnvelope,
  type ArtifactEnvelope,
  type BrandProfilePayload,
  type DesignSpecPayload,
  type PageSpecPayload,
  type PagePlanPayload,
  type ProductBriefPayload,
  type PublishVersionPayload,
  type QAReportPayload,
  type SectionGraphPayload,
  type ThemeTokensPayload,
} from "@/lib/domain/page-artifacts";
import type { ProjectInput } from "@/lib/domain/project-input";
import { resolveVisualDirectionPreset } from "@/lib/domain/visual-directions";
import { lintLandingPageAntiSlop } from "./anti-slop-linter";
import { buildBrandProfile, buildProductBrief } from "./product-brief";
import { scorePageQuality } from "./quality-score";

export type BuildPageArtifactsParams = {
  runId: string;
} & ProjectInput;

export type GeneratedPageArtifacts = {
  artifacts: Array<
    | ArtifactEnvelope<ProductBriefPayload>
    | ArtifactEnvelope<BrandProfilePayload>
    | ArtifactEnvelope<PagePlanPayload>
    | ArtifactEnvelope<SectionGraphPayload>
    | ArtifactEnvelope<ThemeTokensPayload>
    | ArtifactEnvelope<DesignSpecPayload>
    | ArtifactEnvelope<PageSpecPayload>
    | ArtifactEnvelope<QAReportPayload>
    | ArtifactEnvelope<PublishVersionPayload>
  >;
  latestRefs: {
    productBriefRef: string;
    brandProfileRef: string;
    pagePlanRef: string;
    sectionGraphRef: string;
    themeTokensRef: string;
    designSpecRef: string;
    pageSpecRef: string;
    qaReportRef: string;
    publishVersionRef: string | null;
  };
  payloads: {
    productBrief: ProductBriefPayload;
    brandProfile: BrandProfilePayload;
    pagePlan: PagePlanPayload;
    sectionGraph: SectionGraphPayload;
    themeTokens: ThemeTokensPayload;
    designSpec: DesignSpecPayload;
    pageSpec: PageSpecPayload;
    qaReport: QAReportPayload;
    publishVersion: PublishVersionPayload | null;
  };
  qualityScore: ReturnType<typeof scorePageQuality>;
};

export async function buildPageArtifacts({
  runId,
  ...input
}: BuildPageArtifactsParams): Promise<GeneratedPageArtifacts> {
  const visualDirection = resolveVisualDirectionPreset(input.visualDirectionId);
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
    page_goal: `Create a ${visualDirection.name.toLowerCase()} landing page for ${input.productName}.`,
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

  const themeTokensPayload: ThemeTokensPayload = visualDirection.themeTokens;
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

  const designSpecPayload: DesignSpecPayload = {
    visual_thesis: visualDirection.designDirectives.visualThesis,
    brand_alignment: {
      traits: input.brandKeywords,
      audience: input.targetAudience,
      positioning: `${input.productName} for ${input.targetAudience}`,
    },
    token_directives: {
      color: themeTokensPayload.colors,
      typography: themeTokensPayload.typography,
      spacing: themeTokensPayload.spacing,
      radii: themeTokensPayload.radii,
      shadows: themeTokensPayload.shadows,
    },
    layout_directives: {
      variance:
        visualDirection.designDirectives.copyDensity === "restrained"
          ? 1
          : visualDirection.designDirectives.copyDensity === "balanced"
            ? 2
            : 3,
      rules: visualDirection.designDirectives.layoutRules,
    },
    motion_directives: {
      intensity:
        visualDirection.designDirectives.copyDensity === "dense" ? 2 : 1,
      rules: [
        "Keep motion secondary to product comprehension.",
        "Use interaction feedback only where it clarifies action.",
      ],
    },
    section_design_intents: sectionGraphPayload.nodes.map((node) => ({
      section_id: node.section_id,
      layout:
        node.section_type === "hero"
          ? "Product-first hero with direct conversion path."
          : "Clear commercial section rhythm aligned to the selected direction.",
      media:
        node.section_type === "hero"
          ? visualDirection.designDirectives.imageTreatment
          : "Use supplied product assets only; do not invent logos or proof badges.",
      copy:
        node.section_type === "features"
          ? `Use ${visualDirection.designDirectives.copyDensity} benefit copy grounded in supplied selling points.`
          : "Keep copy grounded in the product brief and avoid unsupported amplification.",
      proof:
        node.section_type === "proof"
          ? visualDirection.designDirectives.proofStyle
          : "Do not introduce proof claims outside supplied trust signals.",
      motion: "Use subtle focus and hover states only.",
    })),
    claim_and_proof_constraints: {
      claim_policy: productBriefPayload.claim_policy,
      rules: [
        "Do not invent sales numbers, certifications, awards, discounts, reviews, or customer logos.",
        "Trust signals remain advisory until ClaimRef and ProofRef are persisted.",
        "Copy may clarify supplied facts but must not amplify them.",
      ],
    },
    anti_patterns: {
      visual: [
        "Default purple-blue AI gradients.",
        "Generic abstract hero visuals without product primacy.",
      ],
      copy: [
        "Empty CTA language.",
        "Broad claims detached from supplied selling points.",
      ],
      proof: [
        "Invented review counts.",
        "Unverified certification or award badges.",
      ],
    },
  };
  const designSpec = createArtifactEnvelope({
    artifactType: "DesignSpec",
    runId,
    producerStage: "design-spec-pass",
    inputRefs: [
      productBrief.artifact_id,
      brandProfile.artifact_id,
      pagePlan.artifact_id,
      sectionGraph.artifact_id,
      themeTokens.artifact_id,
    ],
    payload: designSpecPayload,
  });

  const pageSpecPayload: PageSpecPayload = {
    route_id: `landing-page:${runId}`,
    sections: sectionGraphPayload.section_order.map((sectionId) => {
      const node = sectionGraphPayload.nodes.find(
        (candidate) => candidate.section_id === sectionId,
      );

      if (!node) {
        throw new Error(`SectionGraph references missing section ${sectionId}`);
      }

      return {
        section_id: node.section_id,
        section_type: node.section_type,
        component: `landing.${node.section_type}`,
        title: node.title,
        props: node.props,
      };
    }),
    token_refs: {
      theme_tokens_ref: themeTokens.artifact_id,
      design_spec_ref: designSpec.artifact_id,
    },
    asset_refs: input.imageUrls,
    compile_targets: ["preview"],
  };
  const pageSpec = createArtifactEnvelope({
    artifactType: "PageSpec",
    runId,
    producerStage: "page-compile",
    inputRefs: [
      sectionGraph.artifact_id,
      themeTokens.artifact_id,
      designSpec.artifact_id,
    ],
    payload: pageSpecPayload,
  });

  const antiSlopFindings = lintLandingPageAntiSlop({
    sectionGraph: sectionGraphPayload,
    themeTokens: themeTokensPayload,
    pageSpec: pageSpecPayload,
    proofInputs: input.trustSignals,
  });
  const bindingIssues = [
    pageSpecPayload.token_refs.theme_tokens_ref === themeTokens.artifact_id
      ? null
      : "PageSpec token_refs.theme_tokens_ref does not match latest ThemeTokens.",
    pageSpecPayload.token_refs.design_spec_ref === designSpec.artifact_id
      ? null
      : "PageSpec token_refs.design_spec_ref does not match latest DesignSpec.",
    pageSpecPayload.sections.length === sectionGraphPayload.section_order.length
      ? null
      : "PageSpec section count does not match SectionGraph order.",
  ].filter((issue): issue is string => Boolean(issue));
  const blockingIssues = [
    ...bindingIssues.map((summary, index) => ({
      issue_id: `artifact-binding-${index + 1}`,
      severity: "critical" as const,
      category: "artifact-binding",
      repairability: "machine-repairable" as const,
      blocking: true,
      location_ref: "artifact:PageSpec",
      summary,
    })),
    ...antiSlopFindings.map((finding) => ({
      issue_id: finding.issue_id,
      severity: finding.severity,
      category: finding.category,
      repairability:
        finding.category === "claims"
          ? ("manual-only" as const)
          : ("machine-repairable" as const),
      blocking: finding.blocking,
      location_ref: finding.location_ref,
      summary: finding.summary,
    })),
  ];
  const hasBlockingIssue = blockingIssues.some((issue) => issue.blocking);
  const qaReportPayload: QAReportPayload = {
    page_spec_ref: pageSpec.artifact_id,
    preview_build_ref: `preview:${runId}`,
    verdict: hasBlockingIssue ? "fail" : "pass",
    gate_results: [
      {
        gate_id: "artifact-binding",
        result: bindingIssues.length > 0 ? "fail" : "pass",
        blocking: true,
        waivable: false,
        evidence_refs: [
          pageSpec.artifact_id,
          themeTokens.artifact_id,
          designSpec.artifact_id,
        ],
      },
      {
        gate_id: "anti-slop-advisory",
        result: antiSlopFindings.some((finding) => finding.blocking)
          ? "fail"
          : "pass",
        blocking: false,
        waivable: true,
        evidence_refs: [pageSpec.artifact_id, themeTokens.artifact_id],
      },
    ],
    issues: blockingIssues,
    repair_directives: antiSlopFindings.map((finding) => ({
      issue_id: finding.issue_id,
      action:
        finding.category === "claims"
          ? "Ask for proof or remove the unsupported proof-like claim."
          : "Revise generated page artifacts and re-run QA.",
    })),
    evidence_refs: [
      productBrief.artifact_id,
      brandProfile.artifact_id,
      pagePlan.artifact_id,
      sectionGraph.artifact_id,
      themeTokens.artifact_id,
      designSpec.artifact_id,
      pageSpec.artifact_id,
    ],
    waiver: null,
  };
  const qaReport = createArtifactEnvelope({
    artifactType: "QAReport",
    runId,
    producerStage: "verify-publishable-page",
    inputRefs: [pageSpec.artifact_id, designSpec.artifact_id],
    payload: qaReportPayload,
  });

  const publishVersionPayload: PublishVersionPayload | null =
    qaReportPayload.verdict === "pass"
      ? {
          publish_version_id: `preview-version:${runId}`,
          page_spec_ref: pageSpec.artifact_id,
          qa_report_ref: qaReport.artifact_id,
          preview_url: `preview://fusera/runs/${runId}`,
          published_at: new Date().toISOString(),
          publish_target: "preview",
          previous_active_pointer: null,
          pointer_transaction_ref: `preview-pointer:${runId}`,
        }
      : null;
  const publishVersion = publishVersionPayload
    ? createArtifactEnvelope({
        artifactType: "PublishVersion",
        runId,
        producerStage: "publish-preview",
        inputRefs: [pageSpec.artifact_id, qaReport.artifact_id],
        payload: publishVersionPayload,
      })
    : null;

  const qualityScore = scorePageQuality({
    sectionTypes: sectionGraphPayload.nodes.map((node) => node.section_type),
    hasTrustSignals: input.trustSignals.length > 0,
    advisoryFindings: antiSlopFindings,
  });
  const artifacts: GeneratedPageArtifacts["artifacts"] = [
    productBrief,
    brandProfile,
    pagePlan,
    sectionGraph,
    themeTokens,
    designSpec,
    pageSpec,
    qaReport,
  ];

  if (publishVersion) {
    artifacts.push(publishVersion);
  }

  return {
    artifacts,
    latestRefs: {
      productBriefRef: productBrief.artifact_id,
      brandProfileRef: brandProfile.artifact_id,
      pagePlanRef: pagePlan.artifact_id,
      sectionGraphRef: sectionGraph.artifact_id,
      themeTokensRef: themeTokens.artifact_id,
      designSpecRef: designSpec.artifact_id,
      pageSpecRef: pageSpec.artifact_id,
      qaReportRef: qaReport.artifact_id,
      publishVersionRef: publishVersion?.artifact_id ?? null,
    },
    payloads: {
      productBrief: productBriefPayload,
      brandProfile: brandProfilePayload,
      pagePlan: pagePlanPayload,
      sectionGraph: sectionGraphPayload,
      themeTokens: themeTokensPayload,
      designSpec: designSpecPayload,
      pageSpec: pageSpecPayload,
      qaReport: qaReportPayload,
      publishVersion: publishVersionPayload,
    },
    qualityScore,
  };
}
