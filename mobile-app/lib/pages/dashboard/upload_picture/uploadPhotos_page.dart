import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:async';
import 'dart:ui' as ui;
import '../../../(api)/auth.dart';
import '../../../(api)/upload_artworks_api.dart'; 
import 'package:VigilArt/pages/dashboard/upload_picture/dragDropUploadZone.dart';
import 'package:VigilArt/pages/dashboard/upload_picture/fileUploadCard.dart';

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
                      String fileName = path.split('/').last;
                      _uploadingFiles.add({
                        'name': fileName,
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

  // ... imports stay the same ...

  void _handleUpload() async {
    if (_uploadingFiles.isEmpty) return;

    setState(() {
      _isUploading = true;
    });

    try {
      final userId = await apiService.secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception("User not authenticated. Please log in again.");

      List<String> filenames = _uploadingFiles.map((f) => f['name'] as String).toList();
      final uploadUrlsMap = await apiService.getUploadUrls(filenames);

      if (uploadUrlsMap == null || uploadUrlsMap.isEmpty) {
        throw Exception("Server did not return upload URLs.");
      }

      List<Map<String, dynamic>> artworksToCreate = [];
      List<String> failedFiles = []; // Track files that failed validation

      for (int i = 0; i < _uploadingFiles.length; i++) {
        final file = _uploadingFiles[i];
        final fileName = file['name'] as String;
        final filePath = file['path'] as String;
        final description = file['description'] as String;
        
        final uploadInfo = uploadUrlsMap[fileName];
        
        // FIXED: Validate and cast keys from the dynamic map
        final String? presignedUrl = uploadInfo?['presignedUrl']?.toString();
        final String? storageKey = uploadInfo?['storageKey']?.toString();

        if (presignedUrl == null || storageKey == null) {
          failedFiles.add(fileName);
          debugPrint("❌ Missing upload metadata for $fileName");
          continue; 
        }

        final contentType = apiService.getContentType(filePath);

        // Pass validated non-null strings
        bool success = await apiService.uploadFileToCloud(presignedUrl, filePath, contentType);
        
        if (success) {
          final fileObj = File(filePath);
          final fileBytes = await fileObj.readAsBytes();
          final sizeBytes = fileBytes.length;

          final Completer<ui.Image> completer = Completer();
          ui.decodeImageFromList(fileBytes, (ui.Image img) {
            completer.complete(img);
          });
          final ui.Image decodedImage = await completer.future;
          
          final width = decodedImage.width;
          final height = decodedImage.height;

          artworksToCreate.add({
            'userId': userId,
            'originalFilename': fileName, 
            'contentType': contentType,
            'sizeBytes': sizeBytes,
            'description': description,
            'storageKey': storageKey,
            'width': width, 
            'height': height,
          });

          if (mounted) {
            setState(() {
              file['progress'] = 1.0;
            });
          }
        }
      }

      // Show alert if some files failed metadata validation
      if (failedFiles.isNotEmpty && mounted) {
        _showSnackBar('Metadata error for: ${failedFiles.join(", ")}', Colors.orange);
      }

      if (artworksToCreate.isNotEmpty) {
        bool recordsCreated = await apiService.createArtworkRecords(artworksToCreate);
        
        if (!recordsCreated) throw Exception("Images uploaded to cloud, but failed to save records in database.");

        if (mounted) {
          setState(() {
             for (var f in _uploadingFiles.where((f) => f['progress'] == 1.0)) {
               _uploadedFiles.add({'name': f['name'], 'path': f['path']});
             }
             _uploadingFiles.removeWhere((f) => f['progress'] == 1.0);
          });
          
          _showSnackBar('Artworks uploaded successfully!', const Color(0xFF22C55E), icon: Icons.check_circle);
        }
      } else if (failedFiles.isEmpty) {
        throw Exception("Failed to upload any files to the cloud.");
      }

    } catch (e) {
      if (mounted) _showSnackBar('Upload Error: $e', Colors.red.shade600);
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  // Helper to reduce code duplication for snackbars
  void _showSnackBar(String message, Color color, {IconData? icon}) {
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
}