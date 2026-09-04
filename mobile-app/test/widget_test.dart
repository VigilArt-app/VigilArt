import 'package:flutter_test/flutter_test.dart';
import 'package:vigilart/main.dart';
import 'package:vigilart/pages/login_page.dart';

void main() {
  testWidgets('Renders LoginPage when user is not logged in', (WidgetTester tester) async {
    await tester.pumpWidget(const VigilArtApp(isLoggedIn: false));
    expect(find.byType(LoginPage), findsOneWidget);
    expect(find.text('Email address'), findsOneWidget);
  });
}
