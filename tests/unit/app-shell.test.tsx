import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the product promise", () => {
    render(<HomePage />);

    expect(
      screen.getByText("Turn product images into a premium landing page"),
    ).toBeInTheDocument();
  });
});
