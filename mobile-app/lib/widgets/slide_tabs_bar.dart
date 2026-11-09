import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Dashboard sections. iOS: segmented control, selected segment filled plum.
/// Android: primary tabs with a 3px plum indicator.
class SlideTabsBar extends StatelessWidget {
  final List<String> tabs;
  final int selectedTab;
  final ValueChanged<int> onTabSelected;

  const SlideTabsBar({
    super.key,
    required this.tabs,
    required this.selectedTab,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final ios = Theme.of(context).platform == TargetPlatform.iOS;

    Widget tab(int i) {
      final selected = i == selectedTab;
      final label = Text(
        tabs[i],
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: ios
              ? (selected ? c.onPrimary : c.text)
              : (selected ? c.primaryText : c.textMuted),
        ),
      );
      return Expanded(
        child: Semantics(
          button: true,
          selected: selected,
          label: tabs[i],
          excludeSemantics: true,
          child: InkWell(
            borderRadius: BorderRadius.circular(6),
            onTap: () => onTabSelected(i),
            child: Container(
              constraints: const BoxConstraints(minHeight: 44),
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 2),
              decoration: ios
                  ? BoxDecoration(
                      color: selected ? c.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                    )
                  : BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: selected ? c.primary : Colors.transparent, width: 3),
                      ),
                    ),
              child: label,
            ),
          ),
        ),
      );
    }

    final row = Row(children: [for (var i = 0; i < tabs.length; i++) tab(i)]);
    if (ios) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(color: c.surfaceSubtle, borderRadius: BorderRadius.circular(8)),
          child: row,
        ),
      );
    }
    return Container(
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.border))),
      child: row,
    );
  }
}
