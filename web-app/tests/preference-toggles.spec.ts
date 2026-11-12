import { test, expect } from "@playwright/test";

const flags = /🇫🇷|🇬🇧/;

test.beforeEach(async ({ context, page, baseURL }) => {
  await context.addCookies([{ name: "language", value: "en", url: baseURL! }]);
  await page.route("**/api/v1/**", (route) => route.fulfill({ status: 404, json: { message: "Not found" } }));
  await page.route("**/auth/me", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
  await page.route("**/auth/refresh", (route) => route.fulfill({ status: 401, json: { message: "Unauthorized" } }));
});

for (const path of ["/", "/login"]) {
  test(`language toggle shows FR/EN instead of flags on ${path}`, async ({ page }) => {
    await page.goto(path);
    const language = page.getByRole("button", { name: "Language EN" });
    await expect(language).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(flags)).toHaveCount(0);

    // A click before hydration does nothing: retry until the menu opens.
    const french = page.getByRole("menuitem", { name: "Français", exact: true });
    await expect(async () => {
      if (!(await french.isVisible())) await language.click();
      await expect(french).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByRole("menuitem", { name: "English", exact: true })).toBeVisible();
    await expect(page.getByRole("menu").getByText(flags)).toHaveCount(0);

    await french.click();
    await expect(page.getByRole("button", { name: "Langue FR" })).toBeVisible();
  });

  test(`theme toggle shows the screen icon once System is chosen on ${path}`, async ({ page }) => {
    // The icon depends on a theme only the browser knows: it must not break hydration.
    const hydrationErrors: string[] = [];
    page.on("console", (message) => { if (/hydrat|did not match/i.test(message.text())) hydrationErrors.push(message.text()); });
    page.on("pageerror", (error) => { if (/hydrat|did not match/i.test(error.message)) hydrationErrors.push(error.message); });
    await page.goto(path);
    const toggle = page.getByRole("button", { name: "Toggle theme" });
    await expect(toggle).toBeVisible({ timeout: 20_000 });

    const choose = async (name: string) => {
      const item = page.getByRole("menuitem", { name, exact: true });
      await expect(async () => {
        if (!(await item.isVisible())) await toggle.click();
        await expect(item).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 20_000 });
      await item.click();
      // Wait for the closing animation, or the next choice sees the old item.
      await expect(page.getByRole("menu")).toHaveCount(0);
    };

    await choose("Dark");
    await expect(toggle.locator("svg.lucide-monitor")).toHaveCount(0);
    await choose("System");
    await expect(toggle.locator("svg.lucide-monitor")).toBeVisible();
    await choose("Light");
    await expect(toggle.locator("svg.lucide-monitor")).toHaveCount(0);

    // The choice is stored, so the icon must survive a reload.
    await choose("System");
    await page.reload();
    await expect(page.getByRole("button", { name: "Toggle theme" }).locator("svg.lucide-monitor")).toBeVisible({ timeout: 20_000 });
    expect(hydrationErrors).toEqual([]);
  });
}
