import 'package:vigilart/pages/dashboard/dashboard.dart';
import 'package:vigilart/pages/dashboard/upload_picture/upload_photos_page.dart';
import 'package:vigilart/pages/gallery/gallery_page.dart';
import 'package:vigilart/pages/profile/profile_page.dart';
import 'package:vigilart/(api)/auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/login_page.dart';
import 'pages/signup_page.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:vigilart/services/notification_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences prefs = await SharedPreferences.getInstance();
  await dotenv.load(fileName: ".env");

  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  bool isLoggedIn = await checkLoginStatus(prefs);
  bool? notificationsEnabled = prefs.getBool('notificationsEnabled');
  if (isLoggedIn && notificationsEnabled == true) {
    NotificationService().initialize();
  }

  runApp(VigilArtApp(isLoggedIn: isLoggedIn));
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
  const VigilArtApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VigilArt',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.teal,
        primaryColor: const Color(0xFF21808D),
        scaffoldBackgroundColor: const Color(0xFFFFF5E6),
        colorScheme: ColorScheme.fromSwatch(
          primarySwatch: Colors.teal,
          backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            color: Colors.black87,
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF21808D),
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black87,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        fontFamily: 'Poppins',
        useMaterial3: true,
      ),
      home: isLoggedIn ? const DashboardPage() : const LoginPage(),
      routes: {
        '/login': (context) => const LoginPage(),
        '/signup': (context) => const SignupPage(),
        '/dashboard': (context) => const DashboardPage(),
        '/gallery': (context) => const GalleryPage(),
        '/profile': (context) => const ProfilePage(),
        '/upload': (context) => const UploadPhotosPage(),
      },
    );
  }
}
