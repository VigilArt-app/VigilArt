import 'package:flutter/material.dart';

class GalleryImageCard extends StatelessWidget {
  final String id;
  final String title;
  final String imageUrl;
  final String uploadDate;
  final String status;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final VoidCallback onDmcaTap;

  const GalleryImageCard({
    Key? key,
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.uploadDate,
    required this.status,
    required this.onTap,
    required this.onDelete,
    required this.onDmcaTap, 
  }) : super(key: key);

  Color _getStatusColor() {
    switch (status.toLowerCase()) {
      case 'scanning': return const Color(0xFF5E3B7D);
      case 'scanned': return const Color(0xFFEAB308); 
      case 'protected': return const Color(0xFF22C55E); 
      default: return Colors.grey;
    }
  }

  IconData _getStatusIcon() {
    switch (status.toLowerCase()) {
      case 'scanning': return Icons.hourglass_top;
      case 'scanned': return Icons.warning_rounded;
      case 'protected': return Icons.shield_rounded;
      default: return Icons.image;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: imageUrl.isNotEmpty && imageUrl.startsWith('http')
                ? Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    cacheWidth: 350, 
                    gaplessPlayback: true,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)));
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey[200],
                        child: const Center(child: Icon(Icons.broken_image, color: Colors.grey)),
                      );
                    },
                  )
                : Container(
                    color: Colors.grey[200],
                    child: const Center(child: Icon(Icons.image, color: Colors.grey)),
                  ),
            ),

            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [Colors.black.withOpacity(0.2), Colors.black.withOpacity(0.8)],
                ),
              ),
            ),

            Positioned(
              top: 8, right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: _getStatusColor(), borderRadius: BorderRadius.circular(6)),
                child: Row(
                  children: [
                    Icon(_getStatusIcon(), color: Colors.white, size: 12),
                    const SizedBox(width: 4),
                    Text(status.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                  ],
                ),
              ),
            ),

            Positioned(
              bottom: 0, left: 0, right: 0,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            uploadDate,
                            style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.8)),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: onDmcaTap,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(6)),
                            child: const Icon(Icons.security, color: Colors.white, size: 16),
                          ),
                        ),
                        const SizedBox(width: 6),
                        GestureDetector(
                          onTap: onDelete,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(color: Colors.red.withOpacity(0.8), borderRadius: BorderRadius.circular(6)),
                            child: const Icon(Icons.delete_outline, color: Colors.white, size: 16),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
