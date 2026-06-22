import 'package:flutter/material.dart';

class DmcaWarningBanner extends StatelessWidget {
  const DmcaWarningBanner({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        border: Border.all(color: const Color(0xFFFCD34D)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              "Important: VigilArt never files a DMCA complaint on your behalf.",
              style: TextStyle(
                color: Colors.amber[900],
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DmcaStepIndicator extends StatelessWidget {
  final int currentStep;

  const DmcaStepIndicator({Key? key, required this.currentStep}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [1, 2, 3]
            .map((step) => DmcaStepDot(step: step, currentStep: currentStep))
            .toList(),
      ),
    );
  }
}

class DmcaStepDot extends StatelessWidget {
  final int step;
  final int currentStep;

  const DmcaStepDot({Key? key, required this.step, required this.currentStep}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isActive = currentStep == step;
    final isPast = step < currentStep;
    final color = isActive ? Colors.blue : (isPast ? Colors.green : Colors.grey[300]!);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? Colors.blue[50] : (isPast ? Colors.green[50] : Colors.grey[50]),
        border: Border.all(color: color, width: 2),
      ),
      alignment: Alignment.center,
      child: Text(
        isPast ? '✓' : '$step',
        style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 18),
      ),
    );
  }
}

class DmcaHistorySection extends StatelessWidget {
  final List<dynamic> notices;
  final Future<void> Function(Map<String, dynamic>) onLoadNotice;

  const DmcaHistorySection({
    Key? key,
    required this.notices,
    required this.onLoadNotice,
  }) : super(key: key);

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
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Notices History", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text("Load previous notices to continue or view them.", style: TextStyle(fontSize: 13, color: Colors.grey)),
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
    Key? key,
    required this.notice,
    required this.onLoadNotice,
  }) : super(key: key);

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
              color: isSubmitted ? Colors.green[50] : Colors.amber[50],
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              status,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isSubmitted ? Colors.green[700] : Colors.amber[700],
              ),
            ),
          )
        ],
      ),
      subtitle: Text("${date.month}/${date.day}/${date.year}", style: const TextStyle(fontSize: 12)),
      trailing: OutlinedButton.icon(
        icon: const Icon(Icons.open_in_new, size: 16),
        label: const Text("Load"),
        style: OutlinedButton.styleFrom(visualDensity: VisualDensity.compact),
        onPressed: () => onLoadNotice(notice),
      ),
    );
  }
}
