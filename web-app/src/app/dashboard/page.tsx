"use client";

import { useState } from "react";
import ScansReport from "./components/ScansReport";
import StatisticsPanel from "./components/StatisticsPanel";
import ActionButtons from "./components/ActionButtons";
import MonthlyComparison from "./components/MonthlyComparison";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-8 space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <ScansReport refreshKey={refreshKey} />
        <StatisticsPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <ActionButtons onUploadComplete={() => setRefreshKey((value) => value + 1)} />
        <div className="lg:col-span-2 w-full">
          <MonthlyComparison />
        </div>
      </div>
    </div>
  );
}

