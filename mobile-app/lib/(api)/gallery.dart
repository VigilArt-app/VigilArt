import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension GalleryApi on ApiService {
  
  Future<List<Map<String, dynamic>>?> fetchGalleryArtworks() async {
    try {
      final token = await getAccessToken();
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception('User ID not found');

      final headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'};

      final artworksRes = await http.get(Uri.parse('$serverUrl/artworks/user/$userId'), headers: headers);
      if (artworksRes.statusCode != 200) return null;
      final artworksData = jsonDecode(artworksRes.body);
      final List<dynamic> artworks = artworksData['data'] ?? artworksData;

      final reportsRes = await http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers);
      final reportsData = reportsRes.statusCode == 200 ? jsonDecode(reportsRes.body) : {};
      final List<dynamic> reports = reportsData['data'] ?? [];

      List<String> storageKeys = artworks.map((a) => a['storageKey']?.toString() ?? '').where((k) => k.isNotEmpty).toList();
      Map<String, dynamic> downloadUrls = {};
      
      if (storageKeys.isNotEmpty) {
        final urlsRes = await http.post(
          Uri.parse('$serverUrl/storage/artworks/download-urls'),
          headers: headers,
          body: jsonEncode({'storageKeys': storageKeys}),
        );
        if (urlsRes.statusCode == 200 || urlsRes.statusCode == 201) {
          final urlsData = jsonDecode(urlsRes.body);
          downloadUrls = urlsData['data'] ?? urlsData;
        }
      }

      return artworks.map((art) {
        final artId = art['id'].toString();
        final storageKey = art['storageKey'];
        final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;
        
        final report = reports.firstWhere((r) => r['artworkId'] == artId, orElse: () => null);
        
        String status = 'scanning';
        int matchesCount = 0;
        
        if (report != null) {
          matchesCount = report['totalMatches'] ?? 0;
          status = matchesCount > 0 ? 'scanned' : 'protected';
        }

        return {
          'id': artId,
          'title': art['title'] ?? art['originalFilename'] ?? 'Untitled',
          'url': imageUrl ?? '',
          'date': art['createdAt'] ?? DateTime.now().toIso8601String(),
          'status': status,
          'matchesCount': matchesCount,
        };
      }).toList();

    } catch (e) {
      print('Gallery Fetch Error: $e');
      return null;
    }
  }

  // Delete Artwork
  Future<bool> deleteArtwork(String artworkId) async {
    try {
      final token = await getAccessToken();
      final url = Uri.parse('$serverUrl/artworks/$artworkId');
      final response = await http.delete(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      print('Delete Artwork Error: $e');
      return false;
    }
  }
}
