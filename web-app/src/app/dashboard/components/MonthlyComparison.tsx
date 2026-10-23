"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { StatisticsTimelinePoint } from "@vigilart/shared";
import { ReportMatchesModal } from "./statistics/ReportMatchesModal";

interface MonthlyComparisonProps {
  timeline: StatisticsTimelinePoint[];
  loading: boolean;
}

// Concrete chart colors per theme, from the brand guidelines. Passed as SVG
// presentation attributes, so they must be literal colors — CSS var() does not
// resolve inside SVG attributes. The single series is plum (the primary token):
// it is one total, not a data category, so it does not compete with the
// category palette. Labels use the muted text color to keep 4.5:1.
const CHROME = {
  light: { bar: "#5e3b7d", grid: "#e5e5e5", axis: "#d4d4d4", label: "#6b6b6b", cursor: "#000000" },
  dark: { bar: "#b692db", grid: "#262626", axis: "#404040", label: "#a1a1a1", cursor: "#ffffff" },
};

export default function MonthlyComparison({
  timeline,
  loading,
}: MonthlyComparisonProps) {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const chrome = resolvedTheme === "dark" ? CHROME.dark : CHROME.light;
  const [selectedReport, setSelectedReport] =
    useState<StatisticsTimelinePoint | null>(null);

  const shortDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      month: "short",
      day: "numeric",
    });

  // Full date AND time: two scans can run the same day (separate bars), so the
  // time is what tells them apart on hover.
  const fullDate = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderTooltip = ({
    active,
    payload,
  }: Partial<TooltipContentProps<number, string>>) => {
    if (!active || !payload?.length) {
      return null;
    }
    const point = payload[0].payload as StatisticsTimelinePoint;
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
        <p className="font-medium text-popover-foreground">{fullDate(point.date)}</p>
        <p className="text-muted-foreground">
          {point.totalMatches} {t("dashboard_page.graphs.reposts", "reposts")}
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          {t("dashboard_page.graphs.monthly_comparison")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          loading ? (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground h-72 flex items-center justify-center">
              {t("dashboard_page.graphs.no_data", "No reports yet")}
            </div>
          )
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid vertical={false} stroke={chrome.grid} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tickLine={false}
                  axisLine={{ stroke: chrome.axis }}
                  tick={{ fill: chrome.label, fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fill: chrome.label, fontSize: 12 }}
                />
                <Tooltip
                  content={renderTooltip}
                  cursor={{ fill: chrome.cursor, opacity: 0.06 }}
                />
                <Bar
                  dataKey="totalMatches"
                  fill={chrome.bar}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  className="cursor-pointer"
                  onClick={(data) => {
                    const point = data as Partial<StatisticsTimelinePoint>;
                    if (point.reportId) {
                      setSelectedReport(point as StatisticsTimelinePoint);
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {timeline.length > 0 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("dashboard_page.graphs.click_hint", "Click a bar to see that scan's reposts")}
          </p>
        )}

        {/* Keyboard/screen-reader path to the same drill-down: the chart bars are
            mouse-only, so mirror them as focusable buttons. */}
        {timeline.length > 0 && (
          <ul className="sr-only">
            {timeline.map((point) => (
              <li key={point.reportId}>
                <button type="button" onClick={() => setSelectedReport(point)}>
                  {t("dashboard_page.graphs.view_report_reposts", "View reposts from {{date}} ({{count}})", {
                    date: fullDate(point.date),
                    count: point.totalMatches,
                  })}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ReportMatchesModal
        report={selectedReport}
        dateLabel={selectedReport ? fullDate(selectedReport.date) : ""}
        onClose={() => setSelectedReport(null)}
      />
    </Card>
  );
}
