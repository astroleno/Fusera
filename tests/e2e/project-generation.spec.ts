import { expect, test } from "@playwright/test";

test("intake and preview routes render", async ({ page }) => {
  await page.goto("/projects/new");
  await expect(
    page.getByRole("heading", { name: "Start a new landing page" }),
  ).toBeVisible();
  await expect(page.getByLabel("Product name")).toBeVisible();

  await page.goto("/projects/demo-project");
  await expect(
    page.getByText(/Generation has not finished yet|Generated page/),
  ).toBeVisible();
});
