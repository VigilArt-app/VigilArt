import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vigilart/services/firebase_setup.dart';

// The app used to call Firebase.initializeApp() unguarded, so a build without
// Firebase config (iOS has no GoogleService-Info.plist) crashed at startup.
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() => dotenv.loadFromString(envString: 'API_BASE_URL=https://api.test'));
  tearDown(() => debugDefaultTargetPlatformOverride = null);

  test('reports Firebase as unavailable instead of throwing on Android', () async {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    expect(await initFirebase(), isFalse);
  });

  test('reports Firebase as unavailable on iOS when .env has no Firebase values', () async {
    debugDefaultTargetPlatformOverride = TargetPlatform.iOS;
    expect(await initFirebase(), isFalse);
  });
}
