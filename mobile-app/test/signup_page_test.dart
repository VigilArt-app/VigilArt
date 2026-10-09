import 'dart:convert';
import 'dart:io';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:vigilart/(api)/auth.dart';
import 'package:vigilart/(api)/legal.dart';
import 'package:vigilart/pages/signup_page.dart';

// Mirrors web-app/tests/signup-profile.spec.ts: consent is explicit, unchecked
// by default, required before any request, and sent with the policy versions.
void main() {
  setUp(() => dotenv.loadFromString(envString: 'API_BASE_URL=https://api.test'));

  final requests = <http.Request>[];
  final openedLinks = <Uri>[];

  Future<void> pumpSignup(WidgetTester tester, {int status = 201, Map<String, dynamic>? body}) async {
    requests.clear();
    openedLinks.clear();
    final client = MockClient((request) async {
      requests.add(request);
      return http.Response(jsonEncode(body ?? {'success': true}), status);
    });
    // Wide surface: the test font is wider than real fonts and overflows the
    // existing outlined buttons at phone width.
    await tester.binding.setSurfaceSize(const Size(800, 1400));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(MaterialApp(
      home: SignupPage(
        apiService: ApiService(client: client),
        openLink: (url) async {
          openedLinks.add(url);
          return true;
        },
      ),
    ));
  }

  Future<void> fillForm(WidgetTester tester) async {
    final fields = find.byType(TextFormField);
    await tester.enterText(fields.at(0), 'artist@example.com');
    await tester.enterText(fields.at(1), 'Secure_P4ssword');
    await tester.enterText(fields.at(2), 'Secure_P4ssword');
  }

  Future<void> submit(WidgetTester tester) async {
    await tester.tap(find.text('Sign Up'));
    await tester.pumpAndSettle();
  }

  testWidgets('asks for no name and starts with consent unchecked', (tester) async {
    await pumpSignup(tester);
    expect(find.byType(TextFormField), findsNWidgets(3));
    expect(find.text('First Name'), findsNothing);
    expect(find.text('Last Name'), findsNothing);
    expect(tester.widget<Checkbox>(find.byKey(const Key('signup-consent'))).value, isFalse);
  });

  testWidgets('refuses to send anything until consent is ticked', (tester) async {
    await pumpSignup(tester);
    await fillForm(tester);
    await submit(tester);
    expect(requests, isEmpty);
    expect(find.text('You must accept the Terms of Service and acknowledge the Privacy Policy.'), findsOneWidget);
  });

  testWidgets('sends explicit acceptance with the current policy versions', (tester) async {
    await pumpSignup(tester);
    await fillForm(tester);
    await tester.tap(find.byKey(const Key('signup-consent')));
    await tester.pump();
    await submit(tester);
    expect(requests, hasLength(1));
    expect(requests.single.url.toString(), 'https://api.test/auth/signup');
    expect(jsonDecode(requests.single.body), {
      'email': 'artist@example.com',
      'password': 'Secure_P4ssword',
      'acceptedTerms': true,
      'termsVersion': '2026-09-09',
      'privacyVersion': '2026-10-09',
    });
  });

  testWidgets('tells the user to update the app when a policy changed', (tester) async {
    await pumpSignup(tester, status: 400, body: {
      'success': false,
      'statusCode': 400,
      'message': 'privacyVersion: The Privacy Policy has changed. Reload the signup page and review it again.',
    });
    await fillForm(tester);
    await tester.tap(find.byKey(const Key('signup-consent')));
    await tester.pump();
    await submit(tester);
    expect(find.text('Our Terms of Service or Privacy Policy changed. Update the app to sign up.'), findsOneWidget);
  });

  testWidgets('opens the Terms and Privacy pages from the consent text', (tester) async {
    await pumpSignup(tester);
    final consent = tester.widget<RichText>(find.byWidgetPredicate(
        (w) => w is RichText && w.text.toPlainText().startsWith('I accept the')));
    void tapLink(String label) {
      consent.text.visitChildren((span) {
        if (span is TextSpan && span.text == label) {
          (span.recognizer! as TapGestureRecognizer).onTap!();
          return false;
        }
        return true;
      });
    }

    tapLink('Terms of Service');
    tapLink('Privacy Policy');
    expect(openedLinks, [Uri.parse('https://vigilart.app/terms'), Uri.parse('https://vigilart.app/privacy')]);
  });

  test('ships the same policy versions as the signup API', () {
    final legal = File('../shared/src/constants/Legal.ts').readAsStringSync();
    expect(legal, contains('TERMS_VERSION = "$termsVersion"'));
    expect(legal, contains('PRIVACY_VERSION = "$privacyVersion"'));
  });
}
