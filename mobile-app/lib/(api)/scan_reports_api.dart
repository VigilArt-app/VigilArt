import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension ScanReportsApi on ApiService {
  Future<List<Map<String, dynamic>>?> getMasterScanReportMatches() async {
    try {
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception('User ID not found');

      final artworks = await _fetchUserArtworks(userId);
      if (artworks == null) return null;

      final reports = await _fetchUserReports(userId);

      final allMatchingPages = await _fetchAllMatchingPages(reports);

      final storageKeys = artworks.map((a) => a['storageKey']?.toString() ?? '').where((k) => k.isNotEmpty).toList();
      final downloadUrls = await _getDownloadUrls(storageKeys);

      final deduplicatedMatches = <String, Map<String, dynamic>>{};

      for (var page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        if (artId != null) {
          deduplicatedMatches.putIfAbsent(artId, () => {});
          final matchKey = page['id']?.toString() ?? '${page['url']}-${page['firstDetectedAt']}';
          deduplicatedMatches[artId]![matchKey] = page;
        }
      }

      return artworks.map((art) {
        final artId = art['id'].toString();
        final matchesMap = deduplicatedMatches[artId] ?? {};
        final matches = matchesMap.values.toList();

        int creditedCount = 0;
        if (matches.isNotEmpty) {
          matches.sort((a, b) => DateTime.parse(b['firstDetectedAt']).compareTo(DateTime.parse(a['firstDetectedAt'])));
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

  Future<List<dynamic>> _fetchAllMatchingPages(List<dynamic> reports) async {
    if (reports.isEmpty) return [];

    final detailRequests = reports.map((report) {
      final reportId = report['id']?.toString();
      return authenticatedRequest((headers) => http.get(Uri.parse('$serverUrl/reports/details/$reportId'), headers: headers));
    });

    final detailResponses = await Future.wait(detailRequests);
    final allMatchingPages = <dynamic>[];

    for (var res in detailResponses) {
      if (res.statusCode == 200) {
        final detailsData = jsonDecode(res.body);
        final detailsRaw = detailsData['data'] ?? detailsData;
        if (detailsRaw['matchingPages'] != null) {
          allMatchingPages.addAll(detailsRaw['matchingPages']);
        }
      }
    }

    return allMatchingPages;
  }

  Future<List<dynamic>?> _fetchUserArtworks(String userId) async {
    final artworksRes = await authenticatedRequest((headers) => http.get(Uri.parse('$serverUrl/artworks/user/$userId'), headers: headers));
    if (artworksRes.statusCode != 200) return null;
    final artworksData = jsonDecode(artworksRes.body);
    return artworksData['data'] ?? artworksData;
  }

  Future<List<dynamic>> _fetchUserReports(String userId) async {
    final reportsRes = await authenticatedRequest((headers) => http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers));
    if (reportsRes.statusCode != 200) return [];
    final reportsData = jsonDecode(reportsRes.body);
    return reportsData['data'] ?? [];
  }

  Future<Map<String, dynamic>> _getDownloadUrls(List<String> storageKeys) async {
    if (storageKeys.isEmpty) return {};

    final urlsRes = await authenticatedRequest((headers) => http.post(Uri.parse('$serverUrl/storage/artworks/download-urls'), headers: headers, body: jsonEncode({'storageKeys': storageKeys})),);
    if (urlsRes.statusCode == 200 || urlsRes.statusCode == 201) {
      final urlsData = jsonDecode(urlsRes.body);
      return urlsData['data'] ?? urlsData;
    }
    return {};
  }

  Future<Map<String, dynamic>> triggerManualScan() async {
    final userId = await secureStorage.read(key: ApiService.keyUserId);
    if (userId == null) throw Exception('User ID not found');

    final response = await authenticatedRequest(
      (headers) => http.post(
        Uri.parse('$serverUrl/reports/user/$userId'),
        headers: headers,
      ),
    );
    
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(response.body); 
    }

    final createdData = jsonDecode(response.body);
    final reportId = (createdData['data'] ?? createdData)['id'];

    if (reportId == null) throw Exception('Report created but no ID returned');

    final detailsRes = await authenticatedRequest(
      (headers) => http.get(
        Uri.parse('$serverUrl/reports/details/$reportId'),
        headers: headers,
      ),
    );

    if (detailsRes.statusCode != 200) {
      throw Exception(detailsRes.body);
    }

    final detailsData = jsonDecode(detailsRes.body);
    return detailsData['data'] ?? detailsData;
  }

}
