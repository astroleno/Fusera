import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  single: vi.fn(),
  in: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { loadProjectPreview } from "@/lib/projects/load-project-preview";

const sectionGraphPayload = {
  nodes: [
    {
      section_id: "hero",
      section_type: "hero",
      title: "Atlas Bottle",
      props: {
        headline: "Atlas Bottle",
        cta_label: "Shop now",
        image_urls: ["https://example.com/product.jpg"],
      },
    },
  ],
  edges: [],
  section_order: ["hero"],
  required_props: {
    hero: ["headline", "cta_label", "image_urls"],
  },
  proof_bindings: [],
  claim_policy: "low-proof",
};

const themeTokensPayload = {
  colors: {
    background: "#f7f3ec",
    surface: "#fffaf2",
    text: "#171513",
    accent: "#315f52",
  },
  typography: {},
  spacing: {},
  radii: {},
  shadows: {},
  motion: {},
};

describe("loadProjectPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compiles the latest completed run artifacts", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "run_01",
          latest_section_graph_ref: "section-graph_01",
          latest_theme_tokens_ref: "theme-tokens_01",
        },
        error: null,
      }),
    };
    const artifactQuery = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [
          { artifact_type: "SectionGraph", payload: sectionGraphPayload },
          { artifact_type: "ThemeTokens", payload: themeTokensPayload },
        ],
        error: null,
      }),
    };

    mocks.from.mockReturnValueOnce(runQuery).mockReturnValueOnce(artifactQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const page = await loadProjectPreview("project_01");

    expect(page?.sections[0]).toMatchObject({
      key: "hero:hero",
      sectionType: "hero",
    });
    expect(page?.theme.colors.accent).toBe("#315f52");
  });

  it("returns null when no completed run exists", async () => {
    const runQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "not found" },
      }),
    };

    mocks.from.mockReturnValue(runQuery);
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    await expect(loadProjectPreview("project_missing")).resolves.toBeNull();
  });
});
