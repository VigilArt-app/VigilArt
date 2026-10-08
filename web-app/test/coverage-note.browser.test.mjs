import assert from "node:assert/strict";
import { before, after, test } from "node:test";

// Run separately against the dev server; PLAYWRIGHT_MODULE can point to an
// existing tool installation without adding a browser dependency to the app.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "@playwright/test");
const origin = process.env.HYDRATION_TEST_URL ?? "http://127.0.0.1:3130";
const note = "Ce scan n’est pas exhaustif : certains contenus peuvent ne pas être détectés.";
const userId = "00000000-0000-4000-8000-000000000001";
const match = { id: "page-1", artworkId: "fixture", url: "https://example.invalid/art", websiteName: "Known source", pageTitle: "Known match", category: "OTHER", firstDetectedAt: "2026-09-01T00:00:00Z" };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
// Stands in for Cloudflare's script: the site key in .env makes the scan
// button wait for a token.
const fakeTurnstile = "window.turnstile={render:(el,o)=>{setTimeout(()=>o.callback('test-token'));return 'w'},remove(){},reset(){}};";
let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN ?? "/usr/bin/chromium-browser" }); });
after(async () => { await browser?.close(); });

const json = (route, data) => route.fulfill({ json: { success: true, statusCode: 200, data }, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" } });

const openContext = async (signedIn, routes) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
  const cookies = [{ name: "language", value: "fr", url: origin }];
  if (signedIn) cookies.push({ name: "auth_token", value: "local-qa-fixture", url: origin });
  await context.addCookies(cookies);
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "challenges.cloudflare.com") return route.fulfill({ contentType: "text/javascript", body: fakeTurnstile });
    const data = routes(url.pathname, route.request().method());
    if (data !== undefined) return json(route, data);
    if (url.origin !== new URL(origin).origin) return route.abort();
    await route.continue();
  });
  return context;
};

const publicScan = async (totalMatches) => {
  const context = await openContext(false, (path, method) => {
    if (path.endsWith("/public-scan/allowance")) return { remainingToday: 2 };
    if (path.endsWith("/public-scan") && method === "POST") return { scanId: "scan-1" };
    if (path.endsWith("/public-scan/scan-1")) return { scanId: "scan-1", state: "done", error: null, result: totalMatches === 0
      ? { totalMatches: 0, matches: [], categories: [] }
      : { totalMatches, matches: [match], categories: [{ category: "OTHER", count: totalMatches }] } };
  });
  const page = await context.newPage();
  await page.goto(`${origin}/`);
  const idlePanel = page.locator("#public-scan-file").locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]");
  // Read the idle panel only once its translated text is on screen.
  await page.getByRole("button", { name: "Scanner mon œuvre" }).waitFor();
  const idleText = await idlePanel.innerText();
  await page.locator("#public-scan-file").setInputFiles({ name: "art.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Scanner mon œuvre" }).click();
  return { context, page, idleText };
};

test("a visitor who gets zero results is told the scan is not exhaustive", async () => {
  const { context, page, idleText } = await publicScan(0);
  try {
    assert.ok(!idleText.includes(note), "the notice only follows an empty result, not the idle panel");
    await page.getByText("Rien trouvé cette fois.").waitFor();
    await page.getByText(note, { exact: true }).waitFor();
  } finally { await context.close(); }
});

test("a visitor who gets matches does not see the notice", async () => {
  const { context, page } = await publicScan(1);
  try {
    await page.getByRole("link", { name: /Known source/ }).waitFor();
    assert.equal(await page.getByText(note, { exact: true }).count(), 0);
  } finally { await context.close(); }
});

for (const [label, matchingPages] of [["zero", []], ["positive", [match]]]) {
  test(`${label} dashboard report: the notice sits in the summary, right after the match count`, async () => {
    const context = await openContext(true, (path, method) => {
      if (path.endsWith("/auth/me")) return { id: userId, email: "qa@example.invalid", notificationsEnabled: false };
      if (path.endsWith(`/reports/user/${userId}/scan`) && method === "POST") return { jobId: "job-1" };
      if (path.endsWith(`/reports/user/${userId}/scan/job-1`)) return { state: "completed", reportId: "report-1" };
      if (path.endsWith("/reports/details/report-1")) return { id: "report-1", userId, detectionDate: "2026-09-02T00:00:00Z", matchingPages };
    });
    const page = await context.newPage();
    try {
      await page.goto(`${origin}/dashboard`);
      // A click before hydration or before the user is loaded does nothing.
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: /Créer le report/ }).click();
      const count = page.getByText(`${matchingPages.length} correspondances trouvées`, { exact: true });
      await count.waitFor();
      const notice = page.getByRole("dialog").getByText(note, { exact: true });
      assert.equal(await notice.count(), 1);
      // In the same summary box as the count, below it, visible without scrolling.
      const summary = page.getByRole("dialog").locator("div.rounded-lg").filter({ has: count });
      assert.equal(await summary.getByText(note, { exact: true }).count(), 1);
      assert.ok((await notice.boundingBox()).y > (await count.boundingBox()).y);
      assert.ok(await notice.isVisible());
    } finally { await context.close(); }
  });
}
