import type {
  PageSpecPayload,
  SectionGraphPayload,
  ThemeTokensPayload,
} from "@/lib/domain/page-artifacts";

export type AntiSlopFinding = {
  issue_id: string;
  severity: "low" | "medium" | "high" | "critical";
  category:
    | "artifact-binding"
    | "claims"
    | "contrast"
    | "conversion"
    | "proof-binding"
    | "visual-style";
  blocking: boolean;
  location_ref: string;
  summary: string;
};

export type LandingAntiSlopInput = {
  sectionGraph: SectionGraphPayload;
  themeTokens: ThemeTokensPayload;
  pageSpec?: PageSpecPayload;
  proofInputs?: string[];
};

const suspiciousClaimPattern =
  /\b(\d+[\d,.]*\s*(%|reviews?|customers?|units?|sold|stars?|rating)|certified|certification|award[- ]?winning|winner|guaranteed|discount|off|as seen in)\b/i;

function textValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(textValues);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(textValues);
  }

  return [];
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseHexColor(value: string) {
  const match = value.trim().match(/^#([0-9a-f]{6})$/i);

  if (!match) {
    return null;
  }

  const raw = match[1];
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

function relativeLuminance(color: { r: number; g: number; b: number }) {
  const channel = [color.r, color.g, color.b].map((component) => {
    const value = component / 255;
    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return channel[0] * 0.2126 + channel[1] * 0.7152 + channel[2] * 0.0722;
}

function contrastRatio(first: string, second: string) {
  const firstColor = parseHexColor(first);
  const secondColor = parseHexColor(second);

  if (!firstColor || !secondColor) {
    return null;
  }

  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function hueDegrees(color: { r: number; g: number; b: number }) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) {
    return { hue: 0, saturation: 0 };
  }

  let hue = 0;

  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  hue *= 60;

  if (hue < 0) {
    hue += 360;
  }

  return {
    hue,
    saturation: delta / (1 - Math.abs(max + min - 1)),
  };
}

export function lintLandingPageAntiSlop({
  sectionGraph,
  themeTokens,
  pageSpec,
  proofInputs = [],
}: LandingAntiSlopInput): AntiSlopFinding[] {
  const findings: AntiSlopFinding[] = [];
  const suppliedProof = new Set(proofInputs.map(normalizeText));
  const sections = pageSpec?.sections ?? sectionGraph.nodes;
  const hero = sections.find((section) => section.section_id === "hero");
  const cta = sections.find((section) => section.section_type === "cta");
  const heroCta =
    hero?.props &&
    typeof hero.props.cta_label === "string" &&
    hero.props.cta_label.trim();
  const closingCta =
    cta?.props &&
    typeof cta.props.cta_label === "string" &&
    cta.props.cta_label.trim();

  if (!heroCta && !closingCta) {
    findings.push({
      issue_id: "landing-cta-missing",
      severity: "high",
      category: "conversion",
      blocking: true,
      location_ref: "section:hero",
      summary: "Landing page has no clear hero or closing CTA.",
    });
  }

  for (const [colorName, colorValue] of Object.entries(themeTokens.colors)) {
    const parsed = parseHexColor(colorValue);

    if (!parsed) {
      continue;
    }

    const { hue, saturation } = hueDegrees(parsed);

    if (hue >= 220 && hue <= 285 && saturation > 0.28) {
      findings.push({
        issue_id: `default-purple-blue-${colorName}`,
        severity: "medium",
        category: "visual-style",
        blocking: false,
        location_ref: `theme.colors.${colorName}`,
        summary:
          "ThemeTokens include a purple-blue default color; use a commerce-specific palette.",
      });
    }
  }

  const contrastChecks = [
    {
      id: "text-background",
      foreground: themeTokens.colors.text,
      background: themeTokens.colors.background,
      location_ref: "theme.colors.background",
    },
    {
      id: "text-surface",
      foreground: themeTokens.colors.text,
      background: themeTokens.colors.surface,
      location_ref: "theme.colors.surface",
    },
  ];

  for (const check of contrastChecks) {
    const ratio = contrastRatio(check.foreground, check.background);

    if (ratio !== null && ratio < 4.5) {
      findings.push({
        issue_id: `contrast-${check.id}`,
        severity: "high",
        category: "contrast",
        blocking: true,
        location_ref: check.location_ref,
        summary: `Text contrast ratio is ${ratio.toFixed(2)}; expected at least 4.5.`,
      });
    }
  }

  sectionGraph.nodes.forEach((section) => {
    textValues(section.props).forEach((text) => {
      if (!suspiciousClaimPattern.test(text)) {
        return;
      }

      if (suppliedProof.has(normalizeText(text))) {
        return;
      }

      findings.push({
        issue_id: `unverified-claim-${section.section_id}-${findings.length + 1}`,
        severity: "medium",
        category: "claims",
        blocking: false,
        location_ref: `section:${section.section_id}`,
        summary: `Potentially unverified commercial claim: "${text}".`,
      });
    });
  });

  return findings;
}
