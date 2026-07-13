import type { WebsiteCategory } from "@vigilart/shared";
import { CATEGORY_ORDER } from "./categories";

/** Minimal shape a match must have to be filtered/sorted here. */
export type MatchLike = {
  category: WebsiteCategory;
  firstDetectedAt: string | Date;
};

/** Sentinel for "no category filter" — a real, non-empty <SelectItem> value. */
export const ALL_CATEGORIES = "ALL" as const;

export type CategorySelection = WebsiteCategory | typeof ALL_CATEGORIES;

/**
 * The categories actually present in `pages`, in the canonical display order.
 * Used to build the filter options so empty categories are never offered.
 */
export function presentCategories(pages: MatchLike[]): WebsiteCategory[] {
  const present = new Set(pages.map((page) => page.category));
  return CATEGORY_ORDER.filter((category) => present.has(category));
}

/**
 * Apply the category filter (a no-op for `ALL_CATEGORIES`) and return a new
 * array sorted newest-first by `firstDetectedAt`. Never mutates the input.
 */
export function filterAndSortMatches<T extends MatchLike>(
  pages: T[],
  selection: CategorySelection
): T[] {
  const filtered =
    selection === ALL_CATEGORIES
      ? pages
      : pages.filter((page) => page.category === selection);

  return [...filtered].sort(
    (a, b) =>
      new Date(b.firstDetectedAt).getTime() -
      new Date(a.firstDetectedAt).getTime()
  );
}
