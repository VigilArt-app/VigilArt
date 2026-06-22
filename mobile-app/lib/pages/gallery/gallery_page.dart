import 'package:vigilart/(api)/auth.dart'; 
import 'package:vigilart/(api)/gallery.dart';
import 'package:vigilart/(api)/user.dart';
import 'package:vigilart/pages/dmca/dmca_page.dart';
import 'package:vigilart/pages/gallery/gallery_image_card.dart';
import 'package:vigilart/pages/gallery/gallery_tab_selector.dart';
import 'package:vigilart/widgets/header_bar.dart';
import 'package:vigilart/widgets/slideMenuBar.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:vigilart/pages/gallery/widgets/artwork_gallery_details_sheet.dart';

class GalleryPage extends StatefulWidget {
  const GalleryPage({super.key});

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
    final finalAvatarUrl = await _determineAvatarUrl(avatarKey);
    if (mounted) setState(() => _userAvatarUrl = finalAvatarUrl);
  }

  Future<String> _determineAvatarUrl(String? avatarKey) async {
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
    return finalAvatarUrl;
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
      
      final title = (art['title'] ?? art['originalFilename'] ?? '').toString().toLowerCase();
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
              title: const Text('Delete Image', style: TextStyle(fontWeight: FontWeight.bold)),
              content: const Text('Are you sure you want to permanently delete this artwork?'),
              actions: [
                TextButton(
                  onPressed: isDeleting ? null : () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                ),
                TextButton(
                  onPressed: isDeleting ? null : () async {
                    setStateDialog(() => isDeleting = true);
                    // Capture navigator and scaffold instances before async gap.
                    final localNavigator = Navigator.of(context);
                    final localScaffold = ScaffoldMessenger.of(context);
                    final success = await _apiService.deleteArtwork(id);

                    // Use captured references to avoid using BuildContext across await.
                    localNavigator.pop();
                    if (success) {
                      if (mounted) setState(() => _allArtworks.removeWhere((img) => img['id'] == id));
                      localScaffold.showSnackBar(const SnackBar(content: Text('Artwork deleted'), backgroundColor: Colors.green));
                    }
                  },
                  child: isDeleting 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red))
                    : const Text('Delete', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
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
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return FractionallySizedBox(
          heightFactor: 0.92,
          child: ArtworkGalleryDetailsSheet(
            artwork: artwork,
            onDelete: () {
              Navigator.pop(context); 
              _handleDelete(artwork['id']); 
            },
            onViewReports: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/dashboard'); 
            },
            onDmcaTap: () {
              Navigator.pop(context);
              final prefill = {
                'artworkId': artwork['id'],
                'artworkTitle': artwork['title'] ?? artwork['originalFilename'] ?? artwork['id'],
                'infringingUrls': artwork['infringingUrls'] ?? [], 
              };
              Navigator.push(context, MaterialPageRoute(builder: (context) => DmcaPage(artworkPrefill: prefill)));
            },
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
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey[200]!)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey[200]!)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 1.5)),
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
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.photo_library_outlined, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text('No artworks found', style: TextStyle(color: Colors.grey[600], fontSize: 16)),
                      ],
                    ),
                  )
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
                        title: artwork['title'] ?? artwork['originalFilename'] ?? 'Untitled',
                        imageUrl: artwork['imageUrl'] ?? artwork['url'] ?? artwork['storageKey'] ?? '',
                        uploadDate: _formatDate(artwork['date']),
                        status: artwork['status'] ?? 'Unknown',
                        onTap: () => _openArtworkDetails(artwork),
                        onDelete: () => _handleDelete(artwork['id']),
                        onDmcaTap: () {
                          final prefill = {
                            'artworkId': artwork['id'],
                            'artworkTitle': artwork['title'] ?? artwork['originalFilename'] ?? artwork['id'],
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
      bottomNavigationBar: SafeArea(
        child: SlideMenuBar(
          selectedIndex: _bottomNavIndex,
          onTabChange: (i) {
            if (i == 1) {
              Navigator.pushReplacementNamed(context, '/dashboard');
            } else if (i == 2) {
              Navigator.push(
                context, 
                MaterialPageRoute(builder: (context) => const DmcaPage(artworkPrefill: {}))
              );
            } else if (i == 3) {
              Navigator.pushReplacementNamed(context, '/profile');
            }
          }
        ),
      ),
    );
  }
}
