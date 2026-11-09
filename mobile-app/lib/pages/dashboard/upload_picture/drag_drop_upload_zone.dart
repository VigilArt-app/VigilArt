import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/custom_button.dart';

/// Drop zone with a Browse button (photo library or files) and a Camera
/// button. The camera and photo library are only opened on the user's request.
class DragDropUploadZone extends StatelessWidget {
  final ValueChanged<List<String>> onFilesSelected;
  final List<String> acceptedFormats;

  const DragDropUploadZone({
    super.key,
    required this.onFilesSelected,
    this.acceptedFormats = const ['JPEG', 'PNG'],
  });

  Future<void> _pickFiles() async {
    try {
      final result = await FilePicker.pickFiles(type: FileType.image);
      if (result != null && result.files.isNotEmpty) {
        onFilesSelected(result.files.map((f) => f.path ?? '').where((p) => p.isNotEmpty).toList());
      }
    } catch (e) {
      debugPrint('Error picking files: $e');
    }
  }

  Future<void> _pickFromCamera() async {
    try {
      final photo = await ImagePicker().pickImage(source: ImageSource.camera);
      if (photo != null) onFilesSelected([photo.path]);
    } catch (e) {
      debugPrint('Error picking from camera: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.fieldBorder, width: 2),
      ),
      child: Column(
        children: [
          Icon(LucideIcons.upload, size: 32, color: c.primaryText),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: CustomButton(text: l10n.uploadBrowse, onPressed: _pickFiles)),
              const SizedBox(width: 8),
              Expanded(
                child: CustomButton(
                  text: l10n.uploadCamera,
                  icon: const Icon(LucideIcons.camera),
                  showIcon: true,
                  isOutlined: true,
                  onPressed: _pickFromCamera,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('${l10n.uploadSupportedFormats} · ${l10n.uploadErrorSize}',
              textAlign: TextAlign.center, style: TextStyle(color: c.textMuted, fontSize: 12)),
        ],
      ),
    );
  }
}
