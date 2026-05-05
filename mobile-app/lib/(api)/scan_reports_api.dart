import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension ScanReportsApi on ApiService {
  
  Future<List<Map<String, dynamic>>?> getMasterScanReportMatches() async {
    try {
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception('User ID not found');

      final artworksRes = await authenticatedRequest(
        (headers) => http.get(Uri.parse('$serverUrl/artworks/user/$userId'), headers: headers),
      );
      if (artworksRes.statusCode != 200) return null;
      final artworksData = jsonDecode(artworksRes.body);
      final List<dynamic> artworks = artworksData['data'] ?? artworksData;

      final reportsRes = await authenticatedRequest(
        (headers) => http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers),
      );
      if (reportsRes.statusCode != 200) return null;
      final reportsData = jsonDecode(reportsRes.body);
      final List<dynamic> reports = reportsData['data'] ?? reportsData;

      List<dynamic> allMatchingPages = [];
      if (reports.isNotEmpty) {
        final detailRequests = reports.map((report) {
          final reportId = report['id']?.toString();
          return authenticatedRequest(
            (headers) => http.get(Uri.parse('$serverUrl/reports/details/$reportId'), headers: headers),
          );
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

      List<String> storageKeys = artworks.map((a) => a['storageKey']?.toString() ?? '').where((k) => k.isNotEmpty).toList();
      
      Map<String, dynamic> downloadUrls = {};
      if (storageKeys.isNotEmpty) {
        final urlsRes = await authenticatedRequest(
          (headers) => http.post(
            Uri.parse('$serverUrl/storage/artworks/download-urls'),
            headers: headers,
            body: jsonEncode({'storageKeys': storageKeys}),
          ),
        );
        
        if (urlsRes.statusCode == 200 || urlsRes.statusCode == 201) {
          final urlsData = jsonDecode(urlsRes.body);
          downloadUrls = urlsData['data'] ?? urlsData;
        }
      }

      Map<String, List<dynamic>> matchesByArtwork = {};
      for (var page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        if (artId != null) {
          matchesByArtwork.putIfAbsent(artId, () => []).add(page);
        }
      }

      return artworks.map((art) {
        final artId = art['id'].toString();
        final matches = matchesByArtwork[artId] ?? [];
        
        int creditedCount = 0;
        
        if (matches.isNotEmpty) {
          matches.sort((a, b) => DateTime.parse(b['firstDetectedAt']).compareTo(DateTime.parse(a['firstDetectedAt'])));
          
          // FIXED: Dynamically calculate how many matches have proper credit
          creditedCount = matches.where((m) => m['isCredited'] == true).length;
        }
        
        final mostRecentMatch = matches.isNotEmpty ? matches.first : null;
        final storageKey = art['storageKey'];
        final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;

        return {
          'artworkId': artId,
          'title': art['title'] ?? art['originalFilename']?.split('.').first ?? 'Unknown Artwork',
          'imageUrl': imageUrl,
          'matchesCount': matches.length,
          'creditedMatches': creditedCount, 
          'mostRecentSource': mostRecentMatch != null ? mostRecentMatch['websiteName'] : 'N/A',
          'mostRecentDate': mostRecentMatch != null ? mostRecentMatch['firstDetectedAt'] : null,
          'matchingPages': matches, 
        };
      }).toList();

    } catch (e) {
      return null;
    }
  }
}