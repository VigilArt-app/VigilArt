"use client";

import { useTranslation } from "react-i18next";
import type { StatisticsTimelinePoint } from "@vigilart/shared";
import { fetchMatchesByReport } from "./api";
import { MatchesModalView } from "./MatchesModalView";
import { useMatchesFetch } from "./useMatchesFetch";

interface ReportMatchesModalProps {
  /** The clicked bar's report, or null when the modal is closed. */
  report: StatisticsTimelinePoint | null;
  /** Pre-formatted date+time label for the clicked report (owned by the chart). */
  dateLabel: string;
  onClose: () => void;
}

export function ReportMatchesModal({
  report,
  dateLabel,
  onClose,
}: ReportMatchesModalProps) {
  const { t } = useTranslation();

  const token = report?.reportId ?? null;
  // The hook only invokes the fetcher when `token` is set, so `report` is
  // non-null here.
  const { matches, ready, error } = useMatchesFetch(token, () =>
    fetchMatchesByReport((report as StatisticsTimelinePoint).reportId)
  );

  const title = report
    ? t("dashboard_page.statistics.report_matches_title", "Reposts from {{date}}", {
        date: dateLabel,
      })
    : "";

  return (
    <MatchesModalView
      open={report !== null}
      title={title}
      emptyMessage={t(
        "dashboard_page.statistics.no_matches_report",
        "No reposts in this report"
      )}
      ready={ready}
      error={error}
      matches={matches}
      totalCount={report?.totalMatches ?? 0}
      onClose={onClose}
    />
  );
}
