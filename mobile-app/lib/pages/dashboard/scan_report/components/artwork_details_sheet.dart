import 'package:flutter/material.dart';

class ArtworkDetailsSheet extends StatelessWidget {
  final Map<String, dynamic> artwork;

  const ArtworkDetailsSheet({Key? key, required this.artwork}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    List<dynamic> matchingPages = artwork['matchingPages'] ?? [];

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(color: Colors.black, borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(artwork['title'], style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, height: 1.2), maxLines: 2, overflow: TextOverflow.ellipsis)),
                IconButton(icon: const Icon(Icons.close, color: Colors.white, size: 28), onPressed: () => Navigator.pop(context)),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Total Matches: ${artwork['matchesCount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 4),
                  Text('Most Recent Source: ${artwork['mostRecentSource']}', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Divider()),
                  const Text('All detected reposts:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.black)),
                  const SizedBox(height: 16),
                  if (matchingPages.isEmpty)
                    const Center(child: Padding(padding: EdgeInsets.all(20), child: Text("No matches found for this artwork.")))
                  else
                    ...matchingPages.map((page) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey[300]!)),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (page['imageUrl'] != null)
                              ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(page['imageUrl'], width: 60, height: 60, fit: BoxFit.cover)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Category: ${page['category'] ?? 'N/A'}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  Text('Website: ${page['websiteName'] ?? 'Unknown'}', style: const TextStyle(fontSize: 12)),
                                  Text('Title: ${page['pageTitle'] ?? 'N/A'}', style: const TextStyle(fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                                  Text('Found: ${page['firstDetectedAt']?.toString().split('T')[0] ?? ''}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}