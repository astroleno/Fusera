import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MicroAdjustmentsPanel from "@/components/editor/micro-adjustments-panel";

describe("MicroAdjustmentsPanel", () => {
  it("renders bounded regeneration controls", () => {
    render(<MicroAdjustmentsPanel projectId="project_01" />);

    expect(
      screen.getByRole("button", { name: "Regenerate hero" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Regenerate theme" }),
    ).toBeInTheDocument();
  });
});
