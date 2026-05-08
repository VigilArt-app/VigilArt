import { toast } from "sonner";
import { Artwork, ArtworkReportInsights, MatchingPage } from "./types";
import { authenticatedFetch } from "../../../utils/auth/authenticatedFetch";
import i18next from "i18next";

const t = (key: string, defaultValue: string) =>
  i18next.t(key, { defaultValue });

export const fetchArtworks = async (
  userId: string
): Promise<Artwork[]> => {
  try {
    const response = await authenticatedFetch(`/artworks/user/${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch artworks");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    toast.error(t("artwork_gallery_page.failed_load", "Failed to load artworks"));
    throw error;
  }
};

interface ReportSummary {
  id: string;
}

interface ReportDetails {
  id: string;
  detectionDate: string;
  matchingPages: MatchingPage[];
}

export const fetchArtworkReportInsights = async (userId: string): Promise<Record<string, ArtworkReportInsights>> => {
  try {
    const reportsRes = await authenticatedFetch(`/reports/user/${userId}`);

    if (!reportsRes.ok) {
      throw new Error("Failed to fetch reports");
    }

    const reportsData = await reportsRes.json();
    let reports: ReportSummary[] = [];

    if (Array.isArray(reportsData?.data)) {
      reports = reportsData.data;
    } else if (Array.isArray(reportsData)) {
      reports = reportsData;
    }

    if (reports.length === 0) {
      return {};
    }

    const detailsResults = await Promise.all(
      reports.map(async (report) => {
        try {
          const detailsRes = await authenticatedFetch(`/reports/details/${report.id}`);
          if (!detailsRes.ok) return null;

          const detailsData = await detailsRes.json();
          const reportDetails = (detailsData?.data || detailsData) as ReportDetails;

          if (!reportDetails || !Array.isArray(reportDetails.matchingPages)) {
            return null;
          }

          return reportDetails;
        } catch {
          return null;
        }
      })
    );

    const validDetails = detailsResults.filter((d): d is ReportDetails => !!d);
    const pagesByArtwork = new Map<string, Map<string, MatchingPage>>();

    validDetails.forEach((report) => {
      report.matchingPages.forEach((page) => {
        const key = page.id || `${page.url}-${page.firstDetectedAt}`;
        const existing = pagesByArtwork.get(page.artworkId) || new Map<string, MatchingPage>();
        existing.set(key, page);
        pagesByArtwork.set(page.artworkId, existing);
      });
    });

    const insightsByArtwork: Record<string, ArtworkReportInsights> = {};

    pagesByArtwork.forEach((pagesMap, artworkId) => {
      const matchingPages = Array.from(pagesMap.values()).sort(
        (a, b) => new Date(b.firstDetectedAt).getTime() - new Date(a.firstDetectedAt).getTime()
      );
      const mostRecent = matchingPages[0];

      insightsByArtwork[artworkId] = {
        totalMatches: matchingPages.length,
        mostRecentSource: mostRecent?.websiteName || "N/A",
        mostRecentDate: mostRecent?.firstDetectedAt || null,
        matchingPages,
      };
    });

    return insightsByArtwork;
  } catch {
    toast.error(t("artwork_gallery_page.failed_load_reports", "Failed to load reports data"));
    return {};
  }
};

export const deleteArtwork = async (id: string): Promise<void> => {
  try {
    const response = await authenticatedFetch(`/artworks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete artwork");
    }

    toast.success(t("artwork_gallery_page.success_delete", "Artwork deleted successfully"));
  } catch (error) {
    toast.error(t("artwork_gallery_page.failed_delete", "Failed to delete artwork"));
    throw error;
  }
};
