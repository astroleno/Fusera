import { randomUUID } from "node:crypto";
import { z } from "zod";

const nonEmptyString = z.string().min(1);
export const proofRefIdSchema = z
  .string()
  .regex(/^proof:[A-Za-z0-9][A-Za-z0-9._:-]*$/);
export const claimRefIdSchema = z
  .string()
  .regex(/^claim:[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const claimPolicySchema = z.enum(["proof-required", "low-proof", "no-claims"]);
const artifactStatusSchema = z.enum([
  "draft",
  "validated",
  "rejected",
  "superseded",
]);

export const artifactEnvelopeSchema = z.object({
  artifact_type: nonEmptyString,
  schema_version: nonEmptyString,
  artifact_id: nonEmptyString,
  run_id: nonEmptyString,
  status: artifactStatusSchema,
  producer_stage: nonEmptyString,
  input_refs: z.array(z.string()),
  validation: z
    .object({
      valid: z.boolean(),
      errors: z.array(z.string()),
    })
    .strict(),
  payload: z.unknown(),
}).strict();

export type ArtifactEnvelope<TPayload> = Omit<
  z.infer<typeof artifactEnvelopeSchema>,
  "payload"
> & {
  payload: TPayload;
};

export const proofRefSchema = z.object({
  proof_ref: proofRefIdSchema,
  claim: nonEmptyString,
  source: nonEmptyString,
  url: z.string().url().nullable(),
}).strict();

export const claimRefSchema = z.object({
  claim_ref: claimRefIdSchema,
  claim: nonEmptyString,
  proof_refs: z.array(proofRefIdSchema),
}).strict();

export const productBriefPayloadSchema = z.object({
  product_name: nonEmptyString,
  audiences: z.array(nonEmptyString).min(1),
  core_problem: nonEmptyString,
  value_props: z.array(nonEmptyString).min(1),
  product_details: z.array(
    z.object({
      label: nonEmptyString,
      value: nonEmptyString,
    }).strict(),
  ),
  cta_goal: nonEmptyString,
  proof_inputs: z.array(z.string()),
  proof_sources: z.array(proofRefSchema),
  claim_refs: z.array(claimRefSchema),
  claim_policy: claimPolicySchema,
}).strict();

export const brandProfilePayloadSchema = z.object({
  brand_traits: z.array(nonEmptyString).min(1),
  tone_keywords: z.array(nonEmptyString).min(1),
  visual_directions: z.array(nonEmptyString).min(1),
  positioning: nonEmptyString,
  do_not_use: z.array(z.string()),
}).strict();

export const pagePlanPayloadSchema = z.object({
  page_goal: nonEmptyString,
  narrative_arc: nonEmptyString,
  section_intents: z
    .array(
      z.object({
        section_id: nonEmptyString,
        intent: nonEmptyString,
      }).strict(),
    )
    .min(1),
  cta_strategy: nonEmptyString,
  proof_strategy: nonEmptyString,
}).strict();

export const sectionGraphPayloadSchema = z.object({
  nodes: z
    .array(
      z
        .object({
          section_id: nonEmptyString,
          section_type: z.enum([
            "hero",
            "problem",
            "features",
            "proof",
            "cta",
            "faq",
          ]),
          title: nonEmptyString,
          props: z.record(z.unknown()),
        })
        .catchall(z.unknown()),
    )
    .min(1),
  edges: z.array(
    z
      .object({
        from: nonEmptyString,
        to: nonEmptyString,
        relationship: nonEmptyString,
      })
      .strict(),
  ),
  section_order: z.array(nonEmptyString).min(1),
  required_props: z.record(z.array(nonEmptyString)),
  proof_bindings: z.array(
    z
      .object({
        section_id: nonEmptyString,
        proof_ref: proofRefIdSchema,
      })
      .strict(),
  ),
  claim_policy: claimPolicySchema,
}).strict();

export const themeTokensPayloadSchema = z.object({
  colors: z
    .object({
      background: nonEmptyString,
      surface: nonEmptyString,
      text: nonEmptyString,
      accent: nonEmptyString,
    })
    .catchall(z.string()),
  typography: z.record(z.unknown()),
  spacing: z.record(z.unknown()),
  radii: z.record(z.unknown()),
  shadows: z.record(z.unknown()),
  motion: z.record(z.unknown()),
}).strict();

export const designSpecPayloadSchema = z.object({
  visual_thesis: nonEmptyString,
  brand_alignment: z
    .object({
      traits: z.array(nonEmptyString).min(1),
      audience: nonEmptyString,
      positioning: nonEmptyString,
    })
    .strict(),
  token_directives: z
    .object({
      color: z.record(z.unknown()),
      typography: z.record(z.unknown()),
      spacing: z.record(z.unknown()),
      radii: z.record(z.unknown()),
      shadows: z.record(z.unknown()),
    })
    .strict(),
  layout_directives: z
    .object({
      variance: z.number().int(),
      rules: z.array(nonEmptyString).min(1),
    })
    .strict(),
  motion_directives: z
    .object({
      intensity: z.number().int(),
      rules: z.array(nonEmptyString).min(1),
    })
    .strict(),
  section_design_intents: z
    .array(
      z
        .object({
          section_id: nonEmptyString,
          layout: nonEmptyString,
          media: nonEmptyString,
          copy: nonEmptyString,
          proof: nonEmptyString,
          motion: nonEmptyString,
        })
        .strict(),
    )
    .min(1),
  claim_and_proof_constraints: z
    .object({
      claim_policy: claimPolicySchema,
      rules: z.array(nonEmptyString).min(1),
    })
    .strict(),
  anti_patterns: z
    .object({
      visual: z.array(nonEmptyString).min(1),
      copy: z.array(nonEmptyString).min(1),
      proof: z.array(nonEmptyString).min(1),
    })
    .strict(),
}).strict();

const sectionDesignIntentSchema = z
  .object({
    layout: nonEmptyString,
    media: nonEmptyString,
    copy: nonEmptyString,
    proof: nonEmptyString,
    motion: nonEmptyString,
  })
  .strict();

export const pageSpecPayloadSchema = z.object({
  route_id: nonEmptyString,
  sections: z
    .array(
      z
        .object({
          section_id: nonEmptyString,
          section_type: nonEmptyString,
          component: nonEmptyString,
          props: z.record(z.unknown()),
          design_intent: sectionDesignIntentSchema,
        })
        .catchall(z.unknown()),
    )
    .min(1),
  token_refs: z.record(z.unknown()),
  asset_refs: z.array(z.string()),
  compile_targets: z.array(z.enum(["preview"])).min(1),
}).strict();

const qaVerdictSchema = z.enum(["pass", "fail", "waived"]);

export const qaReportPayloadSchema = z.object({
  page_spec_ref: nonEmptyString,
  preview_build_ref: nonEmptyString,
  verdict: qaVerdictSchema,
  gate_results: z
    .array(
      z
        .object({
          gate_id: nonEmptyString,
          result: qaVerdictSchema,
          blocking: z.boolean(),
          waivable: z.boolean(),
          evidence_refs: z.array(z.string()),
        })
        .strict(),
    )
    .min(1),
  issues: z.array(
    z
      .object({
        issue_id: nonEmptyString,
        severity: z.enum(["low", "medium", "high", "critical"]),
        category: nonEmptyString,
        repairability: z.enum(["machine-repairable", "manual-only"]),
        blocking: z.boolean(),
        location_ref: z.string(),
        summary: nonEmptyString,
      })
      .strict(),
  ),
  repair_directives: z.array(z.record(z.unknown())),
  evidence_refs: z.array(z.string()),
  waiver: z
    .object({
      actor: nonEmptyString,
      role: z.enum(["release-approver", "admin"]),
      reason: nonEmptyString,
      approved_at: nonEmptyString,
    })
    .strict()
    .nullable(),
}).strict();

export const publishVersionPayloadSchema = z.object({
  publish_version_id: nonEmptyString,
  page_spec_ref: nonEmptyString,
  qa_report_ref: nonEmptyString,
  preview_url: nonEmptyString,
  published_at: nonEmptyString,
  publish_target: z.literal("preview"),
  previous_active_pointer: z.string().min(1).nullable(),
  pointer_transaction_ref: nonEmptyString,
}).strict();

export type ProductBriefPayload = z.infer<typeof productBriefPayloadSchema>;
export type ProofRef = z.infer<typeof proofRefSchema>;
export type ClaimRef = z.infer<typeof claimRefSchema>;
export type BrandProfilePayload = z.infer<typeof brandProfilePayloadSchema>;
export type PagePlanPayload = z.infer<typeof pagePlanPayloadSchema>;
export type SectionGraphPayload = z.infer<typeof sectionGraphPayloadSchema>;
export type ThemeTokensPayload = z.infer<typeof themeTokensPayloadSchema>;
export type DesignSpecPayload = z.infer<typeof designSpecPayloadSchema>;
export type PageSpecPayload = z.infer<typeof pageSpecPayloadSchema>;
export type QAReportPayload = z.infer<typeof qaReportPayloadSchema>;
export type PublishVersionPayload = z.infer<typeof publishVersionPayloadSchema>;

export function createArtifactEnvelope<TPayload>(params: {
  artifactType: string;
  runId: string;
  producerStage: string;
  inputRefs: string[];
  payload: TPayload;
}): ArtifactEnvelope<TPayload> {
  return {
    artifact_type: params.artifactType,
    schema_version: "1.0.0",
    artifact_id: `${params.artifactType.toLowerCase()}_${randomUUID()}`,
    run_id: params.runId,
    status: "validated",
    producer_stage: params.producerStage,
    input_refs: params.inputRefs,
    validation: {
      valid: true,
      errors: [],
    },
    payload: params.payload,
  };
}
