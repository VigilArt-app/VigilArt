import { test, expect, type Page } from "@playwright/test";

const profile = {
  id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

const mockDashboard = async (page: Page) => {
  await page.route("**/api/v1/**", (route) => route.fulfill({ status: 404, json: { message: "Not found" } }));
  await page.route("**/auth/me", (route) => route.fulfill({ json: { success: true, data: profile } }));
  await page.route("**/reports/user/*", (route) => route.fulfill({ json: { success: true, data: [] } }));
  await page.route("**/reports/user/*/statistics?*", (route) => route.fulfill({ json: {
    success: true, data: { totalMatches: 0, categoryDistribution: [], timeline: [] },
  } }));
  await page.route("**/reports/user/*/scan-quota", (route) => route.fulfill({ json: {
    success: true, data: { remaining: 2, limit: 2, nextAvailableAt: null },
  } }));
  await page.route("**/reports/user/*/scan", (route) => route.fulfill({ json: { success: true, data: { jobId: "job-1" } } }));
  await page.route("**/reports/user/*/scan/*", (route) => route.fulfill({ json: { success: true, data: {
    jobId: "job-1", state: "active", progress: { processed: 1, total: 3 }, reportId: null, error: null,
  } } }));
  await page.route("**/artworks/user/*?*", (route) => route.fulfill({ json: {
    success: true, data: { items: [], nextCursor: null },
  } }));
};

const copy = {
  en: {
    upload: "Upload artworks", uploadTitle: "Upload Picture(s)", scan: "Start a scan", reposts: "Detected reposts",
    quota: "Each scan counts against your quota for 30 days, then you get it back.", progress: "Scanning artwork 1 of 3",
  },
  fr: {
    upload: "Importer des œuvres", uploadTitle: "Importer une ou plusieurs image(s)", scan: "Lancer un scan", reposts: "Reposts détectés",
    quota: "Chaque scan est décompté de votre quota pendant 30 jours, puis il vous est rendu.", progress: "Analyse de l'artwork 1 sur 3",
  },
};

for (const language of ["en", "fr"] as const) {
  test(`dashboard names the import and scan actions clearly (${language})`, async ({ context, page, baseURL }) => {
    const text = copy[language];
    await context.addCookies([
      { name: "language", value: language, url: baseURL! },
      { name: "auth_token", value: "browser-test-only", url: baseURL!, httpOnly: true },
    ]);
    await mockDashboard(page);
    await page.goto("/dashboard");

    await expect(page.getByText(text.reposts, { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Scans Report|Rapport des scans/)).toHaveCount(0);
    await expect(page.getByText(text.quota, { exact: true })).toBeVisible();

    await page.getByRole("button", { name: text.upload }).click();
    const upload = page.getByRole("dialog");
    await expect(upload.getByRole("heading", { name: text.uploadTitle })).toBeVisible();
    // In French "télécharger" reads as a download; the upload flow must not use it.
    await expect(upload.getByText(/[Tt]éléchar/)).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(upload).toBeHidden();

    const scanRequest = page.waitForRequest((request) => request.method() === "POST" && request.url().endsWith("/scan"));
    await page.getByRole("button", { name: text.scan }).click();
    await scanRequest;
    await expect(page.getByRole("dialog").getByText(text.progress)).toBeVisible();
  });
}
