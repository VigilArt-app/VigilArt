"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Upload, Search } from "lucide-react";
import { UploadModal } from "./UploadModal";
import { ReportModal } from "./ReportModal";
import { useCreateReport } from "@/src/hooks/useCreateReport";
import { useScanQuota } from "@/src/hooks/useScanQuota";
import { useTranslation } from "react-i18next";

interface ActionButtonsProps {
  onUploadComplete?: () => void;
}

export default function ActionButtons({ onUploadComplete }: ActionButtonsProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { quota, loading: quotaLoading, error: quotaError, refresh } = useScanQuota();
  const { loading, error, report, progress, handleCreate, resetState } =
    useCreateReport(refresh);
  const scanDisabled = loading || quota?.remaining === 0;

  const handleReportButtonClick = async () => {
    if (scanDisabled) return;
    resetState();
    setReportModalOpen(true);
    await handleCreate();
  };

  const handleReportModalOpenChange = (open: boolean) => {
    setReportModalOpen(open);
    // Closing the modal stops the UI polling (the scan keeps running server-side).
    if (!open) {
      resetState();
    }
  };

  return (
    <>
      <div className="space-y-4 w-full">
        <Button 
          variant="outline" 
          className="w-full h-20 flex items-center justify-between px-6"
          onClick={() => setUploadModalOpen(true)}
        >
          <span className="font-bold text-lg">{t("dashboard_page.upload.upload_artworks")}</span>
          <Upload className="w-6 h-6" />
        </Button>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full h-20 flex items-center justify-between px-6"
            onClick={handleReportButtonClick}
            disabled={scanDisabled}
          >
            <span className="font-bold text-lg">{t("artworks_report_page.create_report")}</span>
            <Search className="w-6 h-6" />
          </Button>
          {/* Under the button: it reads as a note on what the button allows. */}
          <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {quota ? (
              <>
                <p>{t("artworks_report_page.scan_quota", { remaining: quota.remaining, limit: quota.limit })}</p>
                {quota.remaining === 0 && quota.nextAvailableAt && (
                  <p>{t("artworks_report_page.next_scan_available", {
                    date: new Date(quota.nextAvailableAt).toLocaleString(i18n.language),
                  })}</p>
                )}
              </>
            ) : quotaLoading ? (
              <p>{t("artworks_report_page.scan_quota_loading")}</p>
            ) : quotaError ? (
              <div className="flex flex-wrap items-center gap-2">
                <p>{t("artworks_report_page.scan_quota_unavailable")}</p>
                <Button type="button" variant="link" className="h-auto p-0" onClick={() => void refresh()}>
                  {t("artworks_report_page.scan_quota_retry")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={onUploadComplete}
      />
      <ReportModal
        open={reportModalOpen}
        onOpenChange={handleReportModalOpenChange}
        report={report}
        error={error}
        loading={loading}
        progress={progress}
      />
    </>
  );
}
