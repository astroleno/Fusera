import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CommercialIntentWorkbench from "@/components/editor/commercial-intent-workbench";

const runId = "11111111-1111-4111-8111-111111111111";

describe("CommercialIntentWorkbench", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records publish-ready views and export intent", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CommercialIntentWorkbench
        projectId="project_01"
        runId={runId}
        pageSpecRef="page-spec_01"
        qaReportRef="qa-report_01"
        publishReady={true}
        qaFailureReason={null}
      />,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/projects/project_01/intent",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("publish_ready_viewed"),
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Record export intent" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/projects/project_01/intent",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("export_clicked"),
        }),
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Recorded");
  });

  it("records QA failure reasons and disables export intent", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CommercialIntentWorkbench
        projectId="project_01"
        runId={runId}
        pageSpecRef="page-spec_01"
        qaReportRef="qa-report_01"
        publishReady={false}
        qaFailureReason="ClaimRef claim:1 has no matching ProofRef."
      />,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/projects/project_01/intent",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("qa_failed_reason"),
        }),
      );
    });
    expect(
      screen.getByRole("button", { name: "Record export intent" }),
    ).toBeDisabled();
  });
});
