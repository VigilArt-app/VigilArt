import '../categories.dart';

/// Dart port of the web-app `matchCategoryFilter.ts`. Filters a list of raw
/// matching-page maps by website category and sorts them newest-first by
/// `firstDetectedAt`. Matches are untyped `Map<String, dynamic>` on mobile;
/// each carries a `category` code and a `firstDetectedAt` timestamp.

/// Sentinel for "no category filter" — a real, non-empty dropdown value.
const String kAllCategories = 'ALL';

/// The categories actually present in [matches], in the canonical display
/// order. Used to build the filter options so empty categories are never
/// offered.
List<String> presentCategories(List<dynamic> matches) {
  final present = matches
      .map((m) => (m as Map)['category']?.toString())
      .whereType<String>()
      .toSet();
  return kCategoryOrder.where(present.contains).toList();
}

/// Applies the category filter (a no-op for [kAllCategories]) and returns a new
/// list sorted newest-first by `firstDetectedAt`. Never mutates the input.
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
