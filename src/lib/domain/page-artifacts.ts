import { randomUUID } from "node:crypto";
import { z } from "zod";

const nonEmptyString = z.string().min(1);
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

export const productBriefPayloadSchema = z.object({
  product_name: nonEmptyString,
  audiences: z.array(nonEmptyString).min(1),
  core_problem: nonEmptyString,
  value_props: z.array(nonEmptyString).min(1),
  cta_goal: nonEmptyString,
  proof_inputs: z.array(z.string()),
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
        proof_ref: nonEmptyString,
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

export type ProductBriefPayload = z.infer<typeof productBriefPayloadSchema>;
export type BrandProfilePayload = z.infer<typeof brandProfilePayloadSchema>;
export type PagePlanPayload = z.infer<typeof pagePlanPayloadSchema>;
export type SectionGraphPayload = z.infer<typeof sectionGraphPayloadSchema>;
export type ThemeTokensPayload = z.infer<typeof themeTokensPayloadSchema>;

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
