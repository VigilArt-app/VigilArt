// Must match TERMS_VERSION and PRIVACY_VERSION in shared/src/constants/Legal.ts:
// the signup API rejects any other value, so bump both on every policy change.
const String termsVersion = '2026-09-09';
const String privacyVersion = '2026-10-09';

final Uri termsUrl = Uri.parse('https://vigilart.app/terms');
final Uri privacyUrl = Uri.parse('https://vigilart.app/privacy');
