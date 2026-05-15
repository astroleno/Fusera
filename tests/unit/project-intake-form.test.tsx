import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProjectIntakeForm from "@/components/intake/project-intake-form";

const router = {
  push: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

describe("ProjectIntakeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the required fields", () => {
    render(<ProjectIntakeForm />);

    expect(screen.getByLabelText("Product name")).toBeInTheDocument();
    expect(screen.getByLabelText("Product details")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary CTA")).toBeInTheDocument();
    expect(screen.getByLabelText("Proof sources")).toBeInTheDocument();
    expect(screen.getByLabelText("Visual direction")).toBeInTheDocument();
  });

  it("creates a project, starts generation, and redirects to preview", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projectId: "project_01" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "queued", runHandleId: "trigger_01" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<ProjectIntakeForm />);

    fireEvent.change(screen.getByLabelText("Product name"), {
      target: { value: "Atlas Bottle" },
    });
    fireEvent.change(screen.getByLabelText("Target audience"), {
      target: { value: "Urban commuters" },
    });
    fireEvent.change(screen.getByLabelText("Selling points"), {
      target: { value: "Leak-proof\nInsulated" },
    });
    fireEvent.change(screen.getByLabelText("Product details"), {
      target: { value: "Capacity: 24 oz" },
    });
    fireEvent.change(screen.getByLabelText("Brand keywords"), {
      target: { value: "sleek\nconfident" },
    });
    fireEvent.change(screen.getByLabelText("Image URLs"), {
      target: { value: "https://example.com/product.jpg" },
    });
    fireEvent.change(screen.getByLabelText("Primary CTA"), {
      target: { value: "Shop now" },
    });
    fireEvent.change(screen.getByLabelText("Trust signals"), {
      target: { value: "500+ reviews" },
    });
    fireEvent.change(screen.getByLabelText("Proof sources"), {
      target: {
        value:
          "500+ reviews | Review export supplied by brand | https://example.com/reviews",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/projects",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/projects/project_01/generate",
        expect.objectContaining({ method: "POST" }),
      );
      expect(router.push).toHaveBeenCalledWith("/projects/project_01");
    });

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      productName: "Atlas Bottle",
      productDetails: [{ label: "Capacity", value: "24 oz" }],
      trustSignals: ["500+ reviews"],
      proofSources: [
        {
          claim: "500+ reviews",
          source: "Review export supplied by brand",
          url: "https://example.com/reviews",
        },
      ],
    });
  });
});
