import 'package:shared_preferences/shared_preferences.dart';

import '../(api)/auth.dart';
import '../(api)/user.dart';
import 'notification_service.dart';

/// Turns push notifications on or off for this device and keeps the backend
/// flag in sync. Returns false when the device or the backend refused, in
/// which case nothing is left half-changed.
Future<bool> updateMobileNotifications(bool enabled, {ApiService? api}) async {
  final apiService = api ?? ApiService();
  final deviceOk = enabled ? await NotificationService().initialize() != null : await NotificationService().unregisterDevice();
  if (!deviceOk) return false;

  final profile = await apiService.updateUserProfile({'mobileNotificationsEnabled': enabled});
  if (profile == null) {
    // Keep the device and the backend in sync.
    if (enabled) {
      await NotificationService().unregisterDevice();
    } else {
      await NotificationService().initialize();
    }
    return false;
  }
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('mobileNotificationsEnabled', enabled);
  return true;
}
