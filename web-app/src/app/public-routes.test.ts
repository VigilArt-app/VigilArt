import assert from "node:assert/strict";
import test from "node:test";

const publicRoutesUrl = new URL("./public-routes.ts", import.meta.url);
const {
  getRouteRedirect,
  PUBLIC_SHELL_ROUTES,
} = (await import(publicRoutesUrl.href)) as typeof import("./public-routes");

test("anonymous visitors can read both legal pages", () => {
  const anonymous = { hasAuthToken: false, hasRefreshToken: false };

  assert.equal(getRouteRedirect("/terms", anonymous), null);
  assert.equal(getRouteRedirect("/privacy", anonymous), null);
});

test("signed-in visitors can read both legal pages", () => {
  const signedIn = { hasAuthToken: true, hasRefreshToken: true };

  assert.equal(getRouteRedirect("/terms", signedIn), null);
  assert.equal(getRouteRedirect("/privacy", signedIn), null);
});

test("legal pages use the public shell while app pages keep the app shell", () => {
  assert.equal(PUBLIC_SHELL_ROUTES.includes("/terms"), true);
  assert.equal(PUBLIC_SHELL_ROUTES.includes("/privacy"), true);
  assert.equal(PUBLIC_SHELL_ROUTES.includes("/dashboard"), false);
});

test("existing dashboard redirects remain unchanged", () => {
  const anonymous = { hasAuthToken: false, hasRefreshToken: false };
  const signedIn = { hasAuthToken: true, hasRefreshToken: true };

  assert.equal(getRouteRedirect("/dashboard", anonymous), "/login");
  assert.equal(getRouteRedirect("/", signedIn), "/dashboard");
  assert.equal(getRouteRedirect("/login", signedIn), "/dashboard");
  assert.equal(getRouteRedirect("/sign-up", signedIn), "/dashboard");
});
