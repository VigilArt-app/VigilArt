import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../l10n/app_localizations.dart';

/// Opens a page of the website in the system browser.
Future<void> openExternalUrl(BuildContext context, Uri url) async {
  final messenger = ScaffoldMessenger.of(context);
  final message = AppLocalizations.of(context).openLinkFailed;
  final ok = await launchUrl(url, mode: LaunchMode.externalApplication).catchError((_) => false);
  if (!ok) messenger.showSnackBar(SnackBar(content: Text(message)));
}

final Uri faqUrl = Uri.parse('https://vigilart.app/faq');
final Uri legalNoticeUrl = Uri.parse('https://vigilart.app/legal-notice');
