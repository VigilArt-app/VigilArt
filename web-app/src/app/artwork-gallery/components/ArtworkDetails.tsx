"use client";

import { Info } from "lucide-react";
import { Artwork, getArtworkStatus } from "./types";
import { useArtworkImageUrl } from "./hooks/useArtworkImageUrl";
import { useTranslation } from "react-i18next";

interface ArtworkDetailsProps {
  artwork: Artwork;
}

export function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
  const { t } = useTranslation();
  const status = getArtworkStatus(artwork);
  const { imageUrl, isLoading } = useArtworkImageUrl(artwork.storageKey);

  return (
    <div className="w-96 border-l bg-background p-6 overflow-y-auto">
      <div className="bg-black text-white rounded-lg p-4 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("artwork_gallery_page.selected_artwork")}</h2>
      </div>

      <div className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden border">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
            </div>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={artwork.description || "Artwork"}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div
          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
            status === "Scanned"
              ? "bg-green-500 text-white"
              : status === "Scanning"
              ? "bg-purple-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {status.toUpperCase()}
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">{t("artwork_gallery_page.file_name")}</p>
            <p className="text-muted-foreground break-all">
              {artwork.originalFilename || t("artwork_gallery_page.untitled")}
            </p>
          </div>

          {artwork.description && (
            <div>
              <p className="font-semibold">{t("artwork_gallery_page.description")}</p>
              <p className="text-muted-foreground">{artwork.description}</p>
            </div>
          )}

          <div>
            <p className="font-semibold">{t("artwork_gallery_page.upload_date")}</p>
            <p className="text-muted-foreground">
              {new Date(artwork.createdAt).toLocaleString()}
            </p>
          </div>

          {artwork.sizeBytes && (
            <div>
              <p className="font-semibold">{t("artwork_gallery_page.file_size")}</p>
              <p className="text-muted-foreground">
                {(artwork.sizeBytes / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div>
            <p className="font-semibold">{t("artwork_gallery_page.id")}</p>
            <p className="text-muted-foreground font-mono text-xs break-all">
              {artwork.id}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">{t("artwork_gallery_page.all_links_matches")}</h3>
          <div className="text-xs text-muted-foreground">
            {t("artwork_gallery_page.no_matches")}
          </div>
        </div>
      </div>
    </div>
  );
}
