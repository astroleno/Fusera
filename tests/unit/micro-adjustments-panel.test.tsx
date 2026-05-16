import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MicroAdjustmentsPanel from "@/components/editor/micro-adjustments-panel";

describe("MicroAdjustmentsPanel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders bounded regeneration controls", () => {
    render(<MicroAdjustmentsPanel projectId="project_01" />);

    expect(
      screen.getByRole("button", { name: "Regenerate hero" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Regenerate theme" }),
    ).toBeInTheDocument();
  });

  it("records returned-to-modify intent before regeneration", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MicroAdjustmentsPanel
        projectId="project_01"
        runId="11111111-1111-4111-8111-111111111111"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Regenerate hero" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/projects/project_01/intent",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("returned_to_modify"),
        }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/projects/project_01/regenerate",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ scope: "hero" }),
        }),
      );
    });
  });
});
