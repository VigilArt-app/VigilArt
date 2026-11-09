import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vigilart/theme/app_colors.dart';
import 'package:vigilart/theme/app_preferences.dart';

double _luminance(Color c) {
  double ch(double v) => v <= 0.03928 ? v / 12.92 : math.pow((v + 0.055) / 1.055, 2.4).toDouble();
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}

double contrast(Color a, Color b) {
  final x = _luminance(a), y = _luminance(b);
  return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
}

void main() {
  group('AAA colours', () {
    for (final entry in {'light': AppColors.light, 'dark': AppColors.dark}.entries) {
      final c = entry.value;
      test('${entry.key}: text pairs reach 7:1', () {
        final pairs = <String, double>{
          'text/bg': contrast(c.text, c.bg),
          'text/surface': contrast(c.text, c.surface),
          'text/subtle': contrast(c.text, c.surfaceSubtle),
          'muted/bg': contrast(c.textMuted, c.bg),
          'muted/surface': contrast(c.textMuted, c.surface),
          'muted/subtle': contrast(c.textMuted, c.surfaceSubtle),
          'primaryText/bg': contrast(c.primaryText, c.bg),
          'primaryText/surface': contrast(c.primaryText, c.surface),
          'primaryText/subtle': contrast(c.primaryText, c.surfaceSubtle),
          'onPrimary/primary': contrast(c.onPrimary, c.primary),
          'onPrimaryTint/tint': contrast(c.onPrimaryTint, c.primaryTint),
          'error/bg': contrast(c.error, c.bg),
          'error/errorBg': contrast(c.error, c.errorBg),
          'onError/error': contrast(c.onError, c.error),
          'success/successBg': contrast(c.success, c.successBg),
          'info/bg': contrast(c.info, c.bg),
          'warning/warningBg': contrast(c.warning, c.warningBg),
          'matches badge': contrast(c.onBadgeMatches, c.badgeMatches),
          'no matches badge': contrast(c.onBadgeNoMatches, c.badgeNoMatches),
          'not scanned badge': contrast(c.onBadgeNotScanned, c.badgeNotScanned),
          'unavailable badge': contrast(c.onBadgeUnavailable, c.badgeUnavailable),
          'blacklisted badge': contrast(c.onBadgeBlacklisted, c.badgeBlacklisted),
        };
        pairs.forEach((name, ratio) => expect(ratio, greaterThanOrEqualTo(7.0), reason: '$name is ${ratio.toStringAsFixed(2)}:1'));
      });

      test('${entry.key}: non-text marks reach 3:1', () {
        final marks = <String, double>{
          'field border/bg': contrast(c.fieldBorder, c.bg),
          'field border/surface': contrast(c.fieldBorder, c.surface),
          'field border/subtle': contrast(c.fieldBorder, c.surfaceSubtle),
          'focus ring/bg': contrast(c.focusRing, c.bg),
          'primary/surface': contrast(c.primary, c.surface),
          for (var i = 0; i < c.categories.length; i++) 'category $i/surface': contrast(c.categories[i], c.surface),
        };
        marks.forEach((name, ratio) => expect(ratio, greaterThanOrEqualTo(3.0), reason: '$name is ${ratio.toStringAsFixed(2)}:1'));
      });
    }

    test('brand colours match the website', () {
      expect(AppColors.light.primary, const Color(0xFF5E3B7D));
      expect(AppColors.dark.primary, const Color(0xFFB692DB));
      expect(AppColors.light.categories.first, const Color(0xFF3A6DB5));
      expect(AppColors.dark.categories.first, const Color(0xFF5B8FD6));
    });
  });

  group('preferences', () {
    test('follow the system theme by default and persist the user choice', () async {
      SharedPreferences.setMockInitialValues({});
      final store = await SharedPreferences.getInstance();
      final prefs = AppPreferences.load(store);
      expect(prefs.themeMode, ThemeMode.system);
      expect(prefs.locale, isNull);

      await prefs.setThemeMode(ThemeMode.dark);
      await prefs.setLocale(const Locale('fr'));
      final reloaded = AppPreferences.load(store);
      expect(reloaded.themeMode, ThemeMode.dark);
      expect(reloaded.locale, const Locale('fr'));

      await reloaded.setLocale(null);
      expect(AppPreferences.load(store).locale, isNull);
    });

    test('picks the device language when supported, English otherwise', () {
      const supported = AppPreferences.supportedLocales;
      expect(AppPreferences.resolve(const Locale('fr', 'FR'), supported), const Locale('fr'));
      expect(AppPreferences.resolve(const Locale('de'), supported), const Locale('en'));
      expect(AppPreferences.resolve(null, supported), const Locale('en'));
    });
  });

  group('translations', () {
    Map<String, dynamic> arb(String lang) => jsonDecode(File('lib/l10n/arb/app_$lang.arb').readAsStringSync());

    test('French and English have exactly the same keys', () {
      expect(arb('fr').keys.toSet(), arb('en').keys.toSet());
    });

    test('shared strings are the website strings, word for word', () {
      Map<String, dynamic> web(String lang) =>
          jsonDecode(File('../web-app/public/locales/$lang/translation.json').readAsStringSync());
      dynamic get(Map<String, dynamic> m, String path) => path.split('.').fold<dynamic>(m, (a, p) => a[p]);
      final expected = {
        'startScan': 'artworks_report_page.create_report',
        'tabReposts': 'dashboard_page.scans_report.scan_report',
        'galleryTitle': 'artwork_gallery_page.artwork_gallery',
        'statusNoMatches': 'artwork_gallery_page.no_matches_found',
        'dmcaLegalNotice': 'dmca_page.legal_notice',
        'restrictedHidden': 'restricted_match.hidden',
        'themeSystem': 'sidebar.theme_system',
      };
      for (final lang in ['en', 'fr']) {
        expected.forEach((key, webKey) => expect(arb(lang)[key], get(web(lang), webKey), reason: '$lang $key'));
      }
    });

    test('French says "importer" for sending files and the renamed scan wording (#378, #376)', () {
      expect(arb('fr')['startScan'], 'Lancer un scan');
      expect(arb('fr')['tabReposts'], 'Reposts détectés');
      expect(arb('en')['startScan'], 'Start a scan');
      expect(arb('en')['tabReposts'], 'Detected reposts');
      expect(arb('fr')['uploadAction'], 'Importer');
    });
  });
}
