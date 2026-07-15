import { useEffect, useState } from "react";
import type {
  CategoryDistributionItem,
  StatisticsRange,
  StatisticsTimelinePoint,
} from "@vigilart/shared";
import { useAuth } from "@/src/components/contexts/authContext";
import { fetchGlobalStatistics } from "./api";

interface UseStatisticsDataResult {
  totalMatches: number;
  categoryDistribution: CategoryDistributionItem[];
  timeline: StatisticsTimelinePoint[];
  loading: boolean;
  error: boolean;
}

/**
 * Loads the dashboard statistics for the authenticated user. Re-fetches whenever
 * the range toggle changes or a new scan bumps `refreshKey`.
 */
export function useStatisticsData(
  range: StatisticsRange,
  refreshKey: number
): UseStatisticsDataResult {
  const [totalMatches, setTotalMatches] = useState(0);
  const [categoryDistribution, setCategoryDistribution] = useState<
    CategoryDistributionItem[]
  >([]);
  const [timeline, setTimeline] = useState<StatisticsTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user, loading: userLoading } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (userLoading) {
        return;
      }

      setLoading(true);

      if (!user?.id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const stats = await fetchGlobalStatistics(user.id, range);

        if (cancelled) {
          return;
        }

        setError(false);
        setTotalMatches(stats.totalMatches);
        setCategoryDistribution(stats.categoryDistribution);
        setTimeline(stats.timeline);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user?.id, userLoading, range, refreshKey]);

  return { totalMatches, categoryDistribution, timeline, loading, error };
}
