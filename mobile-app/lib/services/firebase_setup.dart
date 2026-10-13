import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

// Android reads its Firebase config from google-services.json at build time.
// iOS has no GoogleService-Info.plist in the project, so its config comes from
// .env, written by CI like API_BASE_URL. These are client identifiers, not
// secrets: Firebase ships the same values inside every app.
FirebaseOptions? _iosOptions() {
  final apiKey = dotenv.env['FIREBASE_IOS_API_KEY'];
  final appId = dotenv.env['FIREBASE_IOS_APP_ID'];
  final senderId = dotenv.env['FIREBASE_MESSAGING_SENDER_ID'];
  final projectId = dotenv.env['FIREBASE_PROJECT_ID'];
  if ([apiKey, appId, senderId, projectId].any((v) => v == null || v.isEmpty)) {
    return null;
  }
  return FirebaseOptions(
    apiKey: apiKey!,
    appId: appId!,
    messagingSenderId: senderId!,
    projectId: projectId!,
    iosBundleId: 'app.vigilart',
  );
}

// Returns false instead of throwing when Firebase cannot start (no config for
// this platform), so the app still opens; only push notifications are lost.
Future<bool> initFirebase() async {
  if (Firebase.apps.isNotEmpty) return true;
  try {
    final options =
        defaultTargetPlatform == TargetPlatform.iOS ? _iosOptions() : null;
    await Firebase.initializeApp(options: options);
    return true;
  } catch (e) {
    debugPrint('Firebase is not configured, push notifications are disabled: $e');
    return false;
  }
}
