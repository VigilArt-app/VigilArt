import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vigilart/(api)/auth.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final ApiService _apiService = ApiService();

  Future<String?> initialize() async {
    try {
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        final token = await _messaging.getToken();
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('fcmToken', token);
          await _registerTokenWithBackend(token);
        }
        _messaging.onTokenRefresh.listen((newToken) async {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('fcmToken', newToken);
          _registerTokenWithBackend(newToken);
        });

        FirebaseMessaging.onMessage.listen((RemoteMessage message) {
          debugPrint(
              'Foreground message received: ${message.notification?.title} - ${message.notification?.body}');
        });

        FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
          debugPrint(
              'App opened from background via notification: ${message.notification?.title}');
        });

        _messaging.getInitialMessage().then((RemoteMessage? message) {
          if (message != null) {
            debugPrint(
                'App launched from terminated state via notification: ${message.notification?.title}');
          }
        });

        return token;
      }
    } catch (e) {
      debugPrint('Failed to initialize NotificationService: $e');
    }
    return null;
  }

  Future<void> _registerTokenWithBackend(String token) async {
    final url = Uri.parse('${_apiService.serverUrl}/notifications/devices');

    try {
      await _apiService.authenticatedRequest((headers) {
        return http.post(
          url,
          headers: headers,
          body: jsonEncode({
            'token': token,
            'platform': 'ANDROID', // To update when we'll support IOS as well
          }),
        );
      });
    } catch (e) {
      debugPrint('Failed to register device token with backend: $e');
    }
  }

  Future<void> unregisterDevice() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('fcmToken');

      if (token == null) {
        try {
          token = await _messaging.getToken();
        } catch (e) {
          debugPrint(
              'Could not fetch token from Firebase SDK to unregister: $e');
        }
      }

      if (token != null) {
        final url = Uri.parse(
            '${_apiService.serverUrl}/notifications/devices/${Uri.encodeComponent(token)}');
        await _apiService.authenticatedRequest((headers) {
          return http.delete(
            url,
            headers: headers,
          );
        });
        await prefs.remove('fcmToken');
      }
    } catch (e) {
      debugPrint('Failed to unregister device token: $e');
    }
  }
}
