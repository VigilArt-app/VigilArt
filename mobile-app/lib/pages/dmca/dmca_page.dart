import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../(api)/auth.dart';
import '../../../(api)/dmca.dart'; 
import 'dmca_form_utils.dart';
import 'dmca_schema_form.dart';

class DmcaPage extends StatefulWidget {
  final Map<String, dynamic> artworkPrefill;

  const DmcaPage({Key? key, required this.artworkPrefill}) : super(key: key);

  @override
  State<DmcaPage> createState() => _DmcaPageState();
}

class _DmcaPageState extends State<DmcaPage> {
  final ApiService _api = ApiService(); 
  String? _userId;
  
  bool _isLoading = true;
  bool _isSavingProfile = false;
  bool _isPreparingNotice = false;
  bool _isGenerating = false;

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
  }

  Future<void> _loadData() async {
    _userId = await _api.secureStorage.read(key: ApiService.keyUserId);

    if (_userId == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error: User not authenticated.')));
        setState(() => _isLoading = false);
      }
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

      final notices = responses[2] as List<dynamic>;
      for (var notice in notices) {
        _noticesByPlatform[notice['dmcaPlatformSlug']] = notice;
      }

      _initializeFormForPlatform();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load DMCA data: $e')));
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
      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF9FAFB),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D))),
      );
    }

    final platform = _platforms.firstWhere((p) => p['slug'] == _selectedPlatformSlug, orElse: () => null);

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
        title: const Text("DMCA Generator", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w800)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("DMCA Assistant", style: TextStyle(color: Colors.black, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text("Prepare your DMCA notice from dynamic platform fields provided by the backend.", style: TextStyle(color: Colors.grey[600], fontSize: 14)),
            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                border: Border.all(color: const Color(0xFFFCD34D)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706)),
                  Expanded(
                    child: Text(
                      "Important: VigilArt never files a DMCA complaint on your behalf. You must review and submit it yourself on the target website.",
                      style: TextStyle(color: Colors.amber[900], fontSize: 13, height: 1.4, fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(20),
              decoration: _cardDecoration(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("1) DMCA profile", style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)),
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
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSavingProfile ? null : _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5E3B7D),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: _isSavingProfile 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                          : const Text("Save DMCA profile", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (platform != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: _cardDecoration(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("2) Notice preparation", style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)),
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
                  
                  DmcaSchemaForm(
                    schema: platform['formSchema'],
                    payload: _formPayload,
                    artworkPrefill: widget.artworkPrefill,
                    detectedInfringingUrls: List<String>.from(widget.artworkPrefill['infringingUrls'] ?? []),
                    onUpdatePath: (path, value) => setState(() => _formPayload = setAtPath(_formPayload, path, value)),
                  ),

                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
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
                          : const Text("Prepare notice", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _activeNotice == null || _isGenerating ? null : _generateContent,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF5E3B7D), 
                        side: BorderSide(color: _activeNotice == null ? Colors.grey[300]! : const Color(0xFF5E3B7D), width: 2),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                      ),
                      child: _isGenerating
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF5E3B7D)))
                          : const Text("Generate email + PDF", style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_generatedContent != null)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: _cardDecoration(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("3) Ready to Send", style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey[200]!)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("To: ${_generatedContent!['email']['to']}", style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text("Subject: ${_generatedContent!['email']['subject']}", style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.copy, size: 16, color: Colors.black87),
                          label: const Text("Subject", style: TextStyle(color: Colors.black87)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.grey[300]!),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
                          ),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: _generatedContent!['email']['subject']));
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Subject copied!')));
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.copy, size: 16, color: Colors.black87),
                          label: const Text("Body", style: TextStyle(color: Colors.black87)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.grey[300]!),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
                          ),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: _generatedContent!['email']['body']));
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Email body copied!')));
                          },
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}