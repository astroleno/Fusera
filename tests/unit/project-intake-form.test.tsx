import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectIntakeForm from "@/components/intake/project-intake-form";

describe("ProjectIntakeForm", () => {
  it("renders the required fields", () => {
    render(<ProjectIntakeForm />);

    expect(screen.getByLabelText("Product name")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary CTA")).toBeInTheDocument();
  });
});
