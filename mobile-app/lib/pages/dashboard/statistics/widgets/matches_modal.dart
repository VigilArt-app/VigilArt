import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../scan_report/match_category_filter.dart';

typedef MatchesFetcher = Future<List<Map<String, dynamic>>> Function();

/// Opens the statistics drill-down modal (shared by the pie category and the
/// bar report). [fetcher] loads the matches; [totalCount] is the true total for
/// the selection so we can show "showing N most recent of total" when the
/// backend-capped list is shorter.
void showMatchesModal(
  BuildContext context, {
  required String title,
  required String emptyMessage,
  required int totalCount,
  required MatchesFetcher fetcher,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => FractionallySizedBox(
      heightFactor: 0.85,
      child: _MatchesModal(
        title: title,
        emptyMessage: emptyMessage,
        totalCount: totalCount,
        fetcher: fetcher,
      ),
    ),
  );
}

class _MatchesModal extends StatefulWidget {
  final String title;
  final String emptyMessage;
  final int totalCount;
  final MatchesFetcher fetcher;

  const _MatchesModal({
    required this.title,
    required this.emptyMessage,
    required this.totalCount,
    required this.fetcher,
  });

  @override
  State<_MatchesModal> createState() => _MatchesModalState();
}

class _MatchesModalState extends State<_MatchesModal> {
  bool _loading = true;
  bool _error = false;
  List<Map<String, dynamic>> _matches = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final result = await widget.fetcher();
      if (!mounted) return;
      setState(() {
        // Newest-first, mirroring the web drill-down.
        _matches = filterAndSortMatches(result, kAllCategories);
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = true;
        _loading = false;
      });
    }
  }

  Future<void> _openLink(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Text(
            widget.title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Colors.black87,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF5E3B7D)),
      );
    }
    if (_error) {
      return Center(
        child: Text('Could not load matches', style: TextStyle(color: Colors.grey[500])),
      );
    }
    if (_matches.isEmpty) {
      return Center(
        child: Text(widget.emptyMessage, style: TextStyle(color: Colors.grey[500])),
      );
    }

    final capped = _matches.length < widget.totalCount;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (capped)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              'Showing the ${_matches.length} most recent of ${widget.totalCount}',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ),
        Expanded(
          child: ListView.separated(
            itemCount: _matches.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) => _buildMatchItem(_matches[index]),
          ),
        ),
      ],
    );
  }

  Widget _buildMatchItem(Map<String, dynamic> match) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            match['websiteName'] ?? 'Unknown Source',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 4),
          Text(
            match['url'] ?? '',
            style: TextStyle(color: Colors.grey[600], fontSize: 12),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: match['url'] != null
                  ? () => _openLink(match['url'] as String)
                  : null,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF5E3B7D),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              icon: const Icon(Icons.open_in_new, size: 16),
              label: const Text('Visit Source'),
            ),
          ),
        ],
      ),
    );
  }
}
