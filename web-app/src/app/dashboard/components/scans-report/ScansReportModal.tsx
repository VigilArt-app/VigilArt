import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { ScanRow } from "./types";

interface ScansReportModalProps {
  artwork: ScanRow | null;
  onClose: () => void;
}

export function ScansReportModal({ artwork, onClose }: ScansReportModalProps) {
  const { t, i18n } = useTranslation();
  if (!artwork) return null;

  return (
    <Dialog open={!!artwork} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{artwork.title || t("dashboard_page.scans_report.unknown_artwork")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>{t("dashboard_page.scans_report.total_matches")}:</strong> {artwork.matches}</p>
            <p><strong>{t("dashboard_page.scans_report.most_recent_source")}:</strong> {artwork.mostRecentSource}</p>
          </div>

          {artwork.matchingPages.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold">{t("dashboard_page.scans_report.all_detected_reposts")}</h3>
              {artwork.matchingPages.map((page) => (
                <div key={`${page.artworkId}-${page.id}-${page.url}-${page.firstDetectedAt}`} className="border rounded-lg p-3">
                  <div className="flex gap-3">
                    {page.imageUrl && (
                      <img
                        src={page.imageUrl}
                        alt={t("dashboard_page.scans_report.detected")}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-grow text-sm">
                      <p><strong>{t("dashboard_page.scans_report.category")}:</strong> {page.category}</p>
                      <p><strong>{t("dashboard_page.scans_report.website")}:</strong> {page.websiteName}</p>
                      <p><strong>{t("dashboard_page.scans_report.title")}:</strong> {page.pageTitle}</p>
                      <p><strong>{t("dashboard_page.scans_report.found")}:</strong> {new Date(page.firstDetectedAt).toLocaleString(i18n.language)}</p>
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
          ) : (
            <p className="text-center text-muted-foreground py-8">{t("dashboard_page.scans_report.no_matches_for_artwork")}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
