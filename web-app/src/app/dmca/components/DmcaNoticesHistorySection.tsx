"use client";

import Link from "next/link";
import type { TFunction } from "i18next";
import type { DmcaNoticeGet } from "@vigilart/shared/types";
import { ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

type DmcaNoticesHistorySectionProps = {
  notices: DmcaNoticeGet[];
  t: TFunction;
  onLoadNotice: (notice: DmcaNoticeGet) => void;
};

export function DmcaNoticesHistorySection({ notices, t, onLoadNotice }: DmcaNoticesHistorySectionProps) {
  if (notices.length === 0) {
    return null;
  }

  const sortedNotices = [...notices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <Card className="rounded-xl border">
      <CardHeader>
        <div>
          <h3 className="font-semibold text-lg">{t("dmca_page.notices_history")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dmca_page.previous_notices_subtitle")}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedNotices.map((notice) => (
            <div
              key={notice.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{notice.dmcaPlatformSlug}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      notice.status === "SUBMITTED"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {notice.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notice.updatedAt).toLocaleDateString()} {new Date(notice.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLoadNotice(notice)}
                className="ml-2 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t("dmca_page.load")}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
