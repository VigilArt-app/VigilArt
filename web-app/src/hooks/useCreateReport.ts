"use client";

import { useState } from "react";
import { useAuth } from "@/src/components/contexts/authContext";
import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch";
import { useTranslation } from "react-i18next";
import type { MatchingPage as SharedMatchingPage } from "@vigilart/shared/types";

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
  handleCreate: () => Promise<void>;
  resetState: () => void;
}

export function useCreateReport(): UseCreateReportResult {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const { user, loading: userLoading } = useAuth();

  const handleCreate = async () => {
    if (userLoading) {
      return;
    }

    if (!user?.id) {
      setError(t("artworks_report_page.error"));
      return;
    }

    const userId = user.id;

    setError(null);
    setReport(null);
    setLoading(true);

    try {
      const reportRes = await authenticatedFetch(`/reports/user/${userId}`, {
        method: "POST"
      });

      if (!reportRes.ok) {
        const err = await reportRes.json().catch(() => ({ message: reportRes.statusText }));
        setError(`${t("artworks_report_page.load_failed")}: ${err.message || reportRes.statusText}`);
        setLoading(false);
        return;
      }

      const createdResponse = await reportRes.json();
      const createdReport = createdResponse.data || createdResponse;
      const reportId = createdReport?.id;

      if (!reportId) {
        setError(t("artworks_report_page.created_but_no_id"));
        setLoading(false);
        return;
      }

      const reportDetailsRes = await authenticatedFetch(`/reports/details/${reportId}`, {
        method: "GET"
      });

      if (!reportDetailsRes.ok) {
        const err = await reportDetailsRes.json().catch(() => ({ message: reportDetailsRes.statusText }));
        setError(`${t("artworks_report_page.created_but_details_failed")}: ${err.message || reportDetailsRes.statusText}`);
        setLoading(false);
        return;
      }

      const detailsResponse = await reportDetailsRes.json();
      const reportData: ReportData = detailsResponse.data || detailsResponse;
      setReport(reportData);
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
      setError(`${t("artworks_report_page.error")}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setReport(null);
  };

  return {
    loading,
    error,
    report,
    handleCreate,
    resetState
  };
}
