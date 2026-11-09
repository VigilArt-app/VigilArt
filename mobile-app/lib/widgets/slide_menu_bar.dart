import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../l10n/app_localizations.dart';
import '../theme/app_colors.dart';

/// Main navigation: Gallery, Dashboard, DMCA, Profile.
/// iOS: tab bar with labels. Android: navigation bar with a pill indicator.
class SlideMenuBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTabChange;

  const SlideMenuBar({
    super.key,
    required this.selectedIndex,
    required this.onTabChange,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    final ios = Theme.of(context).platform == TargetPlatform.iOS;
    final items = <(IconData, String)>[
      (LucideIcons.camera, l10n.navGallery),
      (LucideIcons.layoutDashboard, l10n.navDashboard),
      (LucideIcons.gavel, l10n.navDmca),
      (LucideIcons.user, l10n.navProfile),
    ];

    return Container(
      decoration: BoxDecoration(
        color: ios ? c.surface : c.surfaceSubtle,
        border: ios ? Border(top: BorderSide(color: c.border)) : null,
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(8, ios ? 6 : 12, 8, ios ? 4 : 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              for (var i = 0; i < items.length; i++)
                Expanded(
                  child: Semantics(
                    button: true,
                    selected: i == selectedIndex,
                    label: items[i].$2,
                    excludeSemantics: true,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () => onTabChange(i),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: 48),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: ios ? 28 : 64,
                              height: ios ? 28 : 32,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: !ios && i == selectedIndex ? c.primaryTint : Colors.transparent,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Icon(
                                items[i].$1,
                                size: 24,
                                color: i == selectedIndex ? (ios ? c.primaryText : c.onPrimaryTint) : c.textMuted,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              items[i].$2,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                height: 16 / 12,
                                fontWeight: i == selectedIndex ? FontWeight.w600 : FontWeight.w500,
                                color: i == selectedIndex ? c.primaryText : c.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
