import 'package:VigilArt/pages/dashboard/dashboard.dart';
import 'package:VigilArt/pages/dashboard/upload_picture/uploadPhotos_page.dart';
import 'package:VigilArt/pages/gallery/gallery_page.dart';
import 'package:VigilArt/pages/profile/profile_page.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'pages/login_page.dart';
import 'pages/signup_page.dart';

void main() async {

  WidgetsFlutterBinding.ensureInitialized();
  bool isLoggedIn = await checkLoginStatus();
  
  runApp(VigilArtApp(isLoggedIn: isLoggedIn));
}

Future<bool> checkLoginStatus() async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  bool? loginStatus = prefs.getBool('isLoggedIn');
  return loginStatus ?? false;
}

class VigilArtApp extends StatelessWidget {
  final bool isLoggedIn;
  const VigilArtApp({Key? key, required this.isLoggedIn}) : super(key: key);

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

