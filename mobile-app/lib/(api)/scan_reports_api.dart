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
      if (reports == null) return null;

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

        // A blacklisted site is never shown as the "most recent source" (#326).
        final safeMatches = matches.where((m) => m['unsafeDomain'] != true);
        final mostRecentMatch = safeMatches.isNotEmpty ? safeMatches.first : null;
        final storageKey = art['storageKey'];
        final imageUrl = storageKey != null ? downloadUrls[storageKey] : null;

        return {
          'artworkId': artId,
          'title': art['title'] ?? art['originalFilename']?.split('.').first ?? 'Unknown Artwork',
          'imageUrl': imageUrl,
          'matchesCount': matches.length,
          'blacklistedCount': matches.where((m) => m['unsafeDomain'] == true).length,
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

  Future<List<dynamic>?> _fetchUserReports(String userId) async {
    final reportsRes = await authenticatedRequest((headers) => http.get(Uri.parse('$serverUrl/reports/user/$userId'), headers: headers));
    if (reportsRes.statusCode != 200) return null;
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

  /// Remaining scans in the rolling 30-day window (`/reports/user/:id/scan-quota`).
  Future<ScanQuota> fetchScanQuota() async {
    final userId = await secureStorage.read(key: ApiService.keyUserId);
    if (userId == null) throw Exception('User ID not found');
    final response = await authenticatedRequest(
      (headers) => http.get(Uri.parse('$serverUrl/reports/user/$userId/scan-quota'), headers: headers),
    );
    if (response.statusCode != 200) throw Exception(response.body);
    final decoded = jsonDecode(response.body);
    return ScanQuota.fromJson(Map<String, dynamic>.from(decoded['data'] ?? decoded));
  }

  /// Starts a scan the way the website does: enqueue, then poll short
  /// requests. No request stays open for minutes, so a proxy timeout cannot
  /// cut the scan (#327). Returns the finished report's details.
  Future<Map<String, dynamic>> runScan({
    void Function(ScanProgress? progress, String state)? onProgress,
    Duration pollInterval = const Duration(seconds: 2),
    Duration timeout = const Duration(minutes: 10),
  }) async {
    final userId = await secureStorage.read(key: ApiService.keyUserId);
    if (userId == null) throw Exception('User ID not found');

    final enqueue = await authenticatedRequest(
      (headers) => http.post(Uri.parse('$serverUrl/reports/user/$userId/scan'), headers: headers),
    );
    if (enqueue.statusCode != 200 && enqueue.statusCode != 201) throw Exception(enqueue.body);
    final enqueued = jsonDecode(enqueue.body);
    final jobId = (enqueued['data'] ?? enqueued)['jobId']?.toString();
    if (jobId == null) throw Exception('Scan queued but no job ID returned');

    final deadline = DateTime.now().add(timeout);
    while (true) {
      if (DateTime.now().isAfter(deadline)) throw const ScanTimeoutException();
      final res = await authenticatedRequest(
        (headers) => http.get(Uri.parse('$serverUrl/reports/user/$userId/scan/$jobId'), headers: headers),
      );
      if (res.statusCode == 404) throw Exception('Scan job not found');
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        final status = Map<String, dynamic>.from(decoded['data'] ?? decoded);
        final state = status['state']?.toString() ?? 'waiting';
        final progress = status['progress'] is Map
            ? ScanProgress.fromJson(Map<String, dynamic>.from(status['progress'] as Map))
            : null;
        onProgress?.call(progress, state);
        if (state == 'failed') throw Exception(status['error'] ?? 'Scan failed');
        if (state == 'completed') {
          final reportId = status['reportId']?.toString();
          if (reportId == null) throw Exception('Report created but no ID returned');
          final details = await authenticatedRequest(
            (headers) => http.get(Uri.parse('$serverUrl/reports/details/$reportId'), headers: headers),
          );
          if (details.statusCode != 200) throw Exception(details.body);
          final data = jsonDecode(details.body);
          return Map<String, dynamic>.from(data['data'] ?? data);
        }
      }
      await Future<void>.delayed(pollInterval);
    }
  }

}

class ScanQuota {
  final int remaining;
  final int limit;
  final DateTime? nextAvailableAt;

  const ScanQuota({required this.remaining, required this.limit, this.nextAvailableAt});

  factory ScanQuota.fromJson(Map<String, dynamic> json) => ScanQuota(
        remaining: (json['remaining'] as num).toInt(),
        limit: (json['limit'] as num).toInt(),
        nextAvailableAt:
            json['nextAvailableAt'] == null ? null : DateTime.tryParse(json['nextAvailableAt'].toString())?.toLocal(),
      );
}

class ScanProgress {
  final int processed;
  final int total;

  const ScanProgress({required this.processed, required this.total});

  factory ScanProgress.fromJson(Map<String, dynamic> json) =>
      ScanProgress(processed: (json['processed'] as num).toInt(), total: (json['total'] as num).toInt());
}

/// The scan is still running on the server, but the app stopped waiting for it.
class ScanTimeoutException implements Exception {
  const ScanTimeoutException();
}
