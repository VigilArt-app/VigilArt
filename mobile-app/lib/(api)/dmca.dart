import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension DmcaApiExtension on ApiService {

  dynamic _extractDmcaData(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      return decoded is Map && decoded.containsKey('data') ? decoded['data'] : decoded;
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }


  Future<List<dynamic>> fetchDmcaPlatforms() async {
    final res = await authenticatedRequest(
      (headers) => http.get(Uri.parse('$serverUrl/dmca/platform/'), headers: headers),
    );
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>?> fetchDmcaProfile(String userId) async {
    final res = await authenticatedRequest(
      (headers) => http.get(Uri.parse('$serverUrl/dmca/profile/$userId'), headers: headers),
    );
    if (res.statusCode == 404) return null;
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> createDmcaProfile(String userId, Map<String, dynamic> payload) async {
    final res = await authenticatedRequest(
      (headers) => http.post(
        Uri.parse('$serverUrl/dmca/profile/$userId'),
        headers: headers,
        body: jsonEncode(payload),
      ),
    );
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> updateDmcaProfile(String userId, Map<String, dynamic> payload) async {
    final res = await authenticatedRequest(
      (headers) => http.patch(
        Uri.parse('$serverUrl/dmca/profile/$userId'),
        headers: headers,
        body: jsonEncode(payload),
      ),
    );
    return _extractDmcaData(res);
  }

  Future<List<dynamic>> fetchUserDmcaNotices(String userId) async {
    final res = await authenticatedRequest(
      (headers) => http.get(Uri.parse('$serverUrl/dmca/notice/user/$userId'), headers: headers),
    );
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> createDmcaNotice(Map<String, dynamic> payload) async {
    final res = await authenticatedRequest(
      (headers) => http.post(
        Uri.parse('$serverUrl/dmca/notice/'),
        headers: headers,
        body: jsonEncode(payload),
      ),
    );
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> updateDmcaNotice(String noticeId, Map<String, dynamic> payload) async {
    final res = await authenticatedRequest(
      (headers) => http.patch(
        Uri.parse('$serverUrl/dmca/notice/$noticeId'),
        headers: headers,
        body: jsonEncode(payload),
      ),
    );
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> generateDmcaNotice(String noticeId) async {
    final res = await authenticatedRequest(
      (headers) => http.post(Uri.parse('$serverUrl/dmca/notice/$noticeId/generate'), headers: headers),
    );
    return _extractDmcaData(res);
  }
}
