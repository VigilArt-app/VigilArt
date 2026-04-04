import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  final String serverUrl = "https://dev-api.vigilart.app/api/v1";

  static const String keyAccessToken = 'accessToken';
  static const String keyUserId = 'userId';
  static const String keyUserFirstName = 'userFirstName';
  static const String keyUserLastName = 'userLastName';
  static const String keyUserEmail = 'userEmail';
  static const String keyUserAvatar = 'userAvatar';

  Future<http.Response> login(String email, String password) async {
    final url = Uri.parse('$serverUrl/auth/login');
    print('👉 MON URL EXACTE EST : >>>$url<<');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      
      final data = responseData['data'];
      
      final accessToken = data['accessToken'];
      final user = data['user'];
      
      await secureStorage.write(key: keyAccessToken, value: accessToken);
      await secureStorage.write(key: keyUserId, value: user['id'].toString());
      await secureStorage.write(key: keyUserFirstName, value: user['firstName'].toString());
      await secureStorage.write(key: keyUserLastName, value: user['lastName'].toString());
      await secureStorage.write(key: keyUserEmail, value: user['email'].toString());
      await secureStorage.write(key: keyUserAvatar, value: user['avatar']?.toString() ?? '');
    }
    return response; 
  }

  Future<http.Response> signup(String email, String password, String firstName, String lastName) async {
    final url = Uri.parse('$serverUrl/auth/signup');
    
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
      }),
    );

    if (response.statusCode == 201) {
      final responseData = jsonDecode(response.body);
      final accessToken = responseData['accessToken'];
      
      await secureStorage.write(key: keyAccessToken, value: accessToken);
    }
    return response;
  }

  Future<String?> getAccessToken() async {
    return await secureStorage.read(key: keyAccessToken);
  }
  
  Future<void> logout() async {
    await secureStorage.deleteAll();
  }
}