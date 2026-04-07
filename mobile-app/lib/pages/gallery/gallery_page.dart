import 'package:VigilArt/(api)/auth.dart'; 
import 'package:VigilArt/(api)/gallery.dart';
import 'package:VigilArt/(api)/user.dart';
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
  int _bottomNavIndex = 0;
  bool _isLoading = true;

  String _userAvatarUrl = 'assets/images/default_avatar.jpg';
  List<Map<String, dynamic>> _allArtworks = [];

  @override
  void initState() {
    super.initState();
    _loadUserAvatar(); // ✅ On charge l'avatar
    _loadArtworks();
  }

  // ✅ Fonction pour gérer Cloudflare R2 (identique au Dashboard)
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
          print("Erreur chargement avatar gallery: $e");
        }
      } else {
        finalAvatarUrl = avatarKey;
      }
    }

    if (mounted) {
      setState(() {
        _userAvatarUrl = finalAvatarUrl;
      });
    }
  }

  Future<void> _loadArtworks() async {
    setState(() => _isLoading = true);
    final data = await _apiService.fetchGalleryArtworks();
    if (mounted) {
      setState(() {
        _allArtworks = data ?? [];
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredArtworks {
    return _allArtworks.where((art) {
      final matchesTab = _selectedTab == 'All' || art['status']!.toLowerCase() == _selectedTab.toLowerCase();
      final matchesSearch = _searchQuery.isEmpty || 
          art['id'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          art['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
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
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Failed to delete'), backgroundColor: Colors.red),
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

  void _handleImageTap(Map<String, dynamic> image) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 20),
              
              Text(image['title'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),

              _buildDetailRow('ID', image['id'].toString().split('-').first.toUpperCase(), Icons.fingerprint),
              _buildDetailRow('Upload Date', _formatDate(image['date']), Icons.calendar_today),
              _buildDetailRow('Status', image['status'].toString().toUpperCase(), _getStatusIcon(image['status'])),
              _buildDetailRow('Matches Found', '${image['matchesCount']} pages', Icons.search),

              const SizedBox(height: 28),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey[100],
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: const Text('Close', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pushNamed(context, '/dashboard'); 
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5E3B7D),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: const Text('View Results', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
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

  String _formatDate(String isoDate) {
    try {
      final date = DateTime.parse(isoDate);
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
              Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey[600])),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black)),
            ],
          ),
        ],
      ),
    );
  }

  void _handleBottomNavigation(int index) {
    if (index == _bottomNavIndex) return;
    setState(() => _bottomNavIndex = index);
    switch (index) {
      case 1: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 2: Navigator.pushReplacementNamed(context, '/profile'); break;
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
            onLogoTap: () => Navigator.pushNamed(context, '/dashboard'),
            onNotificationsTap: () => Navigator.pushNamed(context, '/notifications'),
            onProfileTap: () => Navigator.pushNamed(context, '/profile'),
            avatar: _userAvatarUrl, // ✅ On utilise la variable dynamique ici !
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
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFF5E3B7D).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.image_rounded, color: Color(0xFF5E3B7D), size: 24),
                    ),
                    const SizedBox(width: 12),
                    const Text('Gallery', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.black)),
                  ],
                ),
                const SizedBox(height: 16),
                
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search artworks...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 2),
                    ),
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

          const SizedBox(height: 24),

          Expanded(
            child: _filteredArtworks.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.image_not_supported_outlined, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        const Text('No artworks found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: GridView.builder(
                      physics: const BouncingScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1,
                      ),
                      itemCount: _filteredArtworks.length,
                      itemBuilder: (context, index) {
                        final image = _filteredArtworks[index];
                        return GalleryImageCard(
                          id: image['id'].toString().substring(0, 8), 
                          title: image['title'],
                          imageUrl: image['url'],
                          uploadDate: _formatDate(image['date']),
                          status: image['status'],
                          onTap: () => _handleImageTap(image),
                          onDelete: () => _handleDelete(image['id']),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2))]),
          child: SlideMenuBar(selectedIndex: _bottomNavIndex, onTabChange: _handleBottomNavigation),
        ),
      ),
    );
  }
}
