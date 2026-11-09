import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../theme/app_colors.dart';

/// One file in the upload queue. Status is an icon and a progress bar, with
/// the file name as text.
class FileUploadCard extends StatelessWidget {
  final String fileName;
  final String status; // uploading | uploaded
  final double? uploadProgress;
  final VoidCallback onRemove;
  final String? removeLabel;

  const FileUploadCard({
    super.key,
    required this.fileName,
    required this.status,
    this.uploadProgress,
    required this.onRemove,
    this.removeLabel,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final done = status == 'uploaded';
    return Row(
      children: [
        Icon(done ? LucideIcons.check : LucideIcons.fileText, size: 20, color: done ? c.success : c.primaryText),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(fileName, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
              if (!done && (uploadProgress ?? 0) > 0) ...[
                const SizedBox(height: 6),
                LinearProgressIndicator(value: uploadProgress, minHeight: 6, borderRadius: BorderRadius.circular(3)),
              ],
            ],
          ),
        ),
        IconButton(tooltip: removeLabel, icon: const Icon(LucideIcons.x, size: 20), onPressed: onRemove),
      ],
    );
  }
}
