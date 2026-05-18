"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { ReportData } from "@/src/hooks/useCreateReport";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportData | null;
  error: string | null;
  loading: boolean;
}

export function ReportModal({
  open,
  onOpenChange,
  report,
  error,
  loading,
}: ReportModalProps) {
  const { t, i18n } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {error
              ? t("artworks_report_page.error")
              : report
                ? t("artworks_report_page.report_details")
                : t("artworks_report_page.create_report")}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">{t("artworks_report_page.error")}</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        ) : report ? (
          <div className="space-y-6">
            <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">
                  {t("artworks_report_page.report_created")}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {report.matchingPages?.length || 0}{" "}
                  {t("artworks_report_page.detections_found")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>{t("artworks_report_page.detection_date")}:</strong>{" "}
                {new Date(report.detectionDate).toLocaleString(i18n.language)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{t("artworks_report_page.detections_count")}:</strong>{" "}
                {report.matchingPages?.length || 0}
              </p>
            </div>

            {(report.matchingPages?.length || 0) > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("artworks_report_page.detections")}
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {report.matchingPages.map((page) => (
                    <div
                      key={`${page.artworkId}-${page.id}-${page.url}-${page.firstDetectedAt}`}
                      className="border rounded-lg p-4"
                    >
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
                        <div className="flex-grow min-w-0">
                          <p className="text-sm">
                            <strong>{t("artworks_report_page.category")}:</strong>{" "}
                            {page.category}
                          </p>
                          <p className="text-sm">
                            <strong>{t("artworks_report_page.website")}:</strong>{" "}
                            {page.websiteName}
                          </p>
                          <p className="text-sm">
                            <strong>{t("artworks_report_page.page_title")}:</strong>{" "}
                            {page.pageTitle}
                          </p>
                          <p className="text-sm">
                            <strong>{t("artworks_report_page.first_detected")}:</strong>{" "}
                            {new Date(page.firstDetectedAt).toLocaleString(
                              i18n.language
                            )}
                          </p>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
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
        ) : null}

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {error || report
              ? t("dashboard_page.upload.cancel")
              : t("artworks_report_page.processing")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
