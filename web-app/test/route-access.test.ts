import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

const routeAccessUrl = new URL("../src/lib/route-access.ts", import.meta.url);

test("route access policy lives in the shared library", () => {
  assert.equal(existsSync(routeAccessUrl), true);
});

test("public routes remain accessible and use the public shell", async () => {
  const { getRouteRedirect, PUBLIC_SHELL_ROUTES } = (await import(
    routeAccessUrl.href
  )) as typeof import("../src/lib/route-access");
  const anonymous = { hasAuthToken: false, hasRefreshToken: false };
  const signedIn = { hasAuthToken: true, hasRefreshToken: true };

  for (const pathname of ["/terms", "/privacy", "/faq"]) {
    assert.equal(getRouteRedirect(pathname, anonymous), null);
    assert.equal(getRouteRedirect(pathname, signedIn), null);
    assert.equal(PUBLIC_SHELL_ROUTES.includes(pathname), true);
  }

  assert.equal(PUBLIC_SHELL_ROUTES.includes("/dashboard"), false);
});

test("existing dashboard redirects remain unchanged", async () => {
  const { getRouteRedirect } = (await import(
    routeAccessUrl.href
  )) as typeof import("../src/lib/route-access");
  const anonymous = { hasAuthToken: false, hasRefreshToken: false };
  const signedIn = { hasAuthToken: true, hasRefreshToken: true };

  assert.equal(getRouteRedirect("/dashboard", anonymous), "/login");
  assert.equal(getRouteRedirect("/", signedIn), "/dashboard");
  assert.equal(getRouteRedirect("/login", signedIn), "/dashboard");
  assert.equal(getRouteRedirect("/sign-up", signedIn), "/dashboard");
});
