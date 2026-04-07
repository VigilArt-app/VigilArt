import 'package:VigilArt/(api)/auth.dart';
import 'package:VigilArt/pages/profile/profile_header.dart';
import 'package:VigilArt/widgets/editable_from_field.dart';
import 'package:VigilArt/widgets/header_bar.dart';
import 'package:VigilArt/widgets/slideMenuBar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:VigilArt/(api)/user.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:typed_data';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isEditMode = false;
  bool _isLoading = true;
  int _bottomNavIndex = 2;
  final _formKey = GlobalKey<FormState>();
  
  final ApiService _apiService = ApiService(); 
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late TextEditingController _countryController;
  late TextEditingController _languageController;

  Map<String, String> _userData = {
    'firstName': '',
    'lastName': '',
    'email': '',
    'password': '••••••••',
    'country': 'France',
    'language': 'French',
    'avatar': 'assets/images/default_avatar.jpg',
  };

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController(text: _userData['firstName']);
    _lastNameController = TextEditingController(text: _userData['lastName']);
    _emailController = TextEditingController(text: _userData['email']);
    _passwordController = TextEditingController(text: _userData['password']);
    _countryController = TextEditingController(text: _userData['country']);
    _languageController = TextEditingController(text: _userData['language']);
    _loadRemoteUserData();
  }

  void _updateControllersText() {
    _firstNameController.text = _userData['firstName']!;
    _lastNameController.text = _userData['lastName']!;
    _emailController.text = _userData['email']!;
    _passwordController.text = _userData['password']!;
    _countryController.text = _userData['country']!;
    _languageController.text = _userData['language']!;
  }

  
  Future<void> _loadRemoteUserData() async {
    print("🔵 DEBUG 1: Démarrage de la récupération du profil...");
    setState(() => _isLoading = true);
    
    try {
      final profile = await _apiService.fetchUserProfile();
      
      if (profile != null) {
        String avatarDisplayUrl = _userData['avatar']!; 
        final String? avatarKey = profile['avatar']?.toString(); 

        if (avatarKey != null && avatarKey.isNotEmpty) {
          if (avatarKey.startsWith('http')) {
            avatarDisplayUrl = avatarKey;
          } else if (avatarKey.startsWith('profiles/')) {
            final String? downloadUrl = await _apiService.getAvatarDownloadUrl(avatarKey);
            print("🔵 DEBUG 4: Lien Cloudflare R2 généré = $downloadUrl");
            if (downloadUrl != null && downloadUrl.isNotEmpty) {
              avatarDisplayUrl = downloadUrl;
            }
          }
        }

        if (mounted) {
          setState(() {
            _userData = {
              'firstName': profile['firstName']?.toString() ?? 'Prénom introuvable',
              'lastName': profile['lastName']?.toString() ?? 'Nom introuvable',
              'email': profile['email']?.toString() ?? 'Email introuvable',
              'password': '••••••••',
              'country': profile['country']?.toString() ?? 'France',
              'language': profile['language']?.toString() ?? 'French',
              'avatar': avatarDisplayUrl,
            };
            
            print("🔵 DEBUG 5: _userData final préparé pour l'affichage = $_userData");
            _updateControllersText();
          });
        }
      }
    } catch (e) {
      if (mounted) _showSnackBar('Erreur lors du chargement : $e', Colors.red);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleAvatarUpload() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      
      if (image == null) return;

      setState(() => _isLoading = true);

      final Uint8List fileBytes = await image.readAsBytes();
      final String filename = image.name;
      final String mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

      final uploadData = await _apiService.getAvatarUploadUrl(filename);
      
      if (uploadData != null) {
        final String presignedUrl = uploadData['presignedUrl'];
        final String storageKey = uploadData['storageKey']; 

        final bool uploadSuccess = await _apiService.uploadAvatarToR2(fileBytes, mimeType, presignedUrl);

        if (uploadSuccess) {
          final updatedProfile = await _apiService.updateUserProfile({'avatar': storageKey});
          
          if (updatedProfile != null) {
            if (mounted) _showSnackBar('✓ Photo de profil mise à jour !', const Color(0xFF22C55E));
            await _loadRemoteUserData(); 
            return;
          }
        }
      }
      
      if (mounted) _showSnackBar('Échec du téléchargement de l\'image', Colors.red);
    } catch (e) {
      if (mounted) _showSnackBar('Erreur : $e', Colors.red);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleEditToggle() async {
    if (_isEditMode) {
      if (_formKey.currentState!.validate()) {
        setState(() => _isLoading = true);
        
        final Map<String, dynamic> updateData = {
          'firstName': _firstNameController.text,
          'lastName': _lastNameController.text,
          'email': _emailController.text,
          'country': _countryController.text,
          'language': _languageController.text,
        };

        final result = await _apiService.updateUserProfile(updateData);
        setState(() => _isLoading = false);

        if (result != null) {
          setState(() {
            _userData.addAll(updateData.map((k, v) => MapEntry(k, v.toString())));
            _isEditMode = false;
          });
          _showSnackBar('✓ Profil mis à jour avec succès !', const Color(0xFF22C55E));
        } else {
          _showSnackBar('Échec de la mise à jour', Colors.red);
        }
      }
    } else {
      setState(() => _isEditMode = true);
    }
  }

  void _handleLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Souhaitez-vous vraiment vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context), 
            child: const Text('Annuler', style: TextStyle(color: Colors.grey))
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _processLogout();
            }, 
            child: const Text('Déconnexion', style: TextStyle(color: Colors.red))
          ),
        ],
      ),
    );
  }

  void _processLogout() async {
    await _secureStorage.deleteAll(); 
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  void _onBottomTabChange(int index) {
    if (index == _bottomNavIndex) return;
    setState(() => _bottomNavIndex = index);
    
    switch (index) {
      case 0: Navigator.pushReplacementNamed(context, '/gallery'); break;
      case 1: Navigator.pushReplacementNamed(context, '/dashboard'); break;
      case 2: break;
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: color, duration: const Duration(seconds: 2))
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _countryController.dispose();
    _languageController.dispose();
    super.dispose();
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
            onProfileTap: () {},
            avatar: _userData['avatar']?.isNotEmpty == true 
                ? _userData['avatar']! 
                : 'assets/images/default_avatar.jpg',          
          ),
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF5E3B7D)))
        : SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                ProfileHeader(
                  userName: _userData['firstName']!,
                  avatarUrl: _userData['avatar']!,
                  isEditMode: _isEditMode,
                  onEditTap: _handleEditToggle,
                  onAvatarTap: _handleAvatarUpload, 
                ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        _buildSectionHeader('Informations Personnelles'),
                        _buildSectionCard([
                          EditableFormField(
                            label: 'Prénom', 
                            controller: _firstNameController, 
                            isReadOnly: !_isEditMode,
                            validator: (v) => v!.isEmpty ? 'Requis' : null,
                          ),
                          const SizedBox(height: 16),
                          EditableFormField(
                            label: 'Nom', 
                            controller: _lastNameController, 
                            isReadOnly: !_isEditMode,
                            validator: (v) => v!.isEmpty ? 'Requis' : null,
                          ),
                        ]),
                        const SizedBox(height: 24),
                        _buildSectionHeader('Compte'),
                        _buildSectionCard([
                          EditableFormField(
                            label: 'Email', 
                            controller: _emailController, 
                            isReadOnly: !_isEditMode,
                            validator: (v) => !v!.contains('@') ? 'Email invalide' : null,
                          ),
                          const SizedBox(height: 16),
                          EditableFormField(
                            label: 'Mot de passe', 
                            controller: _passwordController, 
                            isPassword: true, 
                            isReadOnly: true, 
                          ),
                        ]),
                        const SizedBox(height: 24),
                        _buildSectionHeader('Localisation & Préférences'),
                        _buildSectionCard([
                          EditableFormField(label: 'Pays', controller: _countryController, isReadOnly: !_isEditMode,),
                          const SizedBox(height: 16),
                          EditableFormField(label: 'Langue', controller: _languageController, isReadOnly: !_isEditMode,),
                        ]),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _handleLogoutDialog,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red[400],
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              elevation: 0,
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center, 
                              children: [
                                Icon(Icons.logout, color: Colors.white, size: 18),
                                SizedBox(width: 8),
                                Text('DÉCONNEXION', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
      bottomNavigationBar: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2))],
          ),
          child: SlideMenuBar(
            selectedIndex: _bottomNavIndex, 
            onTabChange: _onBottomTabChange,
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Row(children: [
        Container(width: 4, height: 18, decoration: BoxDecoration(color: const Color(0xFF5E3B7D), borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 10),
        Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.black87)),
      ]),
    );
  }

  Widget _buildSectionCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: const Color(0xFFEEEEEE), width: 1.5),
      ),
      child: Column(children: children),
    );
  }
}
