import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../categories.dart';
import 'models/statistics_model.dart';

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

  List<CategoryDistributionItem> get _slices {
    final byCategory = {for (final d in distribution) d.category: d.count};
    return kCategoryOrder
        .where((c) => (byCategory[c] ?? 0) > 0)
        .map((c) => CategoryDistributionItem(category: c, count: byCategory[c]!))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final slices = _slices;
    if (slices.isEmpty) {
      return const Center(child: Text('No reposts found yet'));
    }

    return Column(
      children: [
        SizedBox(
          height: 200,
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 55,
              pieTouchData: PieTouchData(
                touchCallback: (event, response) {
                  if (event is! FlTapUpEvent) return;
                  final section = response?.touchedSection;
                  if (section == null) return;
                  final index = section.touchedSectionIndex;
                  if (index >= 0 && index < slices.length) {
                    onTapCategory(slices[index].category);
                  }
                },
              ),
              sections: slices.map((slice) {
                final pct = totalMatches > 0
                    ? (slice.count / totalMatches) * 100
                    : 0.0;
                return PieChartSectionData(
                  color: categoryColor(slice.category),
                  value: slice.count.toDouble(),
                  title: '${pct.toStringAsFixed(0)}%',
                  radius: 45,
                  titleStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        const SizedBox(height: 16),
        _buildLegend(slices),
      ],
    );
  }

  Widget _buildLegend(List<CategoryDistributionItem> slices) {
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: slices.map((slice) {
        final pct = totalMatches > 0 ? (slice.count / totalMatches) * 100 : 0.0;
        return InkWell(
          onTap: () => onTapCategory(slice.category),
          borderRadius: BorderRadius.circular(6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: categoryColor(slice.category),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                categoryLabel(slice.category),
                style: const TextStyle(fontSize: 13, color: Colors.black87),
              ),
              const SizedBox(width: 6),
              Text(
                '${pct.toStringAsFixed(0)}%',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
