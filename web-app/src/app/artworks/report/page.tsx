"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { MatchingPage as SharedMatchingPage } from "@vigilart/shared/types";
import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch";
import { useAuth } from "@/src/components/contexts/authContext";

type MatchingPage = Omit<SharedMatchingPage, "firstDetectedAt"> & {
  firstDetectedAt: string;
};

interface ReportData {
  id: string;
  userId: string;
  detectionDate: string;
  matchingPages: MatchingPage[];
}

export default function ReportPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const matchingPages: MatchingPage[] = report?.matchingPages || [];
  const { user, loading: userLoading } = useAuth();

  const handleCreate = async () => {
    if (userLoading) {
      return;
    }

    if (!user?.id) {
      setMessage(t("artworks_report_page.error"));
      return;
    }

    const userId = user.id;

    setMessage(null);
    setReport(null);
    setLoading(true);

    try {
      const reportRes = await authenticatedFetch(`/reports/user/${userId}`, {
        method: "POST"
      });

      if (!reportRes.ok) {
        const err = await reportRes.json().catch(() => ({ message: reportRes.statusText }));
        setMessage(`${t("artworks_report_page.load_failed")}: ${err.message || reportRes.statusText}`);
        setLoading(false);
        return;
      }

      const createdResponse = await reportRes.json();
      const createdReport = createdResponse.data || createdResponse;
      const reportId = createdReport?.id;

      if (!reportId) {
        setMessage(t("artworks_report_page.created_but_no_id"));
        setLoading(false);
        return;
      }

      const reportDetailsRes = await authenticatedFetch(`/reports/details/${reportId}`, {
        method: "GET"
      });

      if (!reportDetailsRes.ok) {
        const err = await reportDetailsRes.json().catch(() => ({ message: reportDetailsRes.statusText }));
        setMessage(`${t("artworks_report_page.created_but_details_failed")}: ${err.message || reportDetailsRes.statusText}`);
        setLoading(false);
        return;
      }

      const detailsResponse = await reportDetailsRes.json();
      const reportData: ReportData = detailsResponse.data || detailsResponse;
      setReport(reportData);
      const matchCount = reportData.matchingPages?.length || 0;
      setMessage(`${t("artworks_report_page.report_created")}: ${matchCount} ${t("artworks_report_page.detections_found")}.`);
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
      setMessage(`${t("artworks_report_page.error")}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("artworks_report_page.title")}</h1>
      <p className="mb-4">{t("artworks_report_page.subtitle")}</p>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="inline-flex items-center rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
      >
        {loading ? t("artworks_report_page.processing") : t("artworks_report_page.create_report")}
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

      {report && (
        <div className="mt-8 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{t("artworks_report_page.report_details")}</h2>
          <div className="mb-4 text-sm text-gray-600">
            <p><strong>{t("artworks_report_page.detection_date")}:</strong> {new Date(report.detectionDate).toLocaleString(i18n.language)}</p>
            <p><strong>{t("artworks_report_page.detections_count")}:</strong> {report.matchingPages?.length || 0}</p>
          </div>

          {matchingPages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">{t("artworks_report_page.detections")}</h3>
              <div className="space-y-4">
                {matchingPages.map((page) => (
                  <div key={`${page.artworkId}-${page.id}-${page.url}-${page.firstDetectedAt}`} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {page.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={page.imageUrl}
                            alt={t("artworks_report_page.detected")}
                            className="w-24 h-24 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="text-sm"><strong>{t("artworks_report_page.category")}:</strong> {page.category}</p>
                        <p className="text-sm"><strong>{t("artworks_report_page.website")}:</strong> {page.websiteName}</p>
                        <p className="text-sm"><strong>{t("artworks_report_page.page_title")}:</strong> {page.pageTitle}</p>
                        <p className="text-sm"><strong>{t("artworks_report_page.first_detected")}:</strong> {new Date(page.firstDetectedAt).toLocaleString(i18n.language)}</p>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          {t("artworks_report_page.view_page")} →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}