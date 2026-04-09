import 'package:VigilArt/(api)/auth.dart'; 
import 'package:VigilArt/(api)/gallery.dart';
import 'package:VigilArt/(api)/user.dart';
import 'package:VigilArt/pages/dmca/dmca_page.dart';
import 'package:VigilArt/pages/gallery/gallery_image_card.dart';
import 'package:VigilArt/pages/gallery/gallery_tab_selector.dart';
import 'package:VigilArt/widgets/header_bar.dart';
import 'package:VigilArt/widgets/slideMenuBar.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class GalleryPage extends StatefulWidget {
  const GalleryPage({Key? key}) : super(key: key);

  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  final ApiService _apiService = ApiService();
  String _selectedTab = 'All';
  String _searchQuery = '';
  final int _bottomNavIndex = 0;
  bool _isLoading = true;

  String _userAvatarUrl = 'assets/images/default_avatar.jpg';
  List<Map<String, dynamic>> _allArtworks = [];

  @override
  void initState() {
    super.initState();
    _loadUserAvatar(); 
    _loadArtworks();
  }

  Future<void> _loadUserAvatar() async {
    final avatarKey = await _apiService.secureStorage.read(key: ApiService.keyUserAvatar);
    String finalAvatarUrl = 'assets/images/default_avatar.jpg';

    if (avatarKey != null && avatarKey.isNotEmpty && avatarKey != 'null') {
      if (avatarKey.startsWith('http')) {
        finalAvatarUrl = avatarKey;
      } else if (avatarKey.startsWith('profiles/')) {
        try {
          final downloadUrl = await _apiService.getAvatarDownloadUrl(avatarKey);
          if (downloadUrl != null && downloadUrl.isNotEmpty) {
            finalAvatarUrl = downloadUrl;
          }
        } catch (e) {
          debugPrint("Avatar load error: $e");
        }
      } else {
        finalAvatarUrl = avatarKey;
      }
    }

    if (mounted) setState(() => _userAvatarUrl = finalAvatarUrl);
  }

  Future<void> _loadArtworks() async {
    setState(() => _isLoading = true);
    try {
      final data = await _apiService.fetchGalleryArtworks();
      if (mounted) {
        setState(() {
          _allArtworks = data ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredArtworks {
    return _allArtworks.where((art) {
      final matchesTab = _selectedTab == 'All' || 
          (art['status']?.toString().toLowerCase() == _selectedTab.toLowerCase());
      
      final title = (art['originalFilename'] ?? art['title'] ?? '').toString().toLowerCase();
      final matchesSearch = _searchQuery.isEmpty || title.contains(_searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    }).toList();
  }

  void _handleDelete(String id) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        bool isDeleting = false;
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text('Delete Image'),
              content: const Text('Are you sure you want to permanently delete this artwork?'),
              actions: [
                TextButton(
                  onPressed: isDeleting ? null : () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                ),
                TextButton(
                  onPressed: isDeleting ? null : () async {
                    setStateDialog(() => isDeleting = true);
                    final success = await _apiService.deleteArtwork(id);
                    
                    if (mounted) {
                      Navigator.pop(context);
                      if (success) {
                        setState(() => _allArtworks.removeWhere((img) => img['id'] == id));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Artwork deleted'), backgroundColor: Colors.green),
                        );
                      }
                    }
                  },
                  child: isDeleting 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Delete', style: TextStyle(color: Colors.red)),
                ),
              ],
            );
          }
        );
      },
    );
  }

  void _openArtworkDetails(Map<String, dynamic> artwork) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (BuildContext context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 20),
              Text(artwork['originalFilename'] ?? 'Untitled', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),
              _buildDetailRow('ID', artwork['id'].toString().split('-').first.toUpperCase(), Icons.fingerprint),
              _buildDetailRow('Upload Date', _formatDate(artwork['date']), Icons.calendar_today),
              _buildDetailRow('Status', (artwork['status'] ?? 'UNKNOWN').toString().toUpperCase(), _getStatusIcon(artwork['status'] ?? '')),
              _buildDetailRow('Matches Found', '${artwork['matchesCount'] ?? 0} pages', Icons.search),
              const SizedBox(height: 28),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: const Text('Close', style: TextStyle(color: Colors.black87)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pushReplacementNamed(context, '/dashboard'); 
                      },
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF5E3B7D), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: const Text('View Reports', style: TextStyle(color: Colors.white)),
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

  String _formatDate(dynamic isoDate) {
    if (isoDate == null) return 'N/A';
    try {
      final date = DateTime.parse(isoDate.toString());
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (e) {
      return 'Unknown Date';
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'protected': return Icons.shield_rounded;
      case 'scanned': return Icons.warning_rounded;
      case 'scanning': return Icons.hourglass_top;
      default: return Icons.image;
    }
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFF5E3B7D).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: const Color(0xFF5E3B7D), size: 20),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: SafeArea(
          child: VigilArtHeaderBar(
            onLogoTap: () => Navigator.pushNamed(context, '/dashboard'),
            onNotificationsTap: () => Navigator.pushNamed(context, '/notifications'),
            onProfileTap: () => Navigator.pushNamed(context, '/profile'),
            avatar: _userAvatarUrl,
          ),
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)))
        : Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Gallery', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                const SizedBox(height: 16),
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search artworks...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
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
              onTabChanged: (tab) => setState(() => _selectedTab = tab),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: _filteredArtworks.isEmpty
                ? const Center(child: Text('No artworks found'))
                : GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.85,
                    ),
                    itemCount: _filteredArtworks.length,
                    itemBuilder: (context, index) {
                      final artwork = _filteredArtworks[index];
                      return GalleryImageCard(
                        id: artwork['id'].toString(),
                        title: artwork['originalFilename'] ?? 'Untitled',
                        imageUrl: artwork['imageUrl'] ?? artwork['url'] ?? artwork['storageKey'] ?? '',
                        uploadDate: _formatDate(artwork['date']),
                        status: artwork['status'] ?? 'Unknown',
                        onTap: () => _openArtworkDetails(artwork),
                        onDelete: () => _handleDelete(artwork['id']),
                        onDmcaTap: () {
                          final prefill = {
                            'artworkId': artwork['id'],
                            'artworkTitle': artwork['originalFilename'] ?? artwork['title'] ?? artwork['id'],
                            'infringingUrls': artwork['infringingUrls'] ?? [], 
                          };
                          Navigator.push(context, MaterialPageRoute(builder: (context) => DmcaPage(artworkPrefill: prefill)));
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
      bottomNavigationBar: SlideMenuBar(
        selectedIndex: _bottomNavIndex, 
        onTabChange: (i) {
          if (i == 1) Navigator.pushReplacementNamed(context, '/dashboard');
          if (i == 2) Navigator.pushReplacementNamed(context, '/profile');
        }
      ),
    );
  }
}
