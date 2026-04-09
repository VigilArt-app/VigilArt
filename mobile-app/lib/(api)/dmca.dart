import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth.dart'; 

extension DmcaApiExtension on ApiService {
  
  Future<Map<String, String>> get _dmcaHeaders async {
    final token = await secureStorage.read(key: ApiService.keyAccessToken);
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  dynamic _extractDmcaData(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      return decoded is Map && decoded.containsKey('data') ? decoded['data'] : decoded;
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }


  Future<List<dynamic>> fetchDmcaPlatforms() async {
    final res = await http.get(Uri.parse('$serverUrl/dmca/platform/'), headers: await _dmcaHeaders);
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>?> fetchDmcaProfile(String userId) async {
    final res = await http.get(Uri.parse('$serverUrl/dmca/profile/$userId'), headers: await _dmcaHeaders);
    if (res.statusCode == 404) return null;
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> createDmcaProfile(String userId, Map<String, dynamic> payload) async {
    final res = await http.post(Uri.parse('$serverUrl/dmca/profile/$userId'), headers: await _dmcaHeaders, body: jsonEncode(payload));
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> updateDmcaProfile(String userId, Map<String, dynamic> payload) async {
    final res = await http.patch(Uri.parse('$serverUrl/dmca/profile/$userId'), headers: await _dmcaHeaders, body: jsonEncode(payload));
    return _extractDmcaData(res);
  }

  Future<List<dynamic>> fetchUserDmcaNotices(String userId) async {
    final res = await http.get(Uri.parse('$serverUrl/dmca/notice/user/$userId'), headers: await _dmcaHeaders);
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> createDmcaNotice(Map<String, dynamic> payload) async {
    final res = await http.post(Uri.parse('$serverUrl/dmca/notice/'), headers: await _dmcaHeaders, body: jsonEncode(payload));
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> updateDmcaNotice(String noticeId, Map<String, dynamic> payload) async {
    final res = await http.patch(Uri.parse('$serverUrl/dmca/notice/$noticeId'), headers: await _dmcaHeaders, body: jsonEncode(payload));
    return _extractDmcaData(res);
  }

  Future<Map<String, dynamic>> generateDmcaNotice(String noticeId) async {
    final res = await http.post(Uri.parse('$serverUrl/dmca/notice/$noticeId/generate'), headers: await _dmcaHeaders);
    return _extractDmcaData(res);
  }
}
