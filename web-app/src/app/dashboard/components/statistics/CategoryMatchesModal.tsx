"use client";

import { useTranslation } from "react-i18next";
import type { StatisticsRange, WebsiteCategory } from "@vigilart/shared";
import { categoryLabelKey } from "./categories";
import { fetchMatchesByCategory } from "./api";
import { MatchesModalView } from "./MatchesModalView";
import { useMatchesFetch } from "./useMatchesFetch";

interface CategoryMatchesModalProps {
  userId: string | undefined;
  category: WebsiteCategory | null;
  /** Total matches in this category (from the pie), used to flag a capped list. */
  totalCount: number;
  range: StatisticsRange;
  onClose: () => void;
}

export function CategoryMatchesModal({
  userId,
  category,
  totalCount,
  range,
  onClose,
}: CategoryMatchesModalProps) {
  const { t } = useTranslation();

  const token = userId && category ? `${userId}:${category}:${range}` : null;
  const { matches, ready, error } = useMatchesFetch(token, () =>
    fetchMatchesByCategory(userId as string, category as WebsiteCategory, range)
  );

  const title = category
    ? t("dashboard_page.statistics.matches_title", "{{category}} reposts", {
        category: t(categoryLabelKey(category), category),
      })
    : "";

  return (
    <MatchesModalView
      open={category !== null}
      title={title}
      emptyMessage={t(
        "dashboard_page.statistics.no_matches",
        "No reposts in this category"
      )}
      ready={ready}
      error={error}
      matches={matches}
      totalCount={totalCount}
      onClose={onClose}
    />
  );
}
