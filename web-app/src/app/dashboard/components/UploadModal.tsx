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

  useEffect(() => {
    if (!open && uploadResult) {
      const { uploadedCount, failedCount, uploadedNames } = uploadResult;

      if (failedCount === 0) {
        const namesDisplay =
          uploadedNames.length <= 3
            ? uploadedNames.map((name) => `'${name}'`).join(", ")
            : `${uploadedNames.length} artworks`;

        toast.success(
          `${namesDisplay} ${uploadedNames.length > 1 ? "have" : "has"} been uploaded, you can see ${uploadedNames.length > 1 ? "them" : "it"} in your artwork gallery`,
          { duration: 5000 }
        );
      } else if (uploadedCount > 0) {
        toast.warning(`Uploaded ${uploadedCount}, failed ${failedCount}`, {
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
          <DialogTitle>Upload Pictures</DialogTitle>
          <DialogDescription>
            Drag & drop files or click to select files to upload
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
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
