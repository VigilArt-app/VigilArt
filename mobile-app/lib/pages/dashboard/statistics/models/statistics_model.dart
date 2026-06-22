class UserStatistics {
  final int totalScanned;
  final int infringementsFound;
  final int noticesSent;
  final int resolvedCases;
  final List<ChartPoint> growthData;
  final List<ChartPoint> resolvedData;
  final List<SourceData> sourceData;

  UserStatistics({
    required this.totalScanned,
    required this.infringementsFound,
    required this.noticesSent,
    required this.resolvedCases,
    required this.growthData,
    required this.resolvedData,
    required this.sourceData,
  });

  factory UserStatistics.fromJson(Map<String, dynamic> json) {
    return UserStatistics(
      totalScanned: json['totalScanned'] ?? 0,
      infringementsFound: json['infringementsFound'] ?? 0,
      noticesSent: json['noticesSent'] ?? 0,
      resolvedCases: json['resolvedCases'] ?? 0,
      growthData: (json['growthData'] as List? ?? [])
          .map((item) => ChartPoint.fromJson(item))
          .toList(),
      resolvedData: (json['resolvedData'] as List? ?? [])
          .map((item) => ChartPoint.fromJson(item))
          .toList(),
      sourceData: (json['sourceData'] as List? ?? [])
          .map((item) => SourceData.fromJson(item))
          .toList(),
    );
  }
}

class ChartPoint {
  final String label;
  final double value;

  ChartPoint({required this.label, required this.value});

  factory ChartPoint.fromJson(Map<String, dynamic> json) {
    return ChartPoint(
      label: json['label'] ?? '',
      value: (json['value'] ?? 0).toDouble(),
    );
  }
}

class SourceData {
  final String platform;
  final double percentage;

  SourceData({required this.platform, required this.percentage});

  factory SourceData.fromJson(Map<String, dynamic> json) {
    return SourceData(
      platform: json['platform'] ?? '',
      percentage: (json['percentage'] ?? 0).toDouble(),
    );
  }
}
