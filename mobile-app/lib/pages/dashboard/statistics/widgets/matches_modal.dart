import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../l10n/app_localizations.dart';
import '../../../../theme/app_colors.dart';
import '../../../../widgets/restricted_match.dart';
import '../../categories.dart';

typedef MatchesFetcher = Future<List<Map<String, dynamic>>> Function();

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
    builder: (_) => FractionallySizedBox(
      heightFactor: 0.85,
      child: MatchesModal(title: title, emptyMessage: emptyMessage, totalCount: totalCount, fetcher: fetcher),
    ),
  );
}

class MatchesModal extends StatefulWidget {
  final String title;
  final String emptyMessage;
  final int totalCount;
  final MatchesFetcher fetcher;

  const MatchesModal({
    super.key,
    required this.title,
    required this.emptyMessage,
    required this.totalCount,
    required this.fetcher,
  });

  @override
  State<MatchesModal> createState() => _MatchesModalState();
}

class _MatchesModalState extends State<MatchesModal> {
  late final Future<List<Map<String, dynamic>>> _future = widget.fetcher();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) return Center(child: Text(l10n.statsLoadError));
                final matches = snapshot.data ?? [];
                if (matches.isEmpty) return Center(child: Text(widget.emptyMessage, style: TextStyle(color: c.textMuted)));
                return Column(
                  children: [
                    if (widget.totalCount > matches.length)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(l10n.statsShowingFirst(matches.length, widget.totalCount),
                            style: TextStyle(color: c.textMuted, fontSize: 13)),
                      ),
                    Expanded(
                      child: ListView.separated(
                        itemCount: matches.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) => MatchTile(match: matches[i]),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// One matching page: category, website, title and a Visit button. Matches on
/// a blacklisted website are hidden until revealed and never opened as links.
class MatchTile extends StatelessWidget {
  final Map<String, dynamic> match;

  const MatchTile({super.key, required this.match});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final category = match['category']?.toString() ?? 'OTHER';
    final url = match['url']?.toString() ?? '';
    final website = match['websiteName']?.toString() ?? '';
    final title = match['pageTitle']?.toString() ?? '';
    final blacklisted = match['unsafeDomain'] == true;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: c.surface,
        border: Border.all(color: c.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 12, height: 12, decoration: BoxDecoration(color: categoryColor(context, category), shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Expanded(child: Text(categoryLabel(l10n, category), style: const TextStyle(fontSize: 12))),
            ],
          ),
          const SizedBox(height: 8),
          if (blacklisted)
            RestrictedMatch(lines: [website, title, url])
          else ...[
            Text(website, style: const TextStyle(fontWeight: FontWeight.w600)),
            if (title.isNotEmpty) Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(color: c.textMuted, fontSize: 13)),
            Text(url, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontFamily: 'GeistMono', fontSize: 12)),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: url.isEmpty ? null : () => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication),
                icon: const Icon(LucideIcons.externalLink, size: 18),
                label: Text(l10n.repostVisit),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
