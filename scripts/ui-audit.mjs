import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
const directory = ".ui-audit";
const origin = process.env.UI_AUDIT_ORIGIN || "http://localhost:3000";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
  ...(process.argv.includes("--authenticated")
    ? { storageState: directory + "/session.json" }
    : {}),
});
const page = await context.newPage();
if (!process.argv.includes("--authenticated")) {
  await page.goto(origin + "/login");
  await page.getByLabel("Email", { exact: true }).fill("alex@example.test");
  await page.getByLabel("Password").fill("LocalDemo-Only-2026!");
  await page.getByRole("button", { name: "Sign in locally" }).click();
  await page.waitForURL("**/app");
  await context.storageState({ path: directory + "/session.json" });
}
if (process.argv.includes("--save-session")) {
  await browser.close();
  process.exit(0);
}
await page.goto(origin + "/app");
const href = await page
  .locator("a.project-card")
  .filter({ hasText: "Aurora" })
  .getAttribute("href");
if (!href) throw new Error("Aurora project missing");
const routes = {
  workspace: "/app",
  overview: href,
  purchases: href + "/purchases",
  purchase: href + "/purchases/new",
  transactions: href + "/transactions",
  funding: href + "/transactions/new",
  bills: href + "/bills",
  bill: href + "/bills/new",
  reimbursements: href + "/reimbursements",
  advances: href + "/advances",
  advance: href + "/advances/new",
  requests: href + "/requests",
  request: href + "/requests/new",
  people: href + "/people",
  budgets: href + "/budgets",
  budget: href + "/budgets/new",
  vendors: href + "/vendors",
  vendor: href + "/vendors/new",
  assets: href + "/assets",
  asset: href + "/assets/new",
  reimbursement: href + "/reimbursements/new",
  login: "/login",
  landing: "/",
  invitation: "/invite/not-a-valid-token",
  documents: href + "/documents",
  reports: href + "/reports",
  activity: href + "/activity",
  settings: href + "/settings",
  inbox: "/app/inbox",
  profile: "/app/profile",
  onboarding: "/app/projects/new",
  offline: "/offline",
  notfound: "/not-a-real-page",
};
for (const section of [
  "purchases",
  "bills",
  "reimbursements",
  "advances",
  "requests",
  "budgets",
  "vendors",
  "assets",
  "transactions",
]) {
  await page.goto(origin + href + "/" + section);
  await page.waitForLoadState("networkidle");
  if (await page.locator(".record-title").count()) {
    await page.locator(".record-title").first().click();
    const full = await page
      .getByRole("dialog")
      .getByRole("link", { name: "Open full record" })
      .getAttribute("href");
    if (full) routes[section + "-detail"] = full;
  }
}
const viewports = process.argv.includes("--quick")
  ? [
      [1440, 900],
      [390, 844],
    ]
  : [
      [360, 800],
      [390, 844],
      [430, 932],
      [768, 1024],
      [1366, 768],
      [1440, 900],
      [1920, 1080],
    ];
const only = process.env.UI_AUDIT_ONLY?.split(",");
const results = only
  ? JSON.parse(await readFile(`${directory}/audit.json`, "utf8")).filter(
      (row) => !only.includes(row.name),
    )
  : [];
for (const [width, height] of viewports) {
  await page.setViewportSize({ width, height });
  for (const [name, path] of Object.entries(routes)) {
    if (only && !only.includes(name)) continue;
    const errors = [];
    const onError = (e) => errors.push(e.message);
    page.on("pageerror", onError);
    await page.goto(origin + path);
    await page.waitForLoadState("networkidle");
    if (
      name !== "notfound" &&
      (await page
        .getByRole("heading", { name: "Unable to load this page" })
        .count())
    )
      errors.push("Route error boundary displayed");
    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    await page.screenshot({
      path: `${directory}/${name}-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    page.off("pageerror", onError);
    results.push({ name, width, height, ...overflow, errors });
    await writeFile(
      `${directory}/audit.json`,
      JSON.stringify(results, null, 2),
    );
    console.log(
      `${name} ${width}: ${overflow.document > width ? "OVERFLOW" : "ok"}${errors.length ? " ERROR " + errors.join(",") : ""}`,
    );
  }
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(origin + href);
await page.getByRole("button", { name: "Toggle theme" }).click();
await page.screenshot({
  path: `${directory}/overview-dark.png`,
  fullPage: true,
  animations: "disabled",
});
await writeFile(`${directory}/audit.json`, JSON.stringify(results, null, 2));
await browser.close();
if (results.some((r) => r.document > r.width || r.errors.length))
  process.exitCode = 1;
