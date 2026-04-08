import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

import 'auth.dart'; 

extension ArtworkUpload on ApiService {

  Future<Map<String, dynamic>?> getUploadUrls(List<String> filenames) async {
    final url = Uri.parse('$serverUrl/storage/artworks/upload-urls');
    final token = await getAccessToken();

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'filenames': filenames,
          'prefix': 'artworks',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        if (responseData['data'] != null) {
          return responseData['data'] as Map<String, dynamic>; 
        }
      }
      return null;
    } catch (e) {
      print('Network error getting URLs: $e');
      return null;
    }
  }

  Future<bool> uploadFileToCloud(String presignedUrl, String filePath, String contentType) async {
    try {
      final file = File(filePath);
      final fileBytes = await file.readAsBytes();
      
      final response = await http.put(
        Uri.parse(presignedUrl),
        body: fileBytes,
        headers: {'Content-Type': contentType}, 
      );
      
      return response.statusCode == 200;
    } catch (e) {
      print('Error uploading to cloud: $e');
      return false;
    }
  }

  Future<bool> createArtworkRecords(List<Map<String, dynamic>> artworks) async {
    final url = Uri.parse('$serverUrl/artworks/batch');
    final token = await getAccessToken();

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(artworks),
      );
      
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error creating artwork records: $e');
      return false;
    }
  }

  String getContentType(String path) {
    if (path.toLowerCase().endsWith('.png')) return 'image/png';
    return 'image/jpeg';
  }
}
