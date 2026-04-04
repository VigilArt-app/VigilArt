import 'dart:convert';
import 'package:http/http.dart' as http;

import 'auth.dart'; 

extension ScanReportsApi on ApiService {
  
  Future<List<Map<String, dynamic>>?> getMasterScanReportMatches() async {
    try {
      final token = await getAccessToken();
      final userId = await secureStorage.read(key: ApiService.keyUserId);
      
      if (userId == null) throw Exception('User ID not found');

      final reportsUrl = Uri.parse('$serverUrl/reports/user/$userId');
      final reportsResponse = await http.get(
        reportsUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (reportsResponse.statusCode != 200) {
        print('Failed to load user reports: ${reportsResponse.statusCode}');
        return null;
      }

      final reportsData = jsonDecode(reportsResponse.body);
      final List<dynamic> reportsList = reportsData['data'] ?? reportsData; 

      List<Map<String, dynamic>> allCombinedMatches = [];

      for (var report in reportsList) {
        final String? reportId = report['id']?.toString();
        if (reportId == null) continue;

        final detailsUrl = Uri.parse('$serverUrl/reports/details/$reportId');
        final detailsResponse = await http.get(
          detailsUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        if (detailsResponse.statusCode == 200) {
          final detailsData = jsonDecode(detailsResponse.body);
          final reportDetails = detailsData['data'] ?? detailsData;

          if (reportDetails['matches'] != null) {
            allCombinedMatches.addAll(List<Map<String, dynamic>>.from(reportDetails['matches']));
          } else if (reportDetails['artworks'] != null) {
             for (var artwork in reportDetails['artworks']) {
                if (artwork['matches'] != null) {
                   allCombinedMatches.addAll(List<Map<String, dynamic>>.from(artwork['matches']));
                }
             }
          }
        }
      }

      return allCombinedMatches;

    } catch (e) {
      print('Network error getting combined matches: $e');
      return null;
    }
  }
}
