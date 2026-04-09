import 'package:flutter/material.dart';

class ScanEmptyState extends StatelessWidget {
  final VoidCallback onUploadPressed;

  const ScanEmptyState({Key? key, required this.onUploadPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(color: const Color(0xFF5E3B7D).withOpacity(0.08), shape: BoxShape.circle),
              child: const Icon(Icons.image_search_rounded, size: 72, color: Color(0xFF5E3B7D)),
            ),
            const SizedBox(height: 24),
            const Text('No scan reports yet', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.black87)),
            const SizedBox(height: 36),
            ElevatedButton.icon(
              onPressed: onUploadPressed,
              icon: const Icon(Icons.cloud_upload_outlined, color: Colors.white, size: 20),
              label: const Text('Upload Pictures', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5E3B7D),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
