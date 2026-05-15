import { z } from "zod";
import type { ThemeTokensPayload } from "./page-artifacts";

export const visualDirectionIds = [
  "premium-editorial",
  "marketplace-clean",
  "performance-ad",
  "social-commerce",
] as const;

export const visualDirectionIdSchema = z.enum(visualDirectionIds);

export type VisualDirectionId = z.infer<typeof visualDirectionIdSchema>;

export type VisualDirectionPreset = {
  id: VisualDirectionId;
  name: string;
  bestFor: string;
  themeTokens: ThemeTokensPayload;
  designDirectives: {
    visualThesis: string;
    layoutRules: string[];
    copyDensity: "restrained" | "balanced" | "dense" | "social";
    proofStyle: string;
    imageTreatment: string;
  };
};

export const visualDirectionPresets: Record<
  VisualDirectionId,
  VisualDirectionPreset
> = {
  "premium-editorial": {
    id: "premium-editorial",
    name: "Premium editorial",
    bestFor: "Beauty, home, fashion, and premium DTC landing pages",
    themeTokens: {
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
    },
    designDirectives: {
      visualThesis:
        "Editorial product-first page with quiet luxury, spacious copy, and proof that does not overpower the product.",
      layoutRules: [
        "Open with a large product-led hero and restrained supporting copy.",
        "Use fewer but more confident benefit blocks.",
        "Keep proof close to the CTA without making it feel like a badge wall.",
      ],
      copyDensity: "restrained",
      proofStyle: "Short provenance or warranty notes, no inflated metrics.",
      imageTreatment: "Large product crops, soft natural surfaces, premium whitespace.",
    },
  },
  "marketplace-clean": {
    id: "marketplace-clean",
    name: "Marketplace clean",
    bestFor: "Amazon, Shopify listing, B2B product clarity, and comparison-led pages",
    themeTokens: {
      colors: {
        background: "#f4f7f4",
        surface: "#ffffff",
        text: "#14211d",
        accent: "#236353",
        signal: "#f0b84f",
      },
      typography: {
        display: { fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
        body: { fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
      },
      spacing: {
        page: "clamp(20px, 4vw, 56px)",
        section: "clamp(32px, 6vw, 64px)",
      },
      radii: {
        control: "6px",
        pill: "999px",
      },
      shadows: {
        preview: "0 18px 45px rgba(20, 33, 29, 0.12)",
      },
      motion: {
        hover: "140ms ease",
        focus: "120ms ease",
      },
    },
    designDirectives: {
      visualThesis:
        "Clean commerce page optimized for scannability, product facts, and low-friction comparison.",
      layoutRules: [
        "Keep section headings direct and benefit-led.",
        "Use compact spacing and plain proof rows for fast scanning.",
        "Prioritize specifications, use cases, and CTA clarity.",
      ],
      copyDensity: "balanced",
      proofStyle: "Plain source-backed facts and warranty/service details.",
      imageTreatment: "Crisp product render, clean background, visible details.",
    },
  },
  "performance-ad": {
    id: "performance-ad",
    name: "Performance ad",
    bestFor: "Campaign pages, offer-led products, and high-conversion landing pages",
    themeTokens: {
      colors: {
        background: "#fff8e6",
        surface: "#fffbf0",
        text: "#111713",
        accent: "#145c42",
        signal: "#f2c94c",
      },
      typography: {
        display: { fontFamily: "Arial Black, Impact, ui-sans-serif, sans-serif" },
        body: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
      },
      spacing: {
        page: "clamp(18px, 4vw, 48px)",
        section: "clamp(28px, 5vw, 56px)",
      },
      radii: {
        control: "4px",
        pill: "999px",
      },
      shadows: {
        preview: "0 22px 60px rgba(16, 24, 20, 0.28)",
      },
      motion: {
        hover: "120ms ease-out",
        focus: "120ms ease",
      },
    },
    designDirectives: {
      visualThesis:
        "Conversion-first page with strong CTA contrast, sharper benefit hierarchy, and compact proof near action.",
      layoutRules: [
        "Lead with a bold concrete benefit and immediate CTA.",
        "Keep benefits punchy and close to the hero.",
        "Use high-contrast CTA treatment and avoid decorative ambiguity.",
      ],
      copyDensity: "dense",
      proofStyle: "Use only supplied proof, rendered as compact conversion support.",
      imageTreatment: "High-contrast product silhouette or use-case image with clear focal point.",
    },
  },
  "social-commerce": {
    id: "social-commerce",
    name: "Social commerce",
    bestFor: "TikTok, Instagram, Xiaohongshu, lifestyle products, and UGC-led pages",
    themeTokens: {
      colors: {
        background: "#fff6ef",
        surface: "#ffffff",
        text: "#22191a",
        accent: "#c23b53",
        signal: "#37b6a7",
      },
      typography: {
        display: { fontFamily: "Avenir Next, ui-sans-serif, system-ui, sans-serif" },
        body: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
      },
      spacing: {
        page: "clamp(20px, 5vw, 56px)",
        section: "clamp(34px, 6vw, 68px)",
      },
      radii: {
        control: "8px",
        pill: "999px",
      },
      shadows: {
        preview: "0 20px 56px rgba(34, 25, 26, 0.16)",
      },
      motion: {
        hover: "160ms ease-out",
        focus: "140ms ease",
      },
    },
    designDirectives: {
      visualThesis:
        "Lifestyle commerce page that feels discoverable, human, and product-centered without inventing social proof.",
      layoutRules: [
        "Open with a lifestyle outcome and product use moment.",
        "Keep copy conversational but grounded in supplied facts.",
        "Show proof as source-aware notes rather than fake review energy.",
      ],
      copyDensity: "social",
      proofStyle: "Source-aware quotes or community notes only when supplied.",
      imageTreatment: "Lifestyle product use, warm surfaces, and visible product context.",
    },
  },
};

export function resolveVisualDirectionPreset(
  id: VisualDirectionId = "premium-editorial",
) {
  return visualDirectionPresets[id];
}
