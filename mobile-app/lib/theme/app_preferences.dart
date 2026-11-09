import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// The user's choice of theme (Light, Dark, System) and language (French,
/// English), as in the website's sidebar. A missing language follows the
/// device. Both choices persist across launches.
class AppPreferences extends ChangeNotifier {
  AppPreferences._(this._prefs, this._themeMode, this._locale);

  static const String keyThemeMode = 'themeMode';
  static const String keyLanguage = 'languageCode';
  static const List<Locale> supportedLocales = [Locale('en'), Locale('fr')];

  final SharedPreferences _prefs;
  ThemeMode _themeMode;
  Locale? _locale;

  ThemeMode get themeMode => _themeMode;

  /// null means "follow the device".
  Locale? get locale => _locale;

  factory AppPreferences.load(SharedPreferences prefs) {
    final theme = switch (prefs.getString(keyThemeMode)) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    final code = prefs.getString(keyLanguage);
    final locale = supportedLocales.where((l) => l.languageCode == code).firstOrNull;
    return AppPreferences._(prefs, theme, locale);
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    if (mode == _themeMode) return;
    _themeMode = mode;
    notifyListeners();
    await _prefs.setString(keyThemeMode, mode.name);
  }

  Future<void> setLocale(Locale? locale) async {
    if (locale?.languageCode == _locale?.languageCode) return;
    _locale = locale;
    notifyListeners();
    if (locale == null) {
      await _prefs.remove(keyLanguage);
    } else {
      await _prefs.setString(keyLanguage, locale.languageCode);
    }
  }

  /// Picks the supported language closest to the device language, English by default.
  static Locale resolve(Locale? deviceLocale, Iterable<Locale> supported) {
    for (final l in supported) {
      if (l.languageCode == deviceLocale?.languageCode) return l;
    }
    return const Locale('en');
  }
}
