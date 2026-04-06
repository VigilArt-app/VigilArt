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

      // 1. get Artworks
      final artworksRes = await http.get(Uri.parse('$serverUrl/artworks/user/$userId'), headers: headers);
      if (artworksRes.statusCode != 200) return null;
      final artworksData = jsonDecode(artworksRes.body);
      final List<dynamic> artworks = artworksData['data'] ?? artworksData;

      // 2. get reports
      final reportsRes = await http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers);
      if (reportsRes.statusCode != 200) return null;
      final reportsData = jsonDecode(reportsRes.body);
      final List<dynamic> reports = reportsData['data'] ?? reportsData;

      if (reports.isEmpty) {
        // Retourner les artworks vides si pas de rapports (comme le React)
        return artworks.map((art) => {
          'artworkId': art['id'],
          'title': art['title'] ?? 'Artwork',
          'matchesCount': 0,
          'creditedMatches': 0,
          'mostRecentSource': 'N/A',
          'mostRecentDate': DateTime.now().toIso8601String(),
          'matchingPages': [],
          'storageKey': art['storageKey']
        }).toList();
      }

      // 3. get details from reports to have the matchingPages
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

      // 4. download URLs images
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

      // 5. group matchingId per Artwork
      Map<String, List<dynamic>> matchesByArtwork = {};
      for (var page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        if (artId != null) {
          matchesByArtwork.putIfAbsent(artId, () => []).add(page);
        }
      }

      // 6. construct the final list
      return artworks.map((art) {
        final artId = art['id'].toString();
        final matches = matchesByArtwork[artId] ?? [];
        
        // get the most recent match
        matches.sort((a, b) => DateTime.parse(b['firstDetectedAt']).compareTo(DateTime.parse(a['firstDetectedAt'])));
        final mostRecentMatch = matches.isNotEmpty ? matches.first : null;

        return {
          'artworkId': artId,
          'title': art['title'] ?? art['originalFilename']?.split('.').first ?? 'Unknown Artwork',
          'imageUrl': art['storageKey'] != null ? downloadUrls[art['storageKey']] : null,
          'matchesCount': matches.length,
          'creditedMatches': 0, // À adapter si le backend fournit cette info
          'mostRecentSource': mostRecentMatch != null ? mostRecentMatch['websiteName'] : 'N/A',
          'mostRecentDate': mostRecentMatch != null ? mostRecentMatch['firstDetectedAt'] : DateTime.now().toIso8601String(),
          'matchingPages': matches,
        };
      }).toList();

    } catch (e) {
      print('Network error formatting scan rows: $e');
      return null;
    }
  }
}
