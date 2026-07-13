"use client";

import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { MatchingPage } from "@vigilart/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";

interface MatchesModalViewProps {
  open: boolean;
  title: string;
  /** Shown when the selection has no matches (wording differs per caller). */
  emptyMessage: string;
  /** False while the first fetch for the current selection is in flight. */
  ready: boolean;
  error: boolean;
  matches: MatchingPage[];
  /** True total for the selection; if it exceeds matches.length the list is capped. */
  totalCount: number;
  onClose: () => void;
}

/**
 * Presentational modal shared by the category (pie) and report (bar) drill-downs:
 * renders the loading/error/empty states and the match list. The fetching and
 * the title are owned by each caller.
 */
export function MatchesModalView({
  open,
  title,
  emptyMessage,
  ready,
  error,
  matches,
  totalCount,
  onClose,
}: MatchesModalViewProps) {
  const { t, i18n } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!ready ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-8">
            {t("dashboard_page.statistics.load_error", "Could not load matches")}
          </p>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {matches.length < totalCount && (
              <p className="text-xs text-muted-foreground">
                {t(
                  "dashboard_page.statistics.showing_first",
                  "Showing the {{count}} most recent of {{total}}",
                  { count: matches.length, total: totalCount }
                )}
              </p>
            )}
            {matches.map((page) => (
              <div
                key={`${page.artworkId}-${page.id}-${page.url}`}
                className="border rounded-lg p-3"
              >
                <div className="flex gap-3">
                  {page.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.imageUrl}
                      alt={t("dashboard_page.scans_report.detected")}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-grow text-sm">
                    <p>
                      <span className="font-bold">
                        {t("dashboard_page.scans_report.website")}:
                      </span>{" "}
                      {page.websiteName}
                    </p>
                    {page.pageTitle && (
                      <p>
                        <span className="font-bold">
                          {t("dashboard_page.scans_report.title")}:
                        </span>{" "}
                        {page.pageTitle}
                      </p>
                    )}
                    <p>
                      <span className="font-bold">
                        {t("dashboard_page.scans_report.found")}:
                      </span>{" "}
                      {new Date(page.firstDetectedAt).toLocaleString(i18n.language)}
                    </p>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-block mt-2"
                    >
                      {t("dashboard_page.scans_report.visit")} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
