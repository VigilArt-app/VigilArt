import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  final String serverUrl = dotenv.env['API_BASE_URL'] ?? 
      (throw Exception('CRITICAL: API_BASE_URL is not set in the .env file.'));

  static const String keyAccessToken = 'accessToken';
  static const String keyRefreshToken = 'refreshToken';
  static const String keyUserId = 'userId';
  static const String keyUserFirstName = 'userFirstName';
  static const String keyUserLastName = 'userLastName';
  static const String keyUserEmail = 'userEmail';
  static const String keyUserAvatar = 'userAvatar';

  Map<String, String> _authHeaders() => {
    'Content-Type': 'application/json',
    'x-client-type': 'mobile',
  };

  Future<Map<String, String>> bearerHeaders({bool includeContentType = true}) async {
    final token = await getAccessToken();
    return {
      if (includeContentType) 'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> authenticatedRequest(
    Future<http.Response> Function(Map<String, String> headers) request, {
    bool includeContentType = true,
  }) async {
    var headers = await bearerHeaders(includeContentType: includeContentType);
    var response = await request(headers);

    if (response.statusCode != 401) {
      return response;
    }

    final refreshResponse = await refreshAccessToken();
    if (refreshResponse.statusCode != 200) {
      return response;
    }

    headers = await bearerHeaders(includeContentType: includeContentType);
    return request(headers);
  }

  Future<http.Response> login(String email, String password) async {
    final url = Uri.parse('$serverUrl/auth/login');
    final response = await http.post(
      url,
      headers: _authHeaders(),
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      final data = responseData['data'];
      
      final accessToken = data['accessToken'];
      final refreshToken = data['refreshToken'];
      final user = data['user'];
      
      if (accessToken != null && refreshToken != null && user != null) {
        await secureStorage.write(key: keyAccessToken, value: accessToken);
        await secureStorage.write(key: keyRefreshToken, value: refreshToken);
        await secureStorage.write(key: keyUserId, value: user['id'].toString());
        await secureStorage.write(key: keyUserFirstName, value: user['firstName'].toString());
        await secureStorage.write(key: keyUserLastName, value: user['lastName'].toString());
        await secureStorage.write(key: keyUserEmail, value: user['email'].toString());
        await secureStorage.write(key: keyUserAvatar, value: user['avatar']?.toString() ?? '');
      }
    }
    return response; 
  }

  Future<http.Response> signup(String email, String password, String firstName, String lastName) async {
    final url = Uri.parse('$serverUrl/auth/signup');
    
    final response = await http.post(
      url,
      headers: _authHeaders(),
      body: jsonEncode({
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
      }),
    );
    return response;
  }

  Future<http.Response> refreshAccessToken() async {
    final refreshToken = await secureStorage.read(key: keyRefreshToken);
    final url = Uri.parse('$serverUrl/auth/refresh');

    final response = await http.post(
      url,
      headers: {
        ..._authHeaders(),
        if (refreshToken != null) 'Authorization': 'Bearer $refreshToken',
      },
    );

    if (response.statusCode == 200 && response.body.isNotEmpty) {
      final responseData = jsonDecode(response.body);
      final accessToken = responseData['data']?['accessToken'];
      final rotatedRefreshToken = responseData['data']?['refreshToken'];
      if (accessToken != null) {
        await secureStorage.write(key: keyAccessToken, value: accessToken);
      }
      if (rotatedRefreshToken != null) {
        await secureStorage.write(key: keyRefreshToken, value: rotatedRefreshToken);
      }
    }

    return response;
  }

  Future<http.Response> logout() async {
    final refreshToken = await secureStorage.read(key: keyRefreshToken);
    final url = Uri.parse('$serverUrl/auth/logout');

    final response = await http.post(
      url,
      headers: {
        ..._authHeaders(),
        if (refreshToken != null) 'Authorization': 'Bearer $refreshToken',
      },
    );

    if (response.statusCode == 200 || response.statusCode == 204) {
      await secureStorage.deleteAll();
    }

    return response;
  }

  Future<String?> getAccessToken() async {
    return await secureStorage.read(key: keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return await secureStorage.read(key: keyRefreshToken);
  }
  
  Future<void> clearLocalSession() async {
    await secureStorage.deleteAll();
  }
}