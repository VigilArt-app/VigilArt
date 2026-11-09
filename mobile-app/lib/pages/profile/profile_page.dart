import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../(api)/auth.dart';
import '../../(api)/legal.dart';
import '../../(api)/user.dart';
import '../../l10n/app_localizations.dart';
import '../../services/notification_preference.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_preferences.dart';
import '../../widgets/app_links.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/editable_from_field.dart';
import '../../widgets/header_bar.dart';
import '../../widgets/slide_menu_bar.dart';
import '../dmca/dmca_page.dart';
import '../login_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key, this.apiService});

  // Injected by tests.
  final ApiService? apiService;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isLoading = true;
  bool _isSaving = false;
  late final ApiService _apiService = widget.apiService ?? ApiService();

  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  String _avatar = 'assets/images/default_avatar.jpg';
  bool _pushEnabled = false;
  bool _mailEnabled = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    super.dispose();
  }

  void _snack(String message) {
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final l10n = AppLocalizations.of(context);
    try {
      final profile = await _apiService.fetchUserProfile();
      if (profile != null && mounted) {
        final avatar = await _resolveAvatar(profile['avatar']?.toString());
        setState(() {
          _firstName.text = profile['firstName']?.toString() ?? '';
          _lastName.text = profile['lastName']?.toString() ?? '';
          _email.text = profile['email']?.toString() ?? '';
          _pushEnabled = profile['mobileNotificationsEnabled'] == true;
          _mailEnabled = profile['mailNotificationsEnabled'] == true;
          _avatar = avatar;
        });
      } else if (profile == null) {
        _snack(l10n.profileFailedToLoad);
      }
    } catch (_) {
      _snack(l10n.profileFailedToLoad);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<String> _resolveAvatar(String? key) async {
    if (key == null || key.isEmpty) return 'assets/images/default_avatar.jpg';
    if (key.startsWith('http')) return key;
    if (key.startsWith('profiles/')) {
      final url = await _apiService.getAvatarDownloadUrl(key);
      if (url != null && url.isNotEmpty) return url;
    }
    return 'assets/images/default_avatar.jpg';
  }

  Future<void> _saveProfile() async {
    final l10n = AppLocalizations.of(context);
    setState(() => _isSaving = true);
    final updated = await _apiService.updateUserProfile({
      'firstName': _firstName.text.trim().isEmpty ? null : _firstName.text.trim(),
      'lastName': _lastName.text.trim().isEmpty ? null : _lastName.text.trim(),
    });
    if (!mounted) return;
    setState(() => _isSaving = false);
    _snack(updated == null ? l10n.profileErrorUpdating : l10n.profileUpdated);
  }

  Future<void> _uploadAvatar() async {
    final l10n = AppLocalizations.of(context);
    try {
      final image = await ImagePicker().pickImage(source: ImageSource.gallery);
      if (image == null) return;
      setState(() => _isLoading = true);
      final Uint8List bytes = await image.readAsBytes();
      final name = image.name.toLowerCase();
      final png = name.endsWith('.png');
      final filename = 'avatar_${DateTime.now().millisecondsSinceEpoch}.${png ? 'png' : 'jpeg'}';
      final upload = await _apiService.getAvatarUploadUrl(filename);
      if (upload != null && await _apiService.uploadAvatarToR2(bytes, png ? 'image/png' : 'image/jpeg', upload['presignedUrl'])) {
        final updated = await _apiService.updateUserProfile({'avatar': upload['storageKey']});
        if (updated != null) {
          await _apiService.secureStorage.write(key: ApiService.keyUserAvatar, value: upload['storageKey']);
          _snack(l10n.profileUpdated);
          await _load();
          return;
        }
      }
      _snack(l10n.profileFailedAvatar);
    } catch (_) {
      _snack(l10n.profileFailedAvatar);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _togglePush(bool value) async {
    final l10n = AppLocalizations.of(context);
    final ok = await updateMobileNotifications(value, api: _apiService);
    if (!mounted) return;
    if (ok) {
      setState(() => _pushEnabled = value);
    } else {
      _snack(value ? l10n.notificationsDenied : l10n.notificationsFailed);
    }
  }

  Future<void> _toggleMail(bool value) async {
    final l10n = AppLocalizations.of(context);
    final updated = await _apiService.updateUserProfile({'mailNotificationsEnabled': value});
    if (!mounted) return;
    if (updated == null) {
      _snack(l10n.notificationsFailed);
    } else {
      setState(() => _mailEnabled = value);
    }
  }

  Future<void> _confirmLogout() async {
    final l10n = AppLocalizations.of(context);
    final ok = await showAdaptiveDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog.adaptive(
        title: Text(l10n.logoutConfirmTitle),
        content: Text(l10n.logoutConfirmBody),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l10n.logout, style: TextStyle(color: ctx.colors.error))),
        ],
      ),
    );
    if (ok == true) await _logout();
  }

  Future<void> _logout() async {
    try {
      await _apiService.logout();
    } catch (_) {
      await _apiService.clearLocalSession();
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLoggedIn', false);
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginPage()), (_) => false);
  }

  Future<void> _confirmDeleteAccount() async {
    final l10n = AppLocalizations.of(context);
    final ok = await showAdaptiveDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog.adaptive(
        title: Text(l10n.deleteAccountConfirm),
        content: Text('${l10n.deleteAccountWarning}\n\n${l10n.deleteAccountIrreversible}'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l10n.deletePermanently, style: TextStyle(color: ctx.colors.error))),
        ],
      ),
    );
    if (ok != true) return;
    final deleted = await _apiService.deleteUserAccount();
    if (!mounted) return;
    if (deleted) {
      _snack(l10n.accountDeleted);
      await _logout();
    } else {
      _snack(l10n.deleteAccountFailed);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final c = context.colors;
    final prefs = context.watch<AppPreferences>();
    final theme = Theme.of(context);

    Widget section(String title, Widget child, {String? subtitle}) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: theme.textTheme.titleMedium),
            if (subtitle != null) Text(subtitle, style: TextStyle(color: c.textMuted, fontSize: 13)),
            const SizedBox(height: 8),
            child,
          ],
        );

    Widget segmented<T>(List<(T, String, IconData?)> options, T selected, ValueChanged<T> onChanged) => Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(color: c.surfaceSubtle, borderRadius: BorderRadius.circular(8)),
          child: Row(
            children: [
              for (final o in options)
                Expanded(
                  child: Semantics(
                    button: true,
                    selected: o.$1 == selected,
                    label: o.$2,
                    excludeSemantics: true,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(6),
                      onTap: () => onChanged(o.$1),
                      child: Container(
                        constraints: const BoxConstraints(minHeight: 44),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(color: o.$1 == selected ? c.primary : Colors.transparent, borderRadius: BorderRadius.circular(6)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (o.$3 != null) ...[Icon(o.$3, size: 18, color: o.$1 == selected ? c.onPrimary : c.text), const SizedBox(width: 6)],
                            Flexible(child: Text(o.$2, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: o.$1 == selected ? c.onPrimary : c.text))),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );

    Widget switchRow(String title, String description, bool value, ValueChanged<bool> onChanged) => MergeSemantics(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
            subtitle: Text(description, style: TextStyle(color: c.textMuted, fontSize: 13)),
            trailing: Switch(value: value, onChanged: onChanged),
          ),
        );

    Widget linkRow(IconData icon, String label, Uri url) => ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 4),
          leading: Icon(icon, size: 20, color: c.primaryText),
          title: Text(label),
          trailing: Icon(LucideIcons.externalLink, size: 18, color: c.textMuted),
          onTap: () => openExternalUrl(context, url),
        );

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: SafeArea(
          bottom: false,
          child: VigilArtHeaderBar(
            onLogoTap: () => Navigator.pushReplacementNamed(context, '/dashboard'),
            onProfileTap: () {},
            avatar: _avatar,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(l10n.profileWelcome, style: theme.textTheme.headlineMedium),
                  const SizedBox(height: 16),
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: c.surfaceSubtle,
                          backgroundImage: _avatar.startsWith('http') ? NetworkImage(_avatar) as ImageProvider : AssetImage(_avatar),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: _uploadAvatar,
                          style: OutlinedButton.styleFrom(minimumSize: const Size(0, 48)),
                          icon: const Icon(LucideIcons.upload, size: 18),
                          label: Text(l10n.profileUploadPicture),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: EditableFormField(label: l10n.profileFirstName, controller: _firstName)),
                      const SizedBox(width: 8),
                      Expanded(child: EditableFormField(label: l10n.profileLastName, controller: _lastName)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  EditableFormField(label: l10n.profileEmail, controller: _email, isReadOnly: true, keyboardType: TextInputType.emailAddress),
                  const SizedBox(height: 12),
                  CustomButton(text: l10n.profileSave, isLoading: _isSaving, onPressed: _saveProfile),
                  const SizedBox(height: 24),
                  section(
                    l10n.notificationsTitle,
                    Column(children: [
                      switchRow(l10n.notifMobileTitle, l10n.notifMobileDescription, _pushEnabled, _togglePush),
                      switchRow(l10n.notifMailTitle, l10n.notifMailDescription, _mailEnabled, _toggleMail),
                    ]),
                  ),
                  const SizedBox(height: 24),
                  section(
                    l10n.preferencesTitle,
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l10n.themeLabel, style: theme.textTheme.labelMedium),
                        const SizedBox(height: 8),
                        segmented<ThemeMode>(
                          [
                            (ThemeMode.light, l10n.themeLight, LucideIcons.sun),
                            (ThemeMode.dark, l10n.themeDark, LucideIcons.moon),
                            (ThemeMode.system, l10n.themeSystem, LucideIcons.monitor),
                          ],
                          prefs.themeMode,
                          prefs.setThemeMode,
                        ),
                        const SizedBox(height: 16),
                        Text(l10n.languageLabel, style: theme.textTheme.labelMedium),
                        const SizedBox(height: 8),
                        segmented<String>(
                          const [('fr', 'Français', null), ('en', 'English', null)],
                          prefs.locale?.languageCode ?? Localizations.localeOf(context).languageCode,
                          (code) => prefs.setLocale(Locale(code)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  linkRow(LucideIcons.circleHelp, l10n.linkFaq, faqUrl),
                  linkRow(LucideIcons.shield, l10n.linkPrivacy, privacyUrl),
                  linkRow(LucideIcons.scrollText, l10n.linkTerms, termsUrl),
                  linkRow(LucideIcons.fileText, l10n.linkLegalNotice, legalNoticeUrl),
                  const SizedBox(height: 16),
                  CustomButton(text: l10n.logout, icon: const Icon(LucideIcons.logOut), showIcon: true, isOutlined: true, onPressed: _confirmLogout),
                  const SizedBox(height: 8),
                  CustomButton(text: l10n.deleteAccount, icon: const Icon(LucideIcons.trash2), showIcon: true, isOutlined: true, destructive: true, onPressed: _confirmDeleteAccount),
                ],
              ),
            ),
      bottomNavigationBar: SlideMenuBar(
        selectedIndex: 3,
        onTabChange: (index) {
          switch (index) {
            case 0:
              Navigator.pushReplacementNamed(context, '/gallery');
            case 1:
              Navigator.pushReplacementNamed(context, '/dashboard');
            case 2:
              Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const DmcaPage(artworkPrefill: {})));
          }
        },
      ),
    );
  }
}
