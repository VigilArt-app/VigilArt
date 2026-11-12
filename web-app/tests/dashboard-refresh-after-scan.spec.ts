import { test, expect, type Page } from "@playwright/test";

const profile = {
  id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

const artwork = {
  id: "artwork-1", userId: profile.id, title: "peach1", originalFilename: "peach1.png",
  storageKey: null, lastScanAt: null, createdAt: "2026-09-09T00:00:00.000Z",
};

const matchingPages = ["https://example.com/a", "https://example.org/b", "https://example.net/c"].map((url, i) => ({
  id: `match-${i}`, url, artworkId: artwork.id, websiteName: "example", category: "OTHER",
  firstDetectedAt: new Date().toISOString(),
}));

// The backend answers like a never-scanned account until the scan job completes.
const mockBackend = async (page: Page) => {
  let scanned = false;
  await page.route("**/api/v1/**", (route) => route.fulfill({ status: 404, json: { message: "Not found" } }));
  await page.route("**/auth/me", (route) => route.fulfill({ json: { success: true, data: profile } }));
  await page.route("**/artworks/user/*?*", (route) => route.fulfill({ json: {
    success: true, data: { items: [{ ...artwork, lastScanAt: scanned ? new Date().toISOString() : null }], nextCursor: null },
  } }));
  await page.route("**/reports/user/*", (route) => route.fulfill({ json: {
    success: true, data: scanned ? [{ id: "report-1", userId: profile.id, detectionDate: new Date().toISOString() }] : [],
  } }));
  await page.route("**/reports/details/report-1", (route) => route.fulfill({ json: {
    success: true, data: { id: "report-1", userId: profile.id, detectionDate: new Date().toISOString(), matchingPages },
  } }));
  await page.route("**/reports/user/*/statistics?*", (route) => route.fulfill({ json: {
    success: true, data: {
      totalMatches: scanned ? matchingPages.length : 0,
      categoryDistribution: scanned ? [{ category: "OTHER", count: matchingPages.length }] : [],
      timeline: scanned ? [{ reportId: "report-1", date: new Date().toISOString(), totalMatches: matchingPages.length }] : [],
    },
  } }));
  await page.route("**/reports/user/*/scan-quota", (route) => route.fulfill({ json: {
    success: true, data: { remaining: scanned ? 1 : 2, limit: 2, nextAvailableAt: null },
  } }));
  await page.route("**/reports/user/*/scan", (route) => route.fulfill({ json: { success: true, data: { jobId: "job-1" } } }));
  await page.route("**/reports/user/*/scan/*", (route) => {
    scanned = true;
    return route.fulfill({ json: { success: true, data: {
      jobId: "job-1", state: "completed", progress: { processed: 1, total: 1 }, reportId: "report-1", error: null,
    } } });
  });
};

test("dashboard shows the new report and statistics after a scan, without a reload", async ({ context, page, baseURL }) => {
  await context.addCookies([
    { name: "language", value: "en", url: baseURL! },
    { name: "auth_token", value: "browser-test-only", url: baseURL!, httpOnly: true },
  ]);
  await mockBackend(page);
  await page.goto("/dashboard");

  const totalMatches = page.getByText("total matches", { exact: true }).locator("..");
  await expect(totalMatches).toHaveText(/^0\s*total matches$/, { timeout: 20_000 });
  await expect(page.getByText("No scans found")).toBeVisible();
  await expect(page.getByText("No reports yet")).toBeVisible();
  await expect(page.getByText("2 scans left out of 2")).toBeVisible();

  await page.getByRole("button", { name: "Start a scan" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Report created", { exact: false })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await expect(page.getByText("1 scan left out of 2")).toBeVisible();
  await expect(totalMatches).toHaveText(/^3\s*total matches$/);
  await expect(page.getByText("No scans found")).toBeHidden();
  await expect(page.getByText("No reports yet")).toBeHidden();
  await expect(page.getByRole("button", { name: /^peach1 3 / })).toBeVisible();
});
