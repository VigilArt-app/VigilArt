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

/**
 * Validated categorical palette: light and dark steps of the same hues, checked
 * for colour-vision-deficiency separation and for contrast against each
 * surface. Lives here rather than under `dashboard/` so the public landing page
 * can show the same colours without importing dashboard code.
 */
const CATEGORY_COLORS: Record<WebsiteCategory, { light: string; dark: string }> = {
  SOCIAL: { light: "#2a78d6", dark: "#3987e5" },
  ART_PLATFORMS: { light: "#1baf7a", dark: "#199e70" },
  MARKETPLACES: { light: "#eda100", dark: "#c98500" },
  BLOG: { light: "#008300", dark: "#008300" },
  MEDIA: { light: "#4a3aa7", dark: "#9085e9" },
  SEARCH: { light: "#e34948", dark: "#e66767" },
  OTHER: { light: "#e87ba4", dark: "#d55181" },
};

export const getCategoryColor = (
  category: WebsiteCategory,
  isDark: boolean
): string => {
  const entry = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.OTHER;
  return isDark ? entry.dark : entry.light;
};
