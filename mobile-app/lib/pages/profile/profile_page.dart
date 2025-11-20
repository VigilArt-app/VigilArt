import 'package:VigilArt/pages/profile/profile_header.dart';
import 'package:VigilArt/widgets/editable_from_field.dart';
import 'package:VigilArt/widgets/header_bar.dart';
import 'package:VigilArt/widgets/slideMenuBar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late bool _isEditMode;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late TextEditingController _countryController;
  late TextEditingController _languageController;

  final _formKey = GlobalKey<FormState>();
  int _bottomNavIndex = 2;

  Map<String, String> _userData = {
    'firstName': '',
    'lastName': '',
    'email': '',
    'password': '••••••••',
    'country': 'France',
    'language': 'French',
    'avatar':
        'https://i.pinimg.com/736x/03/f3/00/03f3001fb8b4abe101d2f72cc61c0904.jpg',
  };
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _isEditMode = false;
    _initializeControllers();
    loadUserData();
  }

  Future<void> loadUserData() async {
    final firstName = await secureStorage.read(key: 'userFirstName') ?? '';
    final lastName = await secureStorage.read(key: 'userLastName') ?? '';
    final email = await secureStorage.read(key: 'userEmail') ?? '';

    setState(() {
      _userData = {
        'firstName': firstName.isNotEmpty ? firstName : _userData['firstName']!,
        'lastName': lastName.isNotEmpty ? lastName : _userData['lastName']!,
        'email': email.isNotEmpty ? email : _userData['email']!,
        'password': _userData['password']!,
        'country': _userData['country']!,
        'language': _userData['language']!,
        'avatar': _userData['avatar']!,
      };

      _initializeControllers();
    });
  }
  
  void _initializeControllers() {
    _firstNameController =
        TextEditingController(text: _userData['firstName']!);
    _lastNameController = TextEditingController(text: _userData['lastName']!);
    _emailController = TextEditingController(text: _userData['email']!);
    _passwordController = TextEditingController(text: _userData['password']!);
    _countryController = TextEditingController(text: _userData['country']!);
    _languageController = TextEditingController(text: _userData['language']!);
  }

  void _toggleEditMode() {
    if (_isEditMode && _formKey.currentState!.validate()) {
      setState(() {
        _userData['firstName'] = _firstNameController.text;
        _userData['lastName'] = _lastNameController.text;
        _userData['email'] = _emailController.text;
        _userData['country'] = _countryController.text;
        _userData['language'] = _languageController.text;
        _isEditMode = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✓ Profile updated successfully!'),
          backgroundColor: Color(0xFF22C55E),
          duration: Duration(seconds: 2),
        ),
      );
    } else {
      setState(() {
        _isEditMode = !_isEditMode;
      });
    }
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text('Are you sure you want to logout?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Cancel',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _performLogout();
              },
              child: const Text(
                'Logout',
                style: TextStyle(color: Colors.red),
              ),
            ),
          ],
        );
      },
    );
  }

  void _performLogout() {
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
  }

  void _handleBottomNavigation(int index) {
    setState(() {
      _bottomNavIndex = index;
    });

    switch (index) {
      case 0:
        Navigator.pushNamed(context, '/gallery');
        break;
      case 1:
        Navigator.pushNamed(context, '/dashboard');
        break;
      case 2:
        break;
    }
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
            onLogoTap: () {
              Navigator.pushNamed(context, '/dashboard');
            },
            onNotificationsTap: () {
              Navigator.pushNamed(context, '/notifications');
            },
            onProfileTap: () {
              Navigator.pushNamed(context, '/profile');
            },
            avatar: 'assets/images/avatar.jpeg',
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            ProfileHeader(
              userName: _userData['firstName']!,
              avatarUrl: _userData['avatar']!,
              isEditMode: _isEditMode,
              onEditTap: _toggleEditMode,
              onAvatarTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Change avatar feature')),
                );
              },
            ),

            const SizedBox(height: 24),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    _buildSectionHeader('Personal Information'),
                    _buildSectionCard([
                      EditableFormField(
                        label: 'First Name',
                        initialValue: _userData['firstName']!,
                        controller: _firstNameController,
                        isReadOnly: !_isEditMode,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'First name is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      EditableFormField(
                        label: 'Surname',
                        initialValue: _userData['lastName']!,
                        controller: _lastNameController,
                        isReadOnly: !_isEditMode,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Surname is required';
                          }
                          return null;
                        },
                      ),
                    ]),

                    const SizedBox(height: 24),

                    _buildSectionHeader('Account Information'),
                    _buildSectionCard([
                      EditableFormField(
                        label: 'Email',
                        initialValue: _userData['email']!,
                        controller: _emailController,
                        isReadOnly: !_isEditMode,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Email is required';
                          }
                          if (!value.contains('@')) {
                            return 'Enter a valid email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      EditableFormField(
                        label: 'Password',
                        initialValue: _userData['password']!,
                        controller: _passwordController,
                        isPassword: true,
                        isReadOnly: !_isEditMode,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password is required';
                          }
                          if (value.length < 6) {
                            return 'Password must be at least 6 characters';
                          }
                          return null;
                        },
                      ),
                    ]),

                    const SizedBox(height: 24),

                    _buildSectionHeader('Location & Preferences'),
                    _buildSectionCard([
                      EditableFormField(
                        label: 'Country',
                        initialValue: _userData['country']!,
                        controller: _countryController,
                        isReadOnly: !_isEditMode,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Country is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      EditableFormField(
                        label: 'Language',
                        initialValue: _userData['language']!,
                        controller: _languageController,
                        isReadOnly: !_isEditMode,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Language is required';
                          }
                          return null;
                        },
                      ),
                    ]),

                    const SizedBox(height: 32),

                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _handleLogout,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red[400],
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.logout,
                                    color: Colors.white, size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'LOGOUT',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
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
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SlideMenuBar(
            selectedIndex: _bottomNavIndex,
            onTabChange: _handleBottomNavigation,
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 20,
            decoration: BoxDecoration(
              color: const Color(0xFF5E3B7D),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Colors.black,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE8E8E8),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: children,
      ),
    );
  }
}
