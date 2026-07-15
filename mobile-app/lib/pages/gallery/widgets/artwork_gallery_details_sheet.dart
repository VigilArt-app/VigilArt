import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class ArtworkGalleryDetailsSheet extends StatelessWidget {
  final Map<String, dynamic> artwork;
  final VoidCallback onDelete;
  final VoidCallback onDmcaTap;
  final VoidCallback onViewReports;

  const ArtworkGalleryDetailsSheet({
    super.key,
    required this.artwork,
    required this.onDelete,
    required this.onDmcaTap,
    required this.onViewReports,
  });

  String _formatBytes(int? bytes) {
    if (bytes == null || bytes == 0) return 'Unknown size';
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(2)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB';
  }

  String _formatDate(dynamic isoDate) {
    if (isoDate == null) return 'N/A';
    try {
      final date = DateTime.parse(isoDate.toString());
      return DateFormat('MMM dd, yyyy • h:mm a').format(date);
    } catch (e) {
      return 'Unknown Date';
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'scanned': return const Color(0xFF22C55E); 
      case 'scanning': return const Color(0xFFA855F7);
      case 'protected': return const Color(0xFF3B82F6);
      default: return Colors.grey;
    }
  }

  Future<void> _openLink(BuildContext context, String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open link')));
      }
    }
  }

  Widget _buildInfoRow(String label, String value, {bool isMono = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
          const SizedBox(height: 4),
          Text(
            value, 
            style: TextStyle(
              fontSize: 14, 
              fontWeight: FontWeight.w500, 
              color: Colors.black87,
              fontFamily: isMono ? 'monospace' : null,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final status = artwork['status'] ?? 'UNKNOWN';
    final imageUrl = artwork['imageUrl'] ?? artwork['url'] ?? artwork['storageKey'] ?? '';
    final title = artwork['title'] ?? artwork['originalFilename'] ?? 'Untitled';
    final matchesCount = artwork['matchesCount'] ?? 0;
    final List<dynamic> infringingUrls = artwork['infringingUrls'] ?? [];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(24, 16, 16, 16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Selected Artwork', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: imageUrl.isNotEmpty
                          ? Image.network(
                              imageUrl,
                              width: double.infinity,
                              height: 250,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(height: 250, color: Colors.grey[100], child: const Icon(Icons.broken_image, size: 50, color: Colors.grey)),
                            )
                          : Container(height: 250, color: Colors.grey[100], child: const Icon(Icons.image, size: 50, color: Colors.grey)),
                    ),
                  ),
                  const SizedBox(height: 24),

                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _getStatusColor(status).withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      status.toUpperCase(),
                      style: TextStyle(color: _getStatusColor(status), fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.5),
                    ),
                  ),
                  const SizedBox(height: 24),

                  _buildInfoRow('File name', title),
                  if (artwork['description'] != null && artwork['description'].toString().isNotEmpty)
                    _buildInfoRow('Description', artwork['description']),
                  _buildInfoRow('Upload date', _formatDate(artwork['date'])),
                  _buildInfoRow('File size', _formatBytes(artwork['sizeBytes'])),
                  _buildInfoRow('ID', artwork['id'].toString(), isMono: true),
                  _buildInfoRow('Matches', matchesCount.toString()),
                  
                  if (artwork['mostRecentSource'] != null)
                    _buildInfoRow('Most recent source', artwork['mostRecentSource']),

                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 16),

                  const Text('All links of matches:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87)),
                  const SizedBox(height: 12),
                  
                  if (infringingUrls.isEmpty)
                    const Text('No matches found for this artwork yet.', style: TextStyle(color: Colors.grey, fontSize: 14))
                  else
                    ...infringingUrls.map((url) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: InkWell(
                        onTap: () => _openLink(context, url.toString()),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey[200]!),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.link, size: 16, color: Colors.grey),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  url.toString(),
                                  style: const TextStyle(fontSize: 13, color: Colors.blue),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const Icon(Icons.open_in_new, size: 14, color: Colors.grey),
                            ],
                          ),
                        ),
                      ),
                    )),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))],
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  tooltip: 'Delete Artwork',
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onViewReports,
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: const Text('View Reports', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                  ),
                ),
                if (matchesCount > 0) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: onDmcaTap,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5E3B7D),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: const Text('File DMCA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }
}
