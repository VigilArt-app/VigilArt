import 'package:flutter/material.dart';
import 'package:vigilart/(api)/statistics.dart';
import '../../../(api)/auth.dart';
import 'models/statistics_model.dart';
import 'growth_line_chart.dart';
import 'resolved_bar_chart.dart';
import 'source_pie_chart.dart';

class StatisticsPage extends StatefulWidget {
  const StatisticsPage({super.key});

  @override
  State<StatisticsPage> createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  UserStatistics? _stats;

  @override
  void initState() {
    super.initState();
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    try {
      final userId = await _api.secureStorage.read(key: ApiService.keyUserId);
      if (userId != null) {
        final data = await _api.fetchUserStatistics(userId);
        if (mounted) {
          setState(() {
            _stats = data;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)));
    }

    if (_stats == null) {
      return const Center(child: Text("Could not load statistics."));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCards(),
          const SizedBox(height: 24),
          
          const Text("Notice Growth", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            height: 250,
            child: GrowthLineChart(data: _stats!.growthData), 
          ),
          
          const SizedBox(height: 24),
          const Text("Resolved Cases (This Week)", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            height: 250,
            child: ResolvedBarChart(data: _stats!.resolvedData),
          ),
          
          const SizedBox(height: 24),
          const Text("Infringement Sources", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            height: 250,
            child: SourcePieChart(data: _stats!.sourceData),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildCard("Total Scans", _stats!.totalScanned.toString(), Colors.blue),
        _buildCard("Infringements", _stats!.infringementsFound.toString(), Colors.redAccent),
        _buildCard("Notices Sent", _stats!.noticesSent.toString(), Colors.orange),
        _buildCard("Resolved", _stats!.resolvedCases.toString(), Colors.green),
      ],
    );
  }

  Widget _buildCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(color: color, fontSize: 24, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
