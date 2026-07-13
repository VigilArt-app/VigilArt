import 'package:flutter/material.dart';
import 'package:vigilart/(api)/statistics.dart';
import '../../../(api)/auth.dart';
import 'models/statistics_model.dart';
import '../categories.dart';
import 'category_pie_chart.dart';
import 'timeline_bar_chart.dart';
import 'widgets/matches_modal.dart';

class StatisticsPage extends StatefulWidget {
  const StatisticsPage({super.key});

  @override
  State<StatisticsPage> createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
  static const Color _brand = Color(0xFF5E3B7D);

  final ApiService _api = ApiService();
  bool _isLoading = true;
  bool _error = false;
  GlobalStatistics? _stats;
  StatisticsRange _range = StatisticsRange.all;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    setState(() {
      _isLoading = true;
      _error = false;
    });
    try {
      _userId ??= await _api.secureStorage.read(key: ApiService.keyUserId);
      final userId = _userId;
      if (userId == null) {
        if (mounted) setState(() => _error = true);
        return;
      }
      final data = await _api.fetchGlobalStatistics(userId, _range);
      if (mounted) setState(() => _stats = data);
    } catch (_) {
      if (mounted) setState(() => _error = true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onRangeChanged(StatisticsRange range) {
    if (range == _range) return;
    setState(() => _range = range);
    _loadStatistics();
  }

  void _openCategoryMatches(String category) {
    final userId = _userId;
    if (userId == null) return;
    final total = _stats?.categoryDistribution
            .firstWhere(
              (d) => d.category == category,
              orElse: () => CategoryDistributionItem(category: category, count: 0),
            )
            .count ??
        0;
    showMatchesModal(
      context,
      title: '${categoryLabel(category)} reposts',
      emptyMessage: 'No reposts in this category',
      totalCount: total,
      fetcher: () => _api.fetchMatchesByCategory(userId, category, _range),
    );
  }

  void _openReportMatches(TimelinePoint point) {
    showMatchesModal(
      context,
      title: 'Reposts from ${_fullDate(point.date)}',
      emptyMessage: 'No reposts in this report',
      totalCount: point.totalMatches,
      fetcher: () => _api.fetchMatchesByReport(point.reportId),
    );
  }

  String _fullDate(String iso) {
    final date = DateTime.tryParse(iso);
    if (date == null) return '';
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    String two(int n) => n.toString().padLeft(2, '0');
    return '${months[date.month - 1]} ${date.day}, ${date.year} ${two(date.hour)}:${two(date.minute)}';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _stats == null) {
      return const Center(child: CircularProgressIndicator(color: _brand));
    }
    if (_error && _stats == null) {
      return const Center(child: Text('Could not load statistics.'));
    }

    final stats = _stats!;
    return RefreshIndicator(
      onRefresh: _loadStatistics,
      color: _brand,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Statistics',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildRangeToggle(),
            const SizedBox(height: 16),
            _buildTotalMatches(stats.totalMatches),
            const SizedBox(height: 24),

            _buildCard(
              child: stats.categoryDistribution.isEmpty
                  ? _emptyState('No reposts found yet')
                  : CategoryPieChart(
                      distribution: stats.categoryDistribution,
                      totalMatches: stats.totalMatches,
                      onTapCategory: _openCategoryMatches,
                    ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Monthly comparison',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildCard(
              child: stats.timeline.isEmpty
                  ? _emptyState('No reports yet')
                  : Column(
                      children: [
                        SizedBox(
                          height: 240,
                          child: TimelineBarChart(
                            timeline: stats.timeline,
                            onTapPoint: _openReportMatches,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Tap a bar to see that scan's reposts",
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRangeToggle() {
    return Row(
      children: [
        _rangeButton('All Time', StatisticsRange.all),
        const SizedBox(width: 8),
        _rangeButton('Last Month', StatisticsRange.month),
      ],
    );
  }

  Widget _rangeButton(String label, StatisticsRange range) {
    final selected = _range == range;
    return OutlinedButton(
      onPressed: () => _onRangeChanged(range),
      style: OutlinedButton.styleFrom(
        backgroundColor: selected ? _brand : Colors.white,
        foregroundColor: selected ? Colors.white : Colors.black87,
        side: BorderSide(color: selected ? _brand : Colors.grey[300]!),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildTotalMatches(int total) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          '$total',
          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.black87),
        ),
        const SizedBox(width: 8),
        Text('total matches', style: TextStyle(fontSize: 14, color: Colors.grey[600])),
      ],
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: child,
    );
  }

  Widget _emptyState(String message) {
    return Container(
      height: 120,
      alignment: Alignment.center,
      child: Text(message, style: TextStyle(color: Colors.grey[500])),
    );
  }
}
