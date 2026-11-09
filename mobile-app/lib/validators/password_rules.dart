import '../l10n/app_localizations.dart';

/// Same rules as the signup API (`shared/src/schemas/User/User.ts` and
/// `shared/src/constants/User`): at least 8 characters with a lowercase
/// letter, an uppercase letter, a number and a symbol.
const int minPasswordLength = 8;

/// One readable message per missing rule, or an empty list when the password is valid.
List<String> passwordProblems(AppLocalizations l10n, String password) {
  return [
    if (password.length < minPasswordLength) l10n.passwordMinLength,
    if (!RegExp(r'[a-z]').hasMatch(password)) l10n.passwordLowercase,
    if (!RegExp(r'[A-Z]').hasMatch(password)) l10n.passwordUppercase,
    if (!RegExp(r'[0-9]').hasMatch(password)) l10n.passwordNumber,
    if (!RegExp(r'[^a-zA-Z0-9]').hasMatch(password)) l10n.passwordSymbol,
  ];
}

/// The API prefixes validation messages with the field name
/// (`password: Password must contain...`). Show only the readable part.
String stripFieldPrefix(String message) {
  return message
      .split(';')
      .map((part) => part.trim().replaceFirst(RegExp(r'^[A-Za-z][A-Za-z0-9_.]*:\s+'), ''))
      .where((part) => part.isNotEmpty)
      .join('\n');
}
