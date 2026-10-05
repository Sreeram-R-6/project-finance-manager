import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("production shell installs and offline drafts persist without posting", async ({
  page,
  context,
}) => {
  await page.goto("/offline");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  await context.setOffline(true);
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Offline purchase drafts" }),
  ).toBeVisible();
  await page
    .getByLabel("Project", { exact: true })
    .fill("20000000-0000-0000-0000-000000000001");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Persisted offline receipt draft");
  await page.getByLabel("Amount", { exact: true }).fill("12.34");
  await page
    .getByRole("button", { name: "Save offline draft", exact: true })
    .click();
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Persisted offline receipt draft", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(async () => {
      const c = await caches.open("pfm-shell-v1");
      return (await c.keys()).some((r) =>
        /\/api\/|\/app$/.test(new URL(r.url).pathname),
      );
    }),
  ).toBe(false);
  await context.setOffline(false);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
  await page.screenshot({
    path: `test-results/pwa-${test.info().project.name}.png`,
    fullPage: true,
  });
});
