import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  trigger: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

vi.mock("@/trigger/generate-page", () => ({
  generatePageTask: {
    trigger: mocks.trigger,
  },
}));

import { POST } from "@/app/api/projects/[projectId]/generate/route";

const validIntake = {
  productName: "Atlas Bottle",
  sellingPoints: ["Leak-proof", "Insulated"],
  targetAudience: "Urban commuters",
  brandKeywords: ["sleek", "confident"],
  cta: "Shop now",
  visualDirectionId: "premium-editorial",
  imageUrls: ["https://example.com/product.jpg"],
  trustSignals: [],
  referenceUrls: [],
};

describe("POST /api/projects/[projectId]/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues generation for valid stored intake", async () => {
    mocks.single.mockResolvedValue({
      data: { intake: validIntake },
      error: null,
    });
    mocks.eq.mockReturnValue({ single: mocks.single });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });
    mocks.trigger.mockResolvedValue({ id: "trigger_run_01" });

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_01" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "queued", runHandleId: "trigger_run_01" });
    expect(mocks.from).toHaveBeenCalledWith("projects");
    expect(mocks.trigger).toHaveBeenCalledWith({
      projectId: "project_01",
      intake: {
        ...validIntake,
        productDetails: [],
        proofSources: [],
      },
    });
  });

  it("returns 422 when stored intake is malformed", async () => {
    mocks.single.mockResolvedValue({
      data: { intake: { productName: "" } },
      error: null,
    });
    mocks.eq.mockReturnValue({ single: mocks.single });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });

    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project_bad" }),
    });

    expect(response.status).toBe(422);
    expect(mocks.trigger).not.toHaveBeenCalled();
  });
});
