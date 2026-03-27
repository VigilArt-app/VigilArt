import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { ScanRow } from "./types";

interface ScansReportModalProps {
  artwork: ScanRow | null;
  onClose: () => void;
}

export function ScansReportModal({ artwork, onClose }: ScansReportModalProps) {
  const { t, i18n } = useTranslation();
  if (!artwork) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{artwork.title || t("dashboard_page.scans_report.unknown_artwork")}</CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
