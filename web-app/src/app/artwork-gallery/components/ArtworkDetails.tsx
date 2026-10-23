"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArtworkWithInsights, getArtworkResultsState, getArtworkStatus } from "./types";
import { ArtworkStatusBadge } from "./ArtworkStatusBadge";
import { useArtworkImageUrl } from "./hooks/useArtworkImageUrl";
import { useTranslation } from "react-i18next";
import { CategoryFilterSelect } from "../../../components/matches/CategoryFilterSelect";
import { RestrictedMatch, matchIdentity } from "../../../components/matches/RestrictedMatch";
import { mostRecentMatch } from "../../../components/matches/mostRecentMatch";
import { GroupedMatchList } from "../../../components/matches/GroupedMatchList";
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

  const categories = presentCategories(matchingPages.filter((page) => !page.unsafeDomain));
  useEffect(() => {
    if (category !== ALL_CATEGORIES && !categories.includes(category)) setCategory(ALL_CATEGORIES);
  }, [category, categories]);
  const latestMatch = mostRecentMatch(matchingPages);
  const visiblePages = filterAndSortMatches(matchingPages, category);

  return (
    <div className="w-96 border-l bg-background p-6 overflow-y-auto scrollbar-soft">
      <div className="bg-card text-card-foreground border shadow-sm rounded-lg p-4 mb-4 flex items-center justify-between">
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

        {/* What the artist came for first: how many reposts, and the latest. */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{resultsState === "available" ? totalMatches : "—"}</span>
            <span className="text-sm text-muted-foreground">{t("artwork_gallery_page.matches")}</span>
          </div>
          <RestrictedMatch unsafeDomain={!!latestMatch?.unsafeDomain} resetKey={`${artwork.id}-${category}-${matchIdentity(latestMatch)}`}>
          {((mostRecentSource && mostRecentSource !== "N/A") || mostRecentDate) && (
            <dl className="grid grid-cols-2 gap-3">
              {mostRecentSource && mostRecentSource !== "N/A" && (
                <DetailItem label={t("artwork_gallery_page.last_source")} value={mostRecentSource} />
              )}
              {mostRecentDate && (
                <DetailItem label={t("artwork_gallery_page.last_detected")} value={new Date(mostRecentDate).toLocaleString(i18n.language)} />
              )}
            </dl>
          )}
          </RestrictedMatch>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
          <DetailItem
            className="col-span-2"
            label={t("artwork_gallery_page.file_name")}
            value={artwork.originalFilename || t("artwork_gallery_page.untitled")}
          />
          {artwork.description && (
            <DetailItem className="col-span-2" label={t("artwork_gallery_page.description")} value={artwork.description} />
          )}
          <DetailItem
            label={t("artwork_gallery_page.upload_date")}
            value={new Date(artwork.createdAt).toLocaleString(i18n.language)}
          />
          {artwork.sizeBytes && (
            <DetailItem label={t("artwork_gallery_page.file_size")} value={`${(artwork.sizeBytes / 1024).toFixed(2)} KB`} />
          )}
          <DetailItem
            className="col-span-2"
            label={t("artwork_gallery_page.id")}
            value={<span className="font-mono text-sm break-all">{artwork.id}</span>}
          />
        </dl>

        <div className="border-t pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">{t("artwork_gallery_page.all_links_matches")}</h3>
            {categories.length > 1 && (
              <CategoryFilterSelect
                value={category}
                onChange={setCategory}
                categories={categories}
              />
            )}
          </div>
          {matchingPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t(resultsState === "not_scanned"
                ? "artwork_gallery_page.not_scanned_body"
                : resultsState === "unavailable"
                  ? "artwork_gallery_page.results_unavailable"
                  : "artwork_gallery_page.no_matches")}
            </p>
          ) : (
            <GroupedMatchList
              pages={visiblePages}
              resetKeyPrefix={`${artwork.id}-${category}`}
              compact
            />
          )}
          {resultsState === "unavailable" && matchingPages.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("artwork_gallery_page.results_unavailable")}
            </p>
          )}
          {resultsState === "available" && (
            <p className="text-sm text-muted-foreground">
              {t("scan_coverage.result_note")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Label quiet, value prominent: the value is what the reader is looking for.
function DetailItem({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-base break-words">{value}</dd>
    </div>
  );
}
