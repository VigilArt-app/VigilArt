import { toast } from "sonner";
import type { UserUpdate } from "@vigilart/shared/types";
import type { UploadUrlGet, UploadUrlsGetDTO, UserGet } from "@vigilart/shared";
import { authenticatedFetch } from "../../utils/auth/authenticatedFetch";

/**
 * Get presigned upload URL for avatar from storage service
 */
export const getAvatarUploadUrl = async (filename: string): Promise<UploadUrlGet> => {
  try {
    const response = await authenticatedFetch(`/storage/artworks/upload-urls`, {
      method: "POST",
      body: JSON.stringify({
        filenames: [filename],
        prefix: "profiles",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const urlsData = await response.json();
    const uploadUrls: UploadUrlsGetDTO = urlsData.data || urlsData;
    return uploadUrls[filename];
  } catch (error) {
    toast.error("Failed to prepare avatar upload");
    throw error;
  }
};

/**
 * Upload avatar file to R2 presigned URL
 */
export const uploadAvatarToR2 = async (
  file: File,
  presignedUrl: string
): Promise<void> => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
  } catch (error) {
    toast.error("Failed to upload avatar");
    throw error;
  }
};

/**
 * Get download URL for avatar from storage service
 */
export const getAvatarDownloadUrl = async (storageKey: string): Promise<string> => {
  try {
    const response = await authenticatedFetch(`/storage/artworks/download-urls`, {
      method: "POST",
      body: JSON.stringify({
        storageKeys: [storageKey],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get download URL");
    }

    const urlsData = await response.json();
    const downloadUrls = urlsData.data || urlsData;
    return downloadUrls[storageKey];
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  userId: string,
  updateData: UserUpdate
): Promise<UserGet> => {
  try {
    const response = await authenticatedFetch(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to update user profile"
      );
    }

    const data = await response.json();
    toast.success("Profile updated successfully");
    return data.data || data;
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to update profile"
    );
    throw error;
  }
};
