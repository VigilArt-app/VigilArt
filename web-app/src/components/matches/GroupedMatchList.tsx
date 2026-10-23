"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { WebsiteCategory } from "@vigilart/shared";
import { CATEGORY_ORDER, categoryLabelKey, getCategoryColor } from "./categories";
import { RestrictedMatch, matchIdentity } from "./RestrictedMatch";

export interface GroupedMatch {
  id: string;
  artworkId: string;
  url: string;
  category: WebsiteCategory;
  websiteName?: string | null;
  pageTitle?: string | null;
  imageUrl?: string | null;
  unsafeDomain?: boolean | null;
  firstDetectedAt: string;
}

interface GroupedMatchListProps {
  /** Already filtered and sorted newest-first; the order is kept per group. */
  pages: GroupedMatch[];
  /** Prefix for RestrictedMatch reset keys, so a reveal is forgotten when the
   *  artwork or filter changes. */
  resetKeyPrefix: string;
  /** Smaller thumbnails for narrow side panels. */
  compact?: boolean;
}

// Matches grouped by category in collapsible sections, each match a card that
// opens the page. Shared by the dashboard's scan report and the gallery panel.
export function GroupedMatchList({ pages, resetKeyPrefix, compact = false }: GroupedMatchListProps) {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();

  const groups = CATEGORY_ORDER
    .map((category) => ({
      category,
      pages: pages.filter((page) => page.category === category),
    }))
    .filter((group) => group.pages.length > 0);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <Collapsible.Root key={group.category} defaultOpen asChild>
        <section>
          <Collapsible.Trigger className="group flex w-full items-center gap-2 rounded-md py-1 text-left text-sm font-semibold hover:text-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: getCategoryColor(group.category, resolvedTheme === "dark") }}
              aria-hidden="true"
            />
            {t(categoryLabelKey(group.category), group.category)}
            <span className="font-normal text-muted-foreground">({group.pages.length})</span>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" aria-hidden="true" />
          </Collapsible.Trigger>
          <Collapsible.Content className="space-y-2 pt-2">
          {group.pages.map((page) => {
            const key = `${page.artworkId}-${page.id}-${page.url}-${page.firstDetectedAt}`;
            const body = (
              <div className={compact ? "flex items-center gap-3" : "flex items-center gap-4"}>
                {page.imageUrl && (
                  <img
                    src={page.imageUrl}
                    alt={t("dashboard_page.scans_report.detected")}
                    className={`${compact ? "w-16 h-16" : "w-24 h-24"} shrink-0 object-cover rounded-md`}
                  />
                )}
                <div className="min-w-0 flex-grow space-y-1">
                  <p className="text-base font-semibold break-all">{page.websiteName || page.url}</p>
                  <p className="text-sm">
                    {t("dashboard_page.scans_report.found")} {new Date(page.firstDetectedAt).toLocaleString(i18n.language)}
                  </p>
                  {page.pageTitle && (
                    <p className="text-sm text-foreground/75 line-clamp-2">{page.pageTitle}</p>
                  )}
                  {page.unsafeDomain && (
                    // Blacklisted sites are never opened from VigilArt, even after reveal.
                    <p className="pt-1 text-sm break-all text-muted-foreground">{page.url}</p>
                  )}
                </div>
                {!page.unsafeDomain && (
                  <ExternalLink
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover/card:text-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            );

            return page.unsafeDomain ? (
              <div key={key} className="border rounded-lg p-3">
                <RestrictedMatch unsafeDomain resetKey={`${resetKeyPrefix}-${matchIdentity(page)}`}>
                  {body}
                </RestrictedMatch>
              </div>
            ) : (
              <a
                key={key}
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/card relative block border rounded-lg p-3 transition-colors hover:border-foreground/30 hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {body}
                <span className="sr-only">{t("dashboard_page.scans_report.visit")}</span>
              </a>
            );
          })}
          </Collapsible.Content>
        </section>
        </Collapsible.Root>
      ))}
    </div>
  );
}
