"use client";

import { useTranslation } from "react-i18next";
import type { WebsiteCategory } from "@vigilart/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { categoryLabelKey } from "./categories";
import { ALL_CATEGORIES, type CategorySelection } from "./matchCategoryFilter";

interface CategoryFilterSelectProps {
  value: CategorySelection;
  onChange: (value: CategorySelection) => void;
  /** Categories offered besides "All"; caller passes only those present. */
  categories: WebsiteCategory[];
  className?: string;
}

/**
 * Compact category filter shared by the scans-report modal and the artwork
 * gallery details panel. Labels resolve through the shared category i18n keys.
 */
export function CategoryFilterSelect({
  value,
  onChange,
  categories,
  className,
}: CategoryFilterSelectProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={(next) => onChange(next as CategorySelection)}>
      <SelectTrigger
        size="sm"
        className={className}
        aria-label={t("matches.filter_by_category", "Filter by category")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CATEGORIES}>
          {t("matches.all_categories", "All categories")}
        </SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {t(categoryLabelKey(category), category)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
