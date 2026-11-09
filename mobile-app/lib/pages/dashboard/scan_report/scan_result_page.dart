import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../(api)/auth.dart';
import '../../../(api)/legal.dart';
import '../../../(api)/scan_reports_api.dart';
import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/app_links.dart';
import '../../../widgets/custom_button.dart';
import '../categories.dart';
import 'match_category_filter.dart';
import 'widgets/artwork_details_sheet.dart';
import 'widgets/scan_result_card.dart';

enum TimelineFilter { all, week, month, quarter, year }

extension on TimelineFilter {
  /// null means "no limit".
  Duration? get window => switch (this) {
        TimelineFilter.all => null,
        TimelineFilter.week => const Duration(days: 7),
        TimelineFilter.month => const Duration(days: 30),
        TimelineFilter.quarter => const Duration(days: 90),
        TimelineFilter.year => const Duration(days: 365),
      };
}

/// "Detected reposts": one card per artwork, with the filters of the website
/// and the Start a scan action.
class ScanResultsPage extends StatefulWidget {
  const ScanResultsPage({super.key, this.apiService, this.scanPollInterval = const Duration(seconds: 2)});

  // Injected by tests.
  final ApiService? apiService;
  final Duration scanPollInterval;

  @override
  State<ScanResultsPage> createState() => _ScanResultsPageState();
}

class _ScanResultsPageState extends State<ScanResultsPage> {
  late final ApiService apiService = widget.apiService ?? ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Map<String, dynamic>> _allResults = [];
  bool _isLoading = true;
  bool _loadFailed = false;
  bool _isScanning = false;
  String _searchQuery = '';
  TimelineFilter _timelineFilter = TimelineFilter.all;
  String _category = kAllCategories;
  bool _onlyUncredited = false;
  ScanQuota? _quota;
  bool _quotaFailed = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _fetchQuota();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _loadFailed = false;
    });
    try {
      final matches = await apiService.getMasterScanReportMatches();
      if (!mounted) return;
      setState(() {
        if (matches == null) {
          _loadFailed = true;
        } else {
          _allResults = matches;
        }
      });
    } catch (_) {
      if (mounted) setState(() => _loadFailed = true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchQuota() async {
    try {
      final quota = await apiService.fetchScanQuota();
      if (mounted) setState(() => _quota = quota);
    } catch (_) {
      if (mounted) setState(() => _quotaFailed = true);
    }
  }

  List<Map<String, dynamic>> get _filteredResults {
    final window = _timelineFilter.window;
    final since = window == null ? null : DateTime.now().subtract(window);
    final query = _searchQuery.trim().toLowerCase();
    return _allResults.where((r) {
      if (query.isNotEmpty) {
        final haystack = '${r['title']} ${r['mostRecentSource']}'.toLowerCase();
        if (!haystack.contains(query)) return false;
      }
      if (since != null) {
        final date = DateTime.tryParse(r['mostRecentDate']?.toString() ?? '');
        if (date == null || date.isBefore(since)) return false;
      }
      if (_category != kAllCategories) {
        final pages = (r['matchingPages'] as List?) ?? [];
        if (!pages.any((m) => (m as Map)['category']?.toString() == _category)) return false;
      }
      if (_onlyUncredited) {
        final matches = (r['matchesCount'] as int?) ?? 0;
        final credited = (r['creditedMatches'] as int?) ?? 0;
        if (matches - credited <= 0) return false;
      }
      return true;
    }).toList();
  }

  Set<String> get _availableCategories {
    final all = _allResults.expand((r) => (r['matchingPages'] as List?) ?? []);
    return presentCategories(all.toList()).toSet();
  }

  Future<void> _startScan() async {
    final l10n = AppLocalizations.of(context);
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('scanConsentSeen') != true) {
      if (!mounted) return;
      final accepted = await _showScanConsent();
      if (accepted != true) return;
      await prefs.setBool('scanConsentSeen', true);
    }
    if (!mounted) return;
    final progress = ValueNotifier<_ScanState>(_ScanState.queued());
    final sheet = showModalBottomSheet<void>(
      context: context,
      isDismissible: false,
      enableDrag: false,
      builder: (_) => _ScanSheet(state: progress),
    );
    setState(() => _isScanning = true);
    try {
      final report = await apiService.runScan(
        pollInterval: widget.scanPollInterval,
        onProgress: (p, state) => progress.value = _ScanState.running(p),
      );
      final count = ((report['matchingPages'] as List?) ?? []).length;
      progress.value = _ScanState.done(count);
      await _fetchData();
      await _fetchQuota();
    } catch (e) {
      progress.value = _ScanState.failed(_scanErrorMessage(l10n, e));
      await _fetchQuota();
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
    await sheet;
    progress.dispose();
  }

  Future<bool?> _showScanConsent() {
    final l10n = AppLocalizations.of(context);
    return showModalBottomSheet<bool>(
      context: context,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(LucideIcons.shield, size: 28, color: ctx.colors.primaryText),
            const SizedBox(height: 12),
            Text(l10n.scanConsentTitle, style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(l10n.scanConsentBody, style: TextStyle(color: ctx.colors.textMuted)),
            const SizedBox(height: 16),
            CustomButton(text: l10n.scanConsentContinue, onPressed: () => Navigator.pop(ctx, true)),
            TextButton(onPressed: () => openExternalUrl(ctx, privacyUrl), child: Text(l10n.scanConsentPolicy)),
          ],
        ),
      ),
    );
  }

  String _scanErrorMessage(AppLocalizations l10n, Object e) {
    if (e is ScanTimeoutException) return l10n.scanTimeout;
    var message = e.toString().replaceFirst('Exception:', '').trim();
    final start = message.indexOf('{');
    if (start != -1) {
      try {
        final decoded = jsonDecode(message.substring(start));
        final m = decoded['message'];
        message = m is List ? m.join('\n') : m.toString();
      } catch (_) {}
    }
    return message.isEmpty ? l10n.scanFailed : message;
  }

  void _showDetailsSheet(Map<String, dynamic> artwork) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => FractionallySizedBox(heightFactor: 0.85, child: ArtworkDetailsSheet(artwork: artwork)),
    );
  }

  String _timelineLabel(AppLocalizations l10n, TimelineFilter f) => switch (f) {
        TimelineFilter.all => l10n.timelineAll,
        TimelineFilter.week => l10n.timelineWeek,
        TimelineFilter.month => l10n.timelineMonth,
        TimelineFilter.quarter => l10n.timelineQuarter,
        TimelineFilter.year => l10n.timelineYear,
      };

  Widget _quotaNote(AppLocalizations l10n) {
    final c = context.colors;
    final style = TextStyle(color: c.textMuted, fontSize: 12);
    final quota = _quota;
    if (quota != null) {
      final locale = Localizations.localeOf(context).toString();
      final count = quota.remaining == 1 ? l10n.quotaOne(1, quota.limit) : l10n.quotaOther(quota.remaining, quota.limit);
      final second = quota.remaining == 0 && quota.nextAvailableAt != null
          ? l10n.nextScanAvailable(DateFormat.yMMMd(locale).add_Hm().format(quota.nextAvailableAt!))
          : l10n.quotaWindow;
      return Text('$count. $second', style: style);
    }
    if (_quotaFailed) {
      return Row(children: [
        Text(l10n.quotaUnavailable, style: style),
        TextButton(onPressed: () { setState(() => _quotaFailed = false); _fetchQuota(); }, child: Text(l10n.retry)),
      ]);
    }
    return Text(l10n.quotaLoading, style: style);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final results = _filteredResults;
    final scanDisabled = _isLoading || _isScanning || _quota?.remaining == 0;

    return Column(
      children: [
        Expanded(
          child: _isLoading && _allResults.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () async {
                    await Future.wait([_fetchData(), _fetchQuota()]);
                  },
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              TextField(
                                controller: _searchController,
                                onChanged: (v) => setState(() => _searchQuery = v),
                                decoration: InputDecoration(
                                  hintText: l10n.searchByName,
                                  prefixIcon: const Icon(LucideIcons.search, size: 20),
                                ),
                              ),
                              const SizedBox(height: 8),
                              SizedBox(
                                height: 48,
                                child: ListView(
                                  scrollDirection: Axis.horizontal,
                                  children: [
                                    for (final f in TimelineFilter.values)
                                      Padding(
                                        padding: const EdgeInsets.only(right: 8),
                                        child: ChoiceChip(
                                          label: Text(_timelineLabel(l10n, f)),
                                          selected: _timelineFilter == f,
                                          labelStyle: TextStyle(color: _timelineFilter == f ? c.onPrimary : c.text, fontWeight: FontWeight.w500),
                                          onSelected: (_) => setState(() => _timelineFilter = f),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  Expanded(
                                    child: DropdownButtonFormField<String>(
                                      initialValue: _category,
                                      isExpanded: true,
                                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                                      items: [
                                        DropdownMenuItem(value: kAllCategories, child: Text(l10n.allCategories, overflow: TextOverflow.ellipsis)),
                                        for (final cat in kCategoryOrder.where(_availableCategories.contains))
                                          DropdownMenuItem(value: cat, child: Text(categoryLabel(l10n, cat), overflow: TextOverflow.ellipsis)),
                                      ],
                                      onChanged: (v) => setState(() => _category = v ?? kAllCategories),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Flexible(
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Switch(value: _onlyUncredited, onChanged: (v) => setState(() => _onlyUncredited = v)),
                                        Flexible(child: Text(l10n.onlyUncredited, style: const TextStyle(fontSize: 13, height: 16 / 13))),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                            ],
                          ),
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: _loadFailed
                            ? SliverToBoxAdapter(child: _StateMessage(icon: LucideIcons.triangleAlert, text: l10n.failedToLoadReposts, action: l10n.retry, onAction: _fetchData))
                            : results.isEmpty
                                ? SliverToBoxAdapter(child: _StateMessage(icon: LucideIcons.search, text: l10n.noScans))
                                : SliverList(
                                    delegate: SliverChildBuilderDelegate(
                                      (context, index) => ScanResultCard(result: results[index], onTap: () => _showDetailsSheet(results[index])),
                                      childCount: results.length,
                                    ),
                                  ),
                      ),
                    ],
                  ),
                ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          decoration: BoxDecoration(color: c.bg, border: Border(top: BorderSide(color: c.border))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              CustomButton(
                text: l10n.startScan,
                icon: const Icon(LucideIcons.search),
                showIcon: true,
                isLoading: _isScanning,
                onPressed: scanDisabled ? null : _startScan,
              ),
              const SizedBox(height: 4),
              Semantics(liveRegion: true, child: _quotaNote(l10n)),
            ],
          ),
        ),
      ],
    );
  }
}

class _StateMessage extends StatelessWidget {
  final IconData icon;
  final String text;
  final String? action;
  final VoidCallback? onAction;

  const _StateMessage({required this.icon, required this.text, this.action, this.onAction});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.only(top: 48),
      child: Column(
        children: [
          Icon(icon, size: 48, color: c.textMuted),
          const SizedBox(height: 12),
          Text(text, textAlign: TextAlign.center, style: TextStyle(color: c.textMuted)),
          if (action != null) ...[
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onAction, style: OutlinedButton.styleFrom(minimumSize: const Size(160, 48)), child: Text(action!)),
          ],
        ],
      ),
    );
  }
}

class _ScanState {
  final String kind; // queued, running, done, failed
  final ScanProgress? progress;
  final int matches;
  final String? error;

  const _ScanState._(this.kind, {this.progress, this.matches = 0, this.error});
  factory _ScanState.queued() => const _ScanState._('queued');
  factory _ScanState.running(ScanProgress? p) => _ScanState._('running', progress: p);
  factory _ScanState.done(int matches) => _ScanState._('done', matches: matches);
  factory _ScanState.failed(String error) => _ScanState._('failed', error: error);
}

/// Status sheet while a scan runs, then its result. The title is a status
/// ("Scan in progress"), not the name of the action.
class _ScanSheet extends StatelessWidget {
  final ValueNotifier<_ScanState> state;

  const _ScanSheet({required this.state});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    return ValueListenableBuilder<_ScanState>(
      valueListenable: state,
      builder: (context, s, _) {
        final finished = s.kind == 'done' || s.kind == 'failed';
        final title = switch (s.kind) {
          'done' => l10n.reportCreated,
          'failed' => l10n.errorTitle,
          _ => l10n.scanInProgress,
        };
        final p = s.progress;
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              if (!finished) ...[
                Text(p == null ? l10n.scanQueued : l10n.scanningArtwork(p.processed + 1 > p.total ? p.total : p.processed + 1, p.total)),
                const SizedBox(height: 12),
                LinearProgressIndicator(value: p == null || p.total == 0 ? null : p.processed / p.total, minHeight: 8, borderRadius: BorderRadius.circular(4)),
                const SizedBox(height: 8),
                Text(l10n.coverageNote, style: TextStyle(color: c.textMuted, fontSize: 12)),
              ] else if (s.kind == 'done') ...[
                _Banner(color: c.success, bg: c.successBg, icon: LucideIcons.check, text: '${s.matches} ${l10n.detectionsFound}'),
                const SizedBox(height: 8),
                _Banner(color: c.warning, bg: c.warningBg, icon: LucideIcons.triangleAlert, text: l10n.coverageNote),
                const SizedBox(height: 16),
                CustomButton(text: MaterialLocalizations.of(context).okButtonLabel, onPressed: () => Navigator.pop(context)),
              ] else ...[
                _Banner(color: c.error, bg: c.errorBg, icon: LucideIcons.triangleAlert, text: s.error ?? l10n.scanFailed),
                const SizedBox(height: 16),
                CustomButton(text: MaterialLocalizations.of(context).okButtonLabel, onPressed: () => Navigator.pop(context)),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _Banner extends StatelessWidget {
  final Color color;
  final Color bg;
  final IconData icon;
  final String text;

  const _Banner({required this.color, required this.bg, required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: TextStyle(color: context.colors.text))),
        ],
      ),
    );
  }
}
