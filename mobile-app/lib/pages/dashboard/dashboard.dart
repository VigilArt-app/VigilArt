import 'package:VigilArt/pages/dashboard/scan_report/scanResultPage.dart';
import 'package:VigilArt/pages/dashboard/upload_picture/uploadPhotos_page.dart';
import 'package:flutter/material.dart';
import 'package:VigilArt/widgets/header_bar.dart';
import 'package:VigilArt/widgets/slideMenuBar.dart';
import 'package:VigilArt/widgets/slideTabsBar.dart';
import '../../(api)/auth.dart';
import '../../(api)/user.dart';

class DashboardPage extends StatefulWidget {

  const DashboardPage({Key? key}) : super(key: key);
  
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _selectedTabIndex = 1;
  int _bottomNavIndex = 1;

  String _userAvatarUrl = 'assets/images/default_avatar.jpg';

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final apiService = ApiService();
    final avatarKey = await apiService.secureStorage.read(key: ApiService.keyUserAvatar);
    
    String finalAvatarUrl = 'assets/images/default_avatar.jpg';

    if (avatarKey != null && avatarKey.isNotEmpty && avatarKey != 'null') {
      if (avatarKey.startsWith('http')) {
        finalAvatarUrl = avatarKey;
      } else if (avatarKey.startsWith('profiles/')) {
        try {
          final downloadUrl = await apiService.getAvatarDownloadUrl(avatarKey);
          if (downloadUrl != null && downloadUrl.isNotEmpty) {
            finalAvatarUrl = downloadUrl;
          }
        } catch (e) {
          print("Erreur chargement avatar dashboard: $e");
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 243, 239, 239),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60), 
        child: SafeArea(
          child: VigilArtHeaderBar(
            onLogoTap: () { Navigator.pushNamed(context, '/'); }, 
            onNotificationsTap: () { Navigator.pushNamed(context, '/notifications'); },
            onProfileTap: () { Navigator.pushNamed(context, '/profile'); },
            avatar: _userAvatarUrl
          ),
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SlideTabsBar(
              tabs: const ['Statistics', 'Scan Report', 'Upload'],
              selectedTab: _selectedTabIndex, 
              onTabSelected: (index) {
                setState(() {
                  _selectedTabIndex = index;
                });
              },
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: _buildTabContent(),
          )
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: SlideMenuBar(
          selectedIndex: _bottomNavIndex, 
          onTabChange: (index) {
            setState(() {
              _bottomNavIndex = index;
            });
            _handleBottomNavigation(index);
          },
        ),
      ),
    );            
  }

  Widget _buildTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return const Center(child: Text("Statistics Coming Soon"));
      case 1:
        return _buildScanReportContent();
      case 2:
        return _buildUploadContent();
      default:
        return _buildScanReportContent();
    }
  }

  Widget _buildScanReportContent() {
    return ScanResultsPage();
  }

  Widget _buildUploadContent() {
    return const UploadPhotosPage(); 
  }

  void _handleBottomNavigation(int index) {
    switch (index) {
      case 0:
        Navigator.pushNamed(context, '/gallery');
        break;
      case 1:
        break;
      case 2:
        Navigator.pushNamed(context, '/profile');
        break;
    }
  }

}