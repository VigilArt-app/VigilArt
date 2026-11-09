# VigilArt mobile app

Flutter app for Android and iOS (package / bundle ID `app.vigilart`).

## Run locally

1. Create `mobile-app/.env`:

   ```
   API_BASE_URL=https://<api host>
   # iOS only, for push notifications (Firebase console → Project settings → iOS app)
   FIREBASE_IOS_API_KEY=
   FIREBASE_IOS_APP_ID=
   FIREBASE_MESSAGING_SENDER_ID=
   FIREBASE_PROJECT_ID=
   ```

   Without the Firebase values the app still starts; only push notifications are off.
   Android reads its Firebase config from `android/app/google-services.json` instead.

2. `flutter pub get`, then `flutter run --flavor dev` (Android) or `flutter run` (iOS).

## Android release (Google Play)

Merging to `main` runs `release-mobile` in `.github/workflows/deploy-main.yml`. semantic-release builds, with the release keystore:

- `vigilart-v<version>.apk`: direct download from the GitHub release.
- `vigilart-v<version>.aab`: the App Bundle to upload to Google Play.

Both are attached to the `mobile-v<version>` GitHub release. The build number is `GITHUB_RUN_NUMBER`; Play refuses a `versionCode` it has already seen, so it must only go up.

Upload the `.aab` in Play Console → Test and release. The first upload has to be done by hand. With Play App Signing, the CI keystore (`APK_RELEASE_KEYSTORE`) is the **upload key**.

## iOS release (App Store)

iOS builds need macOS and Xcode. CI checks that the project compiles on every mobile change (`build-ios` in `ci.yml`, unsigned). To publish:

1. On a Mac, open `ios/Runner.xcworkspace` and select the Apple developer team for the `Runner` target (Signing & Capabilities).
2. Put the iOS Firebase values in `.env` (see above), and upload the APNs key (`.p8`) in Firebase → Cloud Messaging → Apple app configuration.
3. `flutter build ipa --release --build-name=<version> --build-number=<n>`. The build number must go up on every upload.
4. Upload `build/ios/ipa/*.ipa` with Xcode Organizer or Transporter, test it on TestFlight, then submit it from App Store Connect.

Notes:

- Push notifications are only enabled for Release and Profile builds (`Runner.entitlements`). Debug builds have no push capability, so they can be installed with a free Apple ID ("Personal Team") to test on an iPhone without the paid developer account.
- `ios/Runner/PrivacyInfo.xcprivacy` declares the data the app collects. Keep it in line with the App Store "App Privacy" answers and https://vigilart.app/privacy.
- `ITSAppUsesNonExemptEncryption` is `false`: the app only uses HTTPS, so App Store Connect does not ask the export compliance question on each build.

Release tracking: #330.
