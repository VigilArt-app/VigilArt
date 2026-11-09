import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../../../theme/app_colors.dart';
import '../../categories.dart';
import '../../statistics/widgets/matches_modal.dart';
import '../match_category_filter.dart';

/// Reposts of one artwork, with the category filter of the website.
/// Matches on a blacklisted website stay hidden until revealed (#326).
class ArtworkDetailsSheet extends StatefulWidget {
  final Map<String, dynamic> artwork;

  const ArtworkDetailsSheet({super.key, required this.artwork});

  @override
  State<ArtworkDetailsSheet> createState() => _ArtworkDetailsSheetState();
}

class _ArtworkDetailsSheetState extends State<ArtworkDetailsSheet> {
  String _category = kAllCategories;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final List<dynamic> matches = widget.artwork['matchingPages'] ?? [];
    final present = presentCategories(matches);
    final visible = filterAndSortMatches(matches, _category);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.artwork['title']?.toString() ?? '', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text('${widget.artwork['matchesCount'] ?? matches.length} ${l10n.matchesLabel.toLowerCase()}', style: TextStyle(color: c.textMuted)),
          const SizedBox(height: 12),
          Text(l10n.allDetectedReposts, style: Theme.of(context).textTheme.titleMedium),
          if (present.length > 1) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 48,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (final cat in [kAllCategories, ...present])
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(cat == kAllCategories ? l10n.allCategories : categoryLabel(l10n, cat)),
                        selected: _category == cat,
                        labelStyle: TextStyle(color: _category == cat ? c.onPrimary : c.text, fontWeight: FontWeight.w500),
                        onSelected: (_) => setState(() => _category = cat),
                      ),
                    ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 8),
          Expanded(
            child: visible.isEmpty
                ? Center(child: Text(l10n.noMatchesForArtwork, style: TextStyle(color: c.textMuted)))
                : ListView.separated(
                    itemCount: visible.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => MatchTile(match: visible[i]),
                  ),
          ),
          const SizedBox(height: 8),
          Text(l10n.coverageNote, style: TextStyle(color: c.textMuted, fontSize: 12)),
        ],
      ),
    );
  }
}
