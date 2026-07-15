import 'package:vigilart/pages/dashboard/scan_report/scan_result_page.dart';
import 'package:vigilart/pages/dashboard/statistics/statistics_page.dart';
import 'package:vigilart/pages/dashboard/upload_picture/upload_photos_page.dart';
import 'package:flutter/material.dart';
import 'package:vigilart/widgets/header_bar.dart';
import 'package:vigilart/widgets/slide_menu_bar.dart';
import 'package:vigilart/widgets/slide_tabs_bar.dart';
import '../../(api)/auth.dart';
import '../../(api)/user.dart';
import 'package:vigilart/pages/dmca/dmca_page.dart'; 

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});
  
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _selectedTabIndex = 1;
  final int _bottomNavIndex = 1;

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
          final downloadUrl = await apiService.getAvatarDownloadUrl(avatarKey);
          if (downloadUrl != null && downloadUrl.isNotEmpty) {
            finalAvatarUrl = downloadUrl;
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
            if (index != 1) { 
              _handleBottomNavigation(index);
            }
          },
        ),
      ),
    );            
  }

  Widget _buildTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return StatisticsPage();
      case 1:
        return ScanResultsPage();
      case 2:
        return const UploadPhotosPage(); 
      default:
        return ScanResultsPage();
    }
  }

  void _handleBottomNavigation(int index) {
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/gallery');
        break;
      case 1:
        break;
      case 2:
        Navigator.push(
          context, 
          MaterialPageRoute(builder: (context) => const DmcaPage(artworkPrefill: {}))
        );
        break;
      case 3:
        Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }
}
