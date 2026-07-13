"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Button } from "../../../components/ui/button";
import { useTranslation } from "react-i18next";
import { ScansReportModal } from "./scans-report/ScansReportModal";
import { ScansReportTable } from "./scans-report/ScansReportTable";
import { useScansReportData } from "./scans-report/useScansReportData";
import { ScanRow, SortDirection, SortField } from "./scans-report/types";

interface ScansReportProps {
  refreshKey: number;
}

type TimelineFilter = "all" | "week" | "month" | "quarter" | "year";

const getTimelineStart = (timeline: TimelineFilter): Date => {
  const now = new Date();

  switch (timeline) {
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    }
    case "month": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    }
    case "quarter": {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      return quarterAgo;
    }
    case "year": {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return yearAgo;
    }
    case "all":
    default:
      return new Date(0);
  }
};

export default function ScansReport({ refreshKey }: ScansReportProps) {
  const { t } = useTranslation();
  const { scans, loading, error } = useScansReportData(refreshKey);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [onlyUncredited, setOnlyUncredited] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState<ScanRow | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("all");
  const rowsPerPage = 4;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedScans = useMemo(() => {
    const dateRangeStart = getTimelineStart(timelineFilter);
    const query = searchQuery.toLowerCase();

    let result = scans
      .map((scan) => {
        const matchingPages =
          timelineFilter === "all"
            ? scan.matchingPages
            : scan.matchingPages.filter((page) => new Date(page.firstDetectedAt) >= dateRangeStart);

        if (matchingPages.length === 0) {
          return null;
        }

        const mostRecentMatch = matchingPages.reduce((previous, current) =>
          new Date(current.firstDetectedAt) > new Date(previous.firstDetectedAt)
            ? current
            : previous
        );

        return {
          ...scan,
          matches: matchingPages.length,
          mostRecentSource: mostRecentMatch.websiteName,
          mostRecentDate: mostRecentMatch.firstDetectedAt,
          matchingPages,
        };
      })
      .filter((scan): scan is ScanRow => scan !== null);

    if (searchQuery) {
      result = result.filter(
        (scan) =>
          scan.title.toLowerCase().includes(query) ||
          scan.mostRecentSource.toLowerCase().includes(query)
      );
    }

    if (onlyUncredited) {
      result = result.filter((scan) => scan.matches > scan.creditedMatches);
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number = a[sortField];
        let bValue: string | number = b[sortField];
        if (typeof aValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        } else {
          return sortDirection === "asc"
            ? aValue - (bValue as number)
            : (bValue as number) - aValue;
        }
      });
    }

    return result;
  }, [scans, searchQuery, sortField, sortDirection, onlyUncredited, timelineFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedScans.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortDirection, onlyUncredited, timelineFilter]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <Card className="lg:col-span-2 w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("dashboard_page.scans_report.scan_report")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Input type="text" placeholder={t("dashboard_page.scans_report.Search_by_name")} className="w-48" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="only-uncredited">{t("dashboard_page.scans_report.only_uncredited")}</Label>
              {/* Temporarily disabled: credited-match tracking is not wired up yet. */}
              <Switch id="only-uncredited" checked={onlyUncredited} onCheckedChange={setOnlyUncredited} disabled />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-sm font-medium">{t("dashboard_page.scans_report.timeline_filter", "Timeline")}:</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={timelineFilter === "all" ? "default" : "outline"}
              onClick={() => setTimelineFilter("all")}
              className="text-xs"
            >
              {t("dashboard_page.scans_report.timeline_all", "All Time")}
            </Button>
            <Button
              size="sm"
              variant={timelineFilter === "week" ? "default" : "outline"}
              onClick={() => setTimelineFilter("week")}
              className="text-xs"
            >
              {t("dashboard_page.scans_report.timeline_week", "Last Week")}
            </Button>
            <Button
              size="sm"
              variant={timelineFilter === "month" ? "default" : "outline"}
              onClick={() => setTimelineFilter("month")}
              className="text-xs"
            >
              {t("dashboard_page.scans_report.timeline_month", "Last Month")}
            </Button>
            <Button
              size="sm"
              variant={timelineFilter === "quarter" ? "default" : "outline"}
              onClick={() => setTimelineFilter("quarter")}
              className="text-xs"
            >
              {t("dashboard_page.scans_report.timeline_quarter", "Last 3 Months")}
            </Button>
            <Button
              size="sm"
              variant={timelineFilter === "year" ? "default" : "outline"}
              onClick={() => setTimelineFilter("year")}
              className="text-xs"
            >
              {t("dashboard_page.scans_report.timeline_year", "Last Year")}
            </Button>
          </div>
        </div>

        <ScansReportTable
          loading={loading}
          rows={filteredAndSortedScans}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectArtwork={setSelectedArtwork}
          onPrevPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {t("dashboard_page.scans_report.failed_to_load")}
          </p>
        )}
      </CardContent>

      <ScansReportModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
    </Card>
  );
}
