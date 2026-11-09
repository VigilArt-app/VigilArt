import 'package:flutter_test/flutter_test.dart';
import 'package:vigilart/(api)/auth.dart';
import 'package:vigilart/(api)/gallery.dart';
import 'package:vigilart/(api)/scan_reports_api.dart';

import 'support/test_app.dart';

Map<String, dynamic> match(String id, String artworkId, String site, {bool unsafe = false, String at = '2026-10-01T10:00:00Z', String category = 'SOCIAL'}) => {
      'id': id,
      'artworkId': artworkId,
      'url': 'https://$site/p/$id',
      'category': category,
      'websiteName': site,
      'unsafeDomain': unsafe,
      'firstDetectedAt': at,
    };

void main() {
  setUp(setUpApi);

  group('scan (#327: no request stays open for minutes)', () {
    test('enqueues, polls short requests and returns the finished report', () async {
      final backend = FakeBackend();
      var polls = 0;
      backend.json('POST', '/reports/user/user-1/scan', {'jobId': 'job-1'});
      backend.on('GET', '/reports/user/user-1/scan/job-1', (_) {
        polls++;
        final state = polls < 3 ? 'active' : 'completed';
        return http200({'jobId': 'job-1', 'state': state, 'progress': {'processed': polls, 'total': 3}, 'reportId': polls < 3 ? null : 'r1', 'error': null});
      });
      backend.json('GET', '/reports/details/r1', {'id': 'r1', 'matchingPages': [match('m1', 'a1', 'pinterest.com')]});

      final seen = <int>[];
      final report = await backend.run(() => ApiService().runScan(
            pollInterval: Duration.zero,
            onProgress: (p, state) => seen.add(p?.processed ?? -1),
          ));
      expect(report['id'], 'r1');
      expect((report['matchingPages'] as List), hasLength(1));
      expect(seen, [1, 2, 3]);
      expect(polls, 3);
    });

    test('reports a failed job with the server message', () async {
      final backend = FakeBackend()
        ..json('POST', '/reports/user/user-1/scan', {'jobId': 'j'})
        ..json('GET', '/reports/user/user-1/scan/j', {'jobId': 'j', 'state': 'failed', 'progress': null, 'reportId': null, 'error': 'SerpApi is down'});
      await backend.run(() async {
        await expectLater(ApiService().runScan(pollInterval: Duration.zero), throwsA(predicate((e) => e.toString().contains('SerpApi is down'))));
      });
    });

    test('stops waiting after the timeout but leaves the scan running', () async {
      final backend = FakeBackend()
        ..json('POST', '/reports/user/user-1/scan', {'jobId': 'j'})
        ..json('GET', '/reports/user/user-1/scan/j', {'jobId': 'j', 'state': 'active', 'progress': null, 'reportId': null, 'error': null});
      await backend.run(() async {
        await expectLater(
          ApiService().runScan(pollInterval: const Duration(milliseconds: 5), timeout: const Duration(milliseconds: 30)),
          throwsA(isA<ScanTimeoutException>()),
        );
      });
    });

    test('reads the scan quota', () async {
      final backend = FakeBackend()..json('GET', '/reports/user/user-1/scan-quota', {'remaining': 0, 'limit': 3, 'nextAvailableAt': '2026-11-25T10:00:00.000Z'});
      final quota = await backend.run(() => ApiService().fetchScanQuota());
      expect(quota.remaining, 0);
      expect(quota.limit, 3);
      expect(quota.nextAvailableAt, isNotNull);
    });
  });

  group('blacklisted sites (#326)', () {
    test('are never the "most recent source" of a report', () async {
      final backend = FakeBackend()
        ..json('GET', '/artworks/user/user-1', {'items': [{'id': 'a1', 'originalFilename': 'harbor.png', 'storageKey': 'artworks/harbor.png'}], 'nextCursor': null})
        ..json('GET', '/reports/user/user-1', [{'id': 'r1'}])
        ..json('GET', '/reports/details/r1', {'matchingPages': [
          match('m1', 'a1', 'adult-board.example', unsafe: true, at: '2026-10-05T10:00:00Z'),
          match('m2', 'a1', 'pinterest.com', at: '2026-10-01T10:00:00Z'),
        ]})
        ..json('POST', '/storage/artworks/download-urls', {});
      final results = await backend.run(() => ApiService().getMasterScanReportMatches());
      expect(results, hasLength(1));
      expect(results!.single['matchesCount'], 2);
      expect(results.single['blacklistedCount'], 1);
      expect(results.single['mostRecentSource'], 'pinterest.com');
    });
  });

  group('gallery statuses are the website statuses', () {
    test('matches found, not scanned, no matches and results unavailable', () async {
      final backend = FakeBackend()
        ..json('GET', '/artworks/user/user-1', {'items': [
          {'id': 'a1', 'originalFilename': 'a.png', 'storageKey': 'k1', 'lastScanAt': '2026-10-01T00:00:00Z'},
          {'id': 'a2', 'originalFilename': 'b.png', 'storageKey': 'k2', 'lastScanAt': null},
          {'id': 'a3', 'originalFilename': 'c.png', 'storageKey': 'k3', 'lastScanAt': '2026-10-01T00:00:00Z'},
        ], 'nextCursor': null})
        ..json('GET', '/reports/user/user-1', [{'id': 'r1'}])
        ..json('GET', '/reports/details/r1', {'matchingPages': [match('m1', 'a1', 'pinterest.com')]})
        ..json('POST', '/storage/artworks/download-urls', {});
      final data = (await backend.run(() => ApiService().fetchGalleryArtworks()))!;
      expect(data.map((a) => a['matchesCount']), [1, 0, 0]);
      expect(data.every((a) => a['reportsLoaded'] == true), isTrue);

      final broken = FakeBackend()
        ..json('GET', '/artworks/user/user-1', {'items': [{'id': 'a1', 'originalFilename': 'a.png', 'storageKey': 'k1', 'lastScanAt': '2026-10-01T00:00:00Z'}], 'nextCursor': null})
        ..on('GET', '/reports/user/user-1', (_) => http500())
        ..json('POST', '/storage/artworks/download-urls', {});
      final unavailable = (await broken.run(() => ApiService().fetchGalleryArtworks()))!;
      expect(unavailable.single['reportsLoaded'], isFalse);
    });
  });
}
