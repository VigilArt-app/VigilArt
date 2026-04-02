import { useEffect, useState } from "react";
import { getAuthToken } from "../../../../utils/auth/getAuthToken";
import { getUserIdFromToken } from "../../../../utils/auth/getUserIdFromToken";
import {
  Artwork,
  ArtworksReportDetails,
  ArtworksReportSummary,
  MatchingPage,
  ScanRow,
} from "./types";

interface UseScansReportDataResult {
  scans: ScanRow[];
  loading: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export function useScansReportData(): UseScansReportDataResult {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
        const base = API_BASE.replace(/\/+$/, "");

        const artworksRes = await fetch(`${base}/artworks/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!artworksRes.ok) {
          throw new Error(`Failed to fetch artworks list (${artworksRes.status})`);
        }

        const artworksResponse = await artworksRes.json();
        const artworks: Artwork[] = Array.isArray(artworksResponse)
          ? artworksResponse
          : artworksResponse.data || [];

        const reportRes = await fetch(`${base}/reports/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!reportRes.ok) {
          throw new Error(`Failed to fetch reports list (${reportRes.status})`);
        }

        const reportResponse = await reportRes.json();
        const reportsRaw = reportResponse.data || reportResponse;
        const reports: ArtworksReportSummary[] = Array.isArray(reportsRaw)
          ? reportsRaw
          : [];

        if (reports.length === 0) {
          setScans(
            artworks.map((art) => ({
              artworkId: art.id,
              title: art.title || "Artwork",
              matches: 0,
              creditedMatches: 0,
              mostRecentSource: "N/A",
              mostRecentDate: new Date().toISOString(),
              matchingPages: [],
            }))
          );
          setSelectedDate(new Date().toISOString().split("T")[0]);
          setLoading(false);
          return;
        }

        const reportDetailsResults = await Promise.all(
          reports.map(async (report) => {
            try {
              const detailsRes = await fetch(`${base}/reports/details/${report.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!detailsRes.ok) {
                return null;
              }

              const detailsResponse = await detailsRes.json();
              const detailsRaw = detailsResponse.data || detailsResponse;
              if (!detailsRaw || !Array.isArray(detailsRaw.matchingPages)) {
                return null;
              }

              return detailsRaw as ArtworksReportDetails;
            } catch {
              return null;
            }
          })
        );

        const reportDetails = reportDetailsResults.filter(
          (report): report is ArtworksReportDetails => !!report
        );

        const artworkStorageKeys = artworks
          .map((art) => art.storageKey)
          .filter((key): key is string => !!key);

        let downloadUrlsByStorageKey: Record<string, string> = {};
        if (artworkStorageKeys.length > 0) {
          const downloadUrlsRes = await fetch(`${base}/storage/artworks/download-urls`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ storageKeys: artworkStorageKeys }),
          });

          if (downloadUrlsRes.ok) {
            const rawUrls = await downloadUrlsRes.json();
            downloadUrlsByStorageKey = rawUrls.data || rawUrls || {};
          }
        }

        const matchesByArtwork = new Map<string, Map<string, MatchingPage>>();
        reportDetails.forEach((report) => {
          report.matchingPages.forEach((page) => {
            const existing =
              matchesByArtwork.get(page.artworkId) || new Map<string, MatchingPage>();
            const matchKey = page.id || `${page.url}-${page.firstDetectedAt}`;
            existing.set(matchKey, page);
            matchesByArtwork.set(page.artworkId, existing);
          });
        });

        const scanRows: ScanRow[] = artworks.map((art) => {
          const matchesMap = matchesByArtwork.get(art.id);
          const matches = matchesMap ? Array.from(matchesMap.values()) : [];
          const mostRecentMatch =
            matches.length > 0
              ? matches.reduce((prev, curr) =>
                  new Date(curr.firstDetectedAt) > new Date(prev.firstDetectedAt)
                    ? curr
                    : prev
                )
              : null;

          const artworkImageUrl = art.storageKey
            ? downloadUrlsByStorageKey[art.storageKey]
            : undefined;

          return {
            artworkId: art.id,
            title: art.title || art.originalFilename.split(".").slice(0, -1).join("."),
            imageUrl: artworkImageUrl,
            matches: matches.length,
            creditedMatches: 0,
            mostRecentSource: mostRecentMatch ? mostRecentMatch.websiteName : "N/A",
            mostRecentDate: mostRecentMatch?.firstDetectedAt || new Date().toISOString(),
            matchingPages: matches,
          };
        });

        setScans(scanRows);
        const latestDetectionDate = reportDetails
          .map((report) => new Date(report.detectionDate).getTime())
          .filter((timestamp) => !Number.isNaN(timestamp))
          .sort((a, b) => b - a)[0];

        if (latestDetectionDate) {
          setSelectedDate(new Date(latestDetectionDate).toISOString().split("T")[0]);
        } else {
          setSelectedDate(new Date().toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { scans, loading, selectedDate, setSelectedDate };
}
