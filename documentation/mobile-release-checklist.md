# Mobile release checklist (Google Play and App Store)

Status on branch `feat/mobile-redesign-store-release`, checked on 2026-11-09. **Done** = in the repository and tested, **Human** = needs an account, a console, a Mac or a decision, **Verify** = cannot be checked without a device.

## Conditions of the stores (checked today)

| Store | Condition | Source | Status |
|---|---|---|---|
| Google Play | New apps and updates must target Android 16 (API 36) since 2026-08-31 | [Play target API requirement](https://developer.android.com/google/play/requirements/target-sdk) | Done: Flutter 3.41.9 targets API 36 (`flutter.targetSdkVersion`); confirm in the AAB at upload |
| Google Play | Personal developer accounts created after 2023-11-13 must run a closed test with 12 testers opted in for 14 days before applying for production | [Play Console help](https://support.google.com/googleplay/android-developer/answer/14151465) | Human: check the account type. With a personal account, production cannot be reached in under 14 days |
| Google Play | Data safety form, privacy policy URL, account deletion URL, content rating, target audience, ads declaration | [Play Console help](https://support.google.com/googleplay/android-developer/answer/10787469) | Answers written in `documentation/store-privacy-declarations.md`; Human: enter them |
| App Store | Uploads must be built with Xcode 26 or later (iOS 26 SDK), since 2026-04-28 | [Apple upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) | Human: build on a Mac with Xcode 26+. The CI job uses `macos-15`: check that it selects Xcode 26 |
| App Store | iOS apps must target iOS 13 or later | [Apple upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) | Done: deployment target 13.0 |
| App Store | Updated age rating questions answered for each app | [Apple upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) | Human: answer in App Store Connect |
| App Store | Guideline 5.1.2(i): say what data is sent to a third-party AI service, to whom, and ask permission first | [Apple guidelines update, Nov 2025](https://developer.apple.com/news?id=ey6d8onl), [TechCrunch](https://techcrunch.com/2025/11/13/apples-new-app-review-guidelines-clamp-down-on-apps-sharing-personal-data-with-third-party-ai) | Done: one-time notice before the first scan names SerpApi and Google Lens (`scan_consent` strings); the policy already says artwork is never used to train AI |
| App Store | Sign in with Apple only if a third-party login is offered (4.8) | Apple guidelines | Done: no Google or other third-party login in the app |
| App Store | Account deletion inside the app (5.1.1(v)) | Apple guidelines | Done: Profile → Delete account |

## What this branch delivers

| Ticket | Result |
|---|---|
| #332 Android App Bundle | Done on the merged `feat/330-mobile-store-release` commits: `.aab` built and attached to the release. Human: first upload in Play Console |
| #337 iOS build runs on iPhone | Done in the project: display name, deployment target, permission texts, Firebase started only when configured. Human: `GoogleService-Info.plist` values in `.env` and a run on a real iPhone |
| #338 iOS push | Done in code: entitlements, background mode, token registered as `IOS` (was `ANDROID`). Human: APNs key in Firebase, test on a real iPhone |
| #339 iPhone sizes, iPad, orientation | iPhone only, portrait only. Widget tests cover 360x640, 375x667, 430x932, French, dark and 200% text. Verify: real iPhone, keyboard on the DMCA form |
| #340 Privacy manifest, export compliance | Done: manifest (now with other user content), `ITSAppUsesNonExemptEncryption = NO` |
| #331 Store assets, demo account | Done: copy in `documentation/mobile-store-listing.md`, icons regenerated from the official logo. Human: screenshots from a build (the design system provides the frames), support URL, demo account on production |
| #334 / #342 Listings and forms | Answers and copy written; Human: enter them in both consoles |
| #333 / #335 / #336 / #341 | Human: Play Console and App Signing, test tracks, Apple Developer account and signing, TestFlight |
| #361 Build with the new legal versions | Done in code: versions `2026-10-22` match `shared/src/constants/Legal.ts` (a test fails if they drift). Human: publish the build |
| #364 Push preference after update | Done: the old `notificationsEnabled` value is copied once. Tested |
| #365 Installed builds change preference | Done: the API accepts `notificationsEnabled` for one release and maps it to the mobile preference. Tested |
| #376 Renamed wording | Done: "Start a scan" and "Detected reposts", in French and English |
| #326 Blacklisted matches | Done: hidden until Show, never opened as links, never the "most recent source". Tested |
| #327 Scan timeout behind the proxy | Done: the app enqueues the scan and polls short requests, like the website. No request stays open for minutes. Tested |
| #329 Password rules | Done: the app checks the API rules and shows one message per missing rule. Tested |
| #375 Scan status title | Done in the app ("Scan in progress"); the website still has the old title |

Not implemented in the app, on purpose: the public free scan (it needs the Cloudflare Turnstile check, which works in a browser), browser notifications, and the FAQ and legal texts inside the app (they open the website).

## Friday

- **App Store:** build with Xcode 26+, upload, TestFlight on a real iPhone, submit with the demo account in the review notes. Review usually takes 24 to 48 hours, so submitting by Tuesday or Wednesday is needed for Friday.
- **Google Play:** an organization account can go through review in a few days; a personal account needs the 14-day closed test first, which makes Friday impossible unless it already started.
- Both stores can reject on review. Treat Friday as the target for submission, not as a guaranteed publication date.

## Before pressing submit

1. Merge this branch, then `main`: the release workflow builds the `.apk` and `.aab` with the release keystore.
2. Fill `mobile-app/.env` with the production API and the iOS Firebase values; upload the APNs key.
3. Enter the answers of `documentation/store-privacy-declarations.md` in App Privacy and Data safety, with https://vigilart.app/privacy.
4. Publish a public page for account deletion requests (Play asks for a web link).
5. Create the demo account on production with a few artworks and a finished scan; give its credentials only in the review notes.
