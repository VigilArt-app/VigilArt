"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  CategoryDistributionItem,
  StatisticsRange,
  WebsiteCategory,
} from "@vigilart/shared";
import { useAuth } from "@/src/components/contexts/authContext";
import { CategoryBreakdown } from "@/src/components/matches/CategoryBreakdown";
import { CategoryMatchesModal } from "./statistics/CategoryMatchesModal";

interface StatisticsPanelProps {
  totalMatches: number;
  categoryDistribution: CategoryDistributionItem[];
  range: StatisticsRange;
  onRangeChange: (range: StatisticsRange) => void;
  loading: boolean;
}

export default function StatisticsPanel({
  totalMatches,
  categoryDistribution,
  range,
  onRangeChange,
  loading,
}: StatisticsPanelProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] =
    useState<WebsiteCategory | null>(null);

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
            {t("dashboard_page.statistics.range_month", "Last 30 days")}
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
        ) : totalMatches === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground h-64 flex items-center justify-center">
            {t("dashboard_page.statistics.no_data", "No reposts found yet")}
          </div>
        ) : (
          <CategoryBreakdown
            totalMatches={totalMatches}
            categoryDistribution={categoryDistribution}
            onSelect={setSelectedCategory}
          />
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
