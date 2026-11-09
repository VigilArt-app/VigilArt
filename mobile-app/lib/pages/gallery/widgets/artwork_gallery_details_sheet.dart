import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/status_badge.dart';
import '../../dashboard/statistics/widgets/matches_modal.dart';
import '../gallery_image_card.dart';

/// Details of one artwork, with the same fields as the website.
class ArtworkGalleryDetailsSheet extends StatelessWidget {
  final Map<String, dynamic> artwork;
  final VoidCallback onFileDmca;
  final VoidCallback onViewReposts;

  const ArtworkGalleryDetailsSheet({super.key, required this.artwork, required this.onFileDmca, required this.onViewReposts});

  Widget _item(BuildContext context, String label, String value, {bool mono = false}) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: context.colors.textMuted)),
          Text(value, style: TextStyle(fontSize: mono ? 13 : 15, fontFamily: mono ? 'GeistMono' : null)),
        ],
      );

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final locale = Localizations.localeOf(context).toString();
    final matches = ((artwork['matches'] as List?) ?? []).cast<Map<String, dynamic>>();
    final status = statusOf(artwork);
    final date = DateTime.tryParse(artwork['date']?.toString() ?? '')?.toLocal();
    final lastDetected = DateTime.tryParse(artwork['mostRecentDate']?.toString() ?? '')?.toLocal();
    final size = artwork['sizeBytes'] is num ? '${((artwork['sizeBytes'] as num) / 1024).toStringAsFixed(2)} KB' : '-';
    final filename = artwork['originalFilename']?.toString() ?? '';

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: ListView(
        children: [
          Row(
            children: [
              Expanded(child: Text(l10n.selectedArtwork, style: Theme.of(context).textTheme.titleLarge)),
              StatusBadge(status: status),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            runSpacing: 12,
            spacing: 24,
            children: [
              _item(context, l10n.artworkMatches, '${artwork['matchesCount'] ?? 0}'),
              if (artwork['mostRecentSource'] != null) _item(context, l10n.mostRecentSource, artwork['mostRecentSource'].toString()),
              if (lastDetected != null) _item(context, l10n.artworkLastDetected, DateFormat.yMMMd(locale).add_Hm().format(lastDetected)),
              _item(context, l10n.artworkFileName, filename.isEmpty ? l10n.galleryUntitled : filename),
              if ((artwork['description']?.toString() ?? '').isNotEmpty) _item(context, l10n.artworkDescription, artwork['description'].toString()),
              if (date != null) _item(context, l10n.artworkUploadDate, DateFormat.yMMMd(locale).format(date)),
              _item(context, l10n.artworkFileSize, size),
              _item(context, l10n.artworkId, artwork['id'].toString(), mono: true),
            ],
          ),
          const SizedBox(height: 16),
          Text(l10n.artworkAllLinks, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (status == ArtworkStatus.notScanned)
            Text(l10n.artworkNotScannedBody, style: TextStyle(color: c.textMuted))
          else if (status == ArtworkStatus.resultsUnavailable)
            Text(l10n.statusUnavailable, style: TextStyle(color: c.textMuted))
          else if (matches.isEmpty)
            Text(l10n.artworkNoMatches, style: TextStyle(color: c.textMuted))
          else
            for (final m in matches.take(20))
              Padding(padding: const EdgeInsets.only(bottom: 8), child: MatchTile(match: m)),
          const SizedBox(height: 8),
          Text(l10n.coverageNote, style: TextStyle(color: c.textMuted, fontSize: 12)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: CustomButton(text: l10n.viewReposts, isOutlined: true, onPressed: onViewReposts)),
              const SizedBox(width: 8),
              Expanded(child: CustomButton(text: l10n.createDmcaNotice, onPressed: onFileDmca)),
            ],
          ),
        ],
      ),
    );
  }
}
