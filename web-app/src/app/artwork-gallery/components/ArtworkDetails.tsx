"use client";

import { useEffect, useState } from "react";
import { ArtworkWithInsights, getArtworkResultsState, getArtworkStatus } from "./types";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";
import { useArtworkImageUrl } from "./hooks/useArtworkImageUrl";
import { useTranslation } from "react-i18next";
import { CategoryFilterSelect } from "../../../components/matches/CategoryFilterSelect";
import {
  ALL_CATEGORIES,
  filterAndSortMatches,
  presentCategories,
  type CategorySelection,
} from "../../../components/matches/matchCategoryFilter";

interface ArtworkDetailsProps {
  artwork: ArtworkWithInsights;
}

export function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
  const { t, i18n } = useTranslation();
  const status = getArtworkStatus(artwork);
  const resultsState = getArtworkResultsState(artwork);
  const totalMatches = artwork.reportInsights?.totalMatches || 0;
  const mostRecentSource = artwork.reportInsights?.mostRecentSource;
  const mostRecentDate = artwork.reportInsights?.mostRecentDate;
  const matchingPages = artwork.reportInsights?.matchingPages || [];
  const { imageUrl, isLoading } = useArtworkImageUrl(artwork.storageKey);

  const [category, setCategory] = useState<CategorySelection>(ALL_CATEGORIES);

  // Reset the filter each time a different artwork is selected.
  useEffect(() => {
    setCategory(ALL_CATEGORIES);
  }, [artwork.id]);

  const categories = presentCategories(matchingPages);
  const visiblePages = filterAndSortMatches(matchingPages, category);

  return (
    <div className="w-96 border-l bg-background p-6 overflow-y-auto scrollbar-soft">
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

        <ArtworkStatusBadge status={status} />

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
              {new Date(artwork.createdAt).toLocaleString(i18n.language)}
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

          <div>
            <p className="font-semibold">{t("artwork_gallery_page.matches")}</p>
            <p className="text-muted-foreground">{resultsState === "available" ? totalMatches : "—"}</p>
          </div>

          {mostRecentSource && mostRecentSource !== "N/A" && (
            <div>
              <p className="font-semibold">{t("artwork_gallery_page.last_source")}</p>
              <p className="text-muted-foreground break-all">{mostRecentSource}</p>
            </div>
          )}

          {mostRecentDate && (
            <div>
              <p className="font-semibold">{t("artwork_gallery_page.last_detected")}</p>
              <p className="text-muted-foreground">{new Date(mostRecentDate).toLocaleString(i18n.language)}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold">{t("artwork_gallery_page.all_links_matches")}</h3>
            {categories.length > 1 && (
              <CategoryFilterSelect
                value={category}
                onChange={setCategory}
                categories={categories}
              />
            )}
          </div>
          {matchingPages.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              {t(resultsState === "not_scanned"
                ? "artwork_gallery_page.not_scanned_body"
                : resultsState === "unavailable"
                  ? "artwork_gallery_page.results_unavailable"
                  : "artwork_gallery_page.no_matches")}
            </div>
          ) : (
            <div className="space-y-2">
              {visiblePages.map((page) => (
                <a
                  key={`${page.id}-${page.url}-${page.firstDetectedAt}`}
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded border p-2 text-xs hover:bg-muted/50"
                >
                  <p className="font-semibold truncate">{page.websiteName || page.pageTitle || page.url}</p>
                  <p className="text-muted-foreground truncate">{page.url}</p>
                  <p className="text-muted-foreground">{new Date(page.firstDetectedAt).toLocaleString(i18n.language)}</p>
                </a>
              ))}
            </div>
          )}
          {resultsState === "unavailable" && matchingPages.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("artwork_gallery_page.results_unavailable")}
            </p>
          )}
          {resultsState === "available" && (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("scan_coverage.result_note")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
