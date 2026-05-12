import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  task: vi.fn((definition) => definition),
}));

vi.mock("@trigger.dev/sdk/v3", () => ({
  task: mocks.task,
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { generatePageTask } from "@/trigger/generate-page";

const validIntake = {
  productName: "Atlas Bottle",
  sellingPoints: ["Leak-proof", "Insulated"],
  targetAudience: "Urban commuters",
  brandKeywords: ["sleek", "confident"],
  cta: "Shop now",
  imageUrls: ["https://example.com/product.jpg"],
  trustSignals: ["500+ reviews"],
  referenceUrls: [],
};

describe("generatePageTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists DesignSpec and stores the latest DesignSpec ref", async () => {
    const runQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "run_test_01" },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    const artifactsQuery = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    const from = vi.fn((table: string) => {
      if (table === "generation_runs") {
        return runQuery;
      }

      if (table === "artifacts") {
        return artifactsQuery;
      }

      throw new Error(`Unexpected table ${table}`);
    });

    mocks.createDbClient.mockResolvedValue({ from });

    const taskRunner = generatePageTask as unknown as {
      run: (payload: {
        projectId: string;
        intake: typeof validIntake;
      }) => Promise<{
        latestRefs: {
          designSpecRef: string;
        };
      }>;
    };

    const result = await taskRunner.run({
      projectId: "project_01",
      intake: validIntake,
    });

    const artifactRows = artifactsQuery.insert.mock.calls[0][0];
    const rowsByType = Object.fromEntries(
      artifactRows.map((row: { artifact_type: string }) => [
        row.artifact_type,
        row,
      ]),
    );

    expect(Object.keys(rowsByType).sort()).toEqual([
      "BrandProfile",
      "DesignSpec",
      "PagePlan",
      "ProductBrief",
      "SectionGraph",
      "ThemeTokens",
    ]);
    expect(rowsByType.DesignSpec).toMatchObject({
      artifact_id: result.latestRefs.designSpecRef,
      project_id: "project_01",
      run_id: "run_test_01",
      artifact_type: "DesignSpec",
      producer_stage: "design-spec-pass",
      status: "validated",
      validation: { valid: true, errors: [] },
    });
    expect(rowsByType.DesignSpec.input_refs).toEqual([
      rowsByType.ProductBrief.artifact_id,
      rowsByType.BrandProfile.artifact_id,
      rowsByType.PagePlan.artifact_id,
      rowsByType.SectionGraph.artifact_id,
      rowsByType.ThemeTokens.artifact_id,
    ]);
    expect(runQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        latest_design_spec_ref: result.latestRefs.designSpecRef,
      }),
    );
  });
});
