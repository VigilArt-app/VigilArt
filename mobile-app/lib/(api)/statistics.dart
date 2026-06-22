import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:vigilart/pages/dashboard/statistics/models/statisticsModel.dart';
import 'auth.dart'; 

extension StatisticsApi on ApiService {
  
  Future<UserStatistics> fetchUserStatistics(String userId) async {
    final res = await authenticatedRequest(
      (headers) => http.get(Uri.parse('$serverUrl/user/$userId/statistics'), headers: headers),
    );    
    final data = _extractDmcaData(res);
    return UserStatistics.fromJson(data);
  }

  dynamic _extractDmcaData(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      return decoded is Map && decoded.containsKey('data') ? decoded['data'] : decoded;
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }

}