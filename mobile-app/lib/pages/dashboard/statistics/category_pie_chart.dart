import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import '../categories.dart';
import 'models/statistics_model.dart';

/// Category donut with a legend. Every category has a label and a percentage,
/// so the colours are never the only way to read the chart.
class CategoryPieChart extends StatelessWidget {
  final List<CategoryDistributionItem> distribution;
  final int totalMatches;
  final void Function(String category) onTapCategory;

  const CategoryPieChart({
    super.key,
    required this.distribution,
    required this.totalMatches,
    required this.onTapCategory,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    final byCategory = {for (final d in distribution) d.category: d.count};
    final present = kCategoryOrder.where((k) => (byCategory[k] ?? 0) > 0).toList();

    String pct(int count) => totalMatches > 0 ? '${(count * 100 / totalMatches).round()}%' : '0%';

    final summary = present.map((k) => '${categoryLabel(l10n, k)} ${pct(byCategory[k]!)}').join(', ');
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Semantics(
          label: summary,
          child: SizedBox(
            width: 136,
            height: 136,
            child: ExcludeSemantics(
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 44,
                  pieTouchData: PieTouchData(enabled: false),
                  sections: [
                    for (final k in present)
                      PieChartSectionData(
                        value: byCategory[k]!.toDouble(),
                        color: c.categoryColor(k),
                        radius: 22,
                        showTitle: false,
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            children: [
              for (final k in kCategoryOrder)
                InkWell(
                  onTap: (byCategory[k] ?? 0) > 0 ? () => onTapCategory(k) : null,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(minHeight: 28),
                    child: Row(
                      children: [
                        Container(width: 10, height: 10, decoration: BoxDecoration(color: c.categoryColor(k), shape: BoxShape.circle)),
                        const SizedBox(width: 6),
                        Expanded(child: Text(categoryLabel(l10n, k), style: const TextStyle(fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis)),
                        Text(pct(byCategory[k] ?? 0), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
