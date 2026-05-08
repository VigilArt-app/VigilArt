import { Request } from "express";

export function getCookieDomain(request?: Request): string | undefined {
    if (process.env.NODE_ENV !== "production" || !request)
      return undefined;

    const origin = request.header("origin") || request.header("referer");
    const hostname = origin
      ? new URL(origin).hostname
      : request.header("host")?.split(":")[0];

    if (!hostname || hostname === "localhost" || hostname === "127.0.0.1")
      return undefined;

    const normalizedHostname = hostname.replace(/^www\./, "");
    const parts = normalizedHostname.split(".");

    if (parts.length < 2)
      return undefined;
    return parts.slice(-2).join(".");
  }

export function getCookieOptions(maxAge?: number, request?: Request) {
    const isProduction = process.env.NODE_ENV === "production";
    const domain = getCookieDomain(request);

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      path: "/",
      ...(domain ? { domain } : {}),
      ...(typeof maxAge === "number" ? { maxAge } : {})
    };
  }