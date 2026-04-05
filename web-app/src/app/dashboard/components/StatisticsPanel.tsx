"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StatisticsPanel() {
  const { t } = useTranslation();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("dashboard_page.statistics.statistics")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-pink-500 text-white rounded-xl p-4">
          <p className="text-sm mb-2">{t("dashboard_page.statistics.reported_posts")}</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">18</span>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-orange-400 text-white rounded-xl p-4">
          <p className="text-sm mb-2">{t("dashboard_page.statistics.credited_posts")}</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">20</span>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-purple-600 text-white rounded-xl p-4">
          <p className="text-sm mb-2">{t("dashboard_page.statistics.unauthorized_content")}</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">16</span>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
