import type { Response } from "express";

export function getCookieDomain(): string | undefined {
  if (process.env.COOKIE_DOMAIN === "localhost")
    return;
  return process.env.COOKIE_DOMAIN;
}

export function getCookieOptions(maxAge?: number) {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = getCookieDomain();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    ...(domain ? { domain } : {}),
    ...(typeof maxAge === "number" ? { maxAge } : {})
  };
}

/**
 * Clears the auth cookies using the same options they were set with, so the
 * browser reliably matches and deletes them (domain/path/secure must match).
 */
export function clearAuthCookies(response: Response): void {
  const cookieOptions = getCookieOptions();
  response.clearCookie("auth_token", cookieOptions);
  response.clearCookie("refresh_token", cookieOptions);
}