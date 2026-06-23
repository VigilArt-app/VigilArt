import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'models/statistics_model.dart';

class GrowthLineChart extends StatelessWidget {
  final List<ChartPoint> data;

  const GrowthLineChart({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const Center(child: Text("No data available"));

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index < 0 || index >= data.length) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(data[index].label, style: const TextStyle(fontSize: 12)),
                );
              },
            ),
          ),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: data.asMap().entries.map((entry) {
              return FlSpot(entry.key.toDouble(), entry.value.value);
            }).toList(),
            isCurved: true,
            color: const Color(0xFF5E3B7D),
            barWidth: 3,
            belowBarData: BarAreaData(
              show: true,
              color: const Color(0xFF5E3B7D).withValues(alpha: 0.1),
            ),
          ),
        ],
      ),
    );
  }
}
