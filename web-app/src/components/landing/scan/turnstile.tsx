"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "../../../lib/api-base-url";

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      appearance?: "always" | "execute" | "interaction-only";
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "flexible" | "compact";
    }
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Cloudflare's bot check. Rendered in "interaction-only" mode, so most visitors
// see nothing at all and only a suspicious one gets a challenge.
export function Turnstile({
  onToken,
  resetSignal
}: {
  onToken: (token: string | null) => void;
  // Bumped by the caller once a token has been spent. A Turnstile token is
  // single-use, so without this the visitor's second scan would be sent with
  // the token from the first and rejected by the backend as a failed bot check.
  resetSignal: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const handleToken = useCallback(onToken, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !scriptReady) return;
    const container = containerRef.current;
    const api = window.turnstile;
    if (!container || !api) return;

    widgetRef.current = api.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => handleToken(token),
      // A token is single-use and expires. Clearing it forces a fresh one
      // rather than sending a token the backend will reject.
      "expired-callback": () => handleToken(null),
      "error-callback": () => handleToken(null),
      appearance: "interaction-only",
      theme: "auto",
      size: "flexible"
    });

    return () => {
      if (widgetRef.current) api.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [scriptReady, handleToken]);

  useEffect(() => {
    if (resetSignal === 0 || !widgetRef.current) return;
    handleToken(null);
    window.turnstile?.reset(widgetRef.current);
  }, [resetSignal, handleToken]);

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="empty:hidden" />
    </>
  );
}
