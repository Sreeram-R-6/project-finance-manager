import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("local authenticated financial journey", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("alex@example.test");
  await page.getByLabel("Password").fill("LocalDemo-Only-2026!");
  await page.getByRole("button", { name: "Sign in locally" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("link", { name: "Create project", exact: true }).click();
  await page.getByLabel("Project name").fill("Acceptance " + Date.now());
  await page.getByLabel("Project code").fill("TEST");
  await page.getByLabel("Opening balance").fill("5000");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.getByText("₹5,000.00").first()).toBeVisible();
  await page.getByRole("link", { name: "Add purchase", exact: true }).click();
  await page.getByLabel("Item", { exact: true }).fill("Acceptance expense");
  await page.getByLabel("Unit price").fill("620");
  await page.getByRole("button", { name: "Me", exact: true }).click();
  await page.getByLabel("Receipt or invoice").setInputFiles({
    name: "acceptance-receipt.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aCFEAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(
    page.getByRole("button", { name: "Complete purchase" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /acceptance-receipt.png/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Complete purchase" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  const base = new URL(page.url()).pathname.split("/purchases/")[0];
  await page.goto(base + "/people");
  await page.getByText("Invite a teammate", { exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill("teammate@example.test");
  await page
    .getByRole("button", { name: "Create and copy invite link" })
    .click();
  await expect(page.getByLabel("Invitation link")).toHaveValue(/\/invite\//);
  await page.goto(base + "/transactions/new");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Acceptance funding tranche");
  await page.getByLabel("Amount (INR)", { exact: true }).fill("100");
  await page.getByLabel("Funding source").selectOption({ index: 1 });
  await page.getByLabel("Project cash account").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Complete transaction" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page).toHaveURL(/\/transactions\/[a-f0-9-]+$/);
  await page.goto(base + "/reimbursements");
  await expect(page.getByText("₹620.00").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Request reimbursement", exact: true })
    .click();
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await page.getByText("Record a payment", { exact: true }).click();
  await page.getByLabel("Amount (INR)", { exact: true }).fill("400");
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(
    page.getByText("Partly paid", { exact: true }).first(),
  ).toBeVisible();
  await page.goto(base + "/bills/new");
  await page.getByLabel("Name / description").fill("Acceptance vendor bill");
  await page.getByLabel("Amount (INR)", { exact: true }).fill("1200");
  await page.getByLabel("Due date", { exact: true }).fill("2026-12-01");
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByRole("button", { name: "Confirm bill" }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await page.getByText("Record a payment", { exact: true }).click();
  await page.getByLabel("Amount (INR)", { exact: true }).fill("400");
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(
    page.getByText("Partly paid", { exact: true }).first(),
  ).toBeVisible();
  await page.goto(base + "/documents");
  await page.getByLabel("Recipient", { exact: true }).fill("Finance Office");
  await page
    .getByRole("group", { name: "Include source records" })
    .getByRole("checkbox")
    .first()
    .check();
  await page.getByRole("button", { name: "Generate preview" }).click();
  await expect(page.getByRole("link", { name: "Download PDF" })).toBeVisible();
  await expect(page.locator(".document-preview")).toContainText("\u20b9220.00");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PDF" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toContain(".pdf");
  await file.saveAs(`test-results/letter-${test.info().project.name}.pdf`);
  await page.screenshot({
    path: `test-results/document-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.goto(base + "/reports");
  await expect(
    page.getByRole("button", { name: "Export complete CSV" }),
  ).toBeVisible();
  const pack = await page.request.post(
    `/api/projects/${base.split("/")[3]}/finance-pack`,
    { headers: { Origin: new URL(page.url()).origin } },
  );
  expect(pack.ok()).toBe(true);
  const packData = await pack.json();
  const packed = page.waitForEvent("download");
  await page.evaluate((id) => {
    const link = document.createElement("a");
    link.href = `/api/documents/${id}/pdf`;
    link.click();
  }, packData.id);
  const packFile = await packed;
  await packFile.saveAs(
    `test-results/finance-pack-${test.info().project.name}.pdf`,
  );
  const accessibility = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("button", { name: "Add", exact: true }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
