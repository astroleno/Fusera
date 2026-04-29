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
              key: "cta:cta",
              sectionId: "cta",
              sectionType: "cta",
              title: "Shop now",
              props: {
                cta_label: "Shop now",
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
      screen.getAllByRole("button", { name: "Shop now" }).length,
    ).toBeGreaterThan(0);
  });
});
