import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDbClient: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eqRun: vi.fn(),
  eqProject: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createDbClient: mocks.createDbClient,
}));

import { POST } from "@/app/api/projects/[projectId]/intent/route";

const runId = "11111111-1111-4111-8111-111111111111";

describe("POST /api/projects/[projectId]/intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insert.mockResolvedValue({ error: null });
    mocks.eqProject.mockResolvedValue({ error: null });
    mocks.eqRun.mockReturnValue({ eq: mocks.eqProject });
    mocks.update.mockReturnValue({ eq: mocks.eqRun });
    mocks.from.mockImplementation((table: string) => {
      if (table === "project_intent_events") {
        return { insert: mocks.insert };
      }

      return { update: mocks.update };
    });
    mocks.createDbClient.mockResolvedValue({ from: mocks.from });
  });

  it("records export intent without changing review state", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          eventType: "export_clicked",
          runId,
          pageSpecRef: "page-spec_01",
          qaReportRef: "qa-report_01",
          metadata: { source: "review-workbench" },
        }),
      }),
      { params: Promise.resolve({ projectId: "project_01" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      status: "recorded",
      eventType: "export_clicked",
      reviewState: null,
    });
    expect(mocks.insert).toHaveBeenCalledWith({
      project_id: "project_01",
      run_id: runId,
      event_type: "export_clicked",
      metadata: {
        source: "review-workbench",
        pageSpecRef: "page-spec_01",
        qaReportRef: "qa-report_01",
        reason: null,
      },
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("records review decisions and updates the latest run review state", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          eventType: "revision_requested",
          runId,
          reason: "Hero copy needs stronger buyer language.",
        }),
      }),
      { params: Promise.resolve({ projectId: "project_01" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.reviewState).toBe("needs_changes");
    expect(mocks.update).toHaveBeenCalledWith({ review_state: "needs_changes" });
    expect(mocks.eqRun).toHaveBeenCalledWith("id", runId);
    expect(mocks.eqProject).toHaveBeenCalledWith("project_id", "project_01");
  });

  it("rejects unknown intent events", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          eventType: "poster_runtime_requested",
        }),
      }),
      { params: Promise.resolve({ projectId: "project_01" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
