import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../l10n/app_localizations.dart';
import '../theme/app_colors.dart';
import 'status_badge.dart';

/// Hides every field of a match on a blacklisted website behind a Show button,
/// as the website does (#323). Blacklisted sites are mostly adult image
/// boards, so the URL, name and title can contain not-safe-for-work words.
///
/// Even once revealed, the URL is plain copyable text: it is never opened as a
/// link from the app (#326).
class RestrictedMatch extends StatefulWidget {
  /// The match fields to show once revealed (website name, title, URL).
  final List<String> lines;

  const RestrictedMatch({super.key, required this.lines});

  @override
  State<RestrictedMatch> createState() => _RestrictedMatchState();
}

class _RestrictedMatchState extends State<RestrictedMatch> {
  bool _revealed = false;

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const BlacklistedBadge(count: 1),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Text(
                _revealed ? '' : l10n.restrictedHidden,
                style: TextStyle(color: c.textMuted),
              ),
            ),
            TextButton.icon(
              onPressed: () => setState(() => _revealed = !_revealed),
              icon: Icon(_revealed ? LucideIcons.eyeOff : LucideIcons.eye, size: 18),
              label: Text(_revealed ? l10n.restrictedHide : l10n.restrictedShow),
            ),
          ],
        ),
        if (_revealed)
          for (final line in widget.lines.where((l) => l.isNotEmpty))
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Expanded(child: SelectableText(line, style: const TextStyle(fontFamily: 'GeistMono', fontSize: 13))),
                  IconButton(
                    tooltip: l10n.restrictedCopy,
                    icon: const Icon(LucideIcons.copy, size: 18),
                    onPressed: () => Clipboard.setData(ClipboardData(text: line)),
                  ),
                ],
              ),
            ),
      ],
    );
  }
}
