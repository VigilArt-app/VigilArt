import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'models/statistics_model.dart';

class TimelineBarChart extends StatelessWidget {
  final List<TimelinePoint> timeline;
  final void Function(TimelinePoint point) onTapPoint;

  const TimelineBarChart({
    super.key,
    required this.timeline,
    required this.onTapPoint,
  });

  static const Color _barColor = Color(0xFF2A78D6);

  String _shortDate(String iso) {
    final date = DateTime.tryParse(iso);
    if (date == null) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}';
  }

  @override
  Widget build(BuildContext context) {
    if (timeline.isEmpty) {
      return const Center(child: Text('No reports yet'));
    }

    final labelStep = (timeline.length / 6).ceil().clamp(1, timeline.length);

    return BarChart(
      BarChartData(
        gridData: const FlGridData(show: false),
        alignment: BarChartAlignment.spaceAround,
        titlesData: FlTitlesData(
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: true, reservedSize: 28),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index < 0 || index >= timeline.length) {
                  return const SizedBox.shrink();
                }
                if (index % labelStep != 0) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    _shortDate(timeline[index].date),
                    style: const TextStyle(fontSize: 11),
                  ),
                );
              },
            ),
          ),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              final point = timeline[group.x];
              return BarTooltipItem(
                '${point.totalMatches} reposts',
                const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              );
            },
          ),
          touchCallback: (event, response) {
            if (event is! FlTapUpEvent) return;
            final spot = response?.spot;
            if (spot == null) return;
            final index = spot.touchedBarGroupIndex;
            if (index >= 0 && index < timeline.length) {
              onTapPoint(timeline[index]);
            }
          },
        ),
        barGroups: timeline.asMap().entries.map((entry) {
          return BarChartGroupData(
            x: entry.key,
            barRods: [
              BarChartRodData(
                toY: entry.value.totalMatches.toDouble(),
                color: _barColor,
                width: 14,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
