import { test, expect } from "@playwright/test";

const profile = {
  id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([{ name: "language", value: "en", url: "http://127.0.0.1:3011" }]);
  await page.route("**/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
  await page.route("**/auth/refresh", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
});

for (const language of ["en", "fr"] as const) {
  test(`login does not offer unsupported session or recovery controls (${language})`, async ({ context, page }) => {
    await context.addCookies([{ name: "language", value: language, url: "http://127.0.0.1:3011" }]);
    if (language === "fr") await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await expect(page.getByRole("button", { name: language === "fr" ? "Se connecter" : "Sign in", exact: true })).toBeVisible();
    await expect.soft(page.getByRole("switch", { name: "Remember me" })).toHaveCount(0, { timeout: 1_000 });
    await expect.soft(page.getByText(/Remember me|Se souvenir de moi/i)).toHaveCount(0, { timeout: 1_000 });
    await expect.soft(page.getByRole("link", { name: /Forgot password|Mot de passe oublié/i })).toHaveCount(0, { timeout: 1_000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("link", { name: language === "fr" ? "S'inscrire" : "Sign up now", exact: true })).toHaveAttribute("href", "/sign-up");
  });
}

test("login still sends only credentials and navigates to the authenticated dashboard", async ({ context, page }) => {
  await page.route("**/reports/user/*/statistics?*", (route) => route.fulfill({ json: {
    success: true, data: { totalMatches: 0, categoryDistribution: [], timeline: [] },
  } }));
  await page.route("**/reports/user/*", (route) => route.fulfill({ json: { success: true, data: [] } }));
  await page.route("**/artworks/user/*?*", (route) => route.fulfill({ json: {
    success: true, data: { items: [], nextCursor: null },
  } }));
  await page.route("**/auth/login", async (route) => {
    // Reproduce the backend's session cookie on the test frontend's hostname.
    await context.addCookies([{ name: "auth_token", value: "browser-test-only", url: "http://127.0.0.1:3011", httpOnly: true }]);
    await page.route("**/auth/me", (me) => me.fulfill({ json: { success: true, data: profile } }));
    await route.fulfill({ json: { success: true, data: profile } });
  });
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("artist@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Secure_P4ssword");
  const loginRequest = page.waitForRequest("**/auth/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect((await loginRequest).postDataJSON()).toEqual({ email: "artist@example.com", password: "Secure_P4ssword" });
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test("login preserves credentials and exposes a rejected login", async ({ page }) => {
  await page.route("**/auth/login", (route) => route.fulfill({ status: 401, json: { message: "Invalid credentials" } }));
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("artist@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Wrong_P4ssword");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Invalid credentials" })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveValue("artist@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("Wrong_P4ssword");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  await expect(page).toHaveURL(/\/login$/);
});
