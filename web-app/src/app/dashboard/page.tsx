"use client";

import { useState } from "react";
import type { StatisticsRange } from "@vigilart/shared";
import ScansReport from "./components/ScansReport";
import StatisticsPanel from "./components/StatisticsPanel";
import ActionButtons from "./components/ActionButtons";
import MonthlyComparison from "./components/MonthlyComparison";
import { useStatisticsData } from "./components/statistics/useStatisticsData";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [statisticsRange, setStatisticsRange] = useState<StatisticsRange>("all");

  const { totalMatches, categoryDistribution, timeline, loading } =
    useStatisticsData(statisticsRange, refreshKey);

  return (
    <div className="p-8 space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <ScansReport refreshKey={refreshKey} />
        <StatisticsPanel
          totalMatches={totalMatches}
          categoryDistribution={categoryDistribution}
          range={statisticsRange}
          onRangeChange={setStatisticsRange}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <ActionButtons onUploadComplete={() => setRefreshKey((value) => value + 1)} />
        <div className="lg:col-span-2 w-full">
          <MonthlyComparison timeline={timeline} loading={loading} />
        </div>
      </div>
    </div>
  );
}
