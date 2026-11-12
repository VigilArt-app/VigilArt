import { test, expect, type Page, type Locator } from "@playwright/test";

// A small Android phone, touch only: the beta testers' main device.
const phone = { width: 360, height: 740 };
test.use({ viewport: phone, hasTouch: true, isMobile: true });

const userId = "00000000-0000-4000-8000-000000000001";
const profile = {
  id: userId, email: "camille.dupont-laurent.illustration@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};
const artwork = {
  id: "a1000000-0000-4000-8000-000000000001", userId, originalFilename: "dragon_commission_final_v3_HD.png",
  storageKey: "k1", contentType: "image/png", sizeBytes: 2_345_678, width: 2400, height: 2400,
  description: "Red dragon commission", createdAt: "2026-07-10T10:00:00.000Z", updatedAt: "2026-07-10T10:00:00.000Z",
  lastScanAt: null,
};
const platform = {
  slug: "etsy", displayName: "Etsy", domain: "https://www.etsy.com/", email: "legal@etsy.com",
  dmcaUrl: "https://www.etsy.com/legal/ip/report", formSchema: [],
};
const notice = {
  id: "n1", userId, dmcaPlatformSlug: "etsy", artworkId: null, status: "DRAFT", payload: {},
  submittedAt: null, createdAt: "2026-11-12T10:00:00.000Z", updatedAt: "2026-11-12T10:00:00.000Z",
};
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const signIn = async (page: Page, language: "en" | "fr") => {
  const url = test.info().project.use.baseURL!;
  await page.context().addCookies([
    { name: "language", value: language, url },
    { name: "auth_token", value: "browser-test-only", url, httpOnly: true },
  ]);
  const ok = (data: unknown) => ({ json: { success: true, data } });
  await page.route("**/api/v1/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, "");
    if (path === "/auth/me" || path.startsWith("/users/")) return route.fulfill(ok(profile));
    if (path.startsWith("/artworks/user/")) return route.fulfill(ok({ items: [artwork], nextCursor: null }));
    if (path.endsWith("/scan-quota")) return route.fulfill(ok({ remaining: 2, limit: 3, nextAvailableAt: null }));
    if (path.endsWith("/statistics")) return route.fulfill(ok({ totalMatches: 0, categoryDistribution: [], timeline: [] }));
    if (path.startsWith("/reports/user/")) return route.fulfill(ok([]));
    if (path === "/storage/artworks/download-urls") return route.fulfill(ok({}));
    if (path === "/dmca/platform") return route.fulfill(ok([platform]));
    if (path.startsWith("/dmca/notice/user/")) return route.fulfill(ok([]));
    if (path === "/dmca/notice" && request.method() === "POST") return route.fulfill(ok(notice));
    return route.fulfill({ status: 404, json: { message: "Not found" } });
  });
};

// A tap before hydration does nothing: retry until it has an effect.
const tapUntil = async (target: Locator, effect: Locator) => {
  await expect(async () => {
    if (!(await effect.isVisible())) await target.tap();
    await expect(effect).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 20_000 });
};

// Fully on screen horizontally: a button cut by the page edge cannot be tapped.
const expectOnScreen = async (locator: Locator) => {
  await locator.scrollIntoViewIfNeeded();
  const box = (await locator.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(phone.width);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(phone.height);
};

test("the phone menu closes once a page is chosen", async ({ page }) => {
  await signIn(page, "fr");
  await page.goto("/dashboard");
  const menu = page.locator('[data-mobile="true"]');
  await tapUntil(page.getByRole("button", { name: "Toggle Sidebar" }), menu);
  await menu.getByRole("link", { name: "Profil" }).tap();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(menu).toHaveCount(0);
});

test("a DMCA notice can go from step 1 to step 3 on a phone (fr)", async ({ page }) => {
  await signIn(page, "fr");
  await page.goto("/dmca");
  const next = page.getByRole("button", { name: /Suivant/ });
  await expect(next.first()).toBeVisible({ timeout: 20_000 });
  await expectOnScreen(next.first());
  await next.first().tap();

  await page.locator("select").first().selectOption({ label: "Etsy" });
  await page.getByRole("button", { name: /Préparer/ }).tap();
  await expect(next.last()).toBeEnabled();
  await expectOnScreen(next.last());
  await next.last().tap();
  await expect(page.getByRole("button", { name: /Nouveau rapport/ })).toBeVisible();
});

test("the upload dialog stays usable with several files and a long file name (fr)", async ({ page }) => {
  await signIn(page, "fr");
  await page.goto("/dashboard");
  const dialog = page.getByRole("dialog");
  await tapUntil(page.getByRole("button", { name: /des œuvres/ }), dialog);
  await dialog.locator("input[type=file]").setInputFiles(
    ["dragon_commission_final_version_for_client_HD_2026.png", "forest.png", "lune.png", "sketch.png"]
      .map((name) => ({ name, mimeType: "image/png", buffer: png })),
  );
  await expect(dialog.getByText("forest.png")).toBeVisible();
  await expectOnScreen(dialog.getByRole("heading").first());
  await expectOnScreen(dialog.getByRole("button", { name: "Annuler" }));
  await expectOnScreen(dialog.getByRole("button", { name: "Importer", exact: true }));
});

test("artworks can be edited, deleted and inspected by touch (fr)", async ({ page }) => {
  await signIn(page, "fr");
  await page.goto("/artwork-gallery");
  const edit = page.getByRole("button", { name: "Modifier la description" });
  // Touch screens cannot hover, which is what reveals these buttons with a mouse.
  await expect(edit).toBeVisible({ timeout: 20_000 });
  await expect(edit).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Supprimer l'œuvre" })).toHaveCSS("opacity", "1");

  const close = page.getByRole("button", { name: "Fermer" });
  await tapUntil(page.getByText("dragon_commission_final_v3_HD.png").first(), close);
  await expectOnScreen(close);
  await close.tap();
  await expect(close).toHaveCount(0);
});
