import 'package:flutter/material.dart';
import 'growth_line_chart.dart'; 
import 'resolved_bar_chart.dart';
import 'source_pie_chart.dart';

class StatisticsPage extends StatefulWidget {
  const StatisticsPage({Key? key}) : super(key: key);

  @override
  State<StatisticsPage> createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
  int _selectedSubTab = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(child: _buildToggleSegment(0, 'Growth')),
              Expanded(child: _buildToggleSegment(1, 'Resolved')),
              Expanded(child: _buildToggleSegment(2, 'Sources')),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _buildChartContent(),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildToggleSegment(int index, String title) {
    final isSelected = _selectedSubTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedSubTab = index),
      behavior: HitTestBehavior.opaque, 
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ]
              : [],
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? const Color(0xFF5E3B7D) : Colors.grey[600],
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildChartContent() {
    switch (_selectedSubTab) {
      case 0: return const GrowthLineChart();
      case 1: return const ResolvedBarChart();
      case 2: return const SourcePieChart();
      default: return const GrowthLineChart();
    }
  }
}
