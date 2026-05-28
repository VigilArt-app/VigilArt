import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension ArtworkUpload on ApiService {

  Future<Map<String, dynamic>?> getUploadUrls(List<String> filenames) async {
    final url = Uri.parse('$serverUrl/storage/artworks/upload-urls');

    try {
      final response = await authenticatedRequest(
        (headers) => http.post(
          url,
          headers: headers,
          body: jsonEncode({'filenames': filenames, 'prefix': 'artworks'}),
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        final data = responseData['data'] ?? responseData;
        
        if (data is Map<String, dynamic>) return data;
        if (data is List) {
          Map<String, dynamic> mapped = {};
          for (var item in data) {
            final key = item['filename'] ?? item['name'];
            if (key != null) mapped[key] = item;
          }
          return mapped;
        }
      }
      return null;
    } catch (e) {
      print('Network error getting URLs: $e');
      return null;
    }
  }

  Future<bool> uploadFileToCloud(
    String presignedUrl, 
    String filePath, 
    String contentType,
    Function(double) onProgress
  ) async {
    try {
      final file = File(filePath);
      final fileBytes = await file.readAsBytes();
      
      final response = await http.put(
        Uri.parse(presignedUrl),
        body: fileBytes,
        headers: {'Content-Type': contentType}, 
      );
      
      if (response.statusCode == 200) {
        onProgress(1.0);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> createArtworkRecords(List<Map<String, dynamic>> artworks) async {
    final url = Uri.parse('$serverUrl/artworks/batch');
    try {
      final response = await authenticatedRequest(
        (headers) => http.post(
          url,
          headers: headers,
          body: jsonEncode(artworks),
        ),
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