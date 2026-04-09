import 'package:flutter/material.dart';

class ScanResultCard extends StatelessWidget {
  final String title;
  final String? imageUrl;
  final int matchesCount;
  final String mostRecentSource;
  final VoidCallback onTap;

  const ScanResultCard({
    Key? key,
    required this.title,
    this.imageUrl,
    required this.matchesCount,
    required this.mostRecentSource,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.withOpacity(0.1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: imageUrl != null 
                  ? Image.network(imageUrl!, width: 48, height: 48, fit: BoxFit.cover)
                  : Container(
                      width: 48, 
                      height: 48, 
                      color: Colors.grey[200], 
                      child: const Icon(Icons.image, size: 24, color: Colors.grey),
                    ),
            ),
            const SizedBox(width: 16),
            
            Expanded(
              child: Text(
                title, 
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), 
                maxLines: 1, 
                overflow: TextOverflow.ellipsis,
              ),
            ),
            
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: matchesCount > 5 ? Colors.red : (matchesCount > 0 ? Colors.orange : Colors.grey[400]), 
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                matchesCount.toString(), 
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
            const SizedBox(width: 16),
            
            SizedBox(
              width: 80, 
              child: Text(
                mostRecentSource, 
                style: const TextStyle(fontSize: 11, color: Colors.blue), 
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
