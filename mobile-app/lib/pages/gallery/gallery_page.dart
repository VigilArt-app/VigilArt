import 'package:VigilArt/pages/gallery/gallery_image_card.dart';
import 'package:VigilArt/pages/gallery/gallery_tab_selector.dart';
import 'package:VigilArt/widgets/header_bar.dart';
import 'package:VigilArt/widgets/slideMenuBar.dart';
import 'package:flutter/material.dart';

class GalleryPage extends StatefulWidget {
  const GalleryPage({Key? key}) : super(key: key);

  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  String _selectedTab = 'All';
  int _bottomNavIndex = 0;

  final List<Map<String, String>> _allImages = [
    {
      'id': 'IMG-2025-001',
      'url':
          'https://images.unsplash.com/photo-1578269455691-11f33b13e457?w=500&h=500&fit=crop',
      'date': 'Nov 16, 2025',
      'status': 'protected',
    },
    {
      'id': 'IMG-2025-002',
      'url':
          'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=500&h=500&fit=crop',
      'date': 'Nov 15, 2025',
      'status': 'scanned',
    },
    {
      'id': 'IMG-2025-003',
      'url':
          'https://images.unsplash.com/photo-1578269455691-11f33b13e457?w=500&h=500&fit=crop',
      'date': 'Nov 14, 2025',
      'status': 'scanning',
    },
    {
      'id': 'IMG-2025-004',
      'url':
          'https://images.unsplash.com/photo-1577720643272-265f434fe853?w=500&h=500&fit=crop',
      'date': 'Nov 13, 2025',
      'status': 'protected',
    },
    {
      'id': 'IMG-2025-005',
      'url':
          'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=500&h=500&fit=crop',
      'date': 'Nov 12, 2025',
      'status': 'scanned',
    },
    {
      'id': 'IMG-2025-006',
      'url':
          'https://images.unsplash.com/photo-1578269455691-11f33b13e457?w=500&h=500&fit=crop',
      'date': 'Nov 11, 2025',
      'status': 'protected',
    },
    {
      'id': 'IMG-2025-007',
      'url':
          'https://images.unsplash.com/photo-1577720643272-265f434fe853?w=500&h=500&fit=crop',
      'date': 'Nov 10, 2025',
      'status': 'scanned',
    },
    {
      'id': 'IMG-2025-008',
      'url':
          'https://images.unsplash.com/photo-1561214115-6d2f1b0609fa?w=500&h=500&fit=crop',
      'date': 'Nov 09, 2025',
      'status': 'scanning',
    },
  ];

  List<Map<String, String>> get _filteredImages {
    if (_selectedTab == 'All') {
      return _allImages;
    }
    return _allImages
        .where((img) =>
            img['status']!.toLowerCase() == _selectedTab.toLowerCase())
        .toList();
  }

  void _handleDelete(String id) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Delete Image'),
          content: Text('Are you sure you want to delete image $id?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _allImages.removeWhere((img) => img['id'] == id);
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Image $id deleted'),
                    backgroundColor: Colors.red[400],
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
              child: const Text(
                'Delete',
                style: TextStyle(color: Colors.red),
              ),
            ),
          ],
        );
      },
    );
  }

  void _handleImageTap(Map<String, String> image) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              Text(
                'Image Details',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 20),

              _buildDetailRow('ID', image['id']!, Icons.image),
              _buildDetailRow('Upload Date', image['date']!, Icons.calendar_today),
              _buildDetailRow(
                'Status',
                image['status']!.toUpperCase(),
                _getStatusIcon(image['status']!),
              ),

              const SizedBox(height: 28),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey[100],
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Close',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content:
                                Text('View scan results for ${image['id']}'),
                            backgroundColor: const Color(0xFF5E3B7D),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5E3B7D),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'View Results',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'protected':
        return Icons.shield_rounded;
      case 'scanned':
        return Icons.check_circle;
      case 'scanning':
        return Icons.hourglass_top;
      default:
        return Icons.image;
    }
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF5E3B7D).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color: const Color(0xFF5E3B7D),
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _handleBottomNavigation(int index) {
    setState(() {
      _bottomNavIndex = index;
    });

    switch (index) {
      case 0:
        break;
      case 1:
        Navigator.pushNamed(context, '/dashboard');
        break;
      case 2:
        Navigator.pushNamed(context, '/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: SafeArea(
          child: VigilArtHeaderBar(
            onLogoTap: () {
              Navigator.pushNamed(context, '/dashboard');
            },
            onNotificationsTap: () {
              Navigator.pushNamed(context, '/notifications');
            },
            onProfileTap: () {
              Navigator.pushNamed(context, '/profile');
            },
            avatar: 'assets/images/avatar.jpeg',
            notificationCount: 0,
          ),
        ),
      ),

      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF5E3B7D).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.image_rounded,
                        color: Color(0xFF5E3B7D),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Gallery',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: Colors.black,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${_filteredImages.length} image${_filteredImages.length != 1 ? 's' : ''}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GalleryTabSelector(
              selectedTab: _selectedTab,
              onTabChanged: (tab) {
                setState(() {
                  _selectedTab = tab;
                });
              },
            ),
          ),

          const SizedBox(height: 24),

          Expanded(
            child: _filteredImages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: const Color(0xFF5E3B7D).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.image_not_supported_outlined,
                            size: 64,
                            color: const Color(0xFF5E3B7D),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'No images in $_selectedTab',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Try selecting a different tab',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1,
                      ),
                      itemCount: _filteredImages.length,
                      itemBuilder: (context, index) {
                        final image = _filteredImages[index];
                        return GalleryImageCard(
                          id: image['id']!,
                          imageUrl: image['url']!,
                          uploadDate: image['date']!,
                          status: image['status']!,
                          onTap: () => _handleImageTap(image),
                          onDelete: () => _handleDelete(image['id']!),
                        );
                      },
                    ),
                  ),
          ),

          const SizedBox(height: 16),
        ],
      ),

      bottomNavigationBar: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SlideMenuBar(
            selectedIndex: _bottomNavIndex,
            onTabChange: _handleBottomNavigation,
          ),
        ),
      ),
    );
  }
}
