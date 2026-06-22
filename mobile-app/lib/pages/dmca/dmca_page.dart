import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:vigilart/(api)/user.dart';
import '../../../(api)/auth.dart';
import '../../../(api)/dmca.dart';
import 'dmca_form_utils.dart';
import 'widgets/dmca_components.dart';
import 'widgets/dmca_steps.dart';

import 'package:vigilart/widgets/header_bar.dart';
import 'package:vigilart/widgets/slideMenuBar.dart';

class DmcaPage extends StatefulWidget {
  final Map<String, dynamic> artworkPrefill;
  const DmcaPage({Key? key, required this.artworkPrefill}) : super(key: key);

  @override
  State<DmcaPage> createState() => _DmcaPageState();
}

class _DmcaPageState extends State<DmcaPage> {
  final ApiService _api = ApiService();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  String? _userId;
  String _userAvatarUrl = 'assets/images/default_avatar.jpg';

  bool _isLoading = true;
  bool _isSavingProfile = false;
  bool _isPreparingNotice = false;
  bool _isGenerating = false;

  int _currentStep = 1;
  List<dynamic> _platforms = [];
  String? _selectedPlatformSlug;
  final ProfileFormState _profileForm = ProfileFormState();
  bool _profileExists = false;

  List<dynamic> _allNotices = [];
  Map<String, dynamic> _noticesByPlatform = {};
  Map<String, dynamic>? _activeNotice;
  Map<String, dynamic>? _generatedContent;
  Map<String, dynamic> _formPayload = {};

  dynamic get _selectedPlatform {
    if (_selectedPlatformSlug == null) return null;
    return _platforms.firstWhere(
      (platform) => platform['slug'] == _selectedPlatformSlug,
      orElse: () => null,
    );
  }

  List<String> get _detectedInfringingUrls {
    return List<String>.from(widget.artworkPrefill['infringingUrls'] ?? []);
  }

  @override
  void initState() {
    super.initState();
    _loadData();
    _loadAvatar();
  }

  Future<void> _loadAvatar() async {
    final avatarKey = await _api.secureStorage.read(key: ApiService.keyUserAvatar);
    
    String finalAvatarUrl = 'assets/images/default_avatar.jpg';

    if (avatarKey != null && avatarKey.isNotEmpty && avatarKey != 'null') {
      if (avatarKey.startsWith('http')) {
        finalAvatarUrl = avatarKey;
      } else if (avatarKey.startsWith('profiles/')) {
          final downloadUrl = await _api.getAvatarDownloadUrl(avatarKey);
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


  Future<void> _loadData() async {
    try {
      _userId = await _api.secureStorage.read(key: ApiService.keyUserId);
      if (_userId == null) return;

      await _loadPlatformsAndProfile();
      await _loadNotices();
      _initializeFormForPlatform();
    } catch (error) {
      _showError('Error loading data: $error');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadPlatformsAndProfile() async {
    final responses = await Future.wait([
      _api.fetchDmcaPlatforms(),
      _api.fetchDmcaProfile(_userId!),
    ]);

    _platforms = responses[0] as List<dynamic>;
    if (_platforms.isNotEmpty) {
      _selectedPlatformSlug = _platforms.first['slug'];
    }

    final profileData = responses[1] as Map<String, dynamic>?;
    if (profileData != null) {
      _profileExists = true;
      _profileForm.fromJson(profileData);
    }
  }

  Future<void> _loadNotices() async {
    _allNotices = await _api.fetchUserDmcaNotices(_userId!);
    _indexNoticesByPlatform();
  }

  void _indexNoticesByPlatform() {
    for (final notice in _allNotices) {
      final platformSlug = notice['dmcaPlatformSlug'];
      final existing = _noticesByPlatform[platformSlug];
      if (existing == null || DateTime.parse(notice['updatedAt']).isAfter(DateTime.parse(existing['updatedAt']))) {
        _noticesByPlatform[platformSlug] = notice;
      }
    }
  }

  void _initializeFormForPlatform() {
    final platform = _selectedPlatform;
    if (platform == null) return;

    final savedNotice = _noticesByPlatform[_selectedPlatformSlug];
    if (savedNotice != null && savedNotice['payload'] != null) {
      _activeNotice = savedNotice;
      _formPayload = PathOperations.deepClone(savedNotice['payload']);
    } else {
      _activeNotice = null;
      final defaultPayload = createDefaultValueForItems(platform['formSchema'], widget.artworkPrefill);
      final hydrated = hydrateProfileInPayload(defaultPayload, _profileForm);
      final repeaters = findInfringingRepeaters(platform['formSchema']);
      _formPayload = clearPreselectedInfringingUrls(hydrated, repeaters);
    }
    _generatedContent = null;
  }

  Future<void> _loadNotice(Map<String, dynamic> notice) async {
    setState(() {
      _selectedPlatformSlug = notice['dmcaPlatformSlug'];
      _activeNotice = notice;
      _formPayload = notice['payload'] != null ? PathOperations.deepClone(notice['payload']) : {};
      _generatedContent = null;
      _currentStep = 3;
    });
    _showSuccess('Notice loaded');
  }

  Future<void> _saveProfile() async {
    setState(() => _isSavingProfile = true);
    try {
      final payload = _profileForm.toJson();
      if (_profileExists) {
        await _api.updateDmcaProfile(_userId!, payload);
      } else {
        await _api.createDmcaProfile(_userId!, payload);
        _profileExists = true;
      }
      setState(() => _formPayload = hydrateProfileInPayload(_formPayload, _profileForm));
      _showSuccess('Profile saved!');
    } catch (error) {
      _showError('Error saving profile: $error');
    } finally {
      if (mounted) setState(() => _isSavingProfile = false);
    }
  }

  Future<void> _prepareNotice() async {
    if (!_formKey.currentState!.validate()) {
      _showError('Please fill out all required fields');
      return;
    }

    setState(() => _isPreparingNotice = true);
    try {
      final currentNotice = _noticesByPlatform[_selectedPlatformSlug];
      final canUpdate = currentNotice != null && currentNotice['status'] != 'SUBMITTED';
      final payload = {
        "dmcaPlatformSlug": _selectedPlatformSlug,
        "payload": _formPayload,
        "userId": _userId,
        "artworkId": widget.artworkPrefill['artworkId'],
      };

      final prepared = canUpdate ? await _api.updateDmcaNotice(currentNotice['id'], payload) : await _api.createDmcaNotice(payload);

      setState(() {
        _activeNotice = prepared;
        _noticesByPlatform[_selectedPlatformSlug!] = prepared;
        _generatedContent = null;
      });
      _showSuccess('Notice prepared!');
    } catch (error) {
      _showError('Error preparing notice: $error');
    } finally {
      if (mounted) setState(() => _isPreparingNotice = false);
    }
  }

  Future<void> _generateContent() async {
    if (_activeNotice == null) return;
    setState(() => _isGenerating = true);
    try {
      final generated = await _api.generateDmcaNotice(_activeNotice!['id']);
      setState(() => _generatedContent = generated);
      _showSuccess('Content generated!');
    } catch (error) {
      _showError('Error generating content: $error');
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  void _launchEmailApp() {
    if (_generatedContent == null) return;
    final email = _generatedContent!['email'];
    final uri = Uri(
      scheme: 'mailto',
      path: email['to'],
      queryParameters: {'subject': email['subject'], 'body': email['body']},
    );
    launchUrl(uri);
  }

  void _copyToClipboard(String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    _showSuccess(message);
  }

  void _showSuccess(String message) => _showSnackBar(message, Colors.green);
  void _showError(String message) => _showSnackBar(message, Colors.red);
  void _showSnackBar(String message, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: color));
  }

  void _updateFormPayload(List<dynamic> path, dynamic value) {
    setState(() => _formPayload = PathOperations.setAtPath(_formPayload, path, value));
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("DMCA Assistant", style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text("Follow the steps to prepare and send your legal notice.", style: TextStyle(color: Colors.grey[600], fontSize: 14)),
          const SizedBox(height: 24),
          
          const DmcaWarningBanner(),
          DmcaStepIndicator(currentStep: _currentStep),
          
          if (_currentStep == 1) DmcaHistorySection(notices: _allNotices, onLoadNotice: _loadNotice),
          if (_currentStep == 1) DmcaProfileStep(
              profileForm: _profileForm,
              isSaving: _isSavingProfile,
              onFieldChanged: (field, value) => setState(() => field(value)),
              onSave: _saveProfile,
              onNext: _profileExists ? () => setState(() => _currentStep = 2) : null,
            ),
          if (_currentStep == 2) DmcaPreparationStep(
              platform: _selectedPlatform,
              allPlatforms: _platforms,
              formKey: _formKey,
              formPayload: _formPayload,
              detectedUrls: _detectedInfringingUrls,
              artworkPrefill: widget.artworkPrefill,
              isPreparing: _isPreparingNotice,
              activeNotice: _activeNotice,
              onPlatformChanged: (slug) {
                setState(() { _selectedPlatformSlug = slug; _initializeFormForPlatform(); });
              },
              onUpdatePath: _updateFormPayload,
              onBack: () => setState(() => _currentStep = 1),
              onPrepareNotice: _prepareNotice,
              onNext: _activeNotice != null ? () => setState(() => _currentStep = 3) : null,
            ),
          if (_currentStep == 3) DmcaSubmissionStep(
              platform: _selectedPlatform,
              generatedContent: _generatedContent,
              isGenerating: _isGenerating,
              onGenerateContent: _generateContent,
              onCopyText: _copyToClipboard,
              onLaunchEmail: _launchEmailApp,
              onOpenPdf: () => launchUrl(Uri.parse(_generatedContent?['pdf']?['url'] ?? '')),
              onBack: () => setState(() => _currentStep = 2),
            ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D))));

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: SafeArea(
          child: VigilArtHeaderBar(
            onLogoTap: () => Navigator.pushReplacementNamed(context, '/dashboard'),
            onNotificationsTap: () => Navigator.pushNamed(context, '/notifications'),
            onProfileTap: () => Navigator.pushNamed(context, '/profile'),
            avatar: _userAvatarUrl,
          ),
        ),
      ),
      body: SafeArea(child: _buildBody()),
      bottomNavigationBar: SafeArea(
        child: SlideMenuBar(
          selectedIndex: 2,
          onTabChange: (index) {
            if (index == 0) {
              Navigator.pushReplacementNamed(context, '/gallery');
            } else if (index == 1) Navigator.pushReplacementNamed(context, '/dashboard');
            else if (index == 3) Navigator.pushReplacementNamed(context, '/profile');
          },
        ),
      ),
    );
  }
}
