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