import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([{ name: "language", value: "en", url: "http://127.0.0.1:3011" }]);
  await page.route("**/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
  await page.route("**/auth/refresh", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
});

test("signup requires unchecked consent, links policies, and has no name fields", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.locator('input[type="text"]')).toHaveCount(0);
  const consent = page.getByRole("checkbox");
  await expect(consent).not.toBeChecked();
  await expect(page.getByRole("link", { name: "Terms of Service", exact: true })).toHaveAttribute("href", "/terms");
  await expect(page.getByRole("link", { name: "Privacy Policy", exact: true })).toHaveAttribute("href", "/privacy");
  await page.getByLabel("Email address").fill("artist@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Secure_P4ssword");
  await page.getByLabel("Confirm password").fill("Secure_P4ssword");
  let requests = 0;
  await page.route("**/auth/signup", async (route) => {
    requests++;
    await route.fulfill({ status: 201, json: { success: true } });
  });
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await expect(consent).toBeFocused();
  expect(requests).toBe(0);
  await expect(page).toHaveURL(/\/sign-up$/);
  await consent.check();
  const request = page.waitForRequest("**/auth/signup");
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  expect((await request).postDataJSON()).toEqual({
    email: "artist@example.com", password: "Secure_P4ssword", acceptedTerms: true,
    termsVersion: "2026-09-09", privacyVersion: "2026-10-09",
  });
  await expect(page).toHaveURL(/\/login$/);
});

test("signup preserves inputs and shows an API failure", async ({ page }) => {
  await page.route("**/auth/signup", (route) => route.fulfill({ status: 409, json: { message: "Email already in use" } }));
  await page.goto("/sign-up");
  await page.getByLabel("Email address").fill("artist@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Secure_P4ssword");
  await page.getByLabel("Confirm password").fill("Secure_P4ssword");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Email already in use" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveValue("artist@example.com");
  await expect(page.getByRole("button", { name: "Sign up", exact: true })).toBeEnabled();
});

test("profile displays email instead of existing names and keeps avatar controls", async ({ context, page }) => {
  await context.addCookies([{ name: "auth_token", value: "browser-test-only", url: "http://127.0.0.1:3011" }]);
  await page.route("**/auth/me", (route) => route.fulfill({ json: {
    success: true, data: {
      id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
      firstName: "PrivateFirst", lastName: "PrivateLast", avatar: null,
      subscriptionTier: "FREE", autoRunReports: false, notificationsEnabled: false,
      createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
    },
  } }));
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "artist@example.com", exact: true })).toBeVisible();
  await expect(page.getByText(/PrivateFirst|PrivateLast/)).toHaveCount(0);
  await expect(page.locator('input[name="firstName"], input[name="lastName"]')).toHaveCount(0);
  await expect(page.locator('input[type="file"]')).toHaveCount(1);
  await expect(page.locator('input[type="email"]')).toBeDisabled();
});

test("French mobile signup exposes readable consent without horizontal overflow", async ({ context, page }) => {
  await context.addCookies([{ name: "language", value: "fr", url: "http://127.0.0.1:3011" }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sign-up");
  await expect(page.getByRole("checkbox")).toHaveAccessibleName(/Conditions.*Confidentialité/i);
  await expect(page.getByRole("link", { name: "Conditions d’utilisation", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
