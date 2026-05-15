import { z } from "zod";
import { visualDirectionIdSchema } from "./visual-directions";

const nonEmptyString = z.string().min(1);
const productDetailSchema = z.object({
  label: nonEmptyString,
  value: nonEmptyString,
}).strict();
const proofSourceSchema = z.object({
  claim: nonEmptyString,
  source: nonEmptyString,
  url: z.string().url().optional(),
}).strict();

export const projectInputSchema = z.object({
  productName: nonEmptyString,
  sellingPoints: z.array(nonEmptyString).min(1),
  productDetails: z.array(productDetailSchema).default([]),
  targetAudience: nonEmptyString,
  brandKeywords: z.array(nonEmptyString).min(1),
  cta: nonEmptyString,
  visualDirectionId: visualDirectionIdSchema.default("premium-editorial"),
  imageUrls: z.array(z.string().url()).min(1).max(6),
  price: z.string().optional(),
  trustSignals: z.array(nonEmptyString).default([]),
  proofSources: z.array(proofSourceSchema).default([]),
  tone: z.string().optional(),
  referenceUrls: z.array(z.string().url()).default([]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
