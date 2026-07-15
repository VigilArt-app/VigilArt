import type {
  ArtworksReportGlobalStatistics,
  MatchingPage,
  StatisticsRange,
  WebsiteCategory,
} from "@vigilart/shared";
import { authenticatedFetch } from "../../../../utils/auth/authenticatedFetch";

/**
 * Fetch a user's global statistics: total matches + per-category distribution
 * (scoped by `range`) and the per-report timeline (always all reports).
 */
export const fetchGlobalStatistics = async (
  userId: string,
  range: StatisticsRange
): Promise<ArtworksReportGlobalStatistics> => {
  const params = new URLSearchParams({ range });
  const response = await authenticatedFetch(
    `/reports/user/${userId}/statistics?${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics (${response.status})`);
  }

  const body = await response.json();
  return body.data ?? body;
};

/**
 * Fetch the distinct matches in one website category, scoped by `range` — backs
 * the drill-down modal opened from a Statistics pie slice.
 */
export const fetchMatchesByCategory = async (
  userId: string,
  category: WebsiteCategory,
  range: StatisticsRange
): Promise<MatchingPage[]> => {
  const params = new URLSearchParams({ category, range });
  const response = await authenticatedFetch(
    `/reports/user/${userId}/matches?${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch matches (${response.status})`);
  }

  const body = await response.json();
  return body.data ?? body;
};

/**
 * Fetch the matches found in a single report — backs the drill-down modal opened
 * from a Monthly-comparison bar.
 */
export const fetchMatchesByReport = async (
  reportId: string
): Promise<MatchingPage[]> => {
  const response = await authenticatedFetch(
    `/reports/report/${reportId}/matches`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch matches (${response.status})`);
  }

  const body = await response.json();
  return body.data ?? body;
};
