import 'package:flutter/material.dart';
import 'dart:async';
import 'package:VigilArt/pages/dashboard/upload_picture/dragDropUploadZone.dart';
import 'package:VigilArt/pages/dashboard/upload_picture/fileUploadCard.dart';

class UploadPhotosPage extends StatefulWidget {
  const UploadPhotosPage({Key? key}) : super(key: key);

  @override
  State<UploadPhotosPage> createState() => _UploadPhotosPageState();
}

class _UploadPhotosPageState extends State<UploadPhotosPage> {
  List<Map<String, dynamic>> _uploadingFiles = [];
  List<Map<String, dynamic>> _uploadedFiles = [];

  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
                      });
                    }
                  });

                  _simulateFileUpload();
                },
              ),

              const SizedBox(height: 32),

              if (_uploadingFiles.isNotEmpty) ...[
                Text(
                  'Uploading',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),
                ..._uploadingFiles.map((file) {
                  return FileUploadCard(
                    fileName: file['name'],
                    status: 'uploading',
                    uploadProgress: file['progress'],
                    onRemove: () {
                      setState(() {
                        _uploadingFiles.remove(file);
                      });
                    },
                  );
                }).toList(),
                const SizedBox(height: 24),
              ],

              if (_uploadedFiles.isNotEmpty) ...[
                Text(
                  'Uploaded',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),
                ..._uploadedFiles.map((file) {
                  return FileUploadCard(
                    fileName: file['name'],
                    status: 'uploaded',
                    onRemove: () {
                      setState(() {
                        _uploadedFiles.remove(file);
                      });
                    },
                  );
                }).toList(),
                const SizedBox(height: 24),
              ],

              if (_uploadingFiles.isNotEmpty || _uploadedFiles.isNotEmpty)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isUploading
                        ? null
                        : () {
                            _handleUpload();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5E3B7D),
                      disabledBackgroundColor: Colors.grey[400],
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      _isUploading ? 'UPLOADING...' : 'UPLOAD FILES',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),

              if (_uploadingFiles.isEmpty &&
                  _uploadedFiles.isEmpty &&
                  !_isUploading)
                Padding(
                  padding: const EdgeInsets.only(top: 24),
                  child: Center(
                    child: Text(
                      'No files selected',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _simulateFileUpload() {
    for (int i = 0; i < _uploadingFiles.length; i++) {
      Future.delayed(Duration(milliseconds: i * 500), () {
        _animateProgress(i);
      });
    }
  }

  void _animateProgress(int fileIndex) {
    if (!mounted) return;

    Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      setState(() {
        if (fileIndex < _uploadingFiles.length) {
          _uploadingFiles[fileIndex]['progress'] =
              (_uploadingFiles[fileIndex]['progress'] as double) + 0.1;

          if (_uploadingFiles[fileIndex]['progress'] >= 1.0) {
            _uploadingFiles[fileIndex]['progress'] = 1.0;
            timer.cancel();

            Future.delayed(const Duration(milliseconds: 300), () {
              if (mounted) {
                setState(() {
                  Map<String, dynamic> completed =
                      _uploadingFiles.removeAt(fileIndex);
                  _uploadedFiles.add({
                    'name': completed['name'],
                    'path': completed['path'],
                  });
                });
              }
            });
          }
        }
      });
    });
  }

  void _handleUpload() {
    setState(() {
      _isUploading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✓ Files uploaded successfully!'),
            backgroundColor: Color(0xFF22C55E),
            duration: Duration(seconds: 3),
          ),
        );
      }
    });
  }
}
