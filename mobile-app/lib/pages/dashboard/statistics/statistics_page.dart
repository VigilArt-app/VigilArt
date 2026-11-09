import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../(api)/auth.dart';
import '../../../(api)/statistics.dart';
import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import '../categories.dart';
import 'category_pie_chart.dart';
import 'models/statistics_model.dart';
import 'timeline_bar_chart.dart';
import 'widgets/matches_modal.dart';

class StatisticsPage extends StatefulWidget {
  const StatisticsPage({super.key});

  @override
  State<StatisticsPage> createState() => _StatisticsPageState();
}

class _StatisticsPageState extends State<StatisticsPage> {
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
    final l10n = AppLocalizations.of(context);
    final total = _stats?.categoryDistribution
            .firstWhere(
              (d) => d.category == category,
              orElse: () => CategoryDistributionItem(category: category, count: 0),
            )
            .count ??
        0;
    showMatchesModal(
      context,
      title: l10n.statsMatchesTitle(categoryLabel(l10n, category)),
      emptyMessage: l10n.statsNoMatches,
      totalCount: total,
      fetcher: () => _api.fetchMatchesByCategory(userId, category, _range),
    );
  }

  void _openReportMatches(TimelinePoint point) {
    final l10n = AppLocalizations.of(context);
    final locale = Localizations.localeOf(context).toString();
    final date = DateTime.tryParse(point.date)?.toLocal();
    showMatchesModal(
      context,
      title: l10n.statsReportMatchesTitle(date == null ? '' : DateFormat.yMMMd(locale).add_Hm().format(date)),
      emptyMessage: l10n.statsNoMatchesReport,
      totalCount: point.totalMatches,
      fetcher: () => _api.fetchMatchesByReport(point.reportId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    if (_isLoading && _stats == null) return const Center(child: CircularProgressIndicator());
    if (_error && _stats == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.statsLoadError),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: _loadStatistics, style: OutlinedButton.styleFrom(minimumSize: const Size(160, 48)), child: Text(l10n.retry)),
          ],
        ),
      );
    }

    final stats = _stats!;
    Widget card(String title, Widget child) => Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: c.surface,
            border: Border.all(color: c.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              child,
            ],
          ),
        );

    return RefreshIndicator(
      onRefresh: _loadStatistics,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildRangeToggle(l10n),
            const SizedBox(height: 12),
            card(
              l10n.statsTitle,
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text('${stats.totalMatches}', style: const TextStyle(fontSize: 28, height: 32 / 28, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 8),
                      Text(l10n.statsTotalMatches, style: TextStyle(color: c.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  stats.categoryDistribution.isEmpty
                      ? Padding(padding: const EdgeInsets.symmetric(vertical: 16), child: Text(l10n.statsNoData, style: TextStyle(color: c.textMuted)))
                      : CategoryPieChart(
                          distribution: stats.categoryDistribution,
                          totalMatches: stats.totalMatches,
                          onTapCategory: _openCategoryMatches,
                        ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            card(
              l10n.recentScans,
              stats.timeline.isEmpty
                  ? Text(l10n.recentScansEmpty, style: TextStyle(color: c.textMuted))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TimelineBarChart(timeline: stats.timeline, onTapPoint: _openReportMatches),
                        const SizedBox(height: 8),
                        Text(l10n.recentScansHint, style: TextStyle(color: c.textMuted, fontSize: 12)),
                      ],
                    ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildRangeToggle(AppLocalizations l10n) {
    final c = context.colors;
    Widget option(String label, StatisticsRange range) {
      final selected = _range == range;
      return Expanded(
        child: Semantics(
          button: true,
          selected: selected,
          excludeSemantics: true,
          label: label,
          child: InkWell(
            borderRadius: BorderRadius.circular(6),
            onTap: () => _onRangeChanged(range),
            child: Container(
              constraints: const BoxConstraints(minHeight: 44),
              alignment: Alignment.center,
              decoration: BoxDecoration(color: selected ? c.primary : Colors.transparent, borderRadius: BorderRadius.circular(6)),
              child: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: selected ? c.onPrimary : c.text)),
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: c.surfaceSubtle, borderRadius: BorderRadius.circular(8)),
      child: Row(children: [option(l10n.statsRangeAll, StatisticsRange.all), option(l10n.statsRangeMonth, StatisticsRange.month)]),
    );
  }
}
