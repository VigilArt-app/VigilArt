import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';

class DragDropUploadZone extends StatefulWidget {
  final ValueChanged<List<String>> onFilesSelected;
  final List<String> acceptedFormats;

  const DragDropUploadZone({
    Key? key,
    required this.onFilesSelected,
    this.acceptedFormats = const ['JPEG', 'PNG'],
  }) : super(key: key);

  @override
  State<DragDropUploadZone> createState() => _DragDropUploadZoneState();
}

class _DragDropUploadZoneState extends State<DragDropUploadZone> {
  bool _isDragging = false;
  final ImagePicker _imagePicker = ImagePicker();

  Future<void> _pickFiles() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: true,
      );

      if (result != null) {
        List<String> filePaths =
            result.files.map((file) => file.path ?? '').toList();
        widget.onFilesSelected(filePaths);
      }
    } catch (e) {
      print('Error picking files: $e');
    }
  }

  Future<void> _pickFromCamera() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
      );

      if (photo != null) {
        widget.onFilesSelected([photo.path]);
      }
    } catch (e) {
      print('Error picking from camera: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _pickFiles,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isDragging = true),
        onExit: (_) => setState(() => _isDragging = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
          decoration: BoxDecoration(
            border: Border.all(
              color: _isDragging
                  ? const Color(0xFF5E3B7D)
                  : const Color(0xFFE0E0E0),
              width: 2,
              style: BorderStyle.solid,
            ),
            borderRadius: BorderRadius.circular(16),
            color: _isDragging
                ? const Color(0xFF5E3B7D).withOpacity(0.05)
                : Colors.grey[50],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.cloud_upload_outlined,
                size: 56,
                color: _isDragging
                    ? const Color(0xFF5E3B7D)
                    : Colors.grey[400],
              ),
              const SizedBox(height: 16),

              Text(
                'Drag & drop files or ',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[700],
                ),
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onTap: _pickFiles,
                    child: const Text(
                      'browse',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF5E3B7D),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                  Text(
                    ' or ',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey[700],
                    ),
                  ),
                  GestureDetector(
                    onTap: _pickFromCamera,
                    child: const Text(
                      'Camera',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF5E3B7D),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              Text(
                'Supported formats: ${widget.acceptedFormats.join(', ')}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
