import 'package:flutter/material.dart';

/// The canonical website-category taxonomy, mirroring the backend
/// `WebsiteCategory` enum and the web-app's shared `categories.ts`. Shared by
/// the scans-report matches filter and the statistics dashboard so order,
/// labels and colors stay identical everywhere.

/// Fixed display order for website categories.
const List<String> kCategoryOrder = <String>[
  'SOCIAL',
  'ART_PLATFORMS',
  'MARKETPLACES',
  'BLOG',
  'MEDIA',
  'SEARCH',
  'OTHER',
];

/// Human label for a category code (falls back to the raw code).
String categoryLabel(String category) {
  switch (category) {
    case 'SOCIAL':
      return 'Social media';
    case 'ART_PLATFORMS':
      return 'Art platforms';
    case 'MARKETPLACES':
      return 'Marketplaces';
    case 'BLOG':
      return 'Blogs';
    case 'MEDIA':
      return 'Media';
    case 'SEARCH':
      return 'Search engines';
    case 'OTHER':
      return 'Other';
    default:
      return category;
  }
}

/// Validated categorical palette (light steps), mirroring the web dataviz
/// palette. Used by the statistics pie chart and category chips.
const Map<String, Color> _categoryColors = <String, Color>{
  'SOCIAL': Color(0xFF2A78D6),
  'ART_PLATFORMS': Color(0xFF1BAF7A),
  'MARKETPLACES': Color(0xFFEDA100),
  'BLOG': Color(0xFF008300),
  'MEDIA': Color(0xFF4A3AA7),
  'SEARCH': Color(0xFFE34948),
  'OTHER': Color(0xFFE87BA4),
};

/// Color for a category code (falls back to the OTHER hue).
Color categoryColor(String category) =>
    _categoryColors[category] ?? _categoryColors['OTHER']!;
