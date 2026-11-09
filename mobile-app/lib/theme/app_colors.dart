import 'package:flutter/material.dart';

/// VigilArt colour tokens (design system "VigilArt Mobile", AAA palette).
///
/// Text pairs reach 7:1 and non-text marks 3:1 in both themes. Brand colours,
/// surfaces and the category palette are the same as the website; only the
/// tokens whose website value is under 7:1 are a shade darker or lighter.
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.bg,
    required this.surface,
    required this.surfaceSubtle,
    required this.border,
    required this.fieldBorder,
    required this.text,
    required this.textMuted,
    required this.primary,
    required this.onPrimary,
    required this.primaryText,
    required this.primaryTint,
    required this.onPrimaryTint,
    required this.focusRing,
    required this.error,
    required this.onError,
    required this.errorBg,
    required this.success,
    required this.successBg,
    required this.info,
    required this.infoBg,
    required this.warning,
    required this.warningBg,
    required this.badgeMatches,
    required this.onBadgeMatches,
    required this.badgeNoMatches,
    required this.onBadgeNoMatches,
    required this.badgeNotScanned,
    required this.onBadgeNotScanned,
    required this.badgeUnavailable,
    required this.onBadgeUnavailable,
    required this.badgeBlacklisted,
    required this.onBadgeBlacklisted,
    required this.scrim,
    required this.artworkOverlay,
    required this.categories,
  });

  final Color bg;
  final Color surface;
  final Color surfaceSubtle;
  final Color border;
  final Color fieldBorder;
  final Color text;
  final Color textMuted;
  final Color primary;
  final Color onPrimary;
  final Color primaryText;
  final Color primaryTint;
  final Color onPrimaryTint;
  final Color focusRing;
  final Color error;
  final Color onError;
  final Color errorBg;
  final Color success;
  final Color successBg;
  final Color info;
  final Color infoBg;
  final Color warning;
  final Color warningBg;
  final Color badgeMatches;
  final Color onBadgeMatches;
  final Color badgeNoMatches;
  final Color onBadgeNoMatches;
  final Color badgeNotScanned;
  final Color onBadgeNotScanned;
  final Color badgeUnavailable;
  final Color onBadgeUnavailable;
  final Color badgeBlacklisted;
  final Color onBadgeBlacklisted;
  final Color scrim;
  final Color artworkOverlay;

  /// Fixed order of the website categories: SOCIAL, ART_PLATFORMS,
  /// MARKETPLACES, BLOG, MEDIA, SEARCH, OTHER.
  final List<Color> categories;

  static const List<String> categoryOrder = <String>[
    'SOCIAL',
    'ART_PLATFORMS',
    'MARKETPLACES',
    'BLOG',
    'MEDIA',
    'SEARCH',
    'OTHER',
  ];

  Color categoryColor(String category) {
    final index = categoryOrder.indexOf(category);
    return categories[index < 0 ? categoryOrder.length - 1 : index];
  }

  static const AppColors light = AppColors(
    bg: Color(0xFFFFFFFF),
    surface: Color(0xFFFFFFFF),
    surfaceSubtle: Color(0xFFF5F5F5),
    border: Color(0xFFE5E5E5),
    fieldBorder: Color(0xFF6E6E6E),
    text: Color(0xFF0A0A0A),
    textMuted: Color(0xFF525252),
    primary: Color(0xFF5E3B7D),
    onPrimary: Color(0xFFFFFFFF),
    primaryText: Color(0xFF5E3B7D),
    primaryTint: Color(0xFFF1EBF6),
    onPrimaryTint: Color(0xFF5E3B7D),
    focusRing: Color(0xFF404040),
    error: Color(0xFFA00008),
    onError: Color(0xFFFFFFFF),
    errorBg: Color(0xFFFDECEC),
    success: Color(0xFF005C00),
    successBg: Color(0xFFEAF5EA),
    info: Color(0xFF1A4F94),
    infoBg: Color(0xFFEAF1FB),
    warning: Color(0xFF7A3000),
    warningBg: Color(0xFFFFFBEB),
    badgeMatches: Color(0xFF0F3FB8),
    onBadgeMatches: Color(0xFFFFFFFF),
    badgeNoMatches: Color(0xFF475569),
    onBadgeNoMatches: Color(0xFFFFFFFF),
    badgeNotScanned: Color(0xFF525252),
    onBadgeNotScanned: Color(0xFFFFFFFF),
    badgeUnavailable: Color(0xFF525252),
    onBadgeUnavailable: Color(0xFFFFFFFF),
    badgeBlacklisted: Color(0xFFFCBB00),
    onBadgeBlacklisted: Color(0xFF0A0A0A),
    scrim: Color(0x990A0A0A),
    artworkOverlay: Color(0xD10A0A0A),
    categories: <Color>[
      Color(0xFF3A6DB5),
      Color(0xFF7A7A1A),
      Color(0xFFC2507F),
      Color(0xFFA97A12),
      Color(0xFF00897A),
      Color(0xFFC45F31),
      Color(0xFF8F8F8F),
    ],
  );

  static const AppColors dark = AppColors(
    bg: Color(0xFF0A0A0A),
    surface: Color(0xFF171717),
    surfaceSubtle: Color(0xFF262626),
    border: Color(0xFF2E2E2E),
    fieldBorder: Color(0xFF949494),
    text: Color(0xFFFAFAFA),
    textMuted: Color(0xFFB8B8B8),
    primary: Color(0xFFB692DB),
    onPrimary: Color(0xFF0A0A0A),
    primaryText: Color(0xFFC9AEE8),
    primaryTint: Color(0xFF33244A),
    onPrimaryTint: Color(0xFFD9C7EB),
    focusRing: Color(0xFFFAFAFA),
    error: Color(0xFFFF9A9C),
    onError: Color(0xFF0A0A0A),
    errorBg: Color(0xFF2A1414),
    success: Color(0xFF7AD983),
    successBg: Color(0xFF13261A),
    info: Color(0xFF8FBCF2),
    infoBg: Color(0xFF0F1D30),
    warning: Color(0xFFFCBB00),
    warningBg: Color(0xFF261D0A),
    badgeMatches: Color(0xFFA9C4FF),
    onBadgeMatches: Color(0xFF0A0A0A),
    badgeNoMatches: Color(0xFFA3B0C4),
    onBadgeNoMatches: Color(0xFF0A0A0A),
    badgeNotScanned: Color(0xFFA3A3A3),
    onBadgeNotScanned: Color(0xFF0A0A0A),
    badgeUnavailable: Color(0xFFB8B8B8),
    onBadgeUnavailable: Color(0xFF0A0A0A),
    badgeBlacklisted: Color(0xFFFCBB00),
    onBadgeBlacklisted: Color(0xFF0A0A0A),
    scrim: Color(0xB3000000),
    artworkOverlay: Color(0xD10A0A0A),
    categories: <Color>[
      Color(0xFF5B8FD6),
      Color(0xFF9A9A3A),
      Color(0xFFD0668F),
      Color(0xFFB8862A),
      Color(0xFF2AA595),
      Color(0xFFD77650),
      Color(0xFF8F8F8F),
    ],
  );

  @override
  AppColors copyWith() => this;

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) =>
      other is AppColors && t >= 0.5 ? other : this;
}

extension AppColorsContext on BuildContext {
  AppColors get colors => Theme.of(this).extension<AppColors>()!;
}
