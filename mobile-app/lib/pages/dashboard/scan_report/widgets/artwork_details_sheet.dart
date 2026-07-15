import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../categories.dart';
import '../match_category_filter.dart';

class ArtworkDetailsSheet extends StatefulWidget {
  final Map<String, dynamic> artwork;

  const ArtworkDetailsSheet({super.key, required this.artwork});

  @override
  State<ArtworkDetailsSheet> createState() => _ArtworkDetailsSheetState();
}

class _ArtworkDetailsSheetState extends State<ArtworkDetailsSheet> {
  String _category = kAllCategories;

  Future<void> _openLink(BuildContext context, String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<dynamic> matches = widget.artwork['matchingPages'] ?? [];
    final List<String> categories = presentCategories(matches);
    final List<Map<String, dynamic>> visibleMatches =
        filterAndSortMatches(matches, _category);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          Text(
            widget.artwork['title'] ?? 'Unknown Artwork',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: Colors.black87,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),

          Row(
            children: [
              Icon(Icons.insert_drive_file_outlined, size: 16, color: Colors.grey[500]),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  widget.artwork['originalFilename'] ?? 'Filename not available',
                  style: TextStyle(fontSize: 14, color: Colors.grey[600], fontWeight: FontWeight.w500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          const Divider(),
          const SizedBox(height: 16),
          
          Text(
            '${matches.length} Matches Found',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),

          Expanded(
            child: visibleMatches.isEmpty
                ? Center(
                    child: Text('No external links found.', style: TextStyle(color: Colors.grey[500])),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    itemCount: visibleMatches.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final match = visibleMatches[index];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    match['websiteName'] ?? 'Unknown Source',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                ),
                                if (match['category'] != null)
                                  _buildCategoryBadge(match['category'].toString()),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              match['url'] ?? '',
                              style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton.icon(
                                onPressed: match['url'] != null
                                    ? () => _openLink(context, match['url'] as String)
                                    : null,
                                style: FilledButton.styleFrom(
                                  backgroundColor: const Color(0xFF5E3B7D),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                icon: const Icon(Icons.open_in_new, size: 16),
                                label: const Text('Visit Source'),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter(List<String> categories) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _category,
          isDense: true,
          borderRadius: BorderRadius.circular(12),
          style: const TextStyle(fontSize: 13, color: Colors.black87, fontWeight: FontWeight.w600),
          items: [
            const DropdownMenuItem(value: kAllCategories, child: Text('All categories')),
            ...categories.map(
              (c) => DropdownMenuItem(value: c, child: Text(categoryLabel(c))),
            ),
          ],
          onChanged: (value) {
            if (value != null) setState(() => _category = value);
          },
        ),
      ),
    );
  }

  Widget _buildCategoryBadge(String category) {
    final color = categoryColor(category);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        categoryLabel(category),
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
      ),
    );
  }
}
