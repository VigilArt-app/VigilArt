import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../theme/app_colors.dart';
import 'models/statistics_model.dart';

/// "Recent Scans": one plum bar per scan with its value printed above it.
/// A single series is plum, never a category colour.
class TimelineBarChart extends StatelessWidget {
  final List<TimelinePoint> timeline;
  final void Function(TimelinePoint point) onTapPoint;

  const TimelineBarChart({super.key, required this.timeline, required this.onTapPoint});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final locale = Localizations.localeOf(context).toString();
    final points = timeline.length > 8 ? timeline.sublist(timeline.length - 8) : timeline;
    final maxValue = points.fold<int>(1, (m, p) => p.totalMatches > m ? p.totalMatches : m);
    const maxBar = 86.0;
    final fmt = DateFormat.MMMd(locale);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        for (final p in points)
          Expanded(
            child: Semantics(
              button: true,
              label: '${fmt.format(DateTime.tryParse(p.date)?.toLocal() ?? DateTime.now())}: ${p.totalMatches}',
              excludeSemantics: true,
              child: InkWell(
                onTap: () => onTapPoint(p),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(minHeight: 48),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('${p.totalMatches}', style: TextStyle(fontSize: 12, color: c.textMuted)),
                        const SizedBox(height: 2),
                        Container(
                          height: (p.totalMatches / maxValue * maxBar).clamp(4.0, maxBar),
                          decoration: BoxDecoration(
                            color: c.primary,
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                          ),
                        ),
                        Container(height: 1, color: c.fieldBorder),
                        const SizedBox(height: 4),
                        Text(
                          fmt.format(DateTime.tryParse(p.date)?.toLocal() ?? DateTime.now()),
                          style: TextStyle(fontSize: 11, color: c.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
