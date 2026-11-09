import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vigilart/(api)/auth.dart';
import 'package:vigilart/pages/dashboard/dashboard.dart';
import 'package:vigilart/pages/gallery/gallery_page.dart';
import 'package:vigilart/pages/login_page.dart';
import 'package:vigilart/pages/profile/profile_page.dart';
import 'package:vigilart/pages/signup_page.dart';

import 'support/test_app.dart';

/// #339: the screens must fit small iPhones and Android phones, long French
/// texts, light and dark themes and large system text, with nothing cut off.
void main() {
  setUp(setUpApi);

  FakeBackend backend() => FakeBackend()
    ..json('GET', '/artworks/user/user-1', {'items': [
      {'id': 'a1', 'originalFilename': 'harbor-at-dusk-study-with-a-very-long-file-name.png', 'storageKey': 'k1', 'lastScanAt': '2026-10-01T00:00:00Z', 'createdAt': '2026-11-01T10:00:00Z'},
    ], 'nextCursor': null})
    ..json('GET', '/reports/user/user-1', [{'id': 'r1'}])
    ..json('GET', '/reports/details/r1', {'matchingPages': []})
    ..json('POST', '/storage/artworks/download-urls', {})
    ..json('GET', '/reports/user/user-1/scan-quota', {'remaining': 0, 'limit': 3, 'nextAvailableAt': '2026-11-25T10:00:00.000Z'})
    ..json('GET', '/reports/user/user-1/statistics', {'totalMatches': 0, 'categoryDistribution': [], 'timeline': []})
    ..json('GET', '/users/user-1', {'id': 'user-1', 'email': 'a-very-long-email-address@example-domain.com', 'firstName': 'Amélie', 'lastName': 'Laurent-Delacroix', 'mobileNotificationsEnabled': true, 'mailNotificationsEnabled': false});

  final screens = <String, Widget Function()>{
    'login': () => LoginPage(apiService: ApiService()),
    'signup': () => SignupPage(apiService: ApiService()),
    'dashboard': () => const DashboardPage(),
    'gallery': () => GalleryPage(apiService: ApiService()),
    'profile': () => ProfilePage(apiService: ApiService()),
  };

  const sizes = {'iPhone SE (375x667)': Size(375, 667), 'small Android (360x640)': Size(360, 640), 'Pro Max (430x932)': Size(430, 932)};

  for (final screen in screens.entries) {
    for (final size in sizes.entries) {
      for (final fr in [false, true]) {
        for (final dark in [false, true]) {
          testWidgets('${screen.key} fits ${size.key} ${fr ? 'in French' : 'in English'} ${dark ? 'dark' : 'light'}', (tester) async {
            tester.view.physicalSize = size.value;
            tester.view.devicePixelRatio = 1;
            addTearDown(tester.view.reset);
            await backend().run(() async {
              await tester.pumpWidget(await testApp(screen.value(), locale: Locale(fr ? 'fr' : 'en'), themeMode: dark ? ThemeMode.dark : ThemeMode.light));
              await tester.pump(const Duration(milliseconds: 300));
              await tester.pump(const Duration(milliseconds: 300));
              expect(tester.takeException(), isNull);
            });
          });
        }
      }
    }
  }

  for (final entry in screens.entries) {
    testWidgets('large system text (200%) does not break ${entry.key} in French', (tester) async {
      tester.view.physicalSize = const Size(375, 667);
      tester.view.devicePixelRatio = 1;
      tester.platformDispatcher.textScaleFactorTestValue = 2.0;
      addTearDown(() {
        tester.view.reset();
        tester.platformDispatcher.clearAllTestValues();
      });
      await backend().run(() async {
        await tester.pumpWidget(await testApp(entry.value(), locale: const Locale('fr')));
        await tester.pump(const Duration(milliseconds: 300));
        await tester.pump(const Duration(milliseconds: 300));
        expect(tester.takeException(), isNull);
      });
    });
  }
}
