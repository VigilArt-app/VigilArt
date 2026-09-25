import '../categories.dart';

const String kAllCategories = 'ALL';

List<String> presentCategories(List<dynamic> matches) {
  final present = matches
      .map((m) => (m as Map)['category']?.toString())
      .whereType<String>()
      .toSet();
  return kCategoryOrder.where(present.contains).toList();
}

List<Map<String, dynamic>> filterAndSortMatches(
  List<dynamic> matches,
  String selection,
) {
  final filtered = selection == kAllCategories
      ? matches
      : matches.where((m) => (m as Map)['category']?.toString() == selection);

  final result = filtered
      .map((m) => Map<String, dynamic>.from(m as Map))
      .toList();

  result.sort((a, b) {
    final bDate = _parseDate(b['firstDetectedAt']);
    final aDate = _parseDate(a['firstDetectedAt']);
    return bDate.compareTo(aDate);
  });

  return result;
}

DateTime _parseDate(dynamic value) {
  if (value is String) {
    return DateTime.tryParse(value) ?? DateTime.fromMillisecondsSinceEpoch(0);
  }
  return DateTime.fromMillisecondsSinceEpoch(0);
}
