import { toast } from "sonner";
import { Artwork } from "./types";
import { getUserIdFromToken } from "./utils";

/**
 * Get the auth token from localStorage or sessionStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
};

/**
 * Centralized fetch helper that includes Authorization header
 */
const authenticatedFetch = (url: string, options: RequestInit = {}) => {
  const authToken = getAuthToken();
  if (!authToken) {
    throw new Error("Authentication token not found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${authToken}`,
  };

  return fetch(url, { ...options, headers });
};

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
    console.error("Error fetching artworks:", error);
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
    console.error("Error deleting artwork:", error);
    toast.error("Failed to delete artwork");
    throw error;
  }
};
