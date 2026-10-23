"use client";
import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import { ArtworkWithInsights, getArtworkStatus } from "./types";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";
import { useArtworkImageUrl } from "./hooks/useArtworkImageUrl";
import { useTranslation } from "react-i18next";
import router from 'next/router';
import { mostRecentMatch } from "../../../components/matches/mostRecentMatch";

interface ArtworkCardProps {
  artwork: ArtworkWithInsights;
  isSelected: boolean;
  onSelect: (artwork: ArtworkWithInsights) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onEdit?: (artwork: ArtworkWithInsights, e: React.MouseEvent) => void;
}

export function ArtworkCard({
  artwork,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: ArtworkCardProps) {
  const { t } = useTranslation();
  const status = getArtworkStatus(artwork);
  const pages = artwork.reportInsights?.matchingPages ?? [];
  // The card never names a blacklisted site: it shows the latest safe source
  // and flags the blacklisted ones, which are mostly adult image boards.
  const latestSafeMatch = mostRecentMatch(pages.filter((page) => !page.unsafeDomain));
  const blacklistedCount = pages.filter((page) => page.unsafeDomain).length;
  const { imageUrl, isLoading } = useArtworkImageUrl(artwork.storageKey);

  const openDmcaPage = (e: React.MouseEvent) => {
    e.stopPropagation();

    const matchingPages = artwork.reportInsights?.matchingPages ?? [];
    const prefill = {
      artworkId: artwork.id,
      artworkTitle: artwork.originalFilename || artwork.description || artwork.id,
      artworkDescription: artwork.description || "",
      mostRecentSource: artwork.reportInsights?.mostRecentSource || "",
      infringingUrls: matchingPages.map((page) => page.url),
    };

    router.push(`/dmca?prefill=${encodeURIComponent(JSON.stringify(prefill))}`);
  };

  return (
    <div
      className={`group relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
        isSelected
          ? "border-primary shadow-lg"
          : "border-transparent hover:border-primary/50"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(artwork);
      }}
    >
      <div className="absolute top-2 inset-x-2 z-10 flex flex-wrap items-start gap-2">
        <div className="flex flex-col items-start gap-1">
          <ArtworkStatusBadge status={status} />
          {/* At the top, next to the status: the bottom overlay has no room left on small cards. */}
          {blacklistedCount > 0 && (
            <p className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-black">
              <TriangleAlert className="size-3 shrink-0" aria-hidden="true" />
              {t("artwork_gallery_page.blacklisted_sites", { count: blacklistedCount })}
            </p>
          )}
        </div>

        <div className="ml-auto flex shrink-0 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(artwork, e);
            }}
            className="bg-white hover:bg-gray-200 text-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,background-color] shadow-md border"
            aria-label={t("artwork_gallery_page.edit_description")}
          >
            <Pencil className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => onDelete(artwork.id, e)}
            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,background-color] shadow-md"
            aria-label={t("artwork_gallery_page.delete_artwork")}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

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
        {latestSafeMatch?.websiteName && (
          <p className="text-white/80 text-xs truncate mt-1">
            {t("artwork_gallery_page.last_source")}: {latestSafeMatch.websiteName}
          </p>
        )}
      </div>
    </div>
  );
}
