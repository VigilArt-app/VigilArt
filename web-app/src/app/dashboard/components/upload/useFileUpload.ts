import { useState } from "react";
import { toast } from "sonner";
import { getUserIdFromToken } from "../../../../utils/auth/getUserIdFromToken";
import type { ArtworkCreateManyResponseDTO, UploadUrlsGetDTO } from "@vigilart/shared";
import { getImageDimensions } from "./imageUtils";

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

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

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
    if (uploadedFiles.length === 0) {
      toast.error("Please select at least one file");
      return false;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return false;
    }

    const authToken =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
        : null;

    if (!authToken) {
      toast.error("Authentication token not found. Please login again.");
      return false;
    }

    setIsUploading(true);
    const totalFiles = uploadedFiles.length;
    let uploadedCount = 0;
    let failedCount = 0;
    const uploadedNames: string[] = [];
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;

    toast.loading(`Uploading ${totalFiles} image${totalFiles > 1 ? "s" : ""}...`, {
      id: "upload-progress",
    });

    try {
      // Get presigned URLs
      const filenames = uploadedFiles.map((f) => f.file.name);

      const uploadUrlsResponse = await fetch(`${API_BASE}/storage/artworks/upload-urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
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
            toast.error(`Failed: ${file.name}`);
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
            toast.error(`Failed: ${file.name}`);
            continue;
          }

          storageKeysMap.set(file.name, uploadInfo.storageKey);
          uploadedCount++;
          toast.loading(`Uploaded ${uploadedCount}/${totalFiles}...`, {
            id: "upload-progress",
          });
        } catch (error) {
          failedCount++;
          toast.error(`Error: ${file.name}`);
        }
      }

      if (uploadedCount === 0) {
        toast.dismiss("upload-progress");
        toast.error(`Failed to upload any files`);
        setIsUploading(false);
        return false;
      }

      // Create artwork records
      toast.loading(`Creating artwork records...`, { id: "upload-progress" });
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
        } catch (error) {
          failedCount++;
        }
      }

      if (artworksToCreate.length === 0) {
        toast.dismiss("upload-progress");
        toast.error(`No artworks to create`);
        setIsUploading(false);
        return false;
      }

      const createResponse = await fetch(`${API_BASE}/artworks/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(artworksToCreate),
      });

      if (!createResponse.ok) {
        const contentType = createResponse.headers.get("content-type");
        let errorMessage = "Unknown error";

        if (contentType?.includes("application/json")) {
          try {
            const error = await createResponse.json();
            errorMessage =
              error.message || error.data?.message || `Error: ${createResponse.status}`;
          } catch {
            errorMessage = `Server error: ${createResponse.status}`;
          }
        }

        throw new Error(`Failed to create artworks: ${errorMessage}`);
      }

      const result: ArtworkCreateManyResponseDTO = await createResponse.json();
      const createdArtworks = result;
      uploadedCount = createdArtworks.count || createdArtworks.artworks?.length || 0;
      uploadedNames.push(
        ...(createdArtworks.artworks?.map((a: any) => a.originalFilename) || [])
      );

      toast.dismiss("upload-progress");
      setUploadResult({ uploadedCount, failedCount, uploadedNames });
      clearFiles();
      return true;
    } catch (error) {
      toast.dismiss("upload-progress");
      toast.error(error instanceof Error ? error.message : "An error occurred during upload");
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
