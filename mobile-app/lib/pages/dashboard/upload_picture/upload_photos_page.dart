import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../(api)/auth.dart';
import '../../../(api)/upload_artworks_api.dart';
import '../../../l10n/app_localizations.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/custom_button.dart';
import 'drag_drop_upload_zone.dart';
import 'file_upload_card.dart';

/// Largest image accepted, as on the website.
const int kMaxUploadBytes = 5 * 1024 * 1024;

class UploadPhotosPage extends StatefulWidget {
  const UploadPhotosPage({super.key});

  @override
  State<UploadPhotosPage> createState() => _UploadPhotosPageState();
}

class _UploadPhotosPageState extends State<UploadPhotosPage> {
  final List<Map<String, dynamic>> _uploadingFiles = [];
  final List<Map<String, dynamic>> _uploadedFiles = [];
  bool _isUploading = false;

  final ApiService apiService = ApiService();

  /// Same rules as the website: JPEG or PNG, 5 MB at most.
  Future<void> _addFiles(List<String> paths) async {
    final l10n = AppLocalizations.of(context);
    for (final path in paths) {
      final originalName = path.split('/').last;
      final extension = originalName.contains('.') ? originalName.split('.').last.toLowerCase() : '';
      if (!const ['jpg', 'jpeg', 'png'].contains(extension)) {
        _showSnackBar(l10n.uploadErrorType);
        continue;
      }
      if (await File(path).length() > kMaxUploadBytes) {
        _showSnackBar(l10n.uploadErrorSize);
        continue;
      }
      final safeExtension = extension == 'png' ? 'png' : 'jpg';
      final baseName = originalName.contains('.') ? originalName.substring(0, originalName.lastIndexOf('.')) : originalName;
      if (!mounted) return;
      setState(() => _uploadingFiles.add({
            'name': '$baseName.$safeExtension',
            'path': path,
            'progress': 0.0,
            'description': '',
          }));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final theme = Theme.of(context);
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.uploadArtworks, style: theme.textTheme.headlineMedium),
            const SizedBox(height: 12),
            DragDropUploadZone(acceptedFormats: const ['JPEG', 'PNG'], onFilesSelected: _addFiles),
            const SizedBox(height: 16),
            if (_uploadingFiles.isNotEmpty) ...[
              Text(l10n.uploadReady, style: theme.textTheme.titleMedium),
              const SizedBox(height: 8),
              for (final file in List.of(_uploadingFiles))
                Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      children: [
                        FileUploadCard(
                          fileName: file['name'],
                          status: 'uploading',
                          uploadProgress: file['progress'],
                          onRemove: _isUploading ? () {} : () => setState(() => _uploadingFiles.remove(file)),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          enabled: !_isUploading,
                          onChanged: (value) => file['description'] = value,
                          decoration: InputDecoration(hintText: l10n.uploadAddDescription),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
            if (_uploadedFiles.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(l10n.uploadDone, style: theme.textTheme.titleMedium),
              const SizedBox(height: 8),
              for (final file in List.of(_uploadedFiles))
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: c.successBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: c.success.withValues(alpha: 0.3)),
                  ),
                  child: FileUploadCard(fileName: file['name'], status: 'uploaded', onRemove: () => setState(() => _uploadedFiles.remove(file))),
                ),
              TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/gallery'), child: Text(l10n.uploadSeeGallery)),
            ],
            if (_uploadingFiles.isNotEmpty) ...[
              const SizedBox(height: 8),
              CustomButton(
                text: _isUploading ? l10n.uploadUploading : l10n.uploadAction,
                icon: const Icon(LucideIcons.upload),
                showIcon: true,
                isLoading: _isUploading,
                onPressed: _isUploading ? null : _handleUpload,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  void _handleUpload() async {
    if (_uploadingFiles.isEmpty) return;

    setState(() => _isUploading = true);

    try {
      final userId = await apiService.secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception("User not authenticated.");

      List<String> filenames = _uploadingFiles.map((f) => f['name'] as String).toList();
      final uploadUrlsMap = await apiService.getUploadUrls(filenames);

      if (uploadUrlsMap == null) throw Exception("Server did not return upload URLs.");

      List<Map<String, dynamic>> artworksToCreate = [];
      List<Map<String, dynamic>> successfullyUploaded = [];

      for (var file in _uploadingFiles) {
        final uploadInfo = uploadUrlsMap[file['name']];
        if (uploadInfo == null) continue;

        bool success = await apiService.uploadFileToCloud(
          uploadInfo['presignedUrl'], 
          file['path'], 
          apiService.getContentType(file['path']),
          (progress) {
            if (mounted) setState(() => file['progress'] = progress);
          }
        );
        
        if (success) {
          final fileObj = File(file['path']);
          final fileBytes = await fileObj.readAsBytes();
          final decodedImage = await _decodeImageFromBytes(fileBytes);

          artworksToCreate.add({
            'userId': userId,
            'originalFilename': file['name'],
            'storageKey': uploadInfo['storageKey'],
            'contentType': apiService.getContentType(file['path']),
            'sizeBytes': fileBytes.length,
            'description': file['description'],
            'width': decodedImage.width,
            'height': decodedImage.height,
          });

          successfullyUploaded.add(file);
        }
      }

      if (artworksToCreate.isNotEmpty) {
        bool recordsCreated = await apiService.createArtworkRecords(artworksToCreate);
        
        if (!recordsCreated) {
          throw Exception("Images uploaded to cloud, but failed to save records in database.");
        }

        if (mounted) {
          setState(() {
            _uploadedFiles.addAll(successfullyUploaded);
            _uploadingFiles.removeWhere((f) => successfullyUploaded.contains(f));
          });
          _showSnackBar(AppLocalizations.of(context).uploadDone);
        }
      }

    } catch (e) {
      if (mounted) _showSnackBar(AppLocalizations.of(context).uploadFailedAny);
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  Future<ui.Image> _decodeImageFromBytes(Uint8List bytes) async {
    final Completer<ui.Image> completer = Completer();
    ui.decodeImageFromList(bytes, (ui.Image img) {
      completer.complete(img);
    });
    return completer.future;
  }

}
