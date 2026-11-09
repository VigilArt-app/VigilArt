import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:vigilart/l10n/app_localizations.dart';
import 'package:vigilart/theme/app_preferences.dart';
import 'package:vigilart/theme/app_theme.dart';

/// The app shell used by every widget test: real theme, real strings.
Future<Widget> testApp(
  Widget home, {
  Locale locale = const Locale('en'),
  ThemeMode themeMode = ThemeMode.light,
  AppPreferences? preferences,
}) async {
  SharedPreferences.setMockInitialValues({});
  await initializeDateFormatting();
  final prefs = preferences ?? AppPreferences.load(await SharedPreferences.getInstance());
  return ChangeNotifierProvider<AppPreferences>.value(
    value: prefs,
    child: MaterialApp(
      theme: buildAppTheme(Brightness.light),
      darkTheme: buildAppTheme(Brightness.dark),
      themeMode: themeMode,
      locale: locale,
      supportedLocales: AppPreferences.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: home,
    ),
  );
}

/// Phone-sized surface (390 x 844), the size the mockups are drawn for.
Future<void> usePhoneSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(390, 844));
  tester.view.devicePixelRatio = 1;
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

void setUpApi({String userId = 'user-1'}) {
  dotenv.loadFromString(envString: 'API_BASE_URL=https://api.test');
  FlutterSecureStorage.setMockInitialValues({
    'accessToken': 'access',
    'refreshToken': 'refresh',
    'userId': userId,
  });
}

typedef Route = http.Response Function(http.Request request);

/// A tiny fake backend: routes are matched on "METHOD /path".
class FakeBackend {
  final Map<String, Route> routes = {};
  final List<http.Request> requests = [];

  void on(String method, String path, Route route) => routes['$method $path'] = route;

  void json(String method, String path, Object body, {int status = 200}) =>
      on(method, path, (_) => http.Response(jsonEncode({'data': body}), status));

  http.Client get client => MockClient((request) async {
        requests.add(request);
        final route = routes['${request.method} ${request.url.path}'];
        if (route == null) return http.Response('{"message":"not found"}', 404);
        return route(request);
      });

  /// Runs [body] with every top-level `http.get/post/...` call going to this backend.
  Future<T> run<T>(Future<T> Function() body) => http.runWithClient(body, () => client);
}

http.Response http200(Object data) => http.Response(jsonEncode({'data': data}), 200);
http.Response http500() => http.Response('{"message":"boom"}', 500);

http.Response http404() => http.Response('{"message":"not found"}', 404);
