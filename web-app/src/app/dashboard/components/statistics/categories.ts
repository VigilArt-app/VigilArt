import type { WebsiteCategory } from "@vigilart/shared";

// `CATEGORY_ORDER` and `categoryLabelKey` are the shared category taxonomy
// (also used by the scans-report modal and the artwork gallery). They live in
// the shared matches module; re-exported here so existing imports keep working.
export { CATEGORY_ORDER, categoryLabelKey } from "@/src/components/matches/categories";

// Validated categorical palette (dataviz skill): light + dark steps of the same
// hues, checked for CVD separation and contrast against each surface.
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
