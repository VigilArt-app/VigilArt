import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../(api)/auth.dart';
import '../l10n/app_localizations.dart';
import '../services/notification_service.dart';
import '../theme/app_colors.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input_field.dart';
import '../widgets/logo_header.dart';
import 'dashboard/dashboard.dart';
import 'signup_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, this.apiService});

  // Injected by tests; the app uses the real API.
  final ApiService? apiService;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late final ApiService apiService = widget.apiService ?? ApiService();
  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleContinue() async {
    if (!_formKey.currentState!.validate() || _submitting) return;
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _submitting = true);
    try {
      final response = await apiService.login(_emailController.text.trim(), _passwordController.text.trim());
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('isLoggedIn', true);
        if (!mounted) return;
        if (prefs.getBool('mobileNotificationsEnabled') == true) {
          NotificationService().initialize();
        }
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const DashboardPage()));
      } else {
        messenger.showSnackBar(SnackBar(content: Text(l10n.loginErrorFailed)));
      }
    } catch (_) {
      messenger.showSnackBar(SnackBar(content: Text(l10n.loginErrorUnexpected)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _handleSignup() {
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const SignupPage()));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(child: LogoHeader(width: 210)),
                    const SizedBox(height: 24),
                    Text('${l10n.loginWelcome} ${l10n.loginOn} VigilArt',
                        textAlign: TextAlign.center, style: theme.textTheme.bodyLarge?.copyWith(color: c.textMuted)),
                    const SizedBox(height: 4),
                    Text(l10n.loginGreetings, textAlign: TextAlign.center, style: theme.textTheme.headlineMedium),
                    const SizedBox(height: 24),
                    CustomInputField(
                      labelText: l10n.loginEmail,
                      hintText: l10n.loginPlaceholderEmail,
                      prefixIcon: LucideIcons.mail,
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      textInputAction: TextInputAction.next,
                      validator: (value) {
                        final v = value?.trim() ?? '';
                        if (v.isEmpty || !v.contains('@')) return l10n.emailInvalid;
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    CustomInputField(
                      labelText: l10n.loginPassword,
                      hintText: l10n.loginPlaceholderPassword,
                      isPassword: true,
                      controller: _passwordController,
                      autofillHints: const [AutofillHints.password],
                      textInputAction: TextInputAction.done,
                      validator: (value) => (value == null || value.isEmpty) ? l10n.fieldRequired : null,
                    ),
                    const SizedBox(height: 24),
                    CustomButton(
                      text: _submitting ? l10n.loginSigningIn : l10n.loginSignIn,
                      isLoading: _submitting,
                      onPressed: _handleContinue,
                    ),
                    const SizedBox(height: 24),
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text('${l10n.loginNoAccount} '),
                        TextButton(
                          onPressed: _handleSignup,
                          child: Text(l10n.loginSignUp, style: const TextStyle(decoration: TextDecoration.underline)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
