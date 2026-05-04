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

      List<dynamic> allMatchingPages = [];
      if (reports.isNotEmpty) {
        final detailRequests = reports.map((report) {
          final reportId = report['id']?.toString();
          return http.get(Uri.parse('$serverUrl/reports/details/$reportId'), headers: headers);
        });

        final detailResponses = await Future.wait(detailRequests);

        for (var res in detailResponses) {
          if (res.statusCode == 200) {
            final detailsData = jsonDecode(res.body);
            final detailsRaw = detailsData['data'] ?? detailsData;
            if (detailsRaw['matchingPages'] != null) {
              allMatchingPages.addAll(detailsRaw['matchingPages']);
            }
          }
        }
      }

      Map<String, int> matchesCountByArtwork = {};
      Map<String, List<String>> urlsByArtwork = {}; 
      
      for (var page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        final url = page['url']?.toString();
        
        if (artId != null) {
          matchesCountByArtwork[artId] = (matchesCountByArtwork[artId] ?? 0) + 1;
          
          if (url != null) {
            urlsByArtwork.putIfAbsent(artId, () => []).add(url);
          }
        }
      }

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
        
        int matchesCount = matchesCountByArtwork[artId] ?? 0;
        
        String status = 'scanning';
        if (matchesCount > 0) {
          status = 'scanned';
        } else if (reports.isNotEmpty) {
          status = 'protected';
        }

        return {
          'id': artId,
          'title': art['description'] ?? art['originalFilename'] ?? 'Untitled',          
          'url': imageUrl ?? '',
          'date': art['createdAt'] ?? DateTime.now().toIso8601String(),
          'status': status,
          'matchesCount': matchesCount,
          // FIXED: Map the stored URLs directly into the output payload
          'infringingUrls': urlsByArtwork[artId] ?? [], 
        };
      }).toList();

    } catch (e) {
      return null;
    }
  }

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
      return false;
    }
  }
}
