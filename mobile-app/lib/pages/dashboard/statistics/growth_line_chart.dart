import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class GrowthLineChart extends StatelessWidget {
  const GrowthLineChart({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Artworks Scanned vs Matches Found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                        if (value.toInt() >= 0 && value.toInt() < months.length) {
                          return Padding(padding: const EdgeInsets.only(top: 8), child: Text(months[value.toInt()], style: const TextStyle(fontSize: 12, color: Colors.grey)));
                        }
                        return const Text('');
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: const [FlSpot(0, 10), FlSpot(1, 20), FlSpot(2, 45), FlSpot(3, 80), FlSpot(4, 120), FlSpot(5, 150)],
                    isCurved: true,
                    color: const Color(0xFF5E3B7D),
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(show: true, color: const Color(0xFF5E3B7D).withOpacity(0.1)),
                  ),
                  LineChartBarData(
                    spots: const [FlSpot(0, 2), FlSpot(1, 5), FlSpot(2, 12), FlSpot(3, 20), FlSpot(4, 35), FlSpot(5, 45)],
                    isCurved: true,
                    color: const Color(0xFFEAB308),
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegend(const Color(0xFF5E3B7D), 'Scans'),
              const SizedBox(width: 16),
              _buildLegend(const Color(0xFFEAB308), 'Matches'),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLegend(Color color, String label) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}