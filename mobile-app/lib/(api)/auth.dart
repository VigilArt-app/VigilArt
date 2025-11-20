import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  String serverUrl = "http://10.0.2.2:3001";


  Future<http.Response> login(BuildContext context, String email, String password) async {
    final url = Uri.parse('${serverUrl}/auth/login');
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
      final accessToken = responseData['accessToken'];
      final user = responseData['user'];
      await secureStorage.write(key: 'accessToken', value: accessToken);
      await secureStorage.write(key: 'userId', value: user['id'].toString());
    }
    return response;
  }

  Future<http.Response> signup(BuildContext context, String email, String password, String firstName, String lastName) async {
    final url = Uri.parse('${serverUrl}/auth/signup');
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
      final user = responseData['user'];
      await secureStorage.write(key: 'accessToken', value: accessToken);
      await secureStorage.write(key: 'userId', value: user['id'].toString());
    }
    return response;
  }

  Future<String?> getAccessToken() async {
    return await secureStorage.read(key: 'accessToken');
  }
}
