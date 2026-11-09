import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vigilart/l10n/app_localizations_en.dart';
import 'package:vigilart/main.dart' show migrateNotificationPreference;
import 'package:vigilart/validators/password_rules.dart';

void main() {
  final l10n = AppLocalizationsEn();

  group('password rules match the signup API (#329)', () {
    test('accepts a strong password', () => expect(passwordProblems(l10n, 'Secure_P4ssword'), isEmpty));

    test('gives one readable message per missing rule', () {
      expect(passwordProblems(l10n, 'abc'), [
        'Password must be at least 8 characters long',
        'Password must contain an uppercase letter',
        'Password must contain a number',
        'Password must contain a symbol',
      ]);
      expect(passwordProblems(l10n, 'ALLUPPER1!'), ['Password must contain a lowercase letter']);
    });

    test('strips the field prefix of server messages', () {
      expect(
        stripFieldPrefix('password: Password must be at least 8 characters long; password: Password must contain at least 1 symbol(s)'),
        'Password must be at least 8 characters long\nPassword must contain at least 1 symbol(s)',
      );
    });
  });

  group('notification preference survives the update (#364)', () {
    test('copies the old key once when the new one is missing', () async {
      SharedPreferences.setMockInitialValues({'notificationsEnabled': true});
      final prefs = await SharedPreferences.getInstance();
      expect(migrateNotificationPreference(prefs), isTrue);
      expect(prefs.getBool('mobileNotificationsEnabled'), isTrue);
      expect(prefs.containsKey('notificationsEnabled'), isFalse);
    });

    test('never overrides the new key', () async {
      SharedPreferences.setMockInitialValues({'notificationsEnabled': true, 'mobileNotificationsEnabled': false});
      final prefs = await SharedPreferences.getInstance();
      expect(migrateNotificationPreference(prefs), isFalse);
    });

    test('stays unset for a fresh install', () async {
      SharedPreferences.setMockInitialValues({});
      expect(migrateNotificationPreference(await SharedPreferences.getInstance()), isNull);
    });
  });
}
