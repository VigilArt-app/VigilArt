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
 * Validated categorical palette from the brand guidelines: light and dark steps
 * of the same hues. Each colour is at least 3:1 on its card, and neighbours in
 * CATEGORY_ORDER stay distinct under protanopia and deuteranopia, so reordering
 * the categories or swapping a colour needs the palette revalidated. No plum:
 * it is reserved for the brand. Lives here rather than under `dashboard/` so the
 * public landing page can show the same colours without importing dashboard code.
 */
const CATEGORY_COLORS: Record<WebsiteCategory, { light: string; dark: string }> = {
  SOCIAL: { light: "#3a6db5", dark: "#5b8fd6" },
  ART_PLATFORMS: { light: "#7a7a1a", dark: "#9a9a3a" },
  MARKETPLACES: { light: "#c2507f", dark: "#d0668f" },
  BLOG: { light: "#a97a12", dark: "#b8862a" },
  MEDIA: { light: "#00897a", dark: "#2aa595" },
  SEARCH: { light: "#c45f31", dark: "#d77650" },
  OTHER: { light: "#8f8f8f", dark: "#6b6b6b" },
};

export const getCategoryColor = (
  category: WebsiteCategory,
  isDark: boolean
): string => {
  const entry = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.OTHER;
  return isDark ? entry.dark : entry.light;
};
