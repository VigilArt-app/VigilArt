import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import '../(api)/auth.dart';
import '../(api)/legal.dart';
import '../l10n/app_localizations.dart';
import '../theme/app_colors.dart';
import '../validators/password_rules.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input_field.dart';
import '../widgets/logo_header.dart';
import '../widgets/markup_text.dart';
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

  // Unchecked by default: the user must tick it themselves.
  bool _acceptedTerms = false;
  bool _showConsentError = false;
  bool _submitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _open(Uri url) {
    (widget.openLink ?? (uri) => launchUrl(uri, mode: LaunchMode.externalApplication))(url);
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate() || _submitting) return;
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (password != _confirmPasswordController.text.trim()) {
      messenger.showSnackBar(SnackBar(content: Text(l10n.signupPasswordsDoNotMatch)));
      return;
    }
    if (!_acceptedTerms) {
      setState(() => _showConsentError = true);
      return;
    }

    setState(() => _submitting = true);
    try {
      final response = await apiService.signup(email, password);
      if (response.statusCode == 201) {
        if (mounted) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const LoginPage()));
        }
      } else {
        messenger.showSnackBar(SnackBar(content: Text(_parseSignupError(l10n, response))));
      }
    } catch (e) {
      debugPrint('Signup Exception: $e');
      messenger.showSnackBar(SnackBar(content: Text(l10n.connectionError)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String _parseSignupError(AppLocalizations l10n, http.Response response) {
    final status = response.statusCode;
    if (status == 409) return l10n.accountExists;
    if (status == 400) {
      final message = _serverMessage(response);
      // The app ships the document versions, so a newer policy needs an app update.
      if (message.contains('termsVersion') || message.contains('privacyVersion')) {
        return l10n.policyChanged;
      }
      if (message.contains('acceptedTerms')) return l10n.signupConsentRequired;
      return message.isNotEmpty ? stripFieldPrefix(message) : l10n.signupFailed;
    }
    if (status == 403) {
      final message = _serverMessage(response);
      return message.isNotEmpty ? message : l10n.signupDisabled;
    }
    if (status >= 500) return l10n.signupErrorUnexpected;
    return l10n.signupFailed;
  }

  String _serverMessage(http.Response response) {
    try {
      final message = jsonDecode(response.body)['message'];
      if (message is String) return message;
      if (message is List) return message.join('; ');
      return '';
    } catch (_) {
      return '';
    }
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
                    const Center(child: LogoHeader(width: 180)),
                    const SizedBox(height: 16),
                    Text('${l10n.signupWelcome} ${l10n.signupOn} VigilArt',
                        textAlign: TextAlign.center, style: theme.textTheme.bodyLarge?.copyWith(color: c.textMuted)),
                    const SizedBox(height: 4),
                    Text(l10n.signupReady, textAlign: TextAlign.center, style: theme.textTheme.headlineMedium),
                    const SizedBox(height: 24),
                    CustomInputField(
                      labelText: l10n.signupEmail,
                      hintText: l10n.signupPlaceholderEmail,
                      prefixIcon: LucideIcons.mail,
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      validator: (value) {
                        final v = value?.trim() ?? '';
                        if (v.isEmpty || !v.contains('@')) return l10n.emailInvalid;
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    CustomInputField(
                      labelText: l10n.signupPassword,
                      hintText: '••••••••',
                      isPassword: true,
                      controller: _passwordController,
                      textInputAction: TextInputAction.next,
                      validator: (value) {
                        final problems = passwordProblems(l10n, value ?? '');
                        return problems.isEmpty ? null : problems.join('\n');
                      },
                    ),
                    const SizedBox(height: 16),
                    CustomInputField(
                      labelText: l10n.signupConfirmPassword,
                      hintText: '••••••••',
                      isPassword: true,
                      controller: _confirmPasswordController,
                      textInputAction: TextInputAction.done,
                      validator: (value) => (value == null || value.isEmpty) ? l10n.fieldRequired : null,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          key: const Key('signup-consent'),
                          value: _acceptedTerms,
                          onChanged: (v) => setState(() {
                            _acceptedTerms = v ?? false;
                            if (_acceptedTerms) _showConsentError = false;
                          }),
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: MarkupText(
                              text: l10n.signupConsent,
                              links: {'terms': () => _open(termsUrl), 'privacy': () => _open(privacyUrl)},
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_showConsentError)
                      Padding(
                        padding: const EdgeInsets.only(left: 12, top: 4),
                        child: Text(l10n.signupConsentRequired, style: TextStyle(color: c.error, fontSize: 12)),
                      ),
                    const SizedBox(height: 16),
                    CustomButton(
                      text: _submitting ? l10n.signupSigningUp : l10n.signupSignUp,
                      isLoading: _submitting,
                      onPressed: _handleSignup,
                    ),
                    const SizedBox(height: 24),
                    Wrap(
                      alignment: WrapAlignment.center,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text('${l10n.signupAlreadyHaveAccount} '),
                        TextButton(
                          onPressed: () => Navigator.pushReplacement(
                              context, MaterialPageRoute(builder: (context) => const LoginPage())),
                          child: Text(l10n.signupSignIn, style: const TextStyle(decoration: TextDecoration.underline)),
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
