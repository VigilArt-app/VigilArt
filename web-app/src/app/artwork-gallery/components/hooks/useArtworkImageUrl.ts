import { useState, useEffect } from "react";

export function useArtworkImageUrl(storageKey: string | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!storageKey);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!storageKey) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    const fetchImageUrl = async () => {
      try {
        setIsLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL;
        
        const authToken = 
          typeof window !== 'undefined' 
            ? localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
            : null;

        if (!authToken) {
          throw new Error("Authentication token not found");
        }
        
        const response = await fetch(`${API_BASE}/storage/artworks/download-urls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            storageKeys: [storageKey],
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch download URL: ${response.status}`);
        }

        const rawData = await response.json();
        
        let downloadUrls: Record<string, string>;
        if (rawData.data) {
          downloadUrls = rawData.data as Record<string, string>;
        } else {
          downloadUrls = rawData as Record<string, string>;
        }
        
        const url = downloadUrls[storageKey];
        
        if (!url) {
          throw new Error("Download URL not found in response");
        }

        setImageUrl(url);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Error fetching image URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [storageKey]);

  return { imageUrl, isLoading, error };
}
