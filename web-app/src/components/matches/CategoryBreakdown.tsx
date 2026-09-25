"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps
} from "recharts";
import type { CategoryDistributionItem, WebsiteCategory } from "@vigilart/shared";
import { CATEGORY_ORDER, categoryLabelKey, getCategoryColor } from "./categories";
import { usePrefersReducedMotion } from "@/src/hooks/usePrefersReducedMotion";

export interface CategorySlice {
  category: WebsiteCategory;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface CategoryBreakdownProps {
  totalMatches: number;
  categoryDistribution: CategoryDistributionItem[];
  /** Omitted on the landing page, where there is nothing to drill into. */
  onSelect?: (category: WebsiteCategory) => void;
  /** Pixel height of the donut. Ignored by the bar. */
  chartHeight?: number;
  /** "bar" is a single stacked strip instead of the donut. The landing's card
   *  is compact: a donut there hides the match links, which are the evidence,
   *  while the strip costs about 20px and still gives the legend's colour
   *  something to key against. */
  variant?: "donut" | "bar";
}

// The donut and its legend, shared by the dashboard's statistics panel and the
// public scan result, so an artist sees the same picture before and after
// creating an account.
export function CategoryBreakdown({
  totalMatches,
  categoryDistribution,
  onSelect,
  chartHeight = 224,
  variant = "donut"
}: CategoryBreakdownProps) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const reducedMotion = usePrefersReducedMotion();

  const slices: CategorySlice[] = CATEGORY_ORDER.map((category) => {
    const value =
      categoryDistribution.find((item) => item.category === category)?.count ?? 0;
    return {
      category,
      label: t(categoryLabelKey(category), category),
      value,
      color: getCategoryColor(category, isDark),
      percentage: totalMatches > 0 ? (value / totalMatches) * 100 : 0
    };
  }).filter((slice) => slice.value > 0);

  if (slices.length === 0) return null;

  const renderTooltip = ({
    active,
    payload
  }: Partial<TooltipContentProps<number, string>>) => {
    if (!active || !payload?.length) return null;
    const slice = payload[0].payload as CategorySlice;
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
        <p className="font-medium text-popover-foreground">{slice.label}</p>
        <p className="text-muted-foreground">
          {slice.value} ({slice.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  };

  return (
    <>
      {variant === "bar" ? (
        <CategoryBar slices={slices} />
      ) : (
      <div className="w-full min-w-0" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="none"
              // recharts sweeps the slices in on mount; that is motion, so it
              // has to stop for anyone who asked their system to reduce it.
              isAnimationActive={!reducedMotion}
              onClick={(slice) => {
                const category = (slice as Partial<CategorySlice>).category;
                if (category) onSelect?.(category);
              }}
              className={onSelect ? "cursor-pointer focus:outline-none" : "focus:outline-none"}
            >
              {slices.map((slice) => (
                <Cell key={slice.category} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}

      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {slices.map((slice) => (
          <li key={slice.category}>
            <CategoryLegendRow slice={slice} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </>
  );
}

function CategoryLegendRow({
  slice,
  onSelect
}: {
  slice: CategorySlice;
  onSelect?: (category: WebsiteCategory) => void;
}) {
  const content = (
    <>
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-sm"
        style={{ backgroundColor: slice.color }}
        aria-hidden="true"
      />
      <span className="truncate">{slice.label}</span>
      <span className="ml-auto font-medium text-muted-foreground">
        {slice.percentage.toFixed(0)}%
      </span>
    </>
  );

  // Without a drill-down there is nothing to press, and a button that does
  // nothing is worse than plain text for anyone using a keyboard.
  if (!onSelect) {
    return <span className="flex w-full items-center gap-2 py-0.5">{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(slice.category)}
      className="flex w-full items-center gap-2 rounded-sm py-0.5 text-left hover:text-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </button>
  );
}

// One stacked strip in the category colours. Deliberately not recharts: the
// landing must not pull a charting library in for this, and a flex row of
// percentage-width segments is the whole implementation.
function CategoryBar({ slices }: { slices: CategorySlice[] }) {
  return (
    <div
      className="flex h-2 w-full overflow-hidden rounded-full bg-border"
      role="img"
      // A row of coloured divs is silent to a screen reader, so state the
      // split in words instead.
      aria-label={slices
        .map((slice) => `${slice.label} ${slice.percentage.toFixed(0)}%`)
        .join(", ")}
    >
      {slices.map((slice) => (
        <span
          key={slice.category}
          style={{
            width: `${slice.percentage}%`,
            // A single match in a few hundred is a quarter of a percent, which
            // is sub-pixel and would vanish, leaving its legend swatch keying
            // to nothing again. Flex shrinks the rest to compensate.
            minWidth: 2,
            backgroundColor: slice.color
          }}
        />
      ))}
    </div>
  );
}
