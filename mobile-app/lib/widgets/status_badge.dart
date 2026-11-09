import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../l10n/app_localizations.dart';
import '../theme/app_colors.dart';

/// The four artwork statuses of the website, plus the blacklisted-site flag.
enum ArtworkStatus { notScanned, matchesFound, noMatches, resultsUnavailable }

/// Same rules as the website's `getArtworkStatus`: matches win, then a scan
/// that never ran, then a recorded scan, otherwise the results are unavailable.
ArtworkStatus artworkStatus({
  required int totalMatches,
  required bool scanned,
  required bool insightsAvailable,
}) {
  if (totalMatches > 0) return ArtworkStatus.matchesFound;
  if (!scanned) return ArtworkStatus.notScanned;
  return insightsAvailable ? ArtworkStatus.noMatches : ArtworkStatus.resultsUnavailable;
}

String artworkStatusLabel(AppLocalizations l10n, ArtworkStatus s) => switch (s) {
      ArtworkStatus.notScanned => l10n.statusNotScanned,
      ArtworkStatus.matchesFound => l10n.statusMatchesFound,
      ArtworkStatus.noMatches => l10n.statusNoMatches,
      ArtworkStatus.resultsUnavailable => l10n.statusUnavailable,
    };

/// Filled pill with an icon and a word: status is never conveyed by colour alone.
class StatusBadge extends StatelessWidget {
  final ArtworkStatus status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    final (bg, fg, icon) = switch (status) {
      ArtworkStatus.matchesFound => (c.badgeMatches, c.onBadgeMatches, LucideIcons.eye),
      ArtworkStatus.noMatches => (c.badgeNoMatches, c.onBadgeNoMatches, LucideIcons.check),
      ArtworkStatus.notScanned => (c.badgeNotScanned, c.onBadgeNotScanned, LucideIcons.clock),
      ArtworkStatus.resultsUnavailable => (c.badgeUnavailable, c.onBadgeUnavailable, LucideIcons.triangleAlert),
    };
    return _Pill(bg: bg, fg: fg, icon: icon, label: artworkStatusLabel(l10n, status).toUpperCase());
  }
}

class BlacklistedBadge extends StatelessWidget {
  final int count;

  const BlacklistedBadge({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    return _Pill(
      bg: c.badgeBlacklisted,
      fg: c.onBadgeBlacklisted,
      icon: LucideIcons.triangleAlert,
      label: count == 1 ? l10n.blacklistedSitesOne(count) : l10n.blacklistedSitesOther(count),
    );
  }
}

class _Pill extends StatelessWidget {
  final Color bg;
  final Color fg;
  final IconData icon;
  final String label;

  const _Pill({required this.bg, required this.fg, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 24),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              label,
              style: TextStyle(color: fg, fontSize: 11, height: 14 / 11, fontWeight: FontWeight.w700, letterSpacing: 0.2),
            ),
          ),
        ],
      ),
    );
  }
}

/// Plum tint pill with the number of matches: information, not an alert.
class MatchCountPill extends StatelessWidget {
  final int count;

  const MatchCountPill({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    final zero = count == 0;
    return Container(
      constraints: const BoxConstraints(minHeight: 24),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: zero ? c.surfaceSubtle : c.primaryTint,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$count ${l10n.matchesLabel.toLowerCase()}',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: zero ? c.textMuted : c.onPrimaryTint,
        ),
      ),
    );
  }
}
