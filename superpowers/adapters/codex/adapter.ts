import crypto from "node:crypto";
import { CODEX_CAPABILITIES } from "./capabilities.ts";
import { RealCodexAdapter } from "./real-adapter.ts";

export type CompiledPackBundle = {
  pack_id: string;
  backend: string;
  manifest: Record<string, unknown>;
  skill_source: string;
  reference_sources?: Array<Record<string, unknown>>;
  reference_budget?: Record<string, unknown>;
};

export type CodexInvocationBundle = {
  stage: string;
  selected_pack_ids: string[];
  stage_profile: Record<string, unknown>;
  capabilities: readonly string[];
  compiled_packs: CompiledPackBundle[];
  run: Record<string, unknown>;
  normalized_input_bundle: Record<string, unknown> | null;
  input_artifact_refs: string[];
  materialized_artifacts: Record<string, unknown>;
  output_contract_refs: string[];
  repair_directives?: unknown[];
};

export type CodexInvocationResult = {
  status: "ok" | "failed";
  stdout: string;
  stderr: string;
  usage: Record<string, unknown>;
  attachments: unknown[];
  produced_artifact_candidates: unknown[];
  preview_build_ref?: string;
  failure_mode?: "invocation_failure" | "extraction_failure" | "validation_failure" | "missing_output";
};

export type CodexAdapterMode = "mock" | "real";

export interface CodexAdapter {
  id: "codex";
  capabilities: readonly string[];
  invoke(bundle: CodexInvocationBundle): Promise<CodexInvocationResult>;
}

export class MockCodexAdapter implements CodexAdapter {
  id = "codex" as const;
  capabilities = CODEX_CAPABILITIES;

  async invoke(bundle: CodexInvocationBundle): Promise<CodexInvocationResult> {
    const producedArtifactCandidates = produceMockArtifactCandidates(bundle);
    const attachments = produceMockAttachments(bundle);

    return {
      status: "ok",
      stdout: `mock codex adapter accepted stage ${bundle.stage} with ${bundle.compiled_packs.length} compiled pack(s)`,
      stderr: "",
      usage: {
        mode: "stub",
        compiled_pack_ids: bundle.compiled_packs.map((pack) => pack.pack_id)
      },
      attachments,
      produced_artifact_candidates: producedArtifactCandidates,
      preview_build_ref: undefined
    };
  }
}

export function createCodexAdapter(mode: CodexAdapterMode = "mock"): CodexAdapter {
  if (mode === "real") {
    return new RealCodexAdapter();
  }

  return new MockCodexAdapter();
}

function produceMockAttachments(bundle: CodexInvocationBundle): unknown[] {
  if (bundle.stage !== "normalize-input") {
    return [];
  }

  const input = getInput(bundle);

  return [
    {
      kind: "normalized_input_bundle",
      file_name: "normalized-input.json",
      body: {
        bundle_type: "normalized_input_bundle",
        normalized_at: new Date().toISOString(),
        payload: input
      }
    }
  ];
}

function produceMockArtifactCandidates(bundle: CodexInvocationBundle): unknown[] {
  if (bundle.stage === "product-and-brand-brief") {
    return [makeProductBrief(bundle), makeBrandProfile(bundle)];
  }

  if (bundle.stage === "page-strategy") {
    return [makePagePlan(bundle)];
  }

  if (bundle.stage === "section-planning") {
    return [makeSectionGraph(bundle)];
  }

  if (bundle.stage === "design-system-pass") {
    return [makeThemeTokens(bundle)];
  }

  if (bundle.stage === "design-spec-pass") {
    return [makeDesignSpec(bundle)];
  }

  return [];
}

function makeProductBrief(bundle: CodexInvocationBundle): Record<string, unknown> {
  const input = getInput(bundle);
  const proofInputs = stringArrayFrom(input.proof_inputs, []);
  const proofSources = proofSourcesFrom(input.proof_sources, proofInputs);
  const claimPolicy = claimPolicyFromInput(input, proofInputs, proofSources);

  return makeArtifact(bundle, "ProductBrief", "product-and-brand-brief", ["stages/normalize-input/normalized-input.json"], {
    product_name: stringFrom(input.product_name, "Fusera"),
    audiences: stringArrayFrom(input.audiences, ["operators"]),
    core_problem: stringFrom(input.core_problem, "Teams need a deterministic landing-page path."),
    value_props: stringArrayFrom(input.value_props, ["Artifact-first generation"]),
    cta_goal: stringFrom(input.cta_goal, "Start a preview run"),
    product_details: productDetailsFrom(input.product_details),
    proof_inputs: proofInputs,
    proof_sources: proofSources,
    claim_refs: proofInputs.map((proofInput, index) => ({
      claim_ref: `claim:${index + 1}`,
      claim: proofInput,
      proof_refs: [proofSources[index]?.proof_ref].filter(Boolean)
    })),
    claim_policy: claimPolicy
  });
}

function makeBrandProfile(bundle: CodexInvocationBundle): Record<string, unknown> {
  const input = getInput(bundle);

  return makeArtifact(bundle, "BrandProfile", "product-and-brand-brief", ["stages/normalize-input/normalized-input.json"], {
    brand_traits: stringArrayFrom(input.brand_traits, ["precise"]),
    tone_keywords: stringArrayFrom(input.tone_keywords, ["clear"]),
    visual_directions: stringArrayFrom(input.visual_directions, ["structured"]),
    positioning: stringFrom(input.positioning, "Artifact-first landing generation"),
    do_not_use: stringArrayFrom(input.do_not_use, [])
  });
}

function makePagePlan(bundle: CodexInvocationBundle): Record<string, unknown> {
  const productBrief = artifact(bundle, "ProductBrief");
  const brandProfile = artifact(bundle, "BrandProfile");
  const proofInputs = stringArrayFrom(payload(productBrief).proof_inputs, ["run evidence"]);

  return makeArtifact(bundle, "PagePlan", "page-strategy", [artifactId(productBrief), artifactId(brandProfile)], {
    page_goal: `Convert ${stringFrom(payload(productBrief).product_name, "Fusera")} visitors into preview-run starts.`,
    narrative_arc: "Problem clarity, operational proof, then a single preview CTA.",
    section_intents: [
      { section_id: "hero", intent: "State the product promise and CTA." },
      { section_id: "problem", intent: "Name the workflow risk P0 removes." },
      { section_id: "features", intent: "Show the artifact-led operating model." },
      { section_id: "proof", intent: "Bind claims to harness evidence." },
      { section_id: "cta", intent: "Ask for the preview action." }
    ],
    cta_strategy: stringFrom(payload(productBrief).cta_goal, "Start a preview run"),
    proof_strategy: `Use ${proofInputs.join(", ")}.`
  });
}

function makeSectionGraph(bundle: CodexInvocationBundle): Record<string, unknown> {
  const input = getInput(bundle);
  const pagePlan = artifact(bundle, "PagePlan");
  const claimPolicy = claimPolicyFromInput(input);
  const proofBindings =
    claimPolicy === "proof-required"
      ? [
          {
            section_id: "proof",
            proof_ref: "proof:preview-publish-handoff"
          }
        ]
      : [];
  const proofProps =
    claimPolicy === "proof-required"
      ? {
          proof_ref: "proof:preview-publish-handoff"
        }
      : {
          proof_note: "Keep proof language qualitative until stronger evidence is attached."
        };

  return makeArtifact(bundle, "SectionGraph", "section-planning", [artifactId(pagePlan)], {
    nodes: [
      {
        section_id: "hero",
        section_type: "hero",
        title: "Artifact-first landing previews",
        props: {
          eyebrow: "Fusera P0",
          headline: "Turn product intent into a publishable preview.",
          cta_label: "Start preview run"
        }
      },
      {
        section_id: "problem",
        section_type: "problem",
        title: "Generation needs traceable boundaries",
        props: {
          body: "Each stage emits declared artifacts instead of drifting through prompt prose."
        }
      },
      {
        section_id: "features",
        section_type: "features",
        title: "Stable artifact spine",
        props: {
          items: ["Brief", "Plan", "Graph", "Tokens", "Spec", "QA", "PublishVersion"]
        }
      },
      {
        section_id: "proof",
        section_type: "proof",
        title: "Preview publish is gated",
        props: proofProps
      },
      {
        section_id: "cta",
        section_type: "cta",
        title: "Run the harness",
        props: {
          cta_label: "Create preview"
        }
      }
    ],
    edges: [
      { from: "hero", to: "problem", relationship: "supports" },
      { from: "problem", to: "features", relationship: "explains" },
      { from: "features", to: "proof", relationship: "substantiates" },
      { from: "proof", to: "cta", relationship: "converts" }
    ],
    section_order: ["hero", "problem", "features", "proof", "cta"],
    required_props: {
      hero: ["headline", "cta_label"],
      problem: ["body"],
      features: ["items"],
      proof: claimPolicy === "proof-required" ? ["proof_ref"] : ["proof_note"],
      cta: ["cta_label"]
    },
    proof_bindings: proofBindings,
    claim_policy: claimPolicy
  });
}

function makeThemeTokens(bundle: CodexInvocationBundle): Record<string, unknown> {
  const productBrief = artifact(bundle, "ProductBrief");
  const brandProfile = artifact(bundle, "BrandProfile");
  const pagePlan = artifact(bundle, "PagePlan");
  const tokenPreset = themeTokenPresetFor(
    stringArrayFrom(payload(brandProfile).visual_directions, [])
  );

  return makeArtifact(
    bundle,
    "ThemeTokens",
    "design-system-pass",
    [artifactId(productBrief), artifactId(brandProfile), artifactId(pagePlan)],
    {
      colors: tokenPreset.colors,
      typography: {
        heading_family: "Inter",
        body_family: "Inter",
        scale: tokenPreset.scale,
        direction_signal: tokenPreset.directionSignal,
        source_pack_ids: bundle.selected_pack_ids.filter(
          (packId) =>
            packId.startsWith("base/") ||
            packId.startsWith("styles/") ||
            packId.startsWith("modifiers/")
        )
      },
      spacing: {
        section_y: tokenPreset.sectionY,
        grid_gap: tokenPreset.gridGap,
        direction_signal: tokenPreset.directionSignal
      },
      radii: {
        card: tokenPreset.cardRadius,
        control: tokenPreset.controlRadius,
        direction_signal: tokenPreset.radiusSignal
      },
      shadows: {
        soft: tokenPreset.shadow
      },
      motion: {
        duration_ms: tokenPreset.motionDurationMs,
        easing: "ease-out",
        direction_signal: tokenPreset.motionSignal
      }
    }
  );
}

function themeTokenPresetFor(visualDirections: string[]): {
  colors: Record<string, string>;
  scale: string;
  sectionY: string;
  gridGap: string;
  cardRadius: string;
  controlRadius: string;
  shadow: string;
  motionDurationMs: number;
  directionSignal: string;
  radiusSignal: string;
  motionSignal: string;
} {
  const joined = visualDirections.join(" ");

  if (/\b(terminal|console|command\s*line|shell|cli|monochrome|status)\b/i.test(joined)) {
    return {
      colors: {
        background: "#101418",
        surface: "#151d22",
        text: "#e5f2ef",
        accent: "#22c55e"
      },
      scale: "compact terminal console status",
      sectionY: "64px",
      gridGap: "20px",
      cardRadius: "4px",
      controlRadius: "4px",
      shadow: "0 0 0 1px rgba(34, 197, 94, 0.24)",
      motionDurationMs: 120,
      directionSignal: "terminal console status monochrome",
      radiusSignal: "terminal command line controls",
      motionSignal: "terminal prompt transition"
    };
  }

  if (/\b(industrial|mechanical|tactile|safety|caution|steel|metal|control\s*panel|factory)\b/i.test(joined)) {
    return {
      colors: {
        background: "#f1efe7",
        surface: "#ffffff",
        text: "#1f2424",
        accent: "#f59e0b"
      },
      scale: "compact industrial",
      sectionY: "72px",
      gridGap: "24px",
      cardRadius: "4px",
      controlRadius: "4px",
      shadow: "0 12px 28px rgba(31, 36, 36, 0.14)",
      motionDurationMs: 140,
      directionSignal: "industrial safety steel control panel",
      radiusSignal: "industrial hardwearing edges",
      motionSignal: "industrial status change"
    };
  }

  if (/\b(bauhaus|geometric|primary|color\s+blocking|poster|hard\s+edge|hard\s+shadow)\b/i.test(joined)) {
    return {
      colors: {
        background: "#f7f1df",
        surface: "#ffffff",
        text: "#171717",
        accent: "#e11d48"
      },
      scale: "compact bauhaus poster",
      sectionY: "76px",
      gridGap: "24px",
      cardRadius: "0px",
      controlRadius: "0px",
      shadow: "8px 8px 0 rgba(23, 23, 23, 0.18)",
      motionDurationMs: 150,
      directionSignal: "bauhaus primary color blocking hard edge",
      radiusSignal: "hard edge bauhaus poster block",
      motionSignal: "bauhaus block transition"
    };
  }

  return {
    colors: {
      background: "#f7f4ee",
      surface: "#ffffff",
      text: "#171717",
      accent: "#0f766e"
    },
    scale: "compact",
    sectionY: "72px",
    gridGap: "24px",
    cardRadius: "8px",
    controlRadius: "6px",
    shadow: "0 12px 36px rgba(23, 23, 23, 0.10)",
    motionDurationMs: 160,
    directionSignal: "structured editorial",
    radiusSignal: "restrained controls",
    motionSignal: "restrained entrance motion"
  };
}

function makeDesignSpec(bundle: CodexInvocationBundle): Record<string, unknown> {
  const productBrief = artifact(bundle, "ProductBrief");
  const brandProfile = artifact(bundle, "BrandProfile");
  const pagePlan = artifact(bundle, "PagePlan");
  const sectionGraph = artifact(bundle, "SectionGraph");
  const themeTokens = artifact(bundle, "ThemeTokens");
  const sectionOrder = stringArrayFrom(payload(sectionGraph).section_order, ["hero"]);
  const brandTraits = stringArrayFrom(payload(brandProfile).brand_traits, ["precise"]);
  const audiences = stringArrayFrom(payload(productBrief).audiences, ["operators"]);
  const claimPolicy = stringFrom(payload(productBrief).claim_policy, "proof-required");

  return makeArtifact(
    bundle,
    "DesignSpec",
    "design-spec-pass",
    [
      artifactId(productBrief),
      artifactId(brandProfile),
      artifactId(pagePlan),
      artifactId(sectionGraph),
      artifactId(themeTokens)
    ],
    {
      visual_thesis: `${stringFrom(payload(productBrief).product_name, "Fusera")} should feel artifact-led, credible, and visibly useful in the first viewport.`,
      brand_alignment: {
        traits: brandTraits,
        audience: audiences[0] ?? "operators",
        positioning: stringFrom(payload(brandProfile).positioning, "Artifact-first landing generation")
      },
      token_directives: {
        color: {
          base: stringFrom((payload(themeTokens).colors as Record<string, unknown> | undefined)?.background, "warm neutral"),
          accent: stringFrom((payload(themeTokens).colors as Record<string, unknown> | undefined)?.accent, "deep teal"),
          rules: ["Use product and proof hierarchy before decorative color."]
        },
        typography: {
          rules: ["Keep heading and body families legible and distinct enough for dense landing copy."]
        },
        spacing: {
          rules: ["Preserve scannable section rhythm and leave room for proof details."]
        },
        radii: {
          rules: ["Keep controls at 8px or less unless imagery requires softer framing."]
        },
        shadows: {
          rules: ["Use shadows only for hierarchy, not atmospheric glow."]
        }
      },
      layout_directives: {
        variance: 5,
        rules: ["Make the product promise visible before feature detail.", "Avoid generic three-card repetition."]
      },
      motion_directives: {
        intensity: 3,
        rules: ["Use restrained entrance motion.", "Provide a reduced-motion-safe path."]
      },
      section_design_intents: sectionOrder.map((sectionId) => ({
        section_id: sectionId,
        layout: `Give ${sectionId} a clear role in the page narrative instead of repeating the prior section.`,
        media: `Use inspectable, honest media or layout structure for ${sectionId}; do not fabricate proof assets.`,
        copy: `Keep ${sectionId} copy aligned to the page goal and CTA strategy.`,
        proof: claimPolicy === "proof-required"
          ? `Bind ${sectionId} claims to provided proof inputs or keep claims qualitative.`
          : `Avoid unsupported proof language in ${sectionId}.`,
        motion: `Use subtle motion in ${sectionId} only when it clarifies hierarchy.`
      })),
      claim_and_proof_constraints: {
        claim_policy: claimPolicy,
        rules: ["Do not introduce fake metrics.", "Tie proof claims to validated upstream proof inputs."]
      },
      anti_patterns: {
        visual: ["generic purple-blue AI glow", "generic three-card feature row"],
        copy: ["unsupported automation cliches", "vague launch promises"],
        proof: ["fake metrics", "unsupported testimonials"]
      }
    }
  );
}

function makeArtifact(
  bundle: CodexInvocationBundle,
  artifactType: string,
  producerStage: string,
  inputRefs: string[],
  artifactPayload: Record<string, unknown>
): Record<string, unknown> {
  return {
    artifact_type: artifactType,
    schema_version: "1.0.0",
    artifact_id: `${artifactPrefix(artifactType)}_${stableHash(
      `${runId(bundle)}:${artifactType}:${JSON.stringify(artifactPayload)}`
    ).slice(0, 12)}`,
    run_id: runId(bundle),
    status: "draft",
    producer_stage: producerStage,
    input_refs: inputRefs,
    validation: {
      valid: false,
      errors: []
    },
    payload: artifactPayload
  };
}

function getInput(bundle: CodexInvocationBundle): Record<string, unknown> {
  const normalizedPayload =
    bundle.normalized_input_bundle &&
    typeof bundle.normalized_input_bundle.payload === "object" &&
    bundle.normalized_input_bundle.payload !== null
      ? (bundle.normalized_input_bundle.payload as Record<string, unknown>)
      : null;

  if (normalizedPayload) {
    return normalizedPayload;
  }

  if (typeof bundle.run.input_payload === "object" && bundle.run.input_payload !== null) {
    return bundle.run.input_payload as Record<string, unknown>;
  }

  return {};
}

function artifact(bundle: CodexInvocationBundle, artifactType: string): Record<string, unknown> {
  const value = bundle.materialized_artifacts[artifactType];

  if (typeof value !== "object" || value === null) {
    throw new Error(`Missing materialized artifact ${artifactType}`);
  }

  return value as Record<string, unknown>;
}

function payload(artifactValue: Record<string, unknown>): Record<string, unknown> {
  return typeof artifactValue.payload === "object" && artifactValue.payload !== null
    ? (artifactValue.payload as Record<string, unknown>)
    : {};
}

function artifactId(artifactValue: Record<string, unknown>): string {
  return String(artifactValue.artifact_id);
}

function runId(bundle: CodexInvocationBundle): string {
  return String(bundle.run.run_id ?? "run_unknown");
}

function artifactPrefix(artifactType: string): string {
  return artifactType.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function stableHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function stringFrom(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function stringArrayFrom(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function productDetailsFrom(value: unknown): Array<Record<string, string>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const record = item as Record<string, unknown>;
    const label = stringFrom(record.label, "");
    const detailValue = stringFrom(record.value, "");

    return label && detailValue ? [{ label, value: detailValue }] : [];
  });
}

function proofSourcesFrom(
  value: unknown,
  proofInputs: string[]
): Array<Record<string, string | null>> {
  if (Array.isArray(value)) {
    const parsed = value.flatMap((item) => {
      if (typeof item !== "object" || item === null) {
        return [];
      }

      const record = item as Record<string, unknown>;
      const proofRef = stringFrom(record.proof_ref, "");
      const claim = stringFrom(record.claim, "");
      const source = stringFrom(record.source, "");
      const url = typeof record.url === "string" && record.url ? record.url : null;

      return proofRef && claim && source
        ? [{ proof_ref: proofRef, claim, source, url }]
        : [];
    });

    if (parsed.length > 0) {
      return parsed;
    }
  }

  return proofInputs.map((proofInput, index) => ({
    proof_ref: `proof:${index + 1}`,
    claim: proofInput,
    source: "normalized-input.proof_inputs",
    url: null
  }));
}

function claimPolicyFromInput(
  input: Record<string, unknown>,
  proofInputs = stringArrayFrom(input.proof_inputs, []),
  proofSources = proofSourcesFrom(input.proof_sources, proofInputs)
): string {
  const inputClaimPolicy = stringFrom(input.claim_policy, "");

  return ["proof-required", "low-proof", "no-claims"].includes(inputClaimPolicy)
    ? inputClaimPolicy
    : proofInputs.length > 0 || proofSources.length > 0
      ? "proof-required"
      : "low-proof";
}
