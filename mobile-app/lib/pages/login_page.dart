import 'package:VigilArt/pages/dashboard/dashboard.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'signup_page.dart';
import '../widgets/logo_header.dart';
import '../widgets/custom_input_field.dart';
import '../widgets/custom_button.dart';
import '../(api)/auth.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  final ApiService apiService = ApiService();
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleContinue() async {
    if (_formKey.currentState!.validate()) {
      String email = _emailController.text.trim();
      String password = _passwordController.text.trim();

      try {
        final response = await apiService.login(email, password);

        if (response.statusCode == 200) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const DashboardPage()),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Login failed with status: ${response.statusCode}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error occurred: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _handleSignup() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const SignupPage()),
    );
  }

  void _handleGoogleSignIn() {
    print('Google Sign-In pressed');
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
                    'Nice to see again !',
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
                  CustomButton(
                    text: 'Continue',
                    onPressed: _handleContinue,
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
                    text: "Doesn't have an account ? Sign Up",
                    onPressed: _handleSignup,
                    isOutlined: true,
                    backgroundColor: Colors.black87,
                  ),
                  const SizedBox(height: 24),
                  CustomButton(
                    text: 'Continue with Google',
                    onPressed: _handleGoogleSignIn,
                    icon: FontAwesomeIcons.google,
                    showIcon: true,
                    isOutlined: true,
                    backgroundColor: Colors.black87,
                  ),
                  const SizedBox(height: 24),
                  RichText(
                    textAlign: TextAlign.center,
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.black54,
                      ),
                      children: [
                        TextSpan(text: 'By clicking continue, you agree to our '),
                        TextSpan(
                          text: 'Terms of Service',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                        TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ],
                    ),
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
