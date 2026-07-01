import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'models/statistics_model.dart';

class SourcePieChart extends StatelessWidget {
  final List<SourceData> data;

  const SourcePieChart({super.key, required this.data});

  Color _getColorForIndex(int index) {
    const colors = [Colors.blue, Colors.redAccent, Colors.orange, Colors.purple, Colors.teal];
    return colors[index % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const Center(child: Text("No data available"));

    return PieChart(
      PieChartData(
        sectionsSpace: 2,   
        centerSpaceRadius: 40,
        sections: data.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return PieChartSectionData(
            color: _getColorForIndex(index),
            value: item.percentage,
            title: '${item.platform}\n${item.percentage.toInt()}%',
            radius: 50,
            titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
          );
        }).toList(),
      ),
    );
  }
}
