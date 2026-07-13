"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import type {
  CategoryDistributionItem,
  StatisticsRange,
  WebsiteCategory,
} from "@vigilart/shared";
import { useAuth } from "@/src/components/contexts/authContext";
import {
  CATEGORY_ORDER,
  categoryLabelKey,
  getCategoryColor,
} from "./statistics/categories";
import { CategoryMatchesModal } from "./statistics/CategoryMatchesModal";

interface StatisticsPanelProps {
  totalMatches: number;
  categoryDistribution: CategoryDistributionItem[];
  range: StatisticsRange;
  onRangeChange: (range: StatisticsRange) => void;
  loading: boolean;
}

interface Slice {
  category: WebsiteCategory;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export default function StatisticsPanel({
  totalMatches,
  categoryDistribution,
  range,
  onRangeChange,
  loading,
}: StatisticsPanelProps) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const isDark = resolvedTheme === "dark";
  const [selectedCategory, setSelectedCategory] =
    useState<WebsiteCategory | null>(null);

  const categoryLabel = (category: WebsiteCategory) =>
    t(categoryLabelKey(category), category);

  const slices: Slice[] = CATEGORY_ORDER.map((category) => {
    const value =
      categoryDistribution.find((item) => item.category === category)?.count ?? 0;
    return {
      category,
      label: categoryLabel(category),
      value,
      color: getCategoryColor(category, isDark),
      percentage: totalMatches > 0 ? (value / totalMatches) * 100 : 0,
    };
  }).filter((slice) => slice.value > 0);

  const renderTooltip = ({
    active,
    payload,
  }: Partial<TooltipContentProps<number, string>>) => {
    if (!active || !payload?.length) {
      return null;
    }
    const slice = payload[0].payload as Slice;
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
        <p className="font-medium text-popover-foreground">{slice.label}</p>
        <p className="text-muted-foreground">
          {slice.value} ({slice.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">
          {t("dashboard_page.statistics.statistics")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={range === "all" ? "default" : "outline"}
            onClick={() => onRangeChange("all")}
            className="text-xs"
          >
            {t("dashboard_page.statistics.range_all", "All Time")}
          </Button>
          <Button
            size="sm"
            variant={range === "month" ? "default" : "outline"}
            onClick={() => onRangeChange("month")}
            className="text-xs"
          >
            {t("dashboard_page.statistics.range_month", "Last Month")}
          </Button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{totalMatches}</span>
          <span className="text-sm text-muted-foreground">
            {t("dashboard_page.statistics.total_matches", "total matches")}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : slices.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground h-64 flex items-center justify-center">
            {t("dashboard_page.statistics.no_data", "No reposts found yet")}
          </div>
        ) : (
          <>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    stroke="none"
                    onClick={(slice) => {
                      const category = (slice as Partial<Slice>).category;
                      if (category) setSelectedCategory(category);
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.category} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {slices.map((slice) => (
                <li key={slice.category}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(slice.category)}
                    className="flex w-full items-center gap-2 rounded-sm py-0.5 text-left hover:text-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{slice.label}</span>
                    <span className="ml-auto font-medium text-muted-foreground">
                      {slice.percentage.toFixed(0)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>

      <CategoryMatchesModal
        userId={user?.id}
        category={selectedCategory}
        totalCount={
          categoryDistribution.find(
            (item) => item.category === selectedCategory
          )?.count ?? 0
        }
        range={range}
        onClose={() => setSelectedCategory(null)}
      />
    </Card>
  );
}
