import 'package:flutter_test/flutter_test.dart';
import 'package:vigilart/pages/dashboard/scan_report/match_category_filter.dart';

// Ports the intent of the web-app `matchCategoryFilter.test`: the category
// filter is a no-op for "ALL", filtering keeps only the chosen category, and
// results are always newest-first by `firstDetectedAt` without mutating input.
void main() {
  List<Map<String, dynamic>> sample() => [
        {'url': 'a', 'category': 'SOCIAL', 'firstDetectedAt': '2026-01-01T00:00:00Z'},
        {'url': 'b', 'category': 'MARKETPLACES', 'firstDetectedAt': '2026-03-01T00:00:00Z'},
        {'url': 'c', 'category': 'SOCIAL', 'firstDetectedAt': '2026-02-01T00:00:00Z'},
      ];

  group('presentCategories', () {
    test('returns present categories in canonical order', () {
      expect(presentCategories(sample()), ['SOCIAL', 'MARKETPLACES']);
    });

    test('empty for no matches', () {
      expect(presentCategories([]), isEmpty);
    });
  });

  group('filterAndSortMatches', () {
    test('ALL keeps everything, newest-first', () {
      final result = filterAndSortMatches(sample(), kAllCategories);
      expect(result.map((m) => m['url']), ['b', 'c', 'a']);
    });

    test('filters to a single category, newest-first', () {
      final result = filterAndSortMatches(sample(), 'SOCIAL');
      expect(result.map((m) => m['url']), ['c', 'a']);
    });

    test('unknown category yields empty list', () {
      expect(filterAndSortMatches(sample(), 'BLOG'), isEmpty);
    });

    test('does not mutate the input order', () {
      final input = sample();
      filterAndSortMatches(input, kAllCategories);
      expect(input.map((m) => m['url']), ['a', 'b', 'c']);
    });

    test('tolerates missing/invalid dates without throwing', () {
      final input = [
        {'url': 'x', 'category': 'OTHER'},
        {'url': 'y', 'category': 'OTHER', 'firstDetectedAt': '2026-05-01T00:00:00Z'},
      ];
      final result = filterAndSortMatches(input, kAllCategories);
      expect(result.first['url'], 'y');
    });
  });
}
