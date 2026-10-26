import { test, expect } from "@playwright/test";

const RELEASES_URL = "https://github.com/VigilArt-app/VigilArt/releases/latest";
const apkLink = /Download APK|Télécharger l'APK/;
const phone = { width: 390, height: 844 };
const desktop = { width: 1280, height: 800 };

const profile = {
  id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

test("login and sign-up no longer show the APK button", async ({ context, page, baseURL }) => {
  await context.addCookies([{ name: "language", value: "en", url: baseURL! }]);
  await page.route("**/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
  await page.route("**/auth/refresh", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
  for (const viewport of [desktop, phone]) {
    await page.setViewportSize(viewport);
    for (const path of ["/login", "/sign-up"]) {
      await test.step(`${path} at ${viewport.width}px`, async () => {
        await page.goto(path);
        await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 20_000 });
        // The theme toggle stays in the corner the button left.
        await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible();
        await expect(page.getByRole("link", { name: apkLink })).toHaveCount(0);
        await expect(page.locator(`a[href="${RELEASES_URL}"]`)).toHaveCount(0);
      });
    }
  }
});

for (const language of ["en", "fr"] as const) {
  test(`the APK link lives only in the phone sidebar (${language})`, async ({ context, page, baseURL }) => {
    await context.addCookies([
      { name: "language", value: language, url: baseURL! },
      { name: "auth_token", value: "browser-test-only", url: baseURL!, httpOnly: true },
    ]);
    await page.route("**/api/v1/**", (route) => route.fulfill({ status: 404, json: { message: "Not found" } }));
    await page.route("**/auth/me", (route) => route.fulfill({ json: { success: true, data: profile } }));
    await page.route("**/reports/user/*", (route) => route.fulfill({ json: { success: true, data: [] } }));
    await page.route("**/reports/user/*/statistics?*", (route) => route.fulfill({ json: {
      success: true, data: { totalMatches: 0, categoryDistribution: [], timeline: [] },
    } }));
    await page.route("**/artworks/user/*?*", (route) => route.fulfill({ json: {
      success: true, data: { items: [], nextCursor: null },
    } }));

    await page.setViewportSize(desktop);
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: language === "fr" ? "Déconnexion" : "Logout", exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: apkLink })).toBeHidden();

    await page.setViewportSize(phone);
    const link = page.getByRole("link", { name: language === "fr" ? "Télécharger l'APK" : "Download APK", exact: true });
    // A click before hydration or before the sidebar sees the resize does nothing: retry it.
    await expect(async () => {
      // Never click again once open: the panel's overlay would swallow the click.
      if (!(await link.isVisible())) await page.getByRole("button", { name: "Toggle Sidebar" }).click();
      await expect(link).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000 });
    await expect(link).toHaveAttribute("href", RELEASES_URL);
    await expect(link).toHaveAttribute("target", "_blank");
  });
}
