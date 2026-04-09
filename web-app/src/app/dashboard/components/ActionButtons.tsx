"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Image as ImageIcon, Upload } from "lucide-react";
import { UploadModal } from "./UploadModal";
import { useTranslation } from "react-i18next";

interface ActionButtonsProps {
  onUploadComplete?: () => void;
}

export default function ActionButtons({ onUploadComplete }: ActionButtonsProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-4 w-full">
        <Button variant="outline" className="w-full h-20 flex items-center justify-between px-6">
          <span className="font-bold text-lg">{t("dashboard_page.upload.see_gallery")}</span>
          <ImageIcon className="w-6 h-6" />
        </Button>
        <Button 
          variant="outline" 
          className="w-full h-20 flex items-center justify-between px-6"
          onClick={() => setUploadModalOpen(true)}
        >
          <span className="font-bold text-lg">{t("dashboard_page.upload.upload_artworks")}</span>
          <Upload className="w-6 h-6" />
        </Button>
      </div>
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={onUploadComplete}
      />
    </>
  );
}
