"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Upload, Search } from "lucide-react";
import { UploadModal } from "./UploadModal";
import { ReportModal } from "./ReportModal";
import { useCreateReport } from "@/src/hooks/useCreateReport";
import { useTranslation } from "react-i18next";

interface ActionButtonsProps {
  onUploadComplete?: () => void;
}

export default function ActionButtons({ onUploadComplete }: ActionButtonsProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { t } = useTranslation();
  const { loading, error, report, handleCreate, resetState } = useCreateReport();

  const handleReportButtonClick = async () => {
    resetState();
    setReportModalOpen(true);
    await handleCreate();
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
        <Button 
          variant="outline" 
          className="w-full h-20 flex items-center justify-between px-6"
          onClick={handleReportButtonClick}
          disabled={loading}
        >
          <span className="font-bold text-lg">{t("artworks_report_page.create_report")}</span>
          <Search className="w-6 h-6" />
        </Button>
      </div>
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={onUploadComplete}
      />
      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        report={report}
        error={error}
        loading={loading}
      />
    </>
  );
}
