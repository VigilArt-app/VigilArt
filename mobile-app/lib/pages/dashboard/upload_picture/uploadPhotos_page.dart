import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:async';
import 'dart:ui' as ui;
import '../../../(api)/auth.dart';
import '../../../(api)/upload_artworks_api.dart'; 
import 'package:vigilart/pages/dashboard/upload_picture/dragDropUploadZone.dart';
import 'package:vigilart/pages/dashboard/upload_picture/fileUploadCard.dart';

class UploadPhotosPage extends StatefulWidget {
  const UploadPhotosPage({super.key});

  @override
  State<UploadPhotosPage> createState() => _UploadPhotosPageState();
}

class _UploadPhotosPageState extends State<UploadPhotosPage> {
  List<Map<String, dynamic>> _uploadingFiles = [];
  List<Map<String, dynamic>> _uploadedFiles = [];
  bool _isUploading = false;

  final ApiService apiService = ApiService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Upload Artworks',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: Color(0xFF1A1A1A),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Drag and drop or browse to add new pieces to your gallery.',
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 24),

              DragDropUploadZone(
                acceptedFormats: const ['JPEG', 'PNG'],
                onFilesSelected: (filePaths) {
                  setState(() {
                    for (String path in filePaths) {
                      String originalName = path.split('/').last;
                      
                      String extension = originalName.contains('.') 
                          ? originalName.split('.').last.toLowerCase() 
                          : '';
                      
                      String safeExtension = (extension == 'png') ? 'png' : 'jpg';
                      
                      String baseName = originalName.contains('.') 
                          ? originalName.substring(0, originalName.lastIndexOf('.'))
                          : originalName;
                          
                      String safeFileName = '$baseName.$safeExtension';

                      _uploadingFiles.add({
                        'name': safeFileName,
                        'path': path,
                        'progress': 0.0,
                        'description': '',
                      });
                    }
                  });
                },
              ),

              const SizedBox(height: 32),

              if (_uploadingFiles.isNotEmpty) ...[
                const Text(
                  'Ready to Upload',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1A1A1A),
                  ),
                ),
                const SizedBox(height: 16),
                
                ..._uploadingFiles.map((file) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FileUploadCard(
                            fileName: file['name'],
                            status: 'uploading',
                            uploadProgress: file['progress'],
                            onRemove: _isUploading ? () {} : () { 
                              setState(() {
                                _uploadingFiles.remove(file);
                              });
                            },
                          ),
                          
                          Divider(height: 24, color: Colors.grey.shade100, thickness: 1.5),
                          
                          TextField(
                            enabled: !_isUploading,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                            decoration: InputDecoration(
                              hintText: 'Add a description for this artwork...',
                              hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                              prefixIcon: Icon(Icons.edit_outlined, size: 20, color: Colors.grey.shade400),
                              filled: true,
                              fillColor: const Color(0xFFF8F9FA),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 1.5),
                              ),
                            ),
                            onChanged: (value) {
                              file['description'] = value; 
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ],

              if (_uploadedFiles.isNotEmpty) ...[
                const Padding(
                  padding: EdgeInsets.only(top: 16, bottom: 16),
                  child: Text(
                    'Uploaded Successfully',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                ),
                ..._uploadedFiles.map((file) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.green.withOpacity(0.3), width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: FileUploadCard(
                        fileName: file['name'],
                        status: 'uploaded',
                        onRemove: () {
                          setState(() {
                            _uploadedFiles.remove(file);
                          });
                        },
                      ),
                    ),
                  );
                }).toList(),
                const SizedBox(height: 24),
              ],

              if (_uploadingFiles.isNotEmpty || _uploadedFiles.isNotEmpty)
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 16, bottom: 32),
                  height: 56, 
                  child: ElevatedButton(
                    onPressed: _isUploading || _uploadingFiles.isEmpty
                        ? null
                        : () {
                            _handleUpload();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5E3B7D),
                      disabledBackgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: _isUploading ? 0 : 4,
                      shadowColor: const Color(0xFF5E3B7D).withOpacity(0.4),
                    ),
                    child: _isUploading
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'UPLOADING...',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          )
                        : const Text(
                            'UPLOAD FILES',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                              letterSpacing: 1.0,
                            ),
                          ),
                  ),
                ),

              if (_uploadingFiles.isEmpty && _uploadedFiles.isEmpty && !_isUploading)
                Padding(
                  padding: const EdgeInsets.only(top: 40),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.photo_library_outlined, size: 48, color: Colors.grey.shade300),
                        const SizedBox(height: 16),
                        Text(
                          'Your queue is empty',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey.shade400,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSnackBar(String message, Color color, {IconData? icon}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[Icon(icon, color: Colors.white), const SizedBox(width: 12)],
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600))),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
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
          _showSnackBar('Artworks uploaded successfully!', const Color(0xFF22C55E), icon: Icons.check_circle);
        }
      }

    } catch (e) {
      if (mounted) _showSnackBar('Upload Error: $e', Colors.red);
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
