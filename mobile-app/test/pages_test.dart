import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vigilart/(api)/auth.dart';
import 'package:vigilart/pages/dashboard/dashboard.dart';
import 'package:vigilart/pages/dashboard/scan_report/scan_result_page.dart';
import 'package:vigilart/pages/dmca/dmca_page.dart';
import 'package:vigilart/pages/gallery/gallery_page.dart';
import 'package:vigilart/pages/login_page.dart';
import 'package:vigilart/pages/profile/profile_page.dart';
import 'package:vigilart/theme/app_preferences.dart';
import 'package:vigilart/widgets/restricted_match.dart';

import 'support/test_app.dart';

Map<String, dynamic> art(String id, String name, {String? lastScanAt}) =>
    {'id': id, 'originalFilename': name, 'storageKey': 'k-$id', 'lastScanAt': lastScanAt, 'createdAt': '2026-11-01T10:00:00Z', 'sizeBytes': 2048};

FakeBackend galleryBackend() => FakeBackend()
  ..json('GET', '/artworks/user/user-1', {'items': [
    art('a1', 'harbor.png', lastScanAt: '2026-10-01T00:00:00Z'),
    art('a2', 'garden.png'),
    art('a3', 'ochre.png', lastScanAt: '2026-10-01T00:00:00Z'),
  ], 'nextCursor': null})
  ..json('GET', '/reports/user/user-1', [{'id': 'r1'}])
  ..json('GET', '/reports/details/r1', {'matchingPages': [
    {'id': 'm1', 'artworkId': 'a1', 'url': 'https://pinterest.com/p/1', 'category': 'SOCIAL', 'websiteName': 'pinterest.com', 'unsafeDomain': false, 'firstDetectedAt': '2026-10-02T00:00:00Z'},
    {'id': 'm2', 'artworkId': 'a1', 'url': 'https://adult.example/p/2', 'category': 'OTHER', 'websiteName': 'adult.example', 'unsafeDomain': true, 'firstDetectedAt': '2026-10-03T00:00:00Z'},
  ]})
  ..json('POST', '/storage/artworks/download-urls', {});

void main() {
  setUp(setUpApi);

  group('login', () {
    testWidgets('has no Google button and validates before sending anything', (tester) async {
      await usePhoneSurface(tester);
      final backend = FakeBackend();
      await tester.pumpWidget(await testApp(LoginPage(apiService: ApiService(client: backend.client))));
      expect(find.textContaining('Google'), findsNothing);
      await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
      await tester.pump();
      expect(backend.requests, isEmpty);
      expect(find.text('This field is required'), findsOneWidget);
    });

    testWidgets('speaks French and signs in', (tester) async {
      await usePhoneSurface(tester);
      final backend = FakeBackend()
        ..json('POST', '/auth/mobile/login', {'accessToken': 'a', 'refreshToken': 'r', 'user': {'id': 'user-1', 'email': 'a@b.c', 'avatar': null}});
      await tester.pumpWidget(await testApp(LoginPage(apiService: ApiService(client: backend.client)), locale: const Locale('fr')));
      expect(find.text('Ravi de vous revoir !'), findsOneWidget);
      final fields = find.byType(TextFormField);
      await tester.enterText(fields.at(0), 'artist@example.com');
      await tester.enterText(fields.at(1), 'Secure_P4ssword');
      await tester.tap(find.widgetWithText(FilledButton, 'Se connecter'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(backend.requests.single.url.path, '/auth/mobile/login');
      expect((await SharedPreferences.getInstance()).getBool('isLoggedIn'), isTrue);
    });
  });

  group('gallery', () {
    testWidgets('shows the website statuses, filters by status and flags blacklisted sites', (tester) async {
      await usePhoneSurface(tester);
      final backend = galleryBackend();
      await backend.run(() async {
        await tester.pumpWidget(await testApp(GalleryPage(apiService: ApiService())));
        await tester.pump(const Duration(milliseconds: 100));
        await tester.pump(const Duration(milliseconds: 100));
        expect(find.text('Artwork Gallery'), findsOneWidget);
        expect(find.text('MATCHES FOUND'), findsOneWidget);
        expect(find.text('NOT SCANNED YET'), findsOneWidget);
        expect(find.text('RESULTS UNAVAILABLE'), findsNothing); // reports loaded: a3 is a recorded scan with no match
        expect(find.text('NO MATCHES FOUND'), findsOneWidget);
        expect(find.text('1 blacklisted site'), findsOneWidget);
        expect(find.text('3 images'), findsOneWidget);

        await tester.tap(find.text('Not scanned yet').first);
        await tester.pump();
        expect(find.text('1 images'), findsOneWidget);
        expect(find.text('NOT SCANNED YET'), findsNWidgets(1));
      });
    });

    testWidgets('deletes an artwork after confirmation', (tester) async {
      await usePhoneSurface(tester);
      final backend = galleryBackend()..on('DELETE', '/artworks/a2', (_) => http200({}));
      await backend.run(() async {
        await tester.pumpWidget(await testApp(GalleryPage(apiService: ApiService())));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.tap(find.byType(PopupMenuButton<String>).first);
        await tester.pumpAndSettle();
        await tester.tap(find.text('Delete artwork').last);
        await tester.pumpAndSettle();
        expect(find.text('Are you sure you want to delete this artwork? This action cannot be undone.'), findsOneWidget);
        await tester.tap(find.text('Delete').last);
        await tester.pump(const Duration(milliseconds: 100));
        await tester.pump(const Duration(milliseconds: 100));
        expect(backend.requests.where((r) => r.method == 'DELETE'), hasLength(1));
      });
    });
  });

  group('detected reposts', () {
    FakeBackend repostsBackend({required int remaining}) => galleryBackend()
      ..json('GET', '/reports/user/user-1/scan-quota', {'remaining': remaining, 'limit': 3, 'nextAvailableAt': remaining == 0 ? '2026-11-25T10:00:00.000Z' : null});

    testWidgets('shows the quota note and the renamed action (#376, #378)', (tester) async {
      await usePhoneSurface(tester);
      await repostsBackend(remaining: 2).run(() async {
        await tester.pumpWidget(await testApp(Scaffold(body: ScanResultsPage(apiService: ApiService()))));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump(const Duration(milliseconds: 200));
        expect(find.text('Start a scan'), findsOneWidget);
        expect(find.textContaining('2 scans left out of 3'), findsOneWidget);
        expect(find.textContaining('Each used scan comes back 30 days later.'), findsOneWidget);
        expect(find.text('CREATE NEW REPORT'), findsNothing);
      });
    });

    testWidgets('disables the action and tells when the next scan is available', (tester) async {
      await usePhoneSurface(tester);
      await repostsBackend(remaining: 0).run(() async {
        await tester.pumpWidget(await testApp(Scaffold(body: ScanResultsPage(apiService: ApiService()))));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump(const Duration(milliseconds: 200));
        final button = tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Start a scan'));
        expect(button.onPressed, isNull);
        expect(find.textContaining('Next scan available on'), findsOneWidget);
      });
    });

    testWidgets('asks for consent before the first scan, then runs it', (tester) async {
      await usePhoneSurface(tester);
      final backend = repostsBackend(remaining: 2)
        ..json('POST', '/reports/user/user-1/scan', {'jobId': 'j1'})
        ..json('GET', '/reports/user/user-1/scan/j1', {'jobId': 'j1', 'state': 'completed', 'progress': {'processed': 3, 'total': 3}, 'reportId': 'r1', 'error': null});
      await backend.run(() async {
        await tester.pumpWidget(await testApp(Scaffold(body: ScanResultsPage(apiService: ApiService(), scanPollInterval: Duration.zero))));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.tap(find.widgetWithText(FilledButton, 'Start a scan'));
        await tester.pumpAndSettle();
        expect(find.text('How your artwork is searched'), findsOneWidget);
        expect(find.textContaining('SerpApi'), findsOneWidget);
        expect(backend.requests.where((r) => r.method == 'POST' && r.url.path.endsWith('/scan')), isEmpty);

        await tester.tap(find.text('Continue'));
        await tester.pump(const Duration(milliseconds: 300));
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.text('Report created'), findsOneWidget);
        expect(find.text('This scan is not exhaustive: some content may not be detected.'), findsWidgets);
      });
    });
  });

  group('restricted matches (#326)', () {
    testWidgets('stay hidden until Show, and are never opened as links', (tester) async {
      await tester.pumpWidget(await testApp(const Scaffold(body: RestrictedMatch(lines: ['adult.example', 'https://adult.example/p/2']))));
      expect(find.text('Blacklisted site: content hidden'), findsOneWidget);
      expect(find.text('adult.example'), findsNothing);
      await tester.tap(find.text('Show'));
      await tester.pump();
      expect(find.text('https://adult.example/p/2'), findsOneWidget);
      expect(find.text('Hide'), findsOneWidget);
      expect(find.byIcon(Icons.open_in_new), findsNothing); // no link to follow
    });
  });

  group('profile and preferences', () {
    FakeBackend profileBackend() => FakeBackend()
      ..json('GET', '/users/user-1', {'id': 'user-1', 'email': 'artist@example.com', 'firstName': 'Amélie', 'lastName': 'Laurent', 'avatar': null, 'mobileNotificationsEnabled': false, 'mailNotificationsEnabled': true});

    testWidgets('switches theme and language like the website (Light, Dark, System; Français, English)', (tester) async {
      await usePhoneSurface(tester);
      SharedPreferences.setMockInitialValues({});
      final prefs = AppPreferences.load(await SharedPreferences.getInstance());
      await profileBackend().run(() async {
        await tester.pumpWidget(await testApp(ProfilePage(apiService: ApiService()), preferences: prefs));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump(const Duration(milliseconds: 200));
        expect(find.text('Amélie'), findsOneWidget);
        await tester.scrollUntilVisible(find.text('Dark'), 300, scrollable: find.byType(Scrollable).first);
        await tester.tap(find.text('Dark'));
        await tester.pump();
        expect(prefs.themeMode, ThemeMode.dark);
        await tester.tap(find.text('System'));
        await tester.pump();
        expect(prefs.themeMode, ThemeMode.system);
        await tester.tap(find.text('Français'));
        await tester.pump();
        expect(prefs.locale, const Locale('fr'));
      });
    });

    testWidgets('offers the legal links and account deletion inside the app', (tester) async {
      await usePhoneSurface(tester);
      await profileBackend().run(() async {
        await tester.pumpWidget(await testApp(ProfilePage(apiService: ApiService())));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump(const Duration(milliseconds: 200));
        for (final label in ['FAQ', 'Privacy', 'Terms', 'Legal notice', 'Logout', 'Delete Account']) {
          await tester.scrollUntilVisible(find.text(label), 300, scrollable: find.byType(Scrollable).first);
          expect(find.text(label), findsOneWidget, reason: label);
        }
        await tester.tap(find.text('Delete Account'));
        await tester.pumpAndSettle();
        expect(find.text('Delete Account Permanently'), findsOneWidget);
        expect(find.text('Delete Permanently'), findsOneWidget);
      });
    });
  });

  group('dmca assistant', () {
    testWidgets('opens on the profile step with the legal warning', (tester) async {
      await usePhoneSurface(tester);
      final backend = FakeBackend()
        ..json('GET', '/dmca/platform/', [])
        ..on('GET', '/dmca/profile/user-1', (_) => http404())
        ..json('GET', '/dmca/notice/user/user-1', []);
      await backend.run(() async {
        await tester.pumpWidget(await testApp(const DmcaPage(artworkPrefill: {})));
        await tester.pump(const Duration(milliseconds: 200));
        await tester.pump(const Duration(milliseconds: 200));
        expect(find.text('DMCA Assistant'), findsOneWidget);
        expect(find.textContaining('VigilArt never files a DMCA complaint on your behalf'), findsOneWidget);
        expect(find.text('1) DMCA profile'), findsOneWidget);
      });
    });
  });

  testWidgets('dashboard opens on Detected reposts with the three sections', (tester) async {
    await usePhoneSurface(tester);
    final backend = galleryBackend()..json('GET', '/reports/user/user-1/scan-quota', {'remaining': 3, 'limit': 3, 'nextAvailableAt': null});
    await backend.run(() async {
      await tester.pumpWidget(await testApp(const DashboardPage()));
      await tester.pump(const Duration(milliseconds: 200));
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.text('Statistics'), findsOneWidget);
      expect(find.text('Detected reposts'), findsOneWidget);
      expect(find.text('Upload'), findsOneWidget);
      expect(find.text('Dashboard'), findsOneWidget);
    });
  });
}
