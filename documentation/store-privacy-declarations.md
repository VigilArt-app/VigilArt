# Store privacy declarations (App Store and Google Play)

Answers for **App Store Connect → App Privacy** and **Play Console → Data safety**, written from the Privacy Policy at https://vigilart.app/privacy (English text in `web-app/public/locales/en/translation.json`, `privacy_page`) and from what the mobile app does. Keep this file, `mobile-app/ios/Runner/PrivacyInfo.xcprivacy` (branch `feat/330-mobile-store-release`) and the Privacy Policy in line: if one changes, change the others.

Data controller and contact: see the Legal Notice. Privacy contact: vigilart.app@gmail.com.

## What the app collects and where it goes

| Data | Why | Where it goes |
|---|---|---|
| Name, email address, password (hashed with bcrypt) | Create and run the account | VigilArt backend and database (Epitech-hosted VM), behind Cloudflare |
| Artwork images and their descriptions | Store the user's artworks and search for reposts | Cloudflare R2 (private bucket) |
| Scan history and matches found online | Show the results | VigilArt database |
| DMCA profile (full name, address, phone, email, signature) and notice contents | Prefill and generate the DMCA notice and its PDF | VigilArt database; the PDF in Cloudflare R2, deleted after one day; notices kept 3 years without a link to the account after deletion |
| Push token (device identifier) and notification preferences | Send push notifications the user turned on | Firebase Cloud Messaging (Google) |
| IP address, session information, technical logs | Secure the service and prevent abuse | Cloudflare and the backend; IP kept only as a keyed hash for 30 days to limit free guest scans; logs rotated automatically |
| Acceptance of the Terms and the Privacy Policy (date and versions) | Prove consent | VigilArt database |

The app has no advertising, no analytics SDK, no tracking across apps or websites, and no sale of data. The app uses the camera and the photo library only when the user chooses to add an artwork or a profile picture, and does not request location or contacts.

## SerpApi (reverse image search)

To find where an artwork appears, the backend sends **a temporary URL giving access to the image** to **SerpApi**, which queries the Google Lens API. SerpApi states that search data is deleted automatically 31 days after a search completes. SerpApi acts as a service provider for VigilArt. This must be named in three places: the Privacy Policy (section 3, already there), the store privacy answers below, and the in-app notice before the first scan (text at the end of this file).

Other processors named in the policy: Cloudflare R2, Cloudflare network and Turnstile, Firebase Cloud Messaging, Google Forms and Sheets (optional feedback form, website only), Epitech infrastructure. Some process data outside the EEA under the mechanisms listed in section 5 of the policy.

## App Store: App Privacy

Data used to track the user: **none**. Tracking domains: none. No App Tracking Transparency prompt.

Data collected, all **linked to the user**, **not used for tracking**, purpose **App Functionality**:

| Apple category | Data type | Notes |
|---|---|---|
| Contact Info | Name | Account and DMCA profile |
| Contact Info | Email Address | Account and DMCA profile |
| Contact Info | Physical Address | DMCA profile, optional until a notice is prepared |
| Contact Info | Phone Number | DMCA profile, optional until a notice is prepared |
| User Content | Photos or Videos | Uploaded artworks; temporary link sent to SerpApi |
| User Content | Other User Content | Artwork descriptions, DMCA notice contents and signature |
| Identifiers | Device ID | Push notification token |

To decide with the owner: technical logs that may contain the email address and the hashed IP address. If you consider them collected data, add **Diagnostics → Other Diagnostic Data** (App Functionality, linked, no tracking). Apple counts data sent to a third-party partner as collected by you: SerpApi (the artwork link) and Firebase (the push token) are therefore already covered by the rows above.

`PrivacyInfo.xcprivacy` on branch `feat/330-mobile-store-release` already declares email, name, physical address, phone number, photos or videos and device ID, no tracking, and the UserDefaults reason `CA92.1`. Add **Other User Content** there to match this table.

Also fill in: Privacy Policy URL `https://vigilart.app/privacy`, and in the app a visible link to it (Profile → Preferences → Privacy).

Guideline 5.1.2(i) asks for clear disclosure and permission before personal data is shared with third-party AI. SerpApi runs an image search, not a model trained on user data, and the policy says VigilArt never uses artwork to train AI. The notice below keeps the disclosure explicit anyway.

## Google Play: Data safety

Is data collected? **Yes.** Is any data sold? **No.** Is data encrypted in transit? **Yes** (HTTPS only). Can users request deletion? **Yes**: in the app (Profile → Delete account) and through the deletion web page (see below).

| Play category | Data type | Collected | Shared | Required or optional | Purposes |
|---|---|---|---|---|---|
| Personal info | Name | Yes | No | Required | App functionality, account management |
| Personal info | Email address | Yes | No | Required | App functionality, account management |
| Personal info | Address | Yes | No | Optional | App functionality |
| Personal info | Phone number | Yes | No | Optional | App functionality |
| Photos and videos | Photos | Yes | No | Required to use the product | App functionality |
| App activity | Other user-generated content | Yes | No | Optional | App functionality |
| Device or other IDs | Device or other IDs | Yes | No | Optional (push notifications) | App functionality |

"Shared: No" follows Google's rule that handing data to a service provider that processes it on the developer's behalf (SerpApi, Cloudflare, Firebase) is not sharing. If you prefer to be conservative, declare **Photos** as shared with a service provider; over-declaring does not hurt, under-declaring can lead to a rejection.

Also fill in: privacy policy URL `https://vigilart.app/privacy`; **account deletion URL**: a public page that explains how to delete the account and the data (today the FAQ answer "Can I withdraw and delete my data?" at `https://vigilart.app/faq`; a dedicated anchor is better); target audience 18 and over or 13 and over, not designed for children; no ads; content rating questionnaire (the app opens links to third-party websites and flags adult sites without opening them from a scan result).

## In-app notice before the first scan

Show once, before the first scan, with a primary button to continue and a link to the Privacy Policy. Add the strings to the mobile locale files (keys `scan_consent.*`).

- **English.** Title: "How your artwork is searched". Body: "To find where your artwork appears, VigilArt sends a temporary link to your image to SerpApi, which searches Google Lens. SerpApi deletes its search data after 31 days. Your artwork is stored privately, never published and never used to train AI models." Buttons: "Continue", "Read the Privacy Policy".
- **Français.** Titre : "Comment vos œuvres sont recherchées". Corps : "Pour trouver où vos œuvres apparaissent, VigilArt envoie un lien temporaire vers votre image à SerpApi, qui interroge Google Lens. SerpApi supprime ses données de recherche au bout de 31 jours. Vos œuvres sont stockées de manière privée, jamais publiées et jamais utilisées pour entraîner des modèles d'IA." Boutons : « Continuer », « Lire la politique de confidentialité ».

## Differences to fix in the Privacy Policy

The policy describes the service as a whole and already covers the mobile app's data. Two small additions would remove any doubt for the reviewers: say that the **mobile app** registers a push token with Firebase Cloud Messaging when notifications are turned on, and that the app uses the **camera and photo library** only on the user's request.
