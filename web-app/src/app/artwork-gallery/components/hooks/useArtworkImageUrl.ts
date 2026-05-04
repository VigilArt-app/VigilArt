import { authenticatedFetch } from "@/src/utils/auth/authenticatedFetch";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/src/config";

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
        const response = await authenticatedFetch(`/storage/artworks/download-urls`, {
          method: "POST",
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [storageKey]);

  return { imageUrl, isLoading, error };
}
