import 'package:VigilArt/pages/login_page.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../widgets/logo_header.dart';
import '../widgets/custom_input_field.dart';
import '../widgets/custom_button.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({Key? key}) : super(key: key);

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }


  void _handleLogin() async {
    Navigator.pushReplacement(
      context, 
      MaterialPageRoute(builder: (context) => const LoginPage()),
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
                    'Welcome !',
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
                    labelText: 'Confirm password',
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
                  
                  const SizedBox(height: 32),
                  
                  CustomButton(
                    text: 'Continue',
                    onPressed: () => {},
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
                    text: "Already have an account ? Login",
                    onPressed: _handleLogin,
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
