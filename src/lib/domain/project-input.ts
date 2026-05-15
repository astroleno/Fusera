import { z } from "zod";
import { visualDirectionIdSchema } from "./visual-directions";

const nonEmptyString = z.string().min(1);

export const projectInputSchema = z.object({
  productName: nonEmptyString,
  sellingPoints: z.array(nonEmptyString).min(1),
  targetAudience: nonEmptyString,
  brandKeywords: z.array(nonEmptyString).min(1),
  cta: nonEmptyString,
  visualDirectionId: visualDirectionIdSchema.default("premium-editorial"),
  imageUrls: z.array(z.string().url()).min(1).max(6),
  price: z.string().optional(),
  trustSignals: z.array(nonEmptyString).default([]),
  tone: z.string().optional(),
  referenceUrls: z.array(z.string().url()).default([]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
