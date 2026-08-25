"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicScanResult, PublicScanStatus } from "@vigilart/shared";
import { API_BASE_URL } from "../lib/api-base-url";

const POLL_INTERVAL_MS = 2000;
// The Google Lens call can take 120 seconds; this leaves room for a queue wait
// on top before the visitor is told the scan will not arrive.
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

export type ScanPhase = "idle" | "uploading" | "scanning" | "done" | "error";

export type ScanErrorKind =
  | "wrong_type"
  | "too_large"
  | "bot_check"
  | "rate_limited"
  | "generic";

interface Envelope<T> {
  data: T;
}

function errorKindFor(status: number): ScanErrorKind {
  // The only 400 this route returns is a rejected image: the browser reports a
  // file's type from its name, so a renamed file passes the check in the panel
  // and is caught server-side by its actual bytes.
  if (status === 400) return "wrong_type";
  if (status === 413) return "too_large";
  if (status === 403) return "bot_check";
  if (status === 429) return "rate_limited";
  return "generic";
}

export function usePublicScan() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [result, setResult] = useState<PublicScanResult | null>(null);
  const [errorKind, setErrorKind] = useState<ScanErrorKind | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  // One controller for the whole scan so leaving the page cancels both the
  // upload and every poll that follows it.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const refreshAllowance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public-scan/allowance`);
      if (!res.ok) return;
      const body: Envelope<{ remainingToday: number }> = await res.json();
      setRemainingToday(body.data.remainingToday);
    } catch {
      // The counter is a courtesy. If it cannot be read the page simply does
      // not show it, rather than blocking the upload.
    }
  }, []);

  useEffect(() => {
    void refreshAllowance();
  }, [refreshAllowance]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("idle");
    setResult(null);
    setErrorKind(null);
  }, []);

  const start = useCallback(
    async (file: File, turnstileToken: string | null) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setResult(null);
      setErrorKind(null);
      setPhase("uploading");

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch(`${API_BASE_URL}/public-scan`, {
          method: "POST",
          body: form,
          signal: controller.signal,
          headers: turnstileToken
            ? { "X-Turnstile-Token": turnstileToken }
            : undefined
        });

        if (!res.ok) {
          setErrorKind(errorKindFor(res.status));
          setPhase("error");
          void refreshAllowance();
          return;
        }

        const body: Envelope<{ scanId: string }> = await res.json();
        setPhase("scanning");
        void refreshAllowance();
        await poll(body.data.scanId, controller.signal);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorKind("generic");
        setPhase("error");
      }

      async function poll(scanId: string, signal: AbortSignal) {
        const deadline = Date.now() + POLL_TIMEOUT_MS;

        while (Date.now() < deadline) {
          await new Promise((resolve) =>
            setTimeout(resolve, POLL_INTERVAL_MS)
          );
          if (signal.aborted) return;

          const res = await fetch(
            `${API_BASE_URL}/public-scan/${scanId}`,
            { signal }
          );
          if (!res.ok) {
            setErrorKind("generic");
            setPhase("error");
            return;
          }

          const body: Envelope<PublicScanStatus> = await res.json();
          if (body.data.state === "done" && body.data.result) {
            setResult(body.data.result);
            setPhase("done");
            return;
          }
          if (body.data.state === "failed") {
            setErrorKind("generic");
            setPhase("error");
            return;
          }
        }

        // The scan may still finish server-side, but the visitor has waited
        // three minutes and needs an answer rather than an endless spinner.
        setErrorKind("generic");
        setPhase("error");
      }
    },
    [refreshAllowance]
  );

  return { phase, result, errorKind, remainingToday, start, reset };
}
