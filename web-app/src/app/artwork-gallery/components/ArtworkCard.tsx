"use client";

import { Trash2 } from "lucide-react";
import type { Artwork } from "@vigilart/shared/types";
import { FILTER_STATUS_TRANSLATION_KEYS, getArtworkStatus } from "./types";
import { useArtworkImageUrl } from "./hooks/useArtworkImageUrl";
import { useTranslation } from "react-i18next";

interface ArtworkCardProps {
  artwork: Artwork;
  isSelected: boolean;
  onSelect: (artwork: Artwork) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function ArtworkCard({
  artwork,
  isSelected,
  onSelect,
  onDelete,
}: ArtworkCardProps) {
  const { t } = useTranslation();
  const status = getArtworkStatus(artwork);
  const statusLabel = t(FILTER_STATUS_TRANSLATION_KEYS[status]);
  const { imageUrl, isLoading } = useArtworkImageUrl(artwork.storageKey);

  return (
    <div
      className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
        isSelected
          ? "border-primary shadow-lg"
          : "border-transparent hover:border-primary/50"
      }`}
      onClick={() => onSelect(artwork)}
    >
      <div className="absolute top-2 left-2 z-10">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            status === "Scanned"
              ? "bg-green-500 text-white"
              : status === "Scanning"
              ? "bg-purple-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {status === "Scanned" && "✓ "}
          {status === "Scanning" && "⟳ "}
          {status === "Protected" && "🛡"}
          {statusLabel.toUpperCase()}
        </div>
      </div>

      <button 
        onClick={(e) => onDelete(artwork.id, e)}
        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="aspect-square bg-muted relative overflow-hidden">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
          </div>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={artwork.description || artwork.originalFilename || "Artwork"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">
          {artwork.originalFilename || t("artwork_gallery_page.untitled")}
        </p>
        <p className="text-white/70 text-xs">
          {t("artwork_gallery_page.uploaded")}{" "}
          {new Date(artwork.createdAt).toLocaleDateString(t("artwork_gallery_page.encod_date"), {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
