import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("project presentation, personal payment, receipts and accessible drawers", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in locally" }).click();
  await expect(page).toHaveURL(/\/app$/);
  const project = await page
    .locator("a.project-card")
    .filter({ hasText: "Project Aurora" })
    .getAttribute("href");
  expect(project).toBeTruthy();
  await page.goto(project!);
  await expect(page.locator(".hero-number")).toContainText("\u20b9");
  await expect(
    page.getByRole("heading", { name: "Needs your attention" }),
  ).toBeVisible();
  const motion = await page
    .locator(".ambient-blob")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(motion).toBe("none");
  await page.locator(".project-switcher > summary").click();
  await expect(
    page.locator(".switcher-menu").getByText("Available").first(),
  ).toBeVisible();
  await page.locator(".project-switcher > summary").click();
  await page.goto(project + "/purchases/new");
  await page.getByLabel("Item", { exact: true }).fill("Receipt preview check");
  await page.getByLabel("Unit price").fill("6200");
  await page.getByRole("button", { name: "Me", exact: true }).click();
  await expect(page.locator(".personal-notice")).toContainText(
    "\u20b96,200.00",
  );
  await expect(page.locator(".personal-notice")).toContainText("Alex Kumar");
  await page.getByLabel("Receipt or invoice").setInputFiles({
    name: "receipt.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aCFEAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(
    page.getByAltText("Selected receipt: receipt.png"),
  ).toBeVisible();
  await expect(
    page.getByText("Ready to upload", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove receipt.png" }).click();
  await expect(page.locator(".receipt-preview")).toHaveCount(0);
  await page.getByRole("button", { name: "Save on device" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Draft saved on this device",
  );
  await page.goto(project + "/purchases");
  const mobile = test.info().project.name === "mobile";
  await (
    mobile
      ? page.locator(".mobile-record").first()
      : page.locator(".record-title").first()
  ).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Open full record" }),
  ).toBeVisible();
  const accessibility = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
