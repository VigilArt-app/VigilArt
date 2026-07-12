"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/components/contexts/authContext";
import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch";
import { useTranslation } from "react-i18next";
import type {
  MatchingPage as SharedMatchingPage,
  ScanStatus,
  ScanProgress,
} from "@vigilart/shared/types";

export type { ScanProgress };

type MatchingPage = Omit<SharedMatchingPage, "firstDetectedAt"> & {
  firstDetectedAt: string;
};

export interface ReportData {
  id: string;
  userId: string;
  detectionDate: string;
  matchingPages: MatchingPage[];
}

interface UseCreateReportResult {
  loading: boolean;
  error: string | null;
  report: ReportData | null;
  progress: ScanProgress | null;
  handleCreate: () => Promise<void>;
  resetState: () => void;
}

const POLL_INTERVAL_MS = 2000;
// Give up (and surface an error) if a scan never reports terminal state.
const POLL_TIMEOUT_MS = 10 * 60 * 1000;
// Per-request ceiling so a hung connection can't stall a poll tick or the
// final details fetch forever (native fetch has no timeout of its own).
const REQUEST_TIMEOUT_MS = 15 * 1000;

export function useCreateReport(): UseCreateReportResult {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const { user, loading: userLoading } = useAuth();

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingInFlight = useRef(false);
  // Bumped on every new scan and on reset; an in-flight poll from a superseded
  // run compares against this and bails before touching state.
  const runIdRef = useRef(0);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollingInFlight.current = false;
  };

  // Stop polling if the component using the hook unmounts (e.g. navigation).
  // The backend job keeps running server-side; only the UI polling stops.
  useEffect(() => stopPolling, []);

  const failWith = (message: string) => {
    stopPolling();
    setError(message);
    setLoading(false);
  };

  const fetchReportDetails = async (reportId: string, runId: number) => {
    try {
      const res = await authenticatedFetch(`/reports/details/${reportId}`, {
        method: "GET",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      // The run was superseded (modal closed / new scan) while fetching.
      if (runIdRef.current !== runId) {
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        failWith(
          `${t("artworks_report_page.created_but_details_failed")}: ${err.message || res.statusText}`
        );
        return;
      }

      const detailsResponse = await res.json();
      if (runIdRef.current !== runId) {
        return;
      }
      const reportData: ReportData = detailsResponse.data || detailsResponse;
      setReport(reportData);
      setLoading(false);
    } catch {
      // Timeout / network error — polling is already stopped, so surface an
      // error rather than leaving the modal stuck on the spinner.
      if (runIdRef.current === runId) {
        failWith(t("artworks_report_page.scan_failed"));
      }
    }
  };

  const handleCreate = async () => {
    if (userLoading) {
      return;
    }

    if (!user?.id) {
      setError(t("artworks_report_page.error"));
      return;
    }

    const userId = user.id;

    stopPolling();
    const runId = ++runIdRef.current;
    setError(null);
    setReport(null);
    setProgress(null);
    setLoading(true);

    try {
      const enqueueRes = await authenticatedFetch(
        `/reports/user/${userId}/scan`,
        { method: "POST" }
      );

      if (!enqueueRes.ok) {
        const err = await enqueueRes
          .json()
          .catch(() => ({ message: enqueueRes.statusText }));
        failWith(
          `${t("artworks_report_page.load_failed")}: ${err.message || enqueueRes.statusText}`
        );
        return;
      }

      const enqueued = await enqueueRes.json();
      const jobId = (enqueued.data || enqueued)?.jobId;

      if (!jobId) {
        failWith(t("artworks_report_page.created_but_no_id"));
        return;
      }

      const startedAt = Date.now();
      // Clear any interval a concurrent/previous handleCreate may have set
      // before overwriting the ref, so we never leak an orphaned poller.
      stopPolling();
      pollRef.current = setInterval(async () => {
        // Enforce the overall deadline first — even if a poll is stuck
        // in-flight — so a hung request can never disable the timeout.
        if (runIdRef.current !== runId) {
          return;
        }
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          failWith(t("artworks_report_page.scan_failed"));
          return;
        }
        // Skip if a previous poll is still in flight.
        if (pollingInFlight.current) {
          return;
        }
        pollingInFlight.current = true;
        try {
          const statusRes = await authenticatedFetch(
            `/reports/user/${userId}/scan/${jobId}`,
            { method: "GET", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
          );
          // The user started/reset another run while we were awaiting.
          if (runIdRef.current !== runId) {
            return;
          }
          // Job is gone (evicted / never enqueued) — terminal, not transient.
          if (statusRes.status === 404) {
            failWith(t("artworks_report_page.scan_failed"));
            return;
          }
          if (!statusRes.ok) {
            return; // transient (5xx / network); bounded by POLL_TIMEOUT_MS
          }

          const body = await statusRes.json();
          if (runIdRef.current !== runId) {
            return;
          }
          const scan: ScanStatus = body.data || body;

          if (scan.progress) {
            setProgress(scan.progress);
          }

          if (scan.state === "completed") {
            stopPolling();
            if (scan.reportId) {
              await fetchReportDetails(scan.reportId, runId);
            } else {
              failWith(t("artworks_report_page.created_but_no_id"));
            }
          } else if (scan.state === "failed") {
            failWith(scan.error || t("artworks_report_page.scan_failed"));
          }
        } catch {
          // ignore transient poll errors; bounded by POLL_TIMEOUT_MS
        } finally {
          pollingInFlight.current = false;
        }
      }, POLL_INTERVAL_MS);
    } catch (e: unknown) {
      let errorMessage: string;
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      } else {
        try {
          errorMessage = JSON.stringify(e);
        } catch {
          errorMessage = String(e);
        }
      }
      failWith(`${t("artworks_report_page.error")}: ${errorMessage}`);
    }
  };

  const resetState = () => {
    // Supersede any in-flight poll so it can't resurrect stale state.
    runIdRef.current += 1;
    stopPolling();
    setError(null);
    setReport(null);
    setProgress(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    report,
    progress,
    handleCreate,
    resetState,
  };
}
