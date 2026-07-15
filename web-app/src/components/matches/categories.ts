import type { WebsiteCategory } from "@vigilart/shared";

/**
 * Fixed display order for website categories, shared by every place that lists
 * or filters matches (dashboard statistics, scans report, artwork gallery).
 */
export const CATEGORY_ORDER: WebsiteCategory[] = [
  "SOCIAL",
  "ART_PLATFORMS",
  "MARKETPLACES",
  "BLOG",
  "MEDIA",
  "SEARCH",
  "OTHER",
];

/**
 * i18n key for a category's human label. Use with `t(categoryLabelKey(c), c)`
 * so the raw enum code is the fallback when a translation is missing.
 */
export const categoryLabelKey = (category: WebsiteCategory): string =>
  `dashboard_page.statistics.categories.${category}`;
