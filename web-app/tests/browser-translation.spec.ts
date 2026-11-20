import { test, expect, type BrowserContext, type Page, type Route } from "@playwright/test";
import { InstagramDmcaFormJSON } from "@vigilart/shared";

// Pages translated by Chrome (Google Translate) or Samsung Internet used to
// crash with "Application error" when a button showed its loading icon.

const user = {
  id: "00000000-0000-4000-8000-000000000001", email: "artist@example.com",
  firstName: null, lastName: null, avatar: null, subscriptionTier: "FREE",
  autoRunReports: false, notificationsEnabled: false,
  createdAt: "2026-09-09T00:00:00.000Z", updatedAt: "2026-09-09T00:00:00.000Z",
};

const dmcaProfile = {
  id: "profile-1", userId: user.id, fullName: "Jane Artist", street: "12 rue des Arts", aptSuite: null,
  city: "Paris", postalCode: "75011", country: "France", email: "jane@example.com",
  phone: "+33 6 12 34 56 78", signature: "Jane Artist",
};

const notice = {
  id: "notice-1", userId: user.id, dmcaPlatformSlug: "INSTAGRAM", artworkId: null, status: "DRAFT",
  payload: {}, createdAt: "2026-11-20T00:00:00.000Z", updatedAt: "2026-11-20T00:00:00.000Z",
};

const artwork = (id: string, name: string) => ({
  id, userId: user.id, title: name, originalFilename: `${name}.png`, description: null,
  storageKey: null, lastScanAt: null, createdAt: "2026-09-09T00:00:00.000Z",
});

// A short delay keeps the button in its loading state long enough for React to render the spinner.
const slowly = (route: Route, json: unknown, status = 200) =>
  new Promise((resolve) => setTimeout(resolve, 300)).then(() => route.fulfill({ status, json }));

// What Google Translate and Samsung Internet do to a page: every text node is
// replaced by a <font> element holding the translated text.
const translatePage = (page: Page) =>
  page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (node.nodeValue?.trim() && !node.parentElement?.closest("script, style, textarea, select, option")) {
        textNodes.push(node);
      }
    }
    for (const node of textNodes) {
      const font = document.createElement("font");
      font.textContent = node.nodeValue;
      node.replaceWith(font);
    }
  });

const signIn = async (context: BrowserContext, page: Page, baseURL: string) => {
  await context.addCookies([
    { name: "language", value: "en", url: baseURL },
    { name: "auth_token", value: "browser-test-only", url: baseURL, httpOnly: true },
  ]);
  await page.route("**/api/v1/**", (route) => route.fulfill({ status: 404, json: { message: "Not found" } }));
  await page.route("**/auth/me", (route) => route.fulfill({ json: { success: true, data: user } }));
};

const watchCrashes = (page: Page) => {
  const crashes: string[] = [];
  page.on("pageerror", (error) => crashes.push(error.message));
  return crashes;
};

test("a page translated by the browser goes through the whole DMCA form without crashing", async ({ context, page, baseURL }) => {
  const crashes = watchCrashes(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await signIn(context, page, baseURL!);
  await page.route("**/dmca/platform", (route) => route.fulfill({ json: {
    success: true, data: [{ id: "platform-1", ...InstagramDmcaFormJSON }],
  } }));
  await page.route("**/dmca/profile/*", (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ json: { success: true, data: dmcaProfile } })
      : slowly(route, { success: true, data: dmcaProfile }));
  await page.route("**/dmca/notice/user/*", (route) => route.fulfill({ json: { success: true, data: [] } }));
  await page.route("**/dmca/notice", (route) => slowly(route, { success: true, data: notice }, 201));
  await page.route("**/dmca/notice/notice-1/generate", (route) => slowly(route, { success: true, data: {
    email: { to: "ip@instagram.com", subject: "DMCA Takedown Notice", body: "To the DMCA agent of Instagram." },
    pdf: { url: "https://example.com/notice-1.pdf" },
  } }));
  await page.route("**/dmca/notice/notice-1/status/SUBMITTED", (route) =>
    slowly(route, { success: true, data: { ...notice, status: "SUBMITTED" } }));
  await page.goto("/dmca");

  // Step 1
  await page.getByRole("button", { name: "Save DMCA profile" }).waitFor({ timeout: 20_000 });
  await translatePage(page);
  await page.getByRole("button", { name: "Save DMCA profile" }).click();
  await expect(page.getByText("DMCA profile saved.")).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();

  // Step 2, the step where the crash was reported
  await page.getByRole("combobox").first().selectOption("INSTAGRAM");
  const answers: Record<string, string> = {
    "contact_information-rights_holder": "Jane Artist",
    "contact_information-report_kind": "Photo",
    "contact_information-original_work_url": "https://www.artstation.com/artwork/peach",
    "contact_information-original_work_description": "Digital illustration of a peach character.",
    "infringing_content-report_kind": "Photo/Video/Post",
    "infringing_content-infringements-0-infringing_url": "https://www.instagram.com/p/C0ABCDEF123/",
    "infringing_content-content_infrigement_description": "This account reposted my illustration without permission.",
  };
  for (const [field, value] of Object.entries(answers)) {
    await page.locator(`#dmca-${field}`).fill(value);
  }
  await translatePage(page);
  await page.getByRole("button", { name: "Prepare notice" }).click();
  await expect(page.getByText("DMCA notice prepared.")).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();

  // Step 3
  await translatePage(page);
  await page.getByRole("button", { name: "Generate email + PDF" }).click();
  await expect(page.getByText("DMCA Takedown Notice")).toBeVisible();
  await translatePage(page);
  await page.getByRole("button", { name: "Copy subject" }).click();
  await page.getByRole("button", { name: "Copy body" }).click();
  await page.getByRole("button", { name: "Mark as submitted" }).click();
  await translatePage(page);
  await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("Notice marked as submitted.")).toBeVisible();

  await expect(page.getByText("Application error")).toBeHidden();
  expect(crashes).toEqual([]);
});

test("a page translated by the browser can load more artworks and delete one without crashing", async ({ context, page, baseURL }) => {
  const crashes = watchCrashes(page);
  await signIn(context, page, baseURL!);
  await page.route("**/artworks/user/*?*", (route) =>
    new URL(route.request().url()).searchParams.has("cursor")
      ? slowly(route, { success: true, data: { items: [artwork("artwork-2", "peach2")], nextCursor: null } })
      : route.fulfill({ json: { success: true, data: { items: [artwork("artwork-1", "peach1")], nextCursor: "page-2" } } }));
  await page.route("**/artworks/artwork-1", (route) => slowly(route, { success: true, data: null }));
  await page.goto("/artwork-gallery");

  await page.getByRole("button", { name: "Load more" }).waitFor({ timeout: 20_000 });
  await translatePage(page);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByText("peach2.png")).toBeVisible();

  await page.getByRole("button", { name: "Delete artwork" }).first().click();
  await translatePage(page);
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("peach1.png")).toBeHidden();

  await expect(page.getByText("Application error")).toBeHidden();
  expect(crashes).toEqual([]);
});
