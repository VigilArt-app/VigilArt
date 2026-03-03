import { toast } from "sonner";
import { Artwork } from "./types";
import { authenticatedFetch } from "../../../utils/auth/authenticatedFetch";

export const fetchArtworks = async (
  userId: string
): Promise<Artwork[]> => {
  try {
    const response = await authenticatedFetch(`/artworks/user/${userId}`);

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
    const response = await authenticatedFetch(`/artworks/${id}`, {
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
