import { toast } from "sonner";
import { Artwork } from "./types";
import { getUserIdFromToken } from "../../../utils/auth/getUserIdFromToken";
import { authenticatedFetch } from "../../../utils/auth/authenticatedFetch";

export const fetchArtworks = async (): Promise<Artwork[]> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    toast.error("User not authenticated. Please login.");
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
    toast.error("Failed to load artworks");
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

    toast.success("Artwork deleted successfully");
  } catch (error) {
    toast.error("Failed to delete artwork");
    throw error;
  }
};
