enum StatisticsRange {
  all,
  month;

  String get value => name;
}

class GlobalStatistics {
  final int totalMatches;
  final List<CategoryDistributionItem> categoryDistribution;
  final List<TimelinePoint> timeline;

  GlobalStatistics({
    required this.totalMatches,
    required this.categoryDistribution,
    required this.timeline,
  });

  factory GlobalStatistics.fromJson(Map<String, dynamic> json) {
    return GlobalStatistics(
      totalMatches: (json['totalMatches'] ?? 0) as int,
      categoryDistribution: (json['categoryDistribution'] as List? ?? [])
          .map((item) => CategoryDistributionItem.fromJson(item))
          .toList(),
      timeline: (json['timeline'] as List? ?? [])
          .map((item) => TimelinePoint.fromJson(item))
          .toList(),
    );
  }
}

class CategoryDistributionItem {
  final String category;
  final int count;

  CategoryDistributionItem({required this.category, required this.count});

  factory CategoryDistributionItem.fromJson(Map<String, dynamic> json) {
    return CategoryDistributionItem(
      category: json['category']?.toString() ?? 'OTHER',
      count: (json['count'] ?? 0) as int,
    );
  }
}

class TimelinePoint {
  final String reportId;
  final String date;
  final int totalMatches;

  TimelinePoint({
    required this.reportId,
    required this.date,
    required this.totalMatches,
  });

  factory TimelinePoint.fromJson(Map<String, dynamic> json) {
    return TimelinePoint(
      reportId: json['reportId']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      totalMatches: (json['totalMatches'] ?? 0) as int,
    );
  }
}
