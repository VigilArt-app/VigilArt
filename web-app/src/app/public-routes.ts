export const ANONYMOUS_ROUTES: readonly string[] = [
  "/",
  "/login",
  "/sign-up",
  "/terms",
  "/privacy",
];

export const SIGNED_IN_REDIRECT_ROUTES: readonly string[] = [
  "/",
  "/login",
  "/sign-up",
];

export const PUBLIC_SHELL_ROUTES: readonly string[] = [
  "/",
  "/terms",
  "/privacy",
];

export type RouteSession = Readonly<{
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
}>;

export type RouteRedirect = "/login" | "/dashboard" | null;

export const getRouteRedirect = (
  pathname: string,
  session: RouteSession,
): RouteRedirect => {
  if (
    !session.hasAuthToken &&
    !session.hasRefreshToken &&
    !ANONYMOUS_ROUTES.includes(pathname)
  ) {
    return "/login";
  }

  if (
    session.hasAuthToken &&
    SIGNED_IN_REDIRECT_ROUTES.includes(pathname)
  ) {
    return "/dashboard";
  }

  return null;
};
