import 'dart:convert';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../widgets/logo_header.dart';
import '../widgets/custom_input_field.dart';
import '../widgets/custom_button.dart';
import '../(api)/auth.dart';
import '../(api)/legal.dart';
import 'login_page.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key, this.apiService, this.openLink});

  // Injected by tests; the app uses the real API and browser.
  final ApiService? apiService;
  final Future<bool> Function(Uri url)? openLink;

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final _formKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  late final ApiService apiService = widget.apiService ?? ApiService();
  late final TapGestureRecognizer _termsTap = TapGestureRecognizer()..onTap = () => _open(termsUrl);
  late final TapGestureRecognizer _privacyTap = TapGestureRecognizer()..onTap = () => _open(privacyUrl);

  // Unchecked by default: the user must tick it themselves.
  bool _acceptedTerms = false;
  bool _showConsentError = false;

  static const String _consentRequired =
      'You must accept the Terms of Service and acknowledge the Privacy Policy.';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _termsTap.dispose();
    _privacyTap.dispose();
    super.dispose();
  }

  void _open(Uri url) {
    (widget.openLink ?? (uri) => launchUrl(uri, mode: LaunchMode.externalApplication))(url);
  }

  void _handleSignup() async {
    if (_formKey.currentState!.validate()) {
      String email = _emailController.text.trim();
      String password = _passwordController.text.trim();
      String confirmPassword = _confirmPasswordController.text.trim();

      if (password != confirmPassword) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Passwords do not match'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      if (!_acceptedTerms) {
        setState(() => _showConsentError = true);
        return;
      }

      try {
        final response = await apiService.signup(email, password);

        if (response.statusCode == 201) {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const LoginPage()),
            );
          }
        } else {
          final errorMessage = _parseSignupError(response);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(errorMessage), backgroundColor: Colors.red),
            );
          }
        }
      } catch (e) {
        debugPrint('Signup Exception: $e');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('A network error occurred. Please check your connection.'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  String _parseSignupError(http.Response response) {
    final statusCode = response.statusCode;
    if (statusCode == 409) return 'An account with this email address already exists.';
    if (statusCode == 400) {
      final message = _serverMessage(response);
      // The app ships the document versions, so a newer policy needs an app update.
      if (message.contains('termsVersion') || message.contains('privacyVersion')) {
        return 'Our Terms of Service or Privacy Policy changed. Update the app to sign up.';
      }
      if (message.contains('acceptedTerms')) return _consentRequired;
      return message.isNotEmpty ? message : 'Invalid information provided. Please check your details.';
    }
    if (statusCode >= 500) return 'Server error. Please try again later.';
    return 'Signup failed. Please try again.';
  }

  String _serverMessage(http.Response response) {
    try {
      final message = jsonDecode(response.body)['message'];
      return message is String ? message : '';
    } catch (_) {
      return '';
    }
  }

  void _handleLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFFFF5E6),
              Color(0xFFFFE6E6),
              Color(0xFFFFEECC),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 60),
                  const LogoHeader(
                    logoImagePath: 'assets/icons/vigilart_app_icon.png',
                    appName: 'VigilArt',
                    logoSize: 60,
                  ),
                  const SizedBox(height: 40),
                  const Text(
                    'Create your account',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 32),
                  CustomInputField(
                    labelText: 'Email address',
                    hintText: 'email@domain.com',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  CustomInputField(
                    labelText: 'Password',
                    hintText: '••••••••',
                    controller: _passwordController,
                    isPassword: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      if (value.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  CustomInputField(
                    labelText: 'Confirm Password',
                    hintText: '••••••••',
                    controller: _confirmPasswordController,
                    isPassword: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please confirm your password';
                      }
                      if (value != _passwordController.text) {
                        return 'Passwords do not match';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Checkbox(
                        key: const Key('signup-consent'),
                        value: _acceptedTerms,
                        onChanged: (value) => setState(() {
                          _acceptedTerms = value ?? false;
                          if (_acceptedTerms) _showConsentError = false;
                        }),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text.rich(
                            TextSpan(
                              style: const TextStyle(fontSize: 13, color: Colors.black87),
                              children: [
                                const TextSpan(text: 'I accept the '),
                                TextSpan(
                                  text: 'Terms of Service',
                                  style: const TextStyle(fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                                  recognizer: _termsTap,
                                ),
                                const TextSpan(text: ' and acknowledge the '),
                                TextSpan(
                                  text: 'Privacy Policy',
                                  style: const TextStyle(fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                                  recognizer: _privacyTap,
                                ),
                                const TextSpan(text: '.'),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (_showConsentError)
                    const Padding(
                      padding: EdgeInsets.only(left: 12, top: 4),
                      child: Text(_consentRequired, style: TextStyle(color: Colors.red, fontSize: 12)),
                    ),
                  const SizedBox(height: 20),
                  CustomButton(
                    text: 'Sign Up',
                    onPressed: _handleSignup,
                    backgroundColor: Colors.black87,
                  ),
                  const SizedBox(height: 24),
                  const Row(
                    children: [
                      Expanded(child: Divider(color: Colors.black26)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16.0),
                        child: Text(
                          'or',
                          style: TextStyle(
                            color: Colors.black54,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.black26)),
                    ],
                  ),
                  const SizedBox(height: 24),
                  CustomButton(
                    text: 'Already have an account? Login',
                    onPressed: _handleLogin,
                    isOutlined: true,
                    backgroundColor: Colors.black87,
                  ),
                  const SizedBox(height: 24),
                  CustomButton(
                    text: 'Continue with Google',
                    onPressed: () {
                      debugPrint('Google Sign-In pressed');
                    },
                    icon: const FaIcon(FontAwesomeIcons.google), 
                    showIcon: true,
                    isOutlined: true,
                    backgroundColor: Colors.black87,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}