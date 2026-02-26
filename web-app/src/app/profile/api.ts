import { toast } from "sonner";
import type { UserGet, UserUpdate } from "@vigilart/shared/types";
import type { UploadUrlGet, UploadUrlsGetDTO } from "@vigilart/shared";
import { authenticatedFetch } from "../../utils/auth/authenticatedFetch";
import { getUserIdFromToken } from "../../utils/auth/getUserIdFromToken";

/**
 * Fetch current user profile
 */
export const fetchUserProfile = async (): Promise<UserGet> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    toast.error("User not authenticated. Please login.");
    throw new Error("Not authenticated");
  }

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${API_BASE}/users/${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    toast.error("Failed to load user profile");
    throw error;
  }
};

/**
 * Get presigned upload URL for avatar from storage service
 */
export const getAvatarUploadUrl = async (filename: string): Promise<UploadUrlGet> => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${API_BASE}/storage/artworks/upload-urls`, {
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
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${API_BASE}/storage/artworks/download-urls`, {
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
  updateData: UserUpdate
): Promise<UserGet> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    toast.error("User not authenticated. Please login.");
    throw new Error("Not authenticated");
  }

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${API_BASE}/users/${userId}`, {
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
