import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../(api)/auth.dart';
import '../../../(api)/dmca.dart'; 
import 'dmca_form_utils.dart';
import 'dmca_schema_form.dart';

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
  String? _userId;
  String _userAvatarUrl = 'assets/images/default_avatar.jpg';
  
  bool _isLoading = true;
  bool _isSavingProfile = false;
  bool _isPreparingNotice = false;
  bool _isGenerating = false;

  int _currentStep = 1;
  List<dynamic> _allNotices = [];
  List<dynamic> _platforms = [];
  String? _selectedPlatformSlug;
  
  final ProfileFormState _profileForm = ProfileFormState();
  bool _profileExists = false;

  Map<String, dynamic> _noticesByPlatform = {};
  Map<String, dynamic>? _activeNotice;
  Map<String, dynamic>? _generatedContent;
  Map<String, dynamic> _formPayload = {};

  @override
  void initState() {
    super.initState();
    _loadData();
    _loadAvatar();
  }

  Future<void> _loadAvatar() async {
    final avatarKey = await _api.secureStorage.read(key: ApiService.keyUserAvatar);
    if (avatarKey != null && avatarKey.isNotEmpty) {
      setState(() => _userAvatarUrl = avatarKey);
    }
  }

  Future<void> _loadData() async {
    _userId = await _api.secureStorage.read(key: ApiService.keyUserId);
    if (_userId == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    try {
      final responses = await Future.wait([
        _api.fetchDmcaPlatforms(),
        _api.fetchDmcaProfile(_userId!),
        _api.fetchUserDmcaNotices(_userId!),
      ]);

      _platforms = responses[0] as List<dynamic>;
      if (_platforms.isNotEmpty) _selectedPlatformSlug = _platforms.first['slug'];

      final profileMap = responses[1] as Map<String, dynamic>?;
      if (profileMap != null) {
        _profileExists = true;
        _profileForm
          ..fullName = profileMap['fullName'] ?? ""
          ..email = profileMap['email'] ?? ""
          ..street = profileMap['street'] ?? ""
          ..aptSuite = profileMap['aptSuite'] ?? ""
          ..city = profileMap['city'] ?? ""
          ..postalCode = profileMap['postalCode'] ?? ""
          ..country = profileMap['country'] ?? ""
          ..phone = profileMap['phone'] ?? ""
          ..signature = profileMap['signature'] ?? "";
      }

      _allNotices = responses[2] as List<dynamic>;
      for (var notice in _allNotices) {
        final existing = _noticesByPlatform[notice['dmcaPlatformSlug']];
        if (existing == null || DateTime.parse(notice['updatedAt']).isAfter(DateTime.parse(existing['updatedAt']))) {
          _noticesByPlatform[notice['dmcaPlatformSlug']] = notice;
        }
      }
      _initializeFormForPlatform();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
  

  void _initializeFormForPlatform() {
    if (_selectedPlatformSlug == null) return;
    
    final platform = _platforms.firstWhere((p) => p['slug'] == _selectedPlatformSlug);
    final savedNotice = _noticesByPlatform[_selectedPlatformSlug];

    if (savedNotice != null && savedNotice['payload'] != null) {
      _activeNotice = savedNotice;
      _formPayload = Map<String, dynamic>.from(savedNotice['payload']);
    } else {
      _activeNotice = null;
      final emptyPayload = createDefaultValueForItems(platform['formSchema'], widget.artworkPrefill); 
      _formPayload = hydrateProfileInPayload(emptyPayload, _profileForm);
    }
    _generatedContent = null;
  }

  void _loadNotice(Map<String, dynamic> notice) {
    setState(() {
      _selectedPlatformSlug = notice['dmcaPlatformSlug'];
      _activeNotice = notice;
      if (notice['payload'] != null) {
        _formPayload = Map<String, dynamic>.from(notice['payload']);
      }
      _generatedContent = null;
      _currentStep = 3; 
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notice loaded'), backgroundColor: Colors.green));
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile saved!'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isSavingProfile = false);
    }
  }

  Future<void> _prepareNotice() async {
    setState(() => _isPreparingNotice = true);
    try {
      final currentNotice = _noticesByPlatform[_selectedPlatformSlug];
      final canUpdate = currentNotice != null && currentNotice['status'] != 'SUBMITTED';

      final payload = {
        "dmcaPlatformSlug": _selectedPlatformSlug,
        "payload": _formPayload,
        "userId": _userId,
        "artworkId": widget.artworkPrefill['artworkId']
      };

      Map<String, dynamic> prepared;
      if (canUpdate) {
        prepared = await _api.updateDmcaNotice(currentNotice['id'], payload);
      } else {
        prepared = await _api.createDmcaNotice(payload);
      }

      setState(() {
        _activeNotice = prepared;
        _noticesByPlatform[_selectedPlatformSlug!] = prepared;
        _generatedContent = null;
      });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notice Prepared!'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Content Generated!'), backgroundColor: Colors.green));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  Future<void> _launchUrl(String? urlString) async {
    if (urlString == null || urlString.isEmpty) return;
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not open link.')));
    }
  }

  void _launchEmailApp() {
    if (_generatedContent == null) return;
    final String emailTo = _generatedContent!['email']['to'];
    final String subject = _generatedContent!['email']['subject'];
    final String body = _generatedContent!['email']['body'];

    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: emailTo,
      queryParameters: {'subject': subject, 'body': body},
    );
    launchUrl(emailLaunchUri);
  }

  Widget _buildTextField(String label, String initialValue, Function(String) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextFormField(
            initialValue: initialValue,
            style: const TextStyle(color: Colors.black87, fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.grey[50], 
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: Colors.grey[200]!),
      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))],
    );
  }

  Widget _buildStepIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [1, 2, 3].map((step) {
          bool isActive = _currentStep == step;
          bool isPast = step < _currentStep;
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? Colors.blue[50] : (isPast ? Colors.green[50] : Colors.grey[50]),
              border: Border.all(
                color: isActive ? Colors.blue : (isPast ? Colors.green : Colors.grey[300]!),
                width: 2,
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              isPast ? "✓" : "$step",
              style: TextStyle(
                color: isActive ? Colors.blue : (isPast ? Colors.green : Colors.grey),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildHistorySection() {
    if (_allNotices.isEmpty) return const SizedBox.shrink();
    
    final sortedNotices = List.from(_allNotices)
      ..sort((a, b) => DateTime.parse(b['updatedAt']).compareTo(DateTime.parse(a['updatedAt'])));

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Notices History", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text("Load previous notices to continue or view them.", style: TextStyle(fontSize: 13, color: Colors.grey)),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: sortedNotices.length > 3 ? 3 : sortedNotices.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final notice = sortedNotices[index];
              final date = DateTime.parse(notice['updatedAt']);
              final status = notice['status'];
              final isSubmitted = status == "SUBMITTED";

              return ListTile(
                title: Row(
                  children: [
                    Text(notice['dmcaPlatformSlug'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isSubmitted ? Colors.green[50] : Colors.amber[50],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        status,
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSubmitted ? Colors.green[700] : Colors.amber[700]),
                      ),
                    )
                  ],
                ),
                subtitle: Text("${date.month}/${date.day}/${date.year}", style: const TextStyle(fontSize: 12)),
                trailing: OutlinedButton.icon(
                  icon: const Icon(Icons.open_in_new, size: 16),
                  label: const Text("Load"),
                  style: OutlinedButton.styleFrom(visualDensity: VisualDensity.compact),
                  onPressed: () => _loadNotice(notice),
                ),
              );
            },
          )
        ],
      ),
    );
  }

  Widget _buildProfileStep() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("DMCA Profile", style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("These details are reused to prefill matching platform form fields.", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 24),
          
          _buildTextField("Full name", _profileForm.fullName, (v) => _profileForm.fullName = v),
          _buildTextField("Email", _profileForm.email, (v) => _profileForm.email = v),
          _buildTextField("Street address", _profileForm.street, (v) => _profileForm.street = v),
          _buildTextField("Apartment / Suite", _profileForm.aptSuite, (v) => _profileForm.aptSuite = v),
          _buildTextField("City", _profileForm.city, (v) => _profileForm.city = v),
          _buildTextField("Postal code", _profileForm.postalCode, (v) => _profileForm.postalCode = v),
          _buildTextField("Country", _profileForm.country, (v) => _profileForm.country = v),
          _buildTextField("Phone", _profileForm.phone, (v) => _profileForm.phone = v),
          _buildTextField("Signature", _profileForm.signature, (v) => _profileForm.signature = v),
          
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: _isSavingProfile ? null : _saveProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black87,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSavingProfile 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                      : const Text("Save profile", style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _profileExists ? () => setState(() => _currentStep = 2) : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5E3B7D),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("Next →", style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildPreparationStep() {
    final platform = _platforms.firstWhere((p) => p['slug'] == _selectedPlatformSlug, orElse: () => null);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Notice Preparation", style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("Choose a platform and fill in the requested fields.", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 24),
          
          const Text("Target Platform", style: TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _selectedPlatformSlug,
            dropdownColor: Colors.white,
            style: const TextStyle(color: Colors.black87, fontSize: 14),
            decoration: InputDecoration(
              filled: true, fillColor: Colors.grey[50],
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF5E3B7D), width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            items: _platforms.map((p) => DropdownMenuItem(value: p['slug'] as String, child: Text(p['displayName']))).toList(),
            onChanged: (val) {
              if (val != null) setState(() { _selectedPlatformSlug = val; _initializeFormForPlatform(); });
            },
          ),
          const SizedBox(height: 24),

          if (platform != null) ...[
            DmcaSchemaForm(
              schema: platform['formSchema'],
              payload: _formPayload,
              artworkPrefill: widget.artworkPrefill,
              detectedInfringingUrls: List<String>.from(widget.artworkPrefill['infringingUrls'] ?? []),
              onUpdatePath: (path, value) => setState(() => _formPayload = setAtPath(_formPayload, path, value)),
            ),
            const SizedBox(height: 24),
          ],

          if (_activeNotice != null)
            Container(
              margin: const EdgeInsets.only(bottom: 24),
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(border: Border(left: BorderSide(color: Colors.green, width: 4))),
              child: Text("Notice Status: ${_activeNotice!['status']}", style: const TextStyle(fontWeight: FontWeight.bold)),
            ),

          Row(
            children: [
              OutlinedButton(
                onPressed: () => setState(() => _currentStep = 1),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text("← Back", style: TextStyle(color: Colors.black87)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isPreparingNotice ? null : _prepareNotice,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black87, 
                    foregroundColor: Colors.white, 
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                  ),
                  child: _isPreparingNotice 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text("Prepare notice", style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _activeNotice != null ? () => setState(() => _currentStep = 3) : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5E3B7D), 
                  foregroundColor: Colors.white, 
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                ),
                child: const Text("Next →", style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildSubmissionStep() {
    final platform = _platforms.firstWhere((p) => p['slug'] == _selectedPlatformSlug, orElse: () => null);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Ready to Send", style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("Follow the steps below to submit your notice.", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          const SizedBox(height: 24),

          if (platform != null && platform['dmcaUrl'] != null && platform['dmcaUrl'].toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _launchUrl(platform['dmcaUrl']),
                  icon: const Icon(Icons.open_in_new, size: 18),
                  label: const Text("Open Platform Web Form"),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                ),
              ),
            ),

          if (_generatedContent == null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(border: Border.all(color: Colors.grey[300]!), borderRadius: BorderRadius.circular(8)),
              child: Column(
                children: [
                  const Text("Generate the email and PDF attachments before sending."),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isGenerating ? null : _generateContent,
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF5E3B7D), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                      child: _isGenerating 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text("Generate Content"),
                    ),
                  )
                ],
              ),
            )
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey[300]!)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("To: ${_generatedContent!['email']['to']}", style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text("Subject: ${_generatedContent!['email']['subject']}", style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text("Copy Subject"),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: _generatedContent!['email']['subject']));
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Subject copied!')));
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text("Copy Body"),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: _generatedContent!['email']['body']));
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Email body copied!')));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.email_outlined),
                label: const Text("Open Mail App"),
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                onPressed: _launchEmailApp,
              ),
            ),
            const SizedBox(height: 12),
            
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.description_outlined),
                label: const Text("Download PDF"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5E3B7D),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: () => _launchUrl(_generatedContent!['pdf']?['url']),
              ),
            ),
          ],
          
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: () => setState(() => _currentStep = 2),
            style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text("← Back", style: TextStyle(color: Colors.black87)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D))));
    }

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
      
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("DMCA Assistant", style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text("Follow the steps to prepare and send your legal notice.", style: TextStyle(color: Colors.grey[600], fontSize: 14)),
              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  border: Border.all(color: const Color(0xFFFCD34D)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text("Important: VigilArt never files a DMCA complaint on your behalf.", style: TextStyle(color: Colors.amber[900], fontSize: 13, fontWeight: FontWeight.w500)),
                    ),
                  ],
                ),
              ),
              
              _buildStepIndicator(),
              
              if (_currentStep == 1) _buildHistorySection(),
              if (_currentStep == 1) _buildProfileStep(),
              if (_currentStep == 2) _buildPreparationStep(),
              if (_currentStep == 3) _buildSubmissionStep(),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),

      // GLOBAL BOTTOM NAVIGATION
      bottomNavigationBar: SafeArea(
        child: SlideMenuBar(
          selectedIndex: 2, // Matches the new DMCA index
          onTabChange: (i) {
             if (i == 0) Navigator.pushReplacementNamed(context, '/gallery');
             if (i == 1) Navigator.pushReplacementNamed(context, '/dashboard');
             if (i == 3) Navigator.pushReplacementNamed(context, '/profile');
          }
        ),
      ),
    );
  }
}