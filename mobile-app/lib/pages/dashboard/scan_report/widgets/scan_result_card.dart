import 'package:flutter/material.dart';

class ScanResultCard extends StatelessWidget {
  final Map<String, dynamic> result;
  final VoidCallback onTap;

  const ScanResultCard({Key? key, required this.result, required this.onTap}) : super(key: key);

  Color _getBadgeColor(int matches) {
    if (matches == 0) return Colors.grey;
    if (matches < 5) return Colors.amber;
    if (matches < 10) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final int matches = result['matchesCount'] ?? 0;
    
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: result['imageUrl'] != null
                    ? Image.network(result['imageUrl'], width: 64, height: 64, fit: BoxFit.cover)
                    : Container(
                        width: 64, height: 64, color: Colors.grey[100],
                        child: Icon(Icons.image, color: Colors.grey[400]),
                      ),
              ),
              const SizedBox(width: 16),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result['title'] ?? 'Unknown Artwork',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getBadgeColor(matches).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '$matches Matches',
                            style: TextStyle(
                              color: _getBadgeColor(matches),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            result['mostRecentSource'] != 'N/A' ? result['mostRecentSource'] : 'No detections',
                            style: TextStyle(color: Colors.grey[600], fontSize: 12),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}