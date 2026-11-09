import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:vigilart/l10n/app_localizations.dart';
import 'package:vigilart/theme/app_preferences.dart';
import 'package:vigilart/theme/app_theme.dart';
import 'package:vigilart/pages/dashboard/dashboard.dart';
import 'package:vigilart/pages/dashboard/upload_picture/upload_photos_page.dart';
import 'package:vigilart/pages/gallery/gallery_page.dart';
import 'package:vigilart/pages/profile/profile_page.dart';
import 'package:vigilart/(api)/auth.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/login_page.dart';
import 'pages/signup_page.dart';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:vigilart/services/firebase_setup.dart';
import 'package:vigilart/services/notification_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Runs in its own isolate: .env is not loaded there yet.
  await dotenv.load(fileName: ".env");
  await initFirebase();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // The app is designed for phones in portrait.
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SharedPreferences prefs = await SharedPreferences.getInstance();
  await dotenv.load(fileName: ".env");

  bool isLoggedIn = await checkLoginStatus(prefs);

  // Firebase / push notifications are mobile-only; web has no Firebase config,
  // so initializing it there throws and leaves the app on a blank screen.
  if (!kIsWeb && await initFirebase()) {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    bool? mobileNotificationsEnabled = migrateNotificationPreference(prefs);
    if (isLoggedIn && mobileNotificationsEnabled == true) {
      NotificationService().initialize();
    }
  }

  runApp(VigilArtApp(isLoggedIn: isLoggedIn, preferences: AppPreferences.load(prefs)));
}

/// Reads the push preference. Builds older than the notification split
/// (#360) stored it as `notificationsEnabled`: copy that value once so users
/// who had push notifications on keep them after updating (#364).
bool? migrateNotificationPreference(SharedPreferences prefs) {
  final current = prefs.getBool('mobileNotificationsEnabled');
  if (current != null) return current;
  final legacy = prefs.getBool('notificationsEnabled');
  if (legacy != null) {
    prefs.setBool('mobileNotificationsEnabled', legacy);
    prefs.remove('notificationsEnabled');
  }
  return legacy;
}

Future<bool> checkLoginStatus(SharedPreferences prefs) async {
  final apiService = ApiService();
  bool? loginStatus = prefs.getBool('isLoggedIn');

  if (loginStatus != true) {
    return false;
  }

  final refreshToken = await apiService.getRefreshToken();
  if (refreshToken == null) {
    await prefs.setBool('isLoggedIn', false);
    return false;
  }

  try {
    final response = await apiService.refreshAccessToken();
    if (response.statusCode == 200) {
      await prefs.setBool('isLoggedIn', true);
      return true;
    }

    if (response.statusCode == 401) {
      await prefs.setBool('isLoggedIn', false);
      await apiService.clearLocalSession();
      return false;
    }

    return true;
  } catch (_) {
    return true;
  }
}

class VigilArtApp extends StatelessWidget {
  final bool isLoggedIn;
  final AppPreferences preferences;
  const VigilArtApp({super.key, required this.isLoggedIn, required this.preferences});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AppPreferences>.value(
      value: preferences,
      child: Consumer<AppPreferences>(
        builder: (context, prefs, _) => MaterialApp(
          title: 'VigilArt',
          debugShowCheckedModeBanner: false,
          theme: buildAppTheme(Brightness.light),
          darkTheme: buildAppTheme(Brightness.dark),
          themeMode: prefs.themeMode,
          locale: prefs.locale,
          supportedLocales: AppPreferences.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          localeResolutionCallback: (device, supported) => AppPreferences.resolve(device, supported),
          home: isLoggedIn ? const DashboardPage() : const LoginPage(),
          routes: {
            '/login': (context) => const LoginPage(),
            '/signup': (context) => const SignupPage(),
            '/dashboard': (context) => const DashboardPage(),
            '/gallery': (context) => const GalleryPage(),
            '/profile': (context) => const ProfilePage(),
            '/upload': (context) => const UploadPhotosPage(),
          },
        ),
      ),
    );
  }
}
