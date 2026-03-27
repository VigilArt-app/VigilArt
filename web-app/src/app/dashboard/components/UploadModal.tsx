"use client";

import { useEffect } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "sonner";
import { useFileUpload } from "./upload/useFileUpload";
import { FileDropzone } from "./upload/FileDropzone";
import { FileList } from "./upload/FileList";
import { useTranslation } from "react-i18next";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const {
    uploadedFiles,
    isUploading,
    uploadResult,
    addFiles,
    removeFile,
    updateDescription,
    uploadFiles,
    setUploadResult,
  } = useFileUpload();
  const { t } = useTranslation();

  useEffect(() => {
    if (!open && uploadResult) {
      const { uploadedCount, failedCount, uploadedNames } = uploadResult;

      if (failedCount === 0) {
        const namesDisplay =
          uploadedNames.length <= 3
            ? uploadedNames.map((name) => `'${name}'`).join(", ")
            : `${uploadedNames.length} ${t("dashboard_page.upload.artworks")}`;

        toast.success(
          `${namesDisplay} ${uploadedNames.length > 1 ? t("dashboard_page.upload.have") : t("dashboard_page.upload.has")} ${t("dashboard_page.upload.been_uploaded")} ${uploadedNames.length > 1 ? t("dashboard_page.upload.them") : t("dashboard_page.upload.it")} ${t("dashboard_page.upload.in_your_gallery")}`,
          { duration: 5000 }
        );
      } else if (uploadedCount > 0) {
        toast.warning(`${t("dashboard_page.upload.uploaded")} ${uploadedCount}, ${t("dashboard_page.upload.failed")} ${failedCount}`, {
          duration: 5000,
        });
      }

      setUploadResult(null);
    }
  }, [open, uploadResult, setUploadResult]);

  const handleUpload = async () => {
    const success = await uploadFiles();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dashboard_page.upload.upload_picture")}</DialogTitle>
          <DialogDescription>
            {t("dashboard_page.upload.drag_and_drop")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <FileDropzone onFilesAdded={addFiles} />

          <FileList
            files={uploadedFiles}
            onRemove={removeFile}
            onDescriptionChange={updateDescription}
          />

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              {t("dashboard_page.upload.cancel")}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? t("dashboard_page.upload.uploading") : t("dashboard_page.upload.uploaded_files")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
