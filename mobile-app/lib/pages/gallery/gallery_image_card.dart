import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../l10n/app_localizations.dart';
import '../../theme/app_colors.dart';
import '../../widgets/status_badge.dart';

/// Status of an artwork, computed from the same inputs as the website.
ArtworkStatus statusOf(Map<String, dynamic> art) => artworkStatus(
      totalMatches: (art['matchesCount'] as int?) ?? 0,
      scanned: art['lastScanAt'] != null,
      insightsAvailable: art['reportsLoaded'] == true,
    );

/// Square artwork thumbnail with its status badge, title, date and a menu.
/// The artwork keeps its own colours; only the footer is themed.
class GalleryImageCard extends StatelessWidget {
  final Map<String, dynamic> artwork;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const GalleryImageCard({super.key, required this.artwork, required this.onTap, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    final locale = Localizations.localeOf(context).toString();
    final url = artwork['url']?.toString() ?? '';
    final title = (artwork['title']?.toString().isNotEmpty ?? false) ? artwork['title'].toString() : l10n.galleryUntitled;
    final date = DateTime.tryParse(artwork['date']?.toString() ?? '')?.toLocal();
    final blacklisted = (artwork['blacklistedCount'] as int?) ?? 0;

    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Expanded(
            child: InkWell(
              onTap: onTap,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  url.startsWith('http')
                      ? Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: c.surfaceSubtle, child: Icon(LucideIcons.image, color: c.textMuted)))
                      : Container(color: c.surfaceSubtle, child: Icon(LucideIcons.image, color: c.textMuted)),
                  Positioned(
                    top: 8,
                    left: 8,
                    right: 8,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        StatusBadge(status: statusOf(artwork)),
                        if (blacklisted > 0) ...[const SizedBox(height: 4), BlacklistedBadge(count: blacklisted)],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 4, 0, 4),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      if (date != null)
                        Text(DateFormat.yMMMd(locale).format(date), style: TextStyle(fontSize: 12, color: c.textMuted)),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  tooltip: title,
                  icon: const Icon(LucideIcons.ellipsis, size: 20),
                  onSelected: (v) => v == 'edit' ? onEdit() : onDelete(),
                  itemBuilder: (_) => [
                    PopupMenuItem(value: 'edit', child: Row(children: [const Icon(LucideIcons.pencil, size: 18), const SizedBox(width: 8), Text(l10n.artworkEditTitle)])),
                    PopupMenuItem(value: 'delete', child: Row(children: [Icon(LucideIcons.trash2, size: 18, color: c.error), const SizedBox(width: 8), Text(l10n.artworkDelete, style: TextStyle(color: c.error))])),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
