import 'package:flutter/material.dart';

class FileUploadCard extends StatelessWidget {
  final String fileName;
  final String status;
  final double? uploadProgress;
  final VoidCallback onRemove;

  const FileUploadCard({
    Key? key,
    required this.fileName,
    required this.status,
    this.uploadProgress,
    required this.onRemove,
  }) : super(key: key);

  Color _getStatusColor() {
    switch (status) {
      case 'uploading':
        return const Color(0xFF5E3B7D);
      case 'uploaded':
        return const Color(0xFF22C55E);
      case 'pending':
        return Colors.grey[400]!;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon() {
    switch (status) {
      case 'uploading':
        return Icons.cloud_upload;
      case 'uploaded':
        return Icons.check_circle;
      case 'pending':
        return Icons.schedule;
      default:
        return Icons.file_present;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(
          color: _getStatusColor().withOpacity(0.3),
          width: 1.5,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(
                      _getStatusIcon(),
                      color: _getStatusColor(),
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        fileName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: onRemove,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(
                    Icons.close,
                    size: 18,
                    color: Colors.red[400],
                  ),
                ),
              ),
            ],
          ),

          if (status == 'uploading' && uploadProgress != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: uploadProgress,
                minHeight: 4,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                  const Color(0xFF5E3B7D),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${(uploadProgress! * 100).toStringAsFixed(0)}%',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Color(0xFF62636D),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
