import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { CategoryFilterSelect } from "../../../../components/matches/CategoryFilterSelect";
import {
  ALL_CATEGORIES,
  filterAndSortMatches,
  presentCategories,
  type CategorySelection,
} from "../../../../components/matches/matchCategoryFilter";
import { ScanRow } from "./types";
import { RestrictedMatch, matchIdentity } from "../../../../components/matches/RestrictedMatch";
import { mostRecentMatch } from "../../../../components/matches/mostRecentMatch";

interface ScansReportModalProps {
  artwork: ScanRow | null;
  onClose: () => void;
}

export function ScansReportModal({ artwork, onClose }: ScansReportModalProps) {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<CategorySelection>(ALL_CATEGORIES);

  // Reset the filter each time a different artwork is opened.
  useEffect(() => {
    setCategory(ALL_CATEGORIES);
  }, [artwork?.artworkId]);

  const categories = presentCategories((artwork?.matchingPages ?? []).filter((page) => !page.unsafeDomain));
  useEffect(() => {
    if (category !== ALL_CATEGORIES && !categories.includes(category)) setCategory(ALL_CATEGORIES);
  }, [category, categories]);

  if (!artwork) return null;

  const visiblePages = filterAndSortMatches(artwork.matchingPages, category);
  const latestMatch = mostRecentMatch(artwork.matchingPages);

  return (
    <Dialog open={!!artwork} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{artwork.title || t("dashboard_page.scans_report.unknown_artwork")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><span className="font-bold">{t("dashboard_page.scans_report.total_matches")}:</span> {artwork.matches}</p>
            <RestrictedMatch unsafeDomain={!!latestMatch?.unsafeDomain} resetKey={`${category}-${artwork.artworkId}-${matchIdentity(latestMatch)}`}>
              <p><span className="font-bold">{t("dashboard_page.scans_report.most_recent_source")}:</span> {artwork.mostRecentSource}</p>
            </RestrictedMatch>
          </div>

          {artwork.matchingPages.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{t("dashboard_page.scans_report.all_detected_reposts")}</h3>
                {categories.length > 1 && (
                  <CategoryFilterSelect
                    value={category}
                    onChange={setCategory}
                    categories={categories}
                  />
                )}
              </div>
              {visiblePages.map((page) => (
                <div key={`${page.artworkId}-${page.id}-${page.url}-${page.firstDetectedAt}`} className="border rounded-lg p-3">
                  <RestrictedMatch unsafeDomain={!!page.unsafeDomain} resetKey={`${category}-${artwork.artworkId}-${matchIdentity(page)}`}>
                  <div className="flex gap-3">
                    {page.imageUrl && (
                      <img
                        src={page.imageUrl}
                        alt={t("dashboard_page.scans_report.detected")}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-grow text-sm">
                      <p><span className="font-bold">{t("dashboard_page.scans_report.category")}:</span> {page.category}</p>
                      <p><span className="font-bold">{t("dashboard_page.scans_report.website")}:</span> {page.websiteName}</p>
                      <p><span className="font-bold">{t("dashboard_page.scans_report.title")}:</span> {page.pageTitle}</p>
                      <p><span className="font-bold">{t("dashboard_page.scans_report.found")}:</span> {new Date(page.firstDetectedAt).toLocaleString(i18n.language)}</p>
                      {page.unsafeDomain ? (
                        // Blacklisted sites are never opened from VigilArt, even after reveal.
                        <p className="mt-2 break-all text-muted-foreground">{page.url}</p>
                      ) : (
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-block mt-2"
                        >
                          {t("dashboard_page.scans_report.visit")} →
                        </a>
                      )}
                    </div>
                  </div>
                  </RestrictedMatch>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t("dashboard_page.scans_report.no_matches_for_artwork")}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
