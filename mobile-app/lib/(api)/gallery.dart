import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension GalleryApi on ApiService {
  
  Future<List<Map<String, dynamic>>?> fetchGalleryArtworks() async {
    try {
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      if (userId == null) throw Exception('User ID not found');

      final artworks = await _fetchUserArtworks(userId);
      if (artworks == null) return null;

      final reportsResult = await _fetchUserReportsOrNull(userId);
      final reportsLoaded = reportsResult != null;
      final reports = reportsResult ?? <dynamic>[];

      final allMatchingPages = await _fetchAllMatchingPages(reports);

      final matchesByArtwork = <String, List<Map<String, dynamic>>>{};
      for (final page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        if (artId != null) {
          matchesByArtwork.putIfAbsent(artId, () => []).add(Map<String, dynamic>.from(page as Map));
        }
      }

      final storageKeys = artworks.map((a) => a['storageKey']?.toString() ?? '').where((k) => k.isNotEmpty).toList();
      final downloadUrls = await _getDownloadUrls(storageKeys);

      return artworks.map((art) {
        final artId = art['id'].toString();
        final storageKey = art['storageKey'];
        final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;
        final matches = matchesByArtwork[artId] ?? [];
        matches.sort((a, b) => (b['firstDetectedAt']?.toString() ?? '').compareTo(a['firstDetectedAt']?.toString() ?? ''));
        final blacklisted = matches.where((m) => m['unsafeDomain'] == true).toList();
        final safe = matches.where((m) => m['unsafeDomain'] != true).toList();

        return {
          'id': artId,
          'title': art['description'] ?? art['originalFilename'] ?? '',
          'originalFilename': art['originalFilename'] ?? '',
          'description': art['description'] ?? '',
          'sizeBytes': art['sizeBytes'],
          'url': imageUrl ?? '',
          'date': art['createdAt'] ?? DateTime.now().toIso8601String(),
          // Same inputs as the website's getArtworkStatus.
          'lastScanAt': art['lastScanAt'],
          'reportsLoaded': reportsLoaded,
          'matchesCount': matches.length,
          'blacklistedCount': blacklisted.length,
          'mostRecentSource': safe.isNotEmpty ? safe.first['websiteName'] : null,
          'mostRecentDate': safe.isNotEmpty ? safe.first['firstDetectedAt'] : null,
          'matches': matches,
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
    final allArtworks = <dynamic>[];
    String? cursor;

    while (true) {
      final uri = Uri.parse('$serverUrl/artworks/user/$userId').replace(queryParameters: {
        'limit': '100',
        if (cursor != null) 'cursor': cursor,
      });
      final artworksRes = await authenticatedRequest((headers) => http.get(uri, headers: headers));
      if (artworksRes.statusCode != 200) return allArtworks.isEmpty ? null : allArtworks;

      final artworksData = jsonDecode(artworksRes.body);
      final payload = artworksData['data'] ?? artworksData;

      if (payload is Map) {
        allArtworks.addAll(payload['items'] ?? []);
        final nextCursor = payload['nextCursor']?.toString();
        if (nextCursor == null) break;
        cursor = nextCursor;
      } else {
        allArtworks.addAll(payload as List<dynamic>);
        break;
      }
    }

    return allArtworks;
  }

  /// null when the reports could not be loaded: the gallery then says
  /// "Results unavailable" instead of claiming that nothing was found.
  Future<List<dynamic>?> _fetchUserReportsOrNull(String userId) async {
    final res = await authenticatedRequest((headers) => http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers));
    if (res.statusCode != 200) return null;
    final data = jsonDecode(res.body);
    return data['data'] ?? [];
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

  Future<bool> updateArtworkDescription(String artworkId, String description) async {
    try {
      final response = await authenticatedRequest(
        (headers) => http.patch(
          Uri.parse('$serverUrl/artworks/$artworkId'),
          headers: headers,
          body: jsonEncode({'description': description}),
        ),
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteArtwork(String artworkId) async {
    try {
      final url = Uri.parse('$serverUrl/artworks/$artworkId');
      final response = await authenticatedRequest(
        (headers) => http.delete(url, headers: headers),
        includeContentType: false,
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}
