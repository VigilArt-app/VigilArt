import { toast } from "sonner";
import { Artwork } from "./types";
import { getUserIdFromToken } from "../../../utils/auth/getUserIdFromToken";
import { authenticatedFetch } from "../../../utils/auth/authenticatedFetch";
import i18next from "i18next";

const t = (key: string, defaultValue: string) =>
  i18next.t(key, { defaultValue });

export const fetchArtworks = async (): Promise<Artwork[]> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    toast.error(t("artwork_gallery_page.not_authenticated", "User not authenticated. Please login."));
    throw new Error("Not authenticated");
  }

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${API_BASE}/artworks/user/${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch artworks");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    toast.error(t("artwork_gallery_page.failed_load", "Failed to load artworks"));
    throw error;
  }
};

export const deleteArtwork = async (id: string): Promise<void> => {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const response = await authenticatedFetch(`${API_BASE}/artworks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete artwork");
    }

    toast.success(t("artwork_gallery_page.success_delete", "Artwork deleted successfully"));
  } catch (error) {
    toast.error(t("artwork_gallery_page.failed_delete", "Failed to delete artwork"));
    throw error;
  }
};
