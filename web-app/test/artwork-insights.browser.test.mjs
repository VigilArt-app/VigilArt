import assert from "node:assert/strict";
import { before, after, test } from "node:test";

// Run separately against the dev server; PLAYWRIGHT_MODULE can point to an
// existing tool installation without adding a browser dependency to the app.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "@playwright/test");
const origin = process.env.HYDRATION_TEST_URL ?? "http://127.0.0.1:3130";
const note = "Ce scan n’est pas exhaustif : certains contenus peuvent ne pas être détectés.";
const userId = "00000000-0000-4000-8000-000000000001";
const match = { id: "page-1", artworkId: "fixture", url: "https://example.invalid/art", websiteName: "Known source", pageTitle: "Known match", category: "OTHER", firstDetectedAt: "2026-09-01T00:00:00Z" };
const artwork = { id: "fixture", userId, originalFilename: "fixture.png", contentType: "image/png", sizeBytes: 100, width: 1, height: 1, storageKey: "", createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z", lastScanAt: "2026-09-02T00:00:00Z" };
let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN ?? "/usr/bin/chromium-browser" }); });
after(async () => { await browser?.close(); });

const openArtwork = async (scenario, theme = "light", width = 1280) => {
  const context = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: theme, serviceWorkers: "block" });
  await context.addCookies([{ name: "language", value: "fr", url: origin }, { name: "auth_token", value: "local-qa-fixture", url: origin }]);
  const page = await context.newPage();
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let data;
    if (path.endsWith("/auth/me")) data = { id: userId, email: "qa@example.invalid", notificationsEnabled: false };
    else if (path.endsWith(`/artworks/user/${userId}`)) data = { items: [scenario === "not_scanned" ? { ...artwork, lastScanAt: null } : artwork], nextCursor: null };
    else if (path.endsWith(`/reports/user/${userId}`)) {
      if (scenario === "list_failed") return route.fulfill({ status: 500 });
      data = scenario === "list_malformed" ? {} : scenario === "empty_history" ? [] : scenario === "partial_history" ? [{ id: "history" }, { id: "broken" }] : [{ id: "history" }];
    } else if (path.endsWith("/reports/details/broken") || (path.endsWith("/reports/details/history") && scenario === "detail_failed")) return route.fulfill({ status: 500 });
    else if (path.endsWith("/reports/details/history")) data = { id: "history", detectionDate: "2026-09-02T00:00:00Z", matchingPages: scenario === "detail_malformed" ? null : ["partial_history", "positive"].includes(scenario) ? [match] : [] };
    if (data !== undefined) return route.fulfill({ json: { success: true, statusCode: 200, data }, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" } });
    if (url.origin !== new URL(origin).origin) return route.abort();
    await route.continue();
  });
  await page.goto(`${origin}/artwork-gallery`);
  await page.getByText("fixture.png", { exact: true }).click();
  return { context, page, details: page.locator("div.w-96.border-l") };
};

for (const scenario of ["list_failed", "list_malformed", "detail_failed", "detail_malformed", "partial_history"]) {
  test(`${scenario}: unavailable results never imply zero matches or successful coverage`, async () => {
    const { context, page, details } = await openArtwork(scenario);
    try {
      await details.waitFor();
      assert.match(await details.innerText(), /Résultats indisponibles/);
      assert.equal(await details.getByText("0", { exact: true }).count(), 0);
      assert.equal(await details.getByText("Aucune correspondance enregistrée pour cette œuvre.", { exact: true }).count(), 0);
      assert.equal(await details.getByText(note, { exact: true }).count(), 0);
      const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
      assert.equal(await card.getByText("AUCUNE CORRESPONDANCE TROUVÉE", { exact: true }).count(), 0);
      await card.getByText(scenario === "partial_history" ? "CORRESPONDANCES TROUVÉES" : "RÉSULTATS INDISPONIBLES", { exact: true }).waitFor();
      if (scenario === "partial_history") await details.getByRole("link", { name: /Known source/ }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/artwork-gallery");
    } finally { await context.close(); }
  });
}

for (const scenario of ["empty_history", "empty_report"]) {
  test(`${scenario}: successful empty results retain zero and the coverage note`, async () => {
    const { context, page, details } = await openArtwork(scenario);
    try {
      await details.getByText("Aucune correspondance enregistrée pour cette œuvre.", { exact: true }).waitFor();
      assert.equal(await details.getByText("0", { exact: true }).count(), 1);
      assert.equal(await details.getByText(note, { exact: true }).count(), 1);
      const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
      await card.getByText("AUCUNE CORRESPONDANCE TROUVÉE", { exact: true }).waitFor();
    } finally { await context.close(); }
  });
}

for (const [scenario, label] of [["not_scanned", "PAS ENCORE SCANNÉE"], ["positive", "CORRESPONDANCES TROUVÉES"]]) {
  test(`${scenario}: the card displays the factual scan state`, async () => {
    const { context, page } = await openArtwork(scenario);
    try {
      const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
      await card.getByText(label, { exact: true }).waitFor();
    } finally { await context.close(); }
  });
}

for (const theme of ["light", "dark"]) {
  for (const [scenario, label, lightColor, darkColor] of [
    ["not_scanned", "PAS ENCORE SCANNÉE", [115, 115, 115], [115, 115, 115]],
    ["positive", "CORRESPONDANCES TROUVÉES", [43, 127, 255], [43, 127, 255]],
    ["empty_report", "AUCUNE CORRESPONDANCE TROUVÉE", [100, 116, 139], [100, 116, 139]],
    ["list_failed", "RÉSULTATS INDISPONIBLES", [115, 115, 115], [161, 161, 161]],
  ]) {
    test(`${theme}/${scenario}: card and details retain the requested factual status colors`, async () => {
      const { context, page, details } = await openArtwork(scenario, theme);
      try {
        const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
        await card.getByText(label, { exact: true }).waitFor();
        assert.equal(await page.locator("html").evaluate((node) => node.classList.contains("dark")), theme === "dark");
        for (const container of [card, details]) {
          const badge = container.locator("[data-artwork-status]");
          assert.equal(await badge.count(), 1, "each view must render the colored status badge");
          const colors = await badge.evaluate((node) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext("2d");
            const rgb = (color) => {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 1, 1);
              return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
            };
            const style = getComputedStyle(node);
            return { text: rgb(style.color), background: rgb(style.backgroundColor), label: node.textContent.trim(), children: node.children.length, borderWidth: style.borderTopWidth, fontWeight: style.fontWeight };
          });
          const expected = theme === "dark" ? darkColor : lightColor;
          assert.ok(colors.background.every((channel, index) => Math.abs(channel - expected[index]) <= 1), `${scenario}: unexpected badge background ${colors.background}`);
          if (["not_scanned", "positive", "empty_report"].includes(scenario)) assert.deepEqual(colors.text, [255, 255, 255], "retain white text on the gray, original blue and slate badges");
          assert.equal(colors.label, label);
          assert.equal(colors.children, 0, "the original filled badge has text only, without a dot or icon");
          assert.equal(colors.borderWidth, "0px", "the original badge has no outline");
          assert.equal(colors.fontWeight, "700", "retain the original bold label");
          const luminance = (rgb) => rgb.map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
          const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
          // Seph explicitly requested the original Protected blue/white pair
          // for matches found; that legacy combination falls below AA contrast.
          if (scenario !== "positive") assert.ok(contrast(colors.text, colors.background) >= 4.5, "badge text must meet AA contrast");
        }
      } finally { await context.close(); }
    });
  }
}

for (const width of [1024, 1280, 1440, 1920]) {
  test(`${width}px: the long French match badge stays within its card and clear of image actions`, async () => {
    const { context, page } = await openArtwork("positive", "light", width);
    try {
      const card = page.locator(".group.relative.rounded-lg").filter({ hasText: "fixture.png" });
      await card.hover();
      const geometry = await card.evaluate((element) => {
        const badge = element.querySelector("[data-artwork-status]");
        const bounds = badge.getBoundingClientRect();
        const cardBounds = element.getBoundingClientRect();
        const actions = element.querySelector("button").parentElement.getBoundingClientRect();
        const fits = (rect) => rect.left >= cardBounds.left && rect.right <= cardBounds.right && rect.top >= cardBounds.top && rect.bottom <= cardBounds.bottom;
        return { fits: fits(bounds) && fits(actions), clipped: badge.scrollWidth > badge.clientWidth, overlaps: bounds.left < actions.right && bounds.right > actions.left && bounds.top < actions.bottom && bounds.bottom > actions.top };
      });
      assert.equal(geometry.fits, true);
      assert.equal(geometry.clipped, false);
      assert.equal(geometry.overlaps, false);
    } finally { await context.close(); }
});
}
