import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:vigilart/pages/dashboard/statistics/models/statistics_model.dart';
import 'auth.dart';

extension StatisticsApi on ApiService {
  /// Global statistics for the dashboard: total matches + per-category
  /// distribution (scoped by [range]) and the per-report timeline (all reports,
  /// capped backend-side to the 30 most recent).
  Future<GlobalStatistics> fetchGlobalStatistics(
    String userId,
    StatisticsRange range,
  ) async {
    final res = await authenticatedRequest(
      (headers) => http.get(
        Uri.parse('$serverUrl/reports/user/$userId/statistics?range=${range.value}'),
        headers: headers,
      ),
    );
    final data = _extractData(res);
    return GlobalStatistics.fromJson(Map<String, dynamic>.from(data as Map));
  }

  /// Distinct matches in one website category, scoped by [range] — backs the
  /// category drill-down opened from a pie slice. Returns raw matching-page maps.
  Future<List<Map<String, dynamic>>> fetchMatchesByCategory(
    String userId,
    String category,
    StatisticsRange range,
  ) async {
    final res = await authenticatedRequest(
      (headers) => http.get(
        Uri.parse('$serverUrl/reports/user/$userId/matches?category=$category&range=${range.value}'),
        headers: headers,
      ),
    );
    return _extractMatches(res);
  }

  /// The matches found in a single report — backs the drill-down opened from a
  /// monthly-comparison bar. Returns raw matching-page maps.
  Future<List<Map<String, dynamic>>> fetchMatchesByReport(String reportId) async {
    final res = await authenticatedRequest(
      (headers) => http.get(
        Uri.parse('$serverUrl/reports/report/$reportId/matches'),
        headers: headers,
      ),
    );
    return _extractMatches(res);
  }

  List<Map<String, dynamic>> _extractMatches(http.Response res) {
    final data = _extractData(res);
    final list = data is List ? data : <dynamic>[];
    return list.map((m) => Map<String, dynamic>.from(m as Map)).toList();
  }

  dynamic _extractData(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      return decoded is Map && decoded.containsKey('data')
          ? decoded['data']
          : decoded;
    }
    throw Exception('API Error: ${response.statusCode} - ${response.body}');
  }
}
