import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PagePreview from "@/components/editor/page-preview";

describe("PagePreview", () => {
  it("renders compiled hero and CTA sections", () => {
    render(
      <PagePreview
        page={{
          theme: {
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
          },
          sections: [
            {
              key: "hero:hero",
              sectionId: "hero",
              sectionType: "hero",
              title: "Atlas Bottle",
              props: {
                headline: "Atlas Bottle",
                subhead: "Leak-proof",
                cta_label: "Shop now",
              },
            },
            {
              key: "problem:buyer-fit",
              sectionId: "buyer-fit",
              sectionType: "problem",
              title: "Built for Urban commuters",
              props: {
                headline: "Built for Urban commuters",
                body: "Useful on train rides and at office desks.",
                supporting_points: ["Leak-proof"],
              },
            },
            {
              key: "cta:cta",
              sectionId: "cta",
              sectionType: "cta",
              title: "Shop now",
              props: {
                cta_label: "Shop now",
              },
            },
            {
              key: "faq:details",
              sectionId: "details",
              sectionType: "faq",
              title: "Product details",
              props: {
                items: ["Capacity: 24 oz"],
              },
            },
            {
              key: "proof:proof",
              sectionId: "proof",
              sectionType: "proof",
              title: "Proof points",
              props: {
                trust_signals: ["500+ reviews"],
                proof_source_labels: ["500+ reviews - Review export"],
              },
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Atlas Bottle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Built for Urban commuters" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Leak-proof").length).toBeGreaterThan(0);
    expect(screen.getByText("Capacity: 24 oz")).toBeInTheDocument();
    expect(screen.getByText("500+ reviews - Review export")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Shop now" }).length,
    ).toBeGreaterThan(0);
  });
});
