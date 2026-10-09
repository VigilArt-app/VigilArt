import assert from "node:assert/strict";
import { before, after, test } from "node:test";

// Fixtures intercept every API call: this suite never scans a live provider.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "@playwright/test");
const origin = process.env.MATCHES_TEST_URL ?? "http://127.0.0.1:3131";
const userId = "00000000-0000-4000-8000-000000000001";
const artwork = { id: "fixture", userId, originalFilename: "fixture.png", contentType: "image/png", sizeBytes: 100, width: 1, height: 1, storageKey: "", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", lastScanAt: "2026-09-02T00:00:00Z" };
const unsafe = { id: "unsafe-1", artworkId: "fixture", url: "https://restricted-one.example.invalid/private", imageUrl: "https://restricted-one.example.invalid/image.png", websiteName: "Restricted source one", pageTitle: "Restricted title one", category: "BLOG", firstDetectedAt: "2026-09-02T00:00:00Z", unsafeDomain: true };
const unsafeTwo = { ...unsafe, id: "unsafe-2", url: "https://restricted-two.example.invalid/private", imageUrl: "https://restricted-two.example.invalid/image.png", websiteName: "Restricted source two", pageTitle: "Restricted title two", firstDetectedAt: "2026-09-01T00:00:00Z" };
const safe = { ...unsafe, id: "safe", url: "https://safe.example.invalid/art", imageUrl: null, websiteName: "Safe source", pageTitle: "Safe title", category: "OTHER", firstDetectedAt: "2026-08-01T00:00:00Z", unsafeDomain: false };
const matches = [unsafe, unsafeTwo, safe];
// Stands in for Cloudflare's script: the site key in .env makes the public scan
// button wait for a token.
const fakeTurnstile = "window.turnstile={render:(el,o)=>{setTimeout(()=>o.callback('test-token'));return 'w'},remove(){},reset(){}};";
const show = "Show";
const hide = "Hide";
let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN ?? "/usr/bin/chromium-browser" }); });
after(async () => { await browser?.close(); });

const openPage = async (path, language = "en", matchingPages = matches, signedIn = true) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
  const cookies = [{ name: "language", value: language, url: origin }];
  // The landing page redirects a signed-in user, so the public scan runs signed out.
  if (signedIn) cookies.push({ name: "auth_token", value: "fixture-token", url: origin });
  await context.addCookies(cookies);
  const page = await context.newPage();
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    if (url.hostname === "challenges.cloudflare.com") return route.fulfill({ contentType: "text/javascript", body: fakeTurnstile });
    // Click tests open only intercepted fixture destinations, never real sites.
    if (["https://safe.example.invalid/art", "https://safe-social.example.invalid/art"].includes(url.href)) {
      return route.fulfill({ contentType: "text/html", body: "<title>Safe fixture destination</title>" });
    }
    let data;
    if (pathname.endsWith("/auth/me")) data = { id: userId, email: "qa@example.invalid", notificationsEnabled: false };
    else if (pathname.endsWith(`/artworks/user/${userId}`)) data = { items: [artwork, { ...artwork, id: "safe-artwork", originalFilename: "safe.png" }], nextCursor: null };
    else if (pathname.endsWith(`/reports/user/${userId}/statistics`)) data = { totalMatches: 3, categoryDistribution: [{ category: "OTHER", count: 3 }], timeline: [{ reportId: "history", date: "2026-09-03T00:00:00Z", totalMatches: 3 }] };
    else if (pathname.endsWith(`/reports/user/${userId}/matches`) || pathname.endsWith("/reports/report/history/matches")) data = matchingPages;
    else if (pathname.endsWith(`/reports/user/${userId}/scan`) && route.request().method() === "POST") data = { jobId: "fixture-job" };
    else if (pathname.endsWith(`/reports/user/${userId}/scan/fixture-job`)) data = { state: "completed", reportId: "history" };
    else if (pathname.endsWith(`/reports/user/${userId}`)) data = [{ id: "history", detectionDate: "2026-09-03T00:00:00Z" }];
    else if (pathname.endsWith("/reports/details/history")) data = { id: "history", userId, detectionDate: "2026-09-03T00:00:00Z", matchingPages: [...matchingPages, { ...safe, id: "safe-artwork-match", artworkId: "safe-artwork" }] };
    else if (pathname.endsWith("/public-scan/allowance")) data = { remainingToday: 2 };
    else if (pathname.endsWith("/public-scan") && route.request().method() === "POST") data = { scanId: "fixture-scan" };
    else if (pathname.endsWith("/public-scan/fixture-scan")) data = { scanId: "fixture-scan", state: "done", error: null, result: { totalMatches: 3, matches, categories: [{ category: "OTHER", count: 3 }] } };
    if (data !== undefined) return route.fulfill({ json: { success: true, statusCode: 200, data }, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" } });
    if (url.origin !== new URL(origin).origin) return route.abort();
    await route.continue();
  });
  await page.goto(`${origin}${path}`);
  return { context, page };
};

const assertHidden = async (surface) => {
  const html = await surface.evaluate((node) => node.outerHTML);
  for (const value of [unsafe.websiteName, unsafe.pageTitle, unsafe.url, unsafe.imageUrl, unsafeTwo.websiteName, unsafeTwo.pageTitle, unsafeTwo.url, unsafeTwo.imageUrl]) {
    assert.ok(!html.includes(value), `hidden match leaked ${value} into its DOM or attributes`);
  }
  // No safe fixture uses BLOG, so its raw value or label can only come from a restricted match.
  assert.doesNotMatch(html, />\s*(BLOG|Blogs)\s*</, "a restricted category must not leak into the row or filter");
  assert.doesNotMatch(html, /9\/[12]\/2026/, "restricted detection dates must be absent too");
};

const exerciseRows = async (surface) => {
  await assertHidden(surface);
  await surface.getByText(/Safe source/).waitFor();
  assert.equal(await surface.locator(`a[href="${safe.url}"]`).count(), 1);
  const buttons = surface.getByRole("button", { name: show, exact: true });
  assert.ok(await buttons.count() >= 2, "both restricted matches need independent controls");
  await buttons.first().focus();
  await buttons.first().press("Enter");
  await surface.getByText(/Restricted source one/).waitFor();
  assert.equal(await surface.getByText(/Restricted source two/).count(), 0);
  // Never a link, even after reveal and even signed in.
  assert.equal(await surface.locator(`a[href="${unsafe.url}"]`).count(), 0);
  await surface.getByRole("button", { name: hide, exact: true }).click();
  await assertHidden(surface);
};

const assertSafeLinkOpens = async (page, surface, url) => {
  const link = surface.locator(`a[href="${url}"]`);
  assert.equal(await link.count(), 1, "the safe result must retain its destination link");
  const [destination] = await Promise.all([
    page.waitForEvent("popup", { timeout: 5000 }),
    link.click({ timeout: 5000 }),
  ]);
  try {
    await destination.waitForURL(url, { timeout: 5000 });
    assert.equal(destination.url(), url, "the safe link must open the expected destination");
  } finally {
    await destination.close();
  }
};

test("gallery: latest source, detail summary and each match are hidden, independent and reset on selection", async () => {
  const { context, page } = await openPage("/artwork-gallery");
  try {
    const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
    // Small cards (detail panel open) stack badges over the text: select through the card itself.
    await page.locator(".group.relative.rounded-lg").filter({ hasText: "safe.png" }).getByText(/Safe source/).waitFor();
    await assertHidden(card);
    // The card names only the latest safe source and flags the blacklisted ones.
    await card.getByText("2 blacklisted sites", { exact: true }).waitFor();
    await card.getByText(/Safe source/).waitFor();
    assert.equal(await card.getByRole("button", { name: show, exact: true }).count(), 0, "the card offers no reveal");
    await card.dispatchEvent("click");
    const details = page.locator("div.w-96.border-l");
    await details.getByText(safe.websiteName, { exact: true }).waitFor();
    await assertHidden(details);
    const links = details.locator(".border-t.pt-4");
    await exerciseRows(links);
    await details.getByRole("button", { name: show, exact: true }).first().click();
    await details.getByText(unsafe.websiteName, { exact: true }).waitFor();
    await page.locator(".group.relative.rounded-lg").filter({ hasText: "safe.png" }).getByText("safe.png", { exact: true }).click();
    await details.getByText("safe.png", { exact: true }).waitFor();
    await card.dispatchEvent("click");
    await assertHidden(details);
  } finally { await context.close(); }
});

test("gallery: switching to another artwork whose latest source is also blacklisted hides it again", async () => {
  // The detail panel stays mounted across selections: only the match identity in the reset key can hide it.
  const other = { ...unsafeTwo, id: "unsafe-other", artworkId: "safe-artwork", websiteName: "Restricted source other", firstDetectedAt: "2026-09-03T00:00:00Z" };
  const { context, page } = await openPage("/artwork-gallery", "en", [...matches, other]);
  try {
    const card = (name) => page.locator(".group.relative.rounded-lg").filter({ hasText: name });
    await card("safe.png").getByText(/blacklisted site/).waitFor();
    await card("fixture.png").dispatchEvent("click");
    const summary = page.locator("div.w-96.border-l .space-y-3.text-sm");
    await summary.getByRole("button", { name: show, exact: true }).click();
    await summary.getByText(/Restricted source one/).waitFor();
    await card("safe.png").dispatchEvent("click");
    await page.locator("div.w-96.border-l").getByText("safe.png", { exact: true }).waitFor();
    assert.equal(await summary.getByText(/Restricted source (one|other)/).count(), 0, "a revealed source must not stay revealed for another artwork");
    await summary.getByRole("button", { name: show, exact: true }).waitFor();
  } finally { await context.close(); }
});

for (const surface of ["gallery", "scan history"]) {
  test(`${surface}: changing category hides the revealed latest source again`, async () => {
    const filterMatches = [
      { ...unsafe, category: "MEDIA" },
      safe,
      { ...safe, id: "safe-social", category: "SOCIAL", websiteName: "Safe social source", url: "https://safe-social.example.invalid/art" },
    ];
    const { context, page } = await openPage(surface === "gallery" ? "/artwork-gallery" : "/dashboard", "en", filterMatches);
    try {
      let container;
      let summary;
      if (surface === "gallery") {
        const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
        await card.getByText(/blacklisted site/).waitFor();
        await card.dispatchEvent("click");
        container = page.locator("div.w-96.border-l");
        summary = container.locator(".space-y-3.text-sm");
      } else {
        const row = page.locator("tbody tr").filter({ hasText: /^fixture/ });
        await row.getByText(/Blacklisted site/).waitFor();
        await row.locator("td").first().click();
        container = page.getByRole("dialog");
        summary = container.locator(".space-y-4 > .text-sm.text-muted-foreground");
      }
      await summary.getByRole("button", { name: show, exact: true }).click();
      await summary.getByText(/Restricted source one/).waitFor();
      await container.getByRole("combobox", { name: "Filter by category" }).click();
      await page.getByRole("option", { name: "Social media", exact: true }).click();
      await container.getByText(/Safe social source/).waitFor();
      assert.equal(await summary.getByText(/Restricted source one/).count(), 0, "category change must hide the previously revealed latest source");
      await assertSafeLinkOpens(page, container, "https://safe-social.example.invalid/art");
      await summary.getByRole("button", { name: show, exact: true }).waitFor();
      await summary.getByRole("button", { name: show, exact: true }).click();
      await summary.getByText(/Restricted source one/).waitFor();
      await container.getByRole("combobox", { name: "Filter by category" }).click();
      await page.getByRole("option", { name: "All categories", exact: true }).click();
      assert.equal(await summary.getByText(/Restricted source one/).count(), 0, "returning to all categories must hide it again");
      await summary.getByRole("button", { name: show, exact: true }).waitFor();
      await assertSafeLinkOpens(page, container, "https://safe-social.example.invalid/art");
      await assertSafeLinkOpens(page, container, "https://safe.example.invalid/art");
    } finally { await context.close(); }
  });
}

test("scan history: latest table source and modal summary/matches reset on reopening; unsafe-only filter category is absent", async () => {
  const { context, page } = await openPage("/dashboard");
  try {
    const row = page.locator("tbody tr").filter({ hasText: /^fixture/ });
    await page.locator("tbody tr").filter({ hasText: /^safe/ }).getByText(safe.websiteName, { exact: true }).waitFor();
    await assertHidden(row);
    await row.getByText(/Blacklisted site/).waitFor();
    await row.getByRole("button", { name: show, exact: true }).press("Enter");
    await row.getByText(unsafe.websiteName, { exact: true }).waitFor();
    assert.equal(await page.getByRole("dialog").count(), 0, "Show must not open the row");
    await row.getByRole("button", { name: hide, exact: true }).click();
    await row.locator("td").first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText(/Safe source/).waitFor();
    await assertHidden(dialog);
    assert.equal(await dialog.getByRole("combobox").count(), 0, "the unsafe-only BLOG category must not create a filter option");
    const rows = dialog.locator(".space-y-3");
    await exerciseRows(rows);
    await dialog.getByRole("button", { name: show, exact: true }).first().click();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await row.locator("td").first().click();
    await dialog.getByText(/Safe source/).waitFor();
    await assertHidden(dialog);
  } finally { await context.close(); }
});

for (const surface of ["category", "report", "new-report"]) {
  test(`${surface}: modal matches hide every field and attribute, support keyboard reveal and reset`, async () => {
    const { context, page } = await openPage("/dashboard");
    try {
      // "Create report" does nothing until the signed-in user has loaded.
      await page.waitForLoadState("networkidle");
      const open = async () => {
        if (surface === "category") await page.getByRole("button", { name: /Other.*100%/ }).click();
        else if (surface === "report") await page.getByRole("button", { name: /View reposts from/ }).evaluate((node) => node.click());
        else await page.getByRole("button", { name: "Create report", exact: true }).click();
        await page.getByRole("dialog").getByText(/Safe source/).first().waitFor();
      };
      await open();
      const dialog = page.getByRole("dialog");
      // A newly created report also contains the other artwork's safe match.
      const list = surface === "new-report" ? dialog.locator(".space-y-4.max-h-96") : dialog;
      if (surface === "new-report") {
        await assertHidden(list);
        await list.getByRole("button", { name: show, exact: true }).first().press("Enter");
        await list.getByText(/Restricted source one/).waitFor();
        assert.equal(await list.getByText(/Restricted source two/).count(), 0);
        await list.getByRole("button", { name: hide, exact: true }).click();
        await assertHidden(list);
      } else await exerciseRows(list);
      await list.getByRole("button", { name: show, exact: true }).first().click();
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await open();
      await assertHidden(dialog);
    } finally { await context.close(); }
  });
}

test("public result: every restricted field is hidden and revealed links remain disabled", async () => {
  const { context, page } = await openPage("/", "en", matches, false);
  try {
    await page.locator('input[type="file"]').setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1sAAAAASUVORK5CYII=", "base64") });
    await page.getByRole("button", { name: /Scan.*image|Scan.*artwork/i }).click();
    const panel = page.locator(".lg\\:h-96");
    await panel.getByText(safe.websiteName, { exact: true }).waitFor();
    await exerciseRows(panel);
  } finally { await context.close(); }
});
