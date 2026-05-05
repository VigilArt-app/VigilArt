import { useState } from "react";
import { toast } from "sonner";
import type { UploadUrlsGetDTO } from "@vigilart/shared";
import { getImageDimensions } from "./imageUtils";
import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch";
import { useAuth } from "@/src/components/contexts/authContext";
import { useTranslation } from "react-i18next";

interface UploadedFile {
  file: File;
  preview: string;
  description: string;
  width?: number;
  height?: number;
}

interface UploadResult {
  uploadedCount: number;
  failedCount: number;
  uploadedNames: string[];
}

interface UseFileUploadOptions {
  onUploadComplete?: () => void;
}

export function useFileUpload({ onUploadComplete }: UseFileUploadOptions = {}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { user, loading: userLoading } = useAuth();
  const { t } = useTranslation();

  const addFiles = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateDescription = (index: number, description: string) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      updated[index].description = description;
      return updated;
    });
  };

  const clearFiles = () => {
    uploadedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setUploadedFiles([]);
  };

  const uploadFiles = async (): Promise<boolean> => {
    if (userLoading) {
      return false;
    }

    if (!user?.id) {
      toast.error("Not authenticated");
      return false;
    }

    const userId = user.id;

    if (uploadedFiles.length === 0) {
      toast.error(t("dashboard_page.upload.select_one_file"));
      return false;
    }
    setIsUploading(true);
    const totalFiles = uploadedFiles.length;
    let uploadedCount = 0;
    let failedCount = 0;
    const uploadedNames: string[] = [];

    toast.loading(`${t("dashboard_page.upload.uploading_toatser")} ${totalFiles} image${totalFiles > 1 ? "s" : ""}...`, {
      id: "upload-progress",
    });

    try {
      // Get presigned URLs
      const filenames = uploadedFiles.map((f) => f.file.name);

      const uploadUrlsResponse = await authenticatedFetch(`/storage/artworks/upload-urls`, {
        method: "POST",
        body: JSON.stringify({
          filenames,
          prefix: "artworks",
        }),
      });

      if (!uploadUrlsResponse.ok) {
        throw new Error("Failed to get presigned URLs");
      }

      const uploadUrlsRaw = await uploadUrlsResponse.json();
      const uploadUrls: UploadUrlsGetDTO = uploadUrlsRaw.data || uploadUrlsRaw;

      // Upload files to R2
      const storageKeysMap = new Map<string, string>();
      uploadedCount = 0;

      for (const { file } of uploadedFiles) {
        try {
          const uploadInfo = uploadUrls[file.name];

          if (!uploadInfo) {
            failedCount++;
            toast.error(t("dashboard_page.upload.failed_toaster") + ` ${file.name}`);
            continue;
          }

          const uploadResponse = await fetch(uploadInfo.presignedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            failedCount++;
            toast.error(t("dashboard_page.upload.failed_toaster") + ` ${file.name}`);
            continue;
          }

          storageKeysMap.set(file.name, uploadInfo.storageKey);
          uploadedCount++;
          toast.loading(t("dashboard_page.upload.uploading_toatser") + ` ${uploadedCount}/${totalFiles}...`, {
            id: "upload-progress",
          });
        } catch (error) {
          failedCount++;
          toast.error(t("dashboard_page.upload.error_toaster") + ` ${file.name}`);
        }
      }

      if (uploadedCount === 0) {
        toast.dismiss("upload-progress");
        toast.error(t("dashboard_page.upload.failed_to_upload"));
        setIsUploading(false);
        return false;
      }

      // Create artwork records
      toast.loading(t("dashboard_page.upload.create_records"), { id: "upload-progress" });
      const artworksToCreate: any[] = [];

      for (const { file, description } of uploadedFiles) {
        const storageKey = storageKeysMap.get(file.name);
        if (!storageKey) {
          continue;
        }

        try {
          const { width, height } = await getImageDimensions(file);

          artworksToCreate.push({
            userId,
            originalFilename: file.name,
            contentType: file.type,
            sizeBytes: file.size,
            description: description || "",
            storageKey,
            width,
            height,
          });
        } catch (_) {
          failedCount++;
        }
      }

      if (artworksToCreate.length === 0) {
        toast.dismiss("upload-progress");
        toast.error(t("dashboard_page.upload.no_artworks_to_create"));
        setIsUploading(false);
        return false;
      }

      const createResponse = await authenticatedFetch(`/artworks/batch`, {
        method: "POST",
        body: JSON.stringify(artworksToCreate),
      });

      if (!createResponse.ok) {
        const contentType = createResponse.headers.get("content-type");
        let errorMessage = t("dashboard_page.upload.unknown_error");

        if (contentType?.includes("application/json")) {
          try {
            const error = await createResponse.json();
            errorMessage =
              error.message || error.data?.message || `Error: ${createResponse.status}`;
          } catch {
            errorMessage = `${t("dashboard_page.upload.server_error")} ${createResponse.status}`;
          }
        }

        throw new Error(`Failed to create artworks: ${errorMessage}`);
      }

      const createJson = await createResponse.json().catch(() => null);
      const createdArtworks = (createJson && (createJson.data || createJson)) || {};

      uploadedCount = createdArtworks.count || createdArtworks.artworks?.length || 0;
      uploadedNames.push(
        ...(createdArtworks.artworks?.map((a: any) => a.originalFilename) || [])
      );

      const reportResponse = await authenticatedFetch(`/reports/user/${userId}`, {
        method: "POST"
      });

      if (!reportResponse.ok) {
        toast.error(t("dashboard_page.upload.scan_report_failed"));
      } else {
        onUploadComplete?.();
      }

      toast.dismiss("upload-progress");
      setUploadResult({ uploadedCount, failedCount, uploadedNames });
      clearFiles();
      return true;
    } catch (error) {
      toast.dismiss("upload-progress");
      toast.error(error instanceof Error ? error.message : t("dashboard_page.upload.error_upload"));
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadedFiles,
    isUploading,
    uploadResult,
    addFiles,
    removeFile,
    updateDescription,
    clearFiles,
    uploadFiles,
    setUploadResult,
  };
}
