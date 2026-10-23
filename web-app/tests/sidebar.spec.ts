import { test, expect } from "@playwright/test";

const profile = {
  id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

for (const language of ["en", "fr"] as const) {
  test(`authenticated pages keep navigation without a Pro upgrade message (${language})`, async ({ context, page, baseURL }) => {
    await context.addCookies([
      { name: "language", value: language, url: baseURL! },
      { name: "auth_token", value: "browser-test-only", url: baseURL!, httpOnly: true },
    ]);
    // Keep the real app shell; isolate only its backend reads from live user data.
    await page.route("**/api/v1/**", (route) => route.fulfill({ status: 404, json: { message: "Not found" } }));
    await page.route("**/auth/me", (route) => route.fulfill({ json: { success: true, data: profile } }));
    await page.route("**/reports/user/*", (route) => route.fulfill({ json: { success: true, data: [] } }));
    await page.route("**/reports/user/*/statistics?*", (route) => route.fulfill({ json: {
      success: true, data: { totalMatches: 0, categoryDistribution: [], timeline: [] },
    } }));
    await page.route("**/artworks/user/*?*", (route) => route.fulfill({ json: {
      success: true, data: { items: [], nextCursor: null },
    } }));
    await page.route("**/dmca/platform", (route) => route.fulfill({ json: { success: true, data: [] } }));
    await page.route("**/dmca/notice/user/*", (route) => route.fulfill({ json: { success: true, data: [] } }));

    for (const path of ["/dashboard", "/profile", "/artwork-gallery", "/dmca"]) {
      await test.step(path, async () => {
        await page.goto(path);
        const logout = page.getByRole("link", { name: language === "fr" ? "Déconnexion" : "Logout", exact: true });
        await expect(logout).toBeVisible({ timeout: 20_000 });
        await expect(logout).toHaveAttribute("href", "/logout");
        for (const href of ["/profile", "/dashboard", "/artwork-gallery", "/dmca"]) {
          await expect(page.locator(`[data-sidebar="menu-button"][href="${href}"]`)).toBeVisible();
        }
        await expect(page.getByText(/Passer au plan Pro|Upgrade to Pro/i)).toHaveCount(0, { timeout: 1_000 });
      });
    }

    for (const viewport of [{ width: 1280, height: 600 }, { width: 390, height: 600 }]) {
      await test.step(`logout stays above the lower edge at ${viewport.width}px`, async () => {
        await page.setViewportSize(viewport);
        if (viewport.width < 768) await page.getByRole("button", { name: "Toggle Sidebar" }).click();
        const logout = page.getByRole("link", { name: language === "fr" ? "Déconnexion" : "Logout", exact: true });
        await expect(logout).toBeInViewport({ ratio: 1 });
        await expect.poll(() => logout.evaluate((element) => window.innerHeight - element.getBoundingClientRect().bottom), {
          timeout: 1_000,
        }).toBeGreaterThanOrEqual(24);
        await expect.poll(() => logout.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest("a") === element;
        })).toBe(true);
      });
    }
  });
}
