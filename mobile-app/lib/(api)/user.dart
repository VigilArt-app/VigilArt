import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart';

extension UserProfile on ApiService {
  
  Future<Map<String, dynamic>?> fetchUserProfile() async {
    try {
      final token = await getAccessToken();
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      
      if (userId == null) throw Exception('User ID not found');

      final url = Uri.parse('$serverUrl/users/$userId');
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200) {
        print('Failed to fetch user profile: ${response.statusCode}');
        return null;
      }

      final data = jsonDecode(response.body);
      return data['data'] ?? data; 
    } catch (e) {
      print('Network error fetching profile: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> updateUserProfile(Map<String, dynamic> updateData) async {
    try {
      final token = await getAccessToken();
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      
      if (userId == null) throw Exception('User ID not found');

      final url = Uri.parse('$serverUrl/users/$userId');
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(updateData),
      );

      if (response.statusCode != 200) {
        final errorData = jsonDecode(response.body);
        print('Failed to update profile: ${errorData['message'] ?? response.statusCode}');
        return null;
      }

      final data = jsonDecode(response.body);
      return data['data'] ?? data;
    } catch (e) {
      print('Network error updating profile: $e');
      return null;
    }
  }

  Future<String?> getAvatarDownloadUrl(String storageKey) async {
    try {
      final token = await getAccessToken();
      final url = Uri.parse('$serverUrl/storage/artworks/download-urls');
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'storageKeys': [storageKey],
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final urls = data['data'] ?? data;
        return urls[storageKey];
      }
      return null;
    } catch (e) {
      print('Error getting avatar download URL: $e');
      return null;
    }
  }
}
