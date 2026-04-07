import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension ScanReportsApi on ApiService {
  
  Future<List<Map<String, dynamic>>?> getMasterScanReportMatches() async {
    try {
      final token = await getAccessToken();
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception('User ID not found');

      final headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'};

      // 1. Récupérer les Artworks
      final artworksRes = await http.get(Uri.parse('$serverUrl/artworks/user/$userId'), headers: headers);
      if (artworksRes.statusCode != 200) return null;
      final artworksData = jsonDecode(artworksRes.body);
      final List<dynamic> artworks = artworksData['data'] ?? artworksData;

      // 2. Récupérer les Reports
      final reportsRes = await http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers);
      if (reportsRes.statusCode != 200) return null;
      final reportsData = jsonDecode(reportsRes.body);
      final List<dynamic> reports = reportsData['data'] ?? reportsData;

      // 3. Récupérer les détails des reports pour avoir les matchingPages
      List<dynamic> allMatchingPages = [];
      for (var report in reports) {
        final reportId = report['id']?.toString();
        if (reportId == null) continue;

        final detailsRes = await http.get(Uri.parse('$serverUrl/reports/details/$reportId'), headers: headers);
        if (detailsRes.statusCode == 200) {
          final detailsData = jsonDecode(detailsRes.body);
          final detailsRaw = detailsData['data'] ?? detailsData;
          if (detailsRaw['matchingPages'] != null) {
            allMatchingPages.addAll(detailsRaw['matchingPages']);
          }
        }
      }

      // 4. Télécharger les URLs des images (Storage)
      List<String> storageKeys = artworks.map((a) => a['storageKey']?.toString() ?? '').where((k) => k.isNotEmpty).toList();
      
      print("🟢 DEBUG SCAN 1: Liste des storageKeys trouvées = $storageKeys");
      
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
          print("🟢 DEBUG SCAN 3: URLs générées par Cloudflare = $downloadUrls");
        }
      }

      Map<String, List<dynamic>> matchesByArtwork = {};
      for (var page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        if (artId != null) {
          matchesByArtwork.putIfAbsent(artId, () => []).add(page);
        }
      }

      if (reports.isEmpty) {
        return artworks.map((art) {
          final storageKey = art['storageKey'];
          final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;
          return {
            'artworkId': art['id'],
            'title': art['title'] ?? 'Artwork',
            'matchesCount': 0,
            'creditedMatches': 0,
            'mostRecentSource': 'N/A',
            'mostRecentDate': DateTime.now().toIso8601String(),
            'matchingPages': [],
            'imageUrl': imageUrl,
          };
        }).toList();
      }
      return artworks.map((art) {
        final artId = art['id'].toString();
        final matches = matchesByArtwork[artId] ?? [];
        matches.sort((a, b) => DateTime.parse(b['firstDetectedAt']).compareTo(DateTime.parse(a['firstDetectedAt'])));
        final mostRecentMatch = matches.isNotEmpty ? matches.first : null;

        final storageKey = art['storageKey'];
        final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;
        
        print("🟢 DEBUG SCAN 4: Artwork '${art['title']}' -> Clé: $storageKey -> URL Finale: $imageUrl");

        return {
          'artworkId': artId,
          'title': art['title'] ?? art['originalFilename']?.split('.').first ?? 'Unknown Artwork',
          'imageUrl': imageUrl,
          'matchesCount': matches.length,
          'creditedMatches': 0, 
          'mostRecentSource': mostRecentMatch != null ? mostRecentMatch['websiteName'] : 'N/A',
          'mostRecentDate': mostRecentMatch != null ? mostRecentMatch['firstDetectedAt'] : DateTime.now().toIso8601String(),
          'matchingPages': matches, 
        };
      }).toList();

    } catch (e) {
      return null;
    }
  }
}
