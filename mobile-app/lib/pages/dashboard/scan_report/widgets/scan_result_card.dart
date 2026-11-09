import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../../theme/app_colors.dart';
import '../../../../widgets/status_badge.dart';

class ScanResultCard extends StatelessWidget {
  final Map<String, dynamic> result;
  final VoidCallback onTap;

  const ScanResultCard({super.key, required this.result, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final int matches = result['matchesCount'] ?? 0;
    final String? source = result['mostRecentSource'] is String && result['mostRecentSource'] != 'N/A'
        ? result['mostRecentSource'] as String
        : null;
    final imageUrl = result['imageUrl']?.toString() ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  width: 64,
                  height: 64,
                  color: c.surfaceSubtle,
                  child: imageUrl.startsWith('http')
                      ? Image.network(imageUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Icon(LucideIcons.image, color: c.textMuted))
                      : Icon(LucideIcons.image, color: c.textMuted),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(result['title']?.toString() ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        MatchCountPill(count: matches),
                        if (source != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: c.surfaceSubtle, borderRadius: BorderRadius.circular(6)),
                            child: Text(source, style: const TextStyle(fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.chevronRight, color: c.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}
