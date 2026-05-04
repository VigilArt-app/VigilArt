import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class ResolvedBarChart extends StatelessWidget {
  const ResolvedBarChart({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Matches by Resolution Status', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 150,
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        switch (value.toInt()) {
                          case 0: return const Padding(padding: EdgeInsets.only(top: 8), child: Text('Credible', style: TextStyle(fontSize: 11, color: Colors.grey)));
                          case 1: return const Padding(padding: EdgeInsets.only(top: 8), child: Text('Ignored', style: TextStyle(fontSize: 11, color: Colors.grey)));
                          case 2: return const Padding(padding: EdgeInsets.only(top: 8), child: Text('Pending', style: TextStyle(fontSize: 11, color: Colors.grey)));
                          default: return const Text('');
                        }
                      },
                    ),
                  ),
                ),
                barGroups: [
                  BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 120, color: const Color(0xFF22C55E), width: 20, borderRadius: BorderRadius.circular(4))]),
                  BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 45, color: Colors.red[400], width: 20, borderRadius: BorderRadius.circular(4))]),
                  BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 80, color: const Color(0xFFEAB308), width: 20, borderRadius: BorderRadius.circular(4))]),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}