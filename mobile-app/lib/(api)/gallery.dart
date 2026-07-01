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

      final reports = await _fetchUserReports(userId);

      final allMatchingPages = await _fetchAllMatchingPages(reports);

      final matchesCountByArtwork = <String, int>{};
      final urlsByArtwork = <String, List<String>>{};

      for (var page in allMatchingPages) {
        final artId = page['artworkId']?.toString();
        final url = page['url']?.toString();
        if (artId != null) {
          matchesCountByArtwork[artId] = (matchesCountByArtwork[artId] ?? 0) + 1;
          if (url != null) urlsByArtwork.putIfAbsent(artId, () => []).add(url);
        }
      }

      final storageKeys = artworks.map((a) => a['storageKey']?.toString() ?? '').where((k) => k.isNotEmpty).toList();
      final downloadUrls = await _getDownloadUrls(storageKeys);

      return artworks.map((art) {
        final artId = art['id'].toString();
        final storageKey = art['storageKey'];
        final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;

        final matchesCount = matchesCountByArtwork[artId] ?? 0;

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
          'infringingUrls': urlsByArtwork[artId] ?? [],
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
