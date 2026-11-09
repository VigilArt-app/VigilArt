import 'package:flutter/material.dart';

import '../../(api)/auth.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/header_bar.dart';
import '../../widgets/slide_menu_bar.dart';
import '../../widgets/slide_tabs_bar.dart';
import '../dmca/dmca_page.dart';
import 'scan_report/scan_result_page.dart';
import 'statistics/statistics_page.dart';
import 'upload_picture/upload_photos_page.dart';
import '../../(api)/user.dart';

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
    var finalAvatarUrl = 'assets/images/default_avatar.jpg';

    if (avatarKey != null && avatarKey.isNotEmpty && avatarKey != 'null') {
      if (avatarKey.startsWith('http')) {
        finalAvatarUrl = avatarKey;
      } else if (avatarKey.startsWith('profiles/')) {
        final downloadUrl = await apiService.getAvatarDownloadUrl(avatarKey);
        if (downloadUrl != null && downloadUrl.isNotEmpty) finalAvatarUrl = downloadUrl;
      } else {
        finalAvatarUrl = avatarKey;
      }
    }
    if (mounted) setState(() => _userAvatarUrl = finalAvatarUrl);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: SafeArea(
          bottom: false,
          child: VigilArtHeaderBar(
            onLogoTap: () => setState(() => _selectedTabIndex = 1),
            onProfileTap: () => Navigator.pushNamed(context, '/profile'),
            avatar: _userAvatarUrl,
          ),
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 12),
          SlideTabsBar(
            tabs: [l10n.tabStatistics, l10n.tabReposts, l10n.tabUpload],
            selectedTab: _selectedTabIndex,
            onTabSelected: (index) => setState(() => _selectedTabIndex = index),
          ),
          const SizedBox(height: 12),
          Expanded(child: _buildTabContent()),
        ],
      ),
      bottomNavigationBar: SlideMenuBar(
        selectedIndex: _bottomNavIndex,
        onTabChange: (index) {
          if (index != _bottomNavIndex) _handleBottomNavigation(index);
        },
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return const StatisticsPage();
      case 2:
        return const UploadPhotosPage();
      default:
        return const ScanResultsPage();
    }
  }

  void _handleBottomNavigation(int index) {
    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, '/gallery');
        break;
      case 2:
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DmcaPage(artworkPrefill: {})),
        );
        break;
      case 3:
        Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }
}
