import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import '../../theme/app_colors.dart';

/// Fixed display order of the website categories, shared by the statistics,
/// the reposts list and the artwork details.
const List<String> kCategoryOrder = AppColors.categoryOrder;

String categoryLabel(AppLocalizations l10n, String category) {
  switch (category) {
    case 'SOCIAL':
      return l10n.catSocial;
    case 'ART_PLATFORMS':
      return l10n.catArtPlatforms;
    case 'MARKETPLACES':
      return l10n.catMarketplaces;
    case 'BLOG':
      return l10n.catBlog;
    case 'MEDIA':
      return l10n.catMedia;
    case 'SEARCH':
      return l10n.catSearch;
    case 'OTHER':
      return l10n.catOther;
    default:
      return category;
  }
}

Color categoryColor(BuildContext context, String category) => context.colors.categoryColor(category);
