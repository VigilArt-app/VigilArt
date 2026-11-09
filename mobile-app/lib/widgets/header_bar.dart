import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../(api)/auth.dart';
import '../(api)/user.dart';
import '../l10n/app_localizations.dart';
import '../services/notification_preference.dart';
import '../theme/app_colors.dart';
import 'logo_header.dart';

/// Top bar: logo, wordmark, notification switch and profile avatar.
class VigilArtHeaderBar extends StatefulWidget {
  final VoidCallback onLogoTap;
  final VoidCallback onProfileTap;
  final String avatar;

  const VigilArtHeaderBar({
    super.key,
    required this.onLogoTap,
    required this.onProfileTap,
    required this.avatar,
  });

  @override
  State<VigilArtHeaderBar> createState() => _VigilArtHeaderBarState();
}

class _VigilArtHeaderBarState extends State<VigilArtHeaderBar> {
  bool _enabled = false;
  bool _toggling = false;

  @override
  void initState() {
    super.initState();
    _loadState();
  }

  Future<void> _loadState() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) setState(() => _enabled = prefs.getBool('mobileNotificationsEnabled') ?? false);
    try {
      final profile = await ApiService().fetchUserProfile();
      if (profile != null && mounted) {
        final enabled = profile['mobileNotificationsEnabled'] == true;
        await prefs.setBool('mobileNotificationsEnabled', enabled);
        setState(() => _enabled = enabled);
      }
    } catch (e) {
      debugPrint('Error syncing notification state: $e');
    }
  }

  /// Short explanation before the system permission prompt; the app works
  /// without notifications, so the user can decline.
  Future<bool> _confirmTurnOn() async {
    final l10n = AppLocalizations.of(context);
    final result = await showAdaptiveDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog.adaptive(
        title: Text(l10n.notifPromptTitle),
        content: Text(l10n.notifMobileDescription),
        actions: [
          adaptiveAction(ctx, l10n.notifPromptNotNow, false),
          adaptiveAction(ctx, l10n.notifPromptEnable, true),
        ],
      ),
    );
    return result == true;
  }

  Widget adaptiveAction(BuildContext ctx, String label, bool value) =>
      TextButton(onPressed: () => Navigator.of(ctx).pop(value), child: Text(label));

  Future<void> _toggle() async {
    if (_toggling) return;
    final l10n = AppLocalizations.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final target = !_enabled;
    if (target && !await _confirmTurnOn()) return;
    setState(() => _toggling = true);

    try {
      final ok = await updateMobileNotifications(target);
      if (!ok) {
        messenger.showSnackBar(SnackBar(content: Text(l10n.notificationsFailed)));
        return;
      }
      if (mounted) setState(() => _enabled = target);
      messenger.showSnackBar(SnackBar(
        content: Text(target ? l10n.notificationsEnabled : l10n.notificationsDisabled),
        duration: const Duration(seconds: 2),
      ));
    } finally {
      if (mounted) setState(() => _toggling = false);
    }
  }

  ImageProvider _avatarImage() {
    if (widget.avatar.isEmpty) return const AssetImage('assets/images/default_avatar.jpg');
    if (widget.avatar.startsWith('http')) return NetworkImage(widget.avatar);
    return AssetImage(widget.avatar);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.colors;
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: c.surface,
        border: Border(bottom: BorderSide(color: c.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Semantics(
            button: true,
            label: 'VigilArt',
            excludeSemantics: true,
            child: InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: widget.onLogoTap,
              child: Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: c.primaryTint, borderRadius: BorderRadius.circular(8)),
                child: const LogoMark(size: 32),
              ),
            ),
          ),
          const LogoHeader(width: 126),
          Row(
            children: [
              Semantics(
                button: true,
                toggled: _enabled,
                label: l10n.notifMobileTitle,
                excludeSemantics: true,
                child: InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: _toggle,
                  child: Container(
                    width: 48,
                    height: 48,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: c.surfaceSubtle,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: c.fieldBorder),
                    ),
                    child: _toggling
                        ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))
                        : Icon(
                            _enabled ? LucideIcons.bell : LucideIcons.bellOff,
                            size: 22,
                            color: _enabled ? c.primaryText : c.textMuted,
                          ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Semantics(
                button: true,
                label: l10n.navProfile,
                excludeSemantics: true,
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: widget.onProfileTap,
                  child: Container(
                    width: 48,
                    height: 48,
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: c.primary, width: 2)),
                    child: CircleAvatar(backgroundColor: c.surfaceSubtle, backgroundImage: _avatarImage()),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
