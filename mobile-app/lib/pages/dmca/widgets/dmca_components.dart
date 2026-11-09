import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import 'package:flutter/material.dart';

class DmcaWarningBanner extends StatelessWidget {
  const DmcaWarningBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.warningBg,
        border: Border.all(color: c.warning.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(LucideIcons.triangleAlert, color: c.warning, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(AppLocalizations.of(context).dmcaLegalNotice, style: TextStyle(color: c.text, fontSize: 13, height: 18 / 13))),
        ],
      ),
    );
  }
}

/// Three numbered steps. A finished step shows a check mark, the current step
/// is outlined: the state is never carried by colour alone.
class DmcaStepIndicator extends StatelessWidget {
  final int currentStep;

  const DmcaStepIndicator({super.key, required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          for (final step in [1, 2, 3]) ...[
            DmcaStepDot(step: step, currentStep: currentStep),
            if (step < 3) Expanded(child: Container(height: 2, color: step < currentStep ? context.colors.primary : context.colors.fieldBorder)),
          ],
        ],
      ),
    );
  }
}

class DmcaStepDot extends StatelessWidget {
  final int step;
  final int currentStep;

  const DmcaStepDot({super.key, required this.step, required this.currentStep});

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final isActive = currentStep == step;
    final isPast = step < currentStep;
    return Semantics(
      label: '$step',
      selected: isActive,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isPast ? c.primary : Colors.transparent,
          border: Border.all(color: isPast || isActive ? c.primary : c.fieldBorder, width: 2),
        ),
        alignment: Alignment.center,
        child: isPast
            ? Icon(LucideIcons.check, size: 18, color: c.onPrimary)
            : Text('$step', style: TextStyle(color: isActive ? c.primaryText : c.textMuted, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class DmcaHistorySection extends StatelessWidget {
  final List<dynamic> notices;
  final Future<void> Function(Map<String, dynamic>) onLoadNotice;

  const DmcaHistorySection({
    super.key,
    required this.notices,
    required this.onLoadNotice,
  });

  @override
  Widget build(BuildContext context) {
    if (notices.isEmpty) return const SizedBox.shrink();

    final sortedNotices = List.from(notices)
      ..sort((a, b) => DateTime.parse(b['updatedAt']).compareTo(DateTime.parse(a['updatedAt'])));

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppLocalizations.of(context).dmcaHistory, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(AppLocalizations.of(context).dmcaHistorySubtitle, style: TextStyle(fontSize: 13, color: context.colors.textMuted)),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: sortedNotices.length > 3 ? 3 : sortedNotices.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) => DmcaNoticeHistoryTile(
              notice: sortedNotices[index],
              onLoadNotice: onLoadNotice,
            ),
          )
        ],
      ),
    );
  }
}

class DmcaNoticeHistoryTile extends StatelessWidget {
  final Map<String, dynamic> notice;
  final Future<void> Function(Map<String, dynamic>) onLoadNotice;

  const DmcaNoticeHistoryTile({
    super.key,
    required this.notice,
    required this.onLoadNotice,
  });

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(notice['updatedAt']);
    final status = notice['status'] as String;
    final isSubmitted = status == "SUBMITTED";

    return ListTile(
      title: Row(
        children: [
          Text(notice['dmcaPlatformSlug'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isSubmitted ? context.colors.successBg : context.colors.warningBg,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              status,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isSubmitted ? context.colors.success : context.colors.warning,
              ),
            ),
          )
        ],
      ),
      subtitle: Text(DateFormat.yMMMd(Localizations.localeOf(context).toString()).format(date), style: const TextStyle(fontSize: 12)),
      trailing: OutlinedButton.icon(
        icon: const Icon(LucideIcons.externalLink, size: 16),
        label: Text(AppLocalizations.of(context).dmcaLoad),
        style: OutlinedButton.styleFrom(visualDensity: VisualDensity.compact),
        onPressed: () => onLoadNotice(notice),
      ),
    );
  }
}
