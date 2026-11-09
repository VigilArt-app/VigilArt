import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('fr')
  ];

  /// No description provided for @navDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// No description provided for @navDmca.
  ///
  /// In en, this message translates to:
  /// **'DMCA'**
  String get navDmca;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @themeLabel.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get themeLabel;

  /// No description provided for @themeLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get themeDark;

  /// No description provided for @themeSystem.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get themeSystem;

  /// No description provided for @languageLabel.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageLabel;

  /// No description provided for @linkPrivacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get linkPrivacy;

  /// No description provided for @linkTerms.
  ///
  /// In en, this message translates to:
  /// **'Terms'**
  String get linkTerms;

  /// No description provided for @linkLegalNotice.
  ///
  /// In en, this message translates to:
  /// **'Legal notice'**
  String get linkLegalNotice;

  /// No description provided for @linkFaq.
  ///
  /// In en, this message translates to:
  /// **'FAQ'**
  String get linkFaq;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @errorTitle.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get errorTitle;

  /// No description provided for @loginWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get loginWelcome;

  /// No description provided for @loginOn.
  ///
  /// In en, this message translates to:
  /// **'on'**
  String get loginOn;

  /// No description provided for @loginGreetings.
  ///
  /// In en, this message translates to:
  /// **'Nice to see you again'**
  String get loginGreetings;

  /// No description provided for @loginEmail.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get loginEmail;

  /// No description provided for @loginPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get loginPassword;

  /// No description provided for @loginPlaceholderEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter your email'**
  String get loginPlaceholderEmail;

  /// No description provided for @loginPlaceholderPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter your password'**
  String get loginPlaceholderPassword;

  /// No description provided for @loginSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get loginSignIn;

  /// No description provided for @loginSigningIn.
  ///
  /// In en, this message translates to:
  /// **'Signing in...'**
  String get loginSigningIn;

  /// No description provided for @loginNoAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get loginNoAccount;

  /// No description provided for @loginSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign up now'**
  String get loginSignUp;

  /// No description provided for @loginErrorFailed.
  ///
  /// In en, this message translates to:
  /// **'Login failed. Please check your credentials.'**
  String get loginErrorFailed;

  /// No description provided for @loginErrorNoToken.
  ///
  /// In en, this message translates to:
  /// **'No authentication token received.'**
  String get loginErrorNoToken;

  /// No description provided for @loginErrorUnexpected.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred. Please try again.'**
  String get loginErrorUnexpected;

  /// No description provided for @signupWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get signupWelcome;

  /// No description provided for @signupOn.
  ///
  /// In en, this message translates to:
  /// **'on'**
  String get signupOn;

  /// No description provided for @signupReady.
  ///
  /// In en, this message translates to:
  /// **'Ready to sign up?'**
  String get signupReady;

  /// No description provided for @signupConsent.
  ///
  /// In en, this message translates to:
  /// **'I accept the <terms>Terms of Service</terms> and acknowledge the <privacy>Privacy Policy</privacy>.'**
  String get signupConsent;

  /// No description provided for @signupConsentRequired.
  ///
  /// In en, this message translates to:
  /// **'Accept the Terms of Service and acknowledge the Privacy Policy to create your account.'**
  String get signupConsentRequired;

  /// No description provided for @signupEmail.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get signupEmail;

  /// No description provided for @signupPlaceholderEmail.
  ///
  /// In en, this message translates to:
  /// **'john.doe@example.com'**
  String get signupPlaceholderEmail;

  /// No description provided for @signupPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get signupPassword;

  /// No description provided for @signupConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get signupConfirmPassword;

  /// No description provided for @signupPasswordsDoNotMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get signupPasswordsDoNotMatch;

  /// No description provided for @signupSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get signupSignUp;

  /// No description provided for @signupAlreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get signupAlreadyHaveAccount;

  /// No description provided for @signupSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signupSignIn;

  /// No description provided for @signupSigningUp.
  ///
  /// In en, this message translates to:
  /// **'Signing up...'**
  String get signupSigningUp;

  /// No description provided for @signupErrorUnexpected.
  ///
  /// In en, this message translates to:
  /// **'An unexpected error occurred. Please try again.'**
  String get signupErrorUnexpected;

  /// No description provided for @signupFailed.
  ///
  /// In en, this message translates to:
  /// **'Sign up failed. Please check your information and try again.'**
  String get signupFailed;

  /// No description provided for @signupDisabled.
  ///
  /// In en, this message translates to:
  /// **'Account creation is disabled on this environment.'**
  String get signupDisabled;

  /// No description provided for @tabStatistics.
  ///
  /// In en, this message translates to:
  /// **'Statistics'**
  String get tabStatistics;

  /// No description provided for @tabReposts.
  ///
  /// In en, this message translates to:
  /// **'Detected reposts'**
  String get tabReposts;

  /// No description provided for @tabUpload.
  ///
  /// In en, this message translates to:
  /// **'Upload'**
  String get tabUpload;

  /// No description provided for @searchByName.
  ///
  /// In en, this message translates to:
  /// **'Search by name or source'**
  String get searchByName;

  /// No description provided for @timelineAll.
  ///
  /// In en, this message translates to:
  /// **'All Time'**
  String get timelineAll;

  /// No description provided for @timelineWeek.
  ///
  /// In en, this message translates to:
  /// **'Last Week'**
  String get timelineWeek;

  /// No description provided for @timelineMonth.
  ///
  /// In en, this message translates to:
  /// **'Last Month'**
  String get timelineMonth;

  /// No description provided for @timelineQuarter.
  ///
  /// In en, this message translates to:
  /// **'Last 3 Months'**
  String get timelineQuarter;

  /// No description provided for @timelineYear.
  ///
  /// In en, this message translates to:
  /// **'Last Year'**
  String get timelineYear;

  /// No description provided for @onlyUncredited.
  ///
  /// In en, this message translates to:
  /// **'Only uncredited'**
  String get onlyUncredited;

  /// No description provided for @noScans.
  ///
  /// In en, this message translates to:
  /// **'No scans found'**
  String get noScans;

  /// No description provided for @failedToLoadReposts.
  ///
  /// In en, this message translates to:
  /// **'Failed to load detected reposts. Please try again.'**
  String get failedToLoadReposts;

  /// No description provided for @matchesLabel.
  ///
  /// In en, this message translates to:
  /// **'Matches'**
  String get matchesLabel;

  /// No description provided for @mostRecentSource.
  ///
  /// In en, this message translates to:
  /// **'Most recent source'**
  String get mostRecentSource;

  /// No description provided for @allDetectedReposts.
  ///
  /// In en, this message translates to:
  /// **'All detected reposts'**
  String get allDetectedReposts;

  /// No description provided for @noMatchesForArtwork.
  ///
  /// In en, this message translates to:
  /// **'No matches found for this artwork'**
  String get noMatchesForArtwork;

  /// No description provided for @repostCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get repostCategory;

  /// No description provided for @repostFound.
  ///
  /// In en, this message translates to:
  /// **'Found'**
  String get repostFound;

  /// No description provided for @repostVisit.
  ///
  /// In en, this message translates to:
  /// **'Visit'**
  String get repostVisit;

  /// No description provided for @allCategories.
  ///
  /// In en, this message translates to:
  /// **'All categories'**
  String get allCategories;

  /// No description provided for @filterByCategory.
  ///
  /// In en, this message translates to:
  /// **'Filter by category'**
  String get filterByCategory;

  /// No description provided for @startScan.
  ///
  /// In en, this message translates to:
  /// **'Start a scan'**
  String get startScan;

  /// No description provided for @quotaOne.
  ///
  /// In en, this message translates to:
  /// **'{count} scan left out of {limit}'**
  String quotaOne(int count, int limit);

  /// No description provided for @quotaOther.
  ///
  /// In en, this message translates to:
  /// **'{count} scans left out of {limit}'**
  String quotaOther(int count, int limit);

  /// No description provided for @quotaWindow.
  ///
  /// In en, this message translates to:
  /// **'Each used scan comes back 30 days later.'**
  String get quotaWindow;

  /// No description provided for @quotaLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading scan quota…'**
  String get quotaLoading;

  /// No description provided for @quotaUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Scan quota unavailable.'**
  String get quotaUnavailable;

  /// No description provided for @nextScanAvailable.
  ///
  /// In en, this message translates to:
  /// **'Next scan available on {date}.'**
  String nextScanAvailable(String date);

  /// No description provided for @reportCreated.
  ///
  /// In en, this message translates to:
  /// **'Report created'**
  String get reportCreated;

  /// No description provided for @detectionsFound.
  ///
  /// In en, this message translates to:
  /// **'matches found'**
  String get detectionsFound;

  /// No description provided for @scanQueued.
  ///
  /// In en, this message translates to:
  /// **'Queued…'**
  String get scanQueued;

  /// No description provided for @scanningArtwork.
  ///
  /// In en, this message translates to:
  /// **'Scanning artwork {processed} of {total}'**
  String scanningArtwork(int processed, int total);

  /// No description provided for @scanFailed.
  ///
  /// In en, this message translates to:
  /// **'The scan failed. Please try again.'**
  String get scanFailed;

  /// No description provided for @coverageNote.
  ///
  /// In en, this message translates to:
  /// **'This scan is not exhaustive: some content may not be detected.'**
  String get coverageNote;

  /// No description provided for @restrictedHidden.
  ///
  /// In en, this message translates to:
  /// **'Blacklisted site: content hidden'**
  String get restrictedHidden;

  /// No description provided for @restrictedShow.
  ///
  /// In en, this message translates to:
  /// **'Show'**
  String get restrictedShow;

  /// No description provided for @restrictedHide.
  ///
  /// In en, this message translates to:
  /// **'Hide'**
  String get restrictedHide;

  /// No description provided for @statsTitle.
  ///
  /// In en, this message translates to:
  /// **'Statistics'**
  String get statsTitle;

  /// No description provided for @statsTotalMatches.
  ///
  /// In en, this message translates to:
  /// **'total matches'**
  String get statsTotalMatches;

  /// No description provided for @statsRangeAll.
  ///
  /// In en, this message translates to:
  /// **'All Time'**
  String get statsRangeAll;

  /// No description provided for @statsRangeMonth.
  ///
  /// In en, this message translates to:
  /// **'Last 30 days'**
  String get statsRangeMonth;

  /// No description provided for @statsNoData.
  ///
  /// In en, this message translates to:
  /// **'No reposts found yet'**
  String get statsNoData;

  /// No description provided for @statsLoadError.
  ///
  /// In en, this message translates to:
  /// **'Could not load matches'**
  String get statsLoadError;

  /// No description provided for @statsMatchesTitle.
  ///
  /// In en, this message translates to:
  /// **'{category} reposts'**
  String statsMatchesTitle(String category);

  /// No description provided for @statsReportMatchesTitle.
  ///
  /// In en, this message translates to:
  /// **'Reposts from {date}'**
  String statsReportMatchesTitle(String date);

  /// No description provided for @statsNoMatches.
  ///
  /// In en, this message translates to:
  /// **'No reposts in this category'**
  String get statsNoMatches;

  /// No description provided for @statsNoMatchesReport.
  ///
  /// In en, this message translates to:
  /// **'No reposts in this report'**
  String get statsNoMatchesReport;

  /// No description provided for @statsShowingFirst.
  ///
  /// In en, this message translates to:
  /// **'Showing the {count} most recent of {total}'**
  String statsShowingFirst(int count, int total);

  /// No description provided for @catSocial.
  ///
  /// In en, this message translates to:
  /// **'Social media'**
  String get catSocial;

  /// No description provided for @catArtPlatforms.
  ///
  /// In en, this message translates to:
  /// **'Art platforms'**
  String get catArtPlatforms;

  /// No description provided for @catMarketplaces.
  ///
  /// In en, this message translates to:
  /// **'Marketplaces'**
  String get catMarketplaces;

  /// No description provided for @catBlog.
  ///
  /// In en, this message translates to:
  /// **'Blogs'**
  String get catBlog;

  /// No description provided for @catMedia.
  ///
  /// In en, this message translates to:
  /// **'Media'**
  String get catMedia;

  /// No description provided for @catSearch.
  ///
  /// In en, this message translates to:
  /// **'Search engines'**
  String get catSearch;

  /// No description provided for @catOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get catOther;

  /// No description provided for @recentScans.
  ///
  /// In en, this message translates to:
  /// **'Recent Scans'**
  String get recentScans;

  /// No description provided for @recentScansHint.
  ///
  /// In en, this message translates to:
  /// **'Click a bar to see that scan\'s reposts'**
  String get recentScansHint;

  /// No description provided for @recentScansEmpty.
  ///
  /// In en, this message translates to:
  /// **'No reports yet'**
  String get recentScansEmpty;

  /// No description provided for @uploadArtworks.
  ///
  /// In en, this message translates to:
  /// **'Upload artworks'**
  String get uploadArtworks;

  /// No description provided for @uploadSupportedFormats.
  ///
  /// In en, this message translates to:
  /// **'Supported formats: JPEG, PNG'**
  String get uploadSupportedFormats;

  /// No description provided for @uploadErrorType.
  ///
  /// In en, this message translates to:
  /// **'Only JPEG and PNG images are supported.'**
  String get uploadErrorType;

  /// No description provided for @uploadErrorSize.
  ///
  /// In en, this message translates to:
  /// **'Images must be 5 MB or smaller.'**
  String get uploadErrorSize;

  /// No description provided for @uploadAddDescription.
  ///
  /// In en, this message translates to:
  /// **'Add a description (optional)'**
  String get uploadAddDescription;

  /// No description provided for @uploadAction.
  ///
  /// In en, this message translates to:
  /// **'Upload files'**
  String get uploadAction;

  /// No description provided for @uploadUploading.
  ///
  /// In en, this message translates to:
  /// **'Uploading...'**
  String get uploadUploading;

  /// No description provided for @uploadPreparing.
  ///
  /// In en, this message translates to:
  /// **'Preparing your image...'**
  String get uploadPreparing;

  /// No description provided for @uploadSelectOne.
  ///
  /// In en, this message translates to:
  /// **'Please select at least one file.'**
  String get uploadSelectOne;

  /// No description provided for @uploadArtworkLimit.
  ///
  /// In en, this message translates to:
  /// **'A free account is limited to {limit} artworks. Delete some to add new ones.'**
  String uploadArtworkLimit(int limit);

  /// No description provided for @uploadFailedAny.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload any files. Please try again.'**
  String get uploadFailedAny;

  /// No description provided for @uploadSeeGallery.
  ///
  /// In en, this message translates to:
  /// **'See gallery'**
  String get uploadSeeGallery;

  /// No description provided for @uploadScanReportFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to generate the scan report.'**
  String get uploadScanReportFailed;

  /// No description provided for @galleryTitle.
  ///
  /// In en, this message translates to:
  /// **'Artwork Gallery'**
  String get galleryTitle;

  /// No description provided for @gallerySearch.
  ///
  /// In en, this message translates to:
  /// **'Search by ID, date...'**
  String get gallerySearch;

  /// No description provided for @galleryImages.
  ///
  /// In en, this message translates to:
  /// **'images'**
  String get galleryImages;

  /// No description provided for @filterAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get filterAll;

  /// No description provided for @statusNotScanned.
  ///
  /// In en, this message translates to:
  /// **'Not scanned yet'**
  String get statusNotScanned;

  /// No description provided for @statusNoMatches.
  ///
  /// In en, this message translates to:
  /// **'No matches found'**
  String get statusNoMatches;

  /// No description provided for @statusMatchesFound.
  ///
  /// In en, this message translates to:
  /// **'Matches found'**
  String get statusMatchesFound;

  /// No description provided for @statusUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Results unavailable'**
  String get statusUnavailable;

  /// No description provided for @galleryUntitled.
  ///
  /// In en, this message translates to:
  /// **'Untitled'**
  String get galleryUntitled;

  /// No description provided for @galleryEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'Protect your first artwork'**
  String get galleryEmptyTitle;

  /// No description provided for @galleryEmptySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Upload your work: VigilArt searches the web and shows you where it gets reposted.'**
  String get galleryEmptySubtitle;

  /// No description provided for @galleryNoArtworks.
  ///
  /// In en, this message translates to:
  /// **'No artworks found'**
  String get galleryNoArtworks;

  /// No description provided for @galleryTryAdjusting.
  ///
  /// In en, this message translates to:
  /// **'Try adjusting your filters to find artworks.'**
  String get galleryTryAdjusting;

  /// No description provided for @selectedArtwork.
  ///
  /// In en, this message translates to:
  /// **'Selected artwork'**
  String get selectedArtwork;

  /// No description provided for @artworkFileName.
  ///
  /// In en, this message translates to:
  /// **'File name:'**
  String get artworkFileName;

  /// No description provided for @artworkDescription.
  ///
  /// In en, this message translates to:
  /// **'Description:'**
  String get artworkDescription;

  /// No description provided for @artworkUploadDate.
  ///
  /// In en, this message translates to:
  /// **'Upload date:'**
  String get artworkUploadDate;

  /// No description provided for @artworkFileSize.
  ///
  /// In en, this message translates to:
  /// **'File size:'**
  String get artworkFileSize;

  /// No description provided for @artworkId.
  ///
  /// In en, this message translates to:
  /// **'ID:'**
  String get artworkId;

  /// No description provided for @artworkAllLinks.
  ///
  /// In en, this message translates to:
  /// **'All links of matches:'**
  String get artworkAllLinks;

  /// No description provided for @artworkNoMatches.
  ///
  /// In en, this message translates to:
  /// **'No matches recorded for this artwork.'**
  String get artworkNoMatches;

  /// No description provided for @artworkNotScannedBody.
  ///
  /// In en, this message translates to:
  /// **'This artwork has not been scanned yet.'**
  String get artworkNotScannedBody;

  /// No description provided for @artworkMatches.
  ///
  /// In en, this message translates to:
  /// **'Matches'**
  String get artworkMatches;

  /// No description provided for @artworkLastDetected.
  ///
  /// In en, this message translates to:
  /// **'Last detected'**
  String get artworkLastDetected;

  /// No description provided for @artworkEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit description'**
  String get artworkEditTitle;

  /// No description provided for @artworkEditBody.
  ///
  /// In en, this message translates to:
  /// **'Edit the description of your artwork.'**
  String get artworkEditBody;

  /// No description provided for @artworkDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete artwork'**
  String get artworkDelete;

  /// No description provided for @artworkConfirmDelete.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this artwork? This action cannot be undone.'**
  String get artworkConfirmDelete;

  /// No description provided for @artworkDeleting.
  ///
  /// In en, this message translates to:
  /// **'Deleting...'**
  String get artworkDeleting;

  /// No description provided for @artworkFailedLoad.
  ///
  /// In en, this message translates to:
  /// **'Failed to load artworks. Please try again.'**
  String get artworkFailedLoad;

  /// No description provided for @artworkFailedDelete.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete artwork. Please try again.'**
  String get artworkFailedDelete;

  /// No description provided for @artworkDeleted.
  ///
  /// In en, this message translates to:
  /// **'Artwork deleted successfully.'**
  String get artworkDeleted;

  /// No description provided for @blacklistedSitesOne.
  ///
  /// In en, this message translates to:
  /// **'{count} blacklisted site'**
  String blacklistedSitesOne(int count);

  /// No description provided for @blacklistedSitesOther.
  ///
  /// In en, this message translates to:
  /// **'{count} blacklisted sites'**
  String blacklistedSitesOther(int count);

  /// No description provided for @createDmcaNotice.
  ///
  /// In en, this message translates to:
  /// **'Create DMCA notice'**
  String get createDmcaNotice;

  /// No description provided for @dmcaTitle.
  ///
  /// In en, this message translates to:
  /// **'DMCA Assistant'**
  String get dmcaTitle;

  /// No description provided for @dmcaProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'1) DMCA profile'**
  String get dmcaProfileTitle;

  /// No description provided for @dmcaProfileSubtitle.
  ///
  /// In en, this message translates to:
  /// **'These details are reused to prefill matching platform form fields.'**
  String get dmcaProfileSubtitle;

  /// No description provided for @dmcaSaveProfile.
  ///
  /// In en, this message translates to:
  /// **'Save DMCA profile'**
  String get dmcaSaveProfile;

  /// No description provided for @dmcaProfileSaved.
  ///
  /// In en, this message translates to:
  /// **'DMCA profile saved.'**
  String get dmcaProfileSaved;

  /// No description provided for @dmcaProfileSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to save DMCA profile.'**
  String get dmcaProfileSaveFailed;

  /// No description provided for @dmcaNoticeTitle.
  ///
  /// In en, this message translates to:
  /// **'2) Notice preparation'**
  String get dmcaNoticeTitle;

  /// No description provided for @dmcaNoticeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose a platform and fill in the requested fields.'**
  String get dmcaNoticeSubtitle;

  /// No description provided for @dmcaPlatform.
  ///
  /// In en, this message translates to:
  /// **'Platform'**
  String get dmcaPlatform;

  /// No description provided for @dmcaSelectPlatform.
  ///
  /// In en, this message translates to:
  /// **'Select a platform'**
  String get dmcaSelectPlatform;

  /// No description provided for @dmcaPrepareNotice.
  ///
  /// In en, this message translates to:
  /// **'Prepare notice'**
  String get dmcaPrepareNotice;

  /// No description provided for @dmcaNoticePrepared.
  ///
  /// In en, this message translates to:
  /// **'DMCA notice prepared.'**
  String get dmcaNoticePrepared;

  /// No description provided for @dmcaNoticePrepareFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to prepare notice.'**
  String get dmcaNoticePrepareFailed;

  /// No description provided for @dmcaGenerateContent.
  ///
  /// In en, this message translates to:
  /// **'Generate email + PDF'**
  String get dmcaGenerateContent;

  /// No description provided for @dmcaContentGenerated.
  ///
  /// In en, this message translates to:
  /// **'Content generated.'**
  String get dmcaContentGenerated;

  /// No description provided for @dmcaContentGenerationFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to generate content.'**
  String get dmcaContentGenerationFailed;

  /// No description provided for @dmcaGenerateFirst.
  ///
  /// In en, this message translates to:
  /// **'Generate the email and PDF first to see the content.'**
  String get dmcaGenerateFirst;

  /// No description provided for @dmcaSendTitle.
  ///
  /// In en, this message translates to:
  /// **'3) Manual submission'**
  String get dmcaSendTitle;

  /// No description provided for @dmcaSendSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Use generated assets, then submit the report directly on the platform website.'**
  String get dmcaSendSubtitle;

  /// No description provided for @dmcaLegalNotice.
  ///
  /// In en, this message translates to:
  /// **'Important: VigilArt never files a DMCA complaint on your behalf. You must review and submit it yourself on the target website.'**
  String get dmcaLegalNotice;

  /// No description provided for @dmcaCopySubject.
  ///
  /// In en, this message translates to:
  /// **'Copy subject'**
  String get dmcaCopySubject;

  /// No description provided for @dmcaCopyBody.
  ///
  /// In en, this message translates to:
  /// **'Copy body'**
  String get dmcaCopyBody;

  /// No description provided for @dmcaOpenMail.
  ///
  /// In en, this message translates to:
  /// **'Open mail app'**
  String get dmcaOpenMail;

  /// No description provided for @dmcaDownloadPdf.
  ///
  /// In en, this message translates to:
  /// **'Download PDF'**
  String get dmcaDownloadPdf;

  /// No description provided for @dmcaOpenPlatformForm.
  ///
  /// In en, this message translates to:
  /// **'Open external DMCA form'**
  String get dmcaOpenPlatformForm;

  /// No description provided for @dmcaPlatformFormUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Platform form URL is not available for this service'**
  String get dmcaPlatformFormUnavailable;

  /// No description provided for @dmcaEmailTo.
  ///
  /// In en, this message translates to:
  /// **'To'**
  String get dmcaEmailTo;

  /// No description provided for @dmcaEmailSubject.
  ///
  /// In en, this message translates to:
  /// **'Subject'**
  String get dmcaEmailSubject;

  /// No description provided for @dmcaStatus.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get dmcaStatus;

  /// No description provided for @dmcaHistory.
  ///
  /// In en, this message translates to:
  /// **'Previous DMCA Notices'**
  String get dmcaHistory;

  /// No description provided for @dmcaHistorySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Click \'Load\' to restore a previous notice and continue editing'**
  String get dmcaHistorySubtitle;

  /// No description provided for @dmcaLoad.
  ///
  /// In en, this message translates to:
  /// **'Load'**
  String get dmcaLoad;

  /// No description provided for @dmcaStartNew.
  ///
  /// In en, this message translates to:
  /// **'Start new report'**
  String get dmcaStartNew;

  /// No description provided for @dmcaMarkSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Mark as submitted'**
  String get dmcaMarkSubmitted;

  /// No description provided for @dmcaMarkSubmittedWarning.
  ///
  /// In en, this message translates to:
  /// **'Once you have submitted the DMCA report on the platform, mark it as submitted below. This will lock the report and prevent further modifications.'**
  String get dmcaMarkSubmittedWarning;

  /// No description provided for @dmcaConfirmSubmitTitle.
  ///
  /// In en, this message translates to:
  /// **'Mark notice as submitted?'**
  String get dmcaConfirmSubmitTitle;

  /// No description provided for @dmcaConfirmSubmitDescription.
  ///
  /// In en, this message translates to:
  /// **'This action is irreversible. Once marked as submitted, the notice can no longer be modified.'**
  String get dmcaConfirmSubmitDescription;

  /// No description provided for @dmcaConfirmSubmit.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get dmcaConfirmSubmit;

  /// No description provided for @dmcaNoticeLoaded.
  ///
  /// In en, this message translates to:
  /// **'Notice loaded successfully'**
  String get dmcaNoticeLoaded;

  /// No description provided for @dmcaStatusUpdated.
  ///
  /// In en, this message translates to:
  /// **'Notice marked as submitted.'**
  String get dmcaStatusUpdated;

  /// No description provided for @dmcaStatusUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to update notice status.'**
  String get dmcaStatusUpdateFailed;

  /// No description provided for @dmcaNoNotices.
  ///
  /// In en, this message translates to:
  /// **'No DMCA notices yet'**
  String get dmcaNoNotices;

  /// No description provided for @dmcaSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get dmcaSubmitted;

  /// No description provided for @dmcaFieldRequired.
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get dmcaFieldRequired;

  /// No description provided for @dmcaRequiredFields.
  ///
  /// In en, this message translates to:
  /// **'Required fields'**
  String get dmcaRequiredFields;

  /// No description provided for @dmcaFailedToLoad.
  ///
  /// In en, this message translates to:
  /// **'Failed to load DMCA data.'**
  String get dmcaFailedToLoad;

  /// No description provided for @dmcaFullName.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get dmcaFullName;

  /// No description provided for @dmcaStreet.
  ///
  /// In en, this message translates to:
  /// **'Street address'**
  String get dmcaStreet;

  /// No description provided for @dmcaAptSuite.
  ///
  /// In en, this message translates to:
  /// **'Apartment / Suite'**
  String get dmcaAptSuite;

  /// No description provided for @dmcaCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get dmcaCity;

  /// No description provided for @dmcaPostalCode.
  ///
  /// In en, this message translates to:
  /// **'Postal code'**
  String get dmcaPostalCode;

  /// No description provided for @dmcaCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get dmcaCountry;

  /// No description provided for @dmcaEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get dmcaEmail;

  /// No description provided for @dmcaPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get dmcaPhone;

  /// No description provided for @dmcaSignature.
  ///
  /// In en, this message translates to:
  /// **'Signature'**
  String get dmcaSignature;

  /// No description provided for @dmcaOriginalWork.
  ///
  /// In en, this message translates to:
  /// **'Identification of the original work'**
  String get dmcaOriginalWork;

  /// No description provided for @dmcaOriginalWorkPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Title / description of your original work'**
  String get dmcaOriginalWorkPlaceholder;

  /// No description provided for @dmcaOriginalWorkUrl.
  ///
  /// In en, this message translates to:
  /// **'Original work URL'**
  String get dmcaOriginalWorkUrl;

  /// No description provided for @dmcaDetectedUrls.
  ///
  /// In en, this message translates to:
  /// **'Detected URLs for this artwork'**
  String get dmcaDetectedUrls;

  /// No description provided for @dmcaSelectDetectedUrl.
  ///
  /// In en, this message translates to:
  /// **'Select a detected URL'**
  String get dmcaSelectDetectedUrl;

  /// No description provided for @dmcaAddUrl.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get dmcaAddUrl;

  /// No description provided for @dmcaManualUrl.
  ///
  /// In en, this message translates to:
  /// **'Add a URL manually'**
  String get dmcaManualUrl;

  /// No description provided for @dmcaAddManualUrl.
  ///
  /// In en, this message translates to:
  /// **'Add manually'**
  String get dmcaAddManualUrl;

  /// No description provided for @dmcaSelectedUrls.
  ///
  /// In en, this message translates to:
  /// **'Selected infringing URLs'**
  String get dmcaSelectedUrls;

  /// No description provided for @dmcaNoSelectedUrls.
  ///
  /// In en, this message translates to:
  /// **'No URL selected.'**
  String get dmcaNoSelectedUrls;

  /// No description provided for @dmcaRemoveUrl.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get dmcaRemoveUrl;

  /// No description provided for @profileWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get profileWelcome;

  /// No description provided for @profilePicture.
  ///
  /// In en, this message translates to:
  /// **'Profile Picture'**
  String get profilePicture;

  /// No description provided for @profileFirstName.
  ///
  /// In en, this message translates to:
  /// **'First name'**
  String get profileFirstName;

  /// No description provided for @profileLastName.
  ///
  /// In en, this message translates to:
  /// **'Last name'**
  String get profileLastName;

  /// No description provided for @profileEmail.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get profileEmail;

  /// No description provided for @profileUploadPicture.
  ///
  /// In en, this message translates to:
  /// **'Upload picture'**
  String get profileUploadPicture;

  /// No description provided for @profileUploading.
  ///
  /// In en, this message translates to:
  /// **'Uploading...'**
  String get profileUploading;

  /// No description provided for @profileSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get profileSave;

  /// No description provided for @profileUpdated.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully.'**
  String get profileUpdated;

  /// No description provided for @profileErrorUpdating.
  ///
  /// In en, this message translates to:
  /// **'Error updating profile. Please try again.'**
  String get profileErrorUpdating;

  /// No description provided for @profileFailedToLoad.
  ///
  /// In en, this message translates to:
  /// **'Failed to load profile information. Please try again.'**
  String get profileFailedToLoad;

  /// No description provided for @profileFailedAvatar.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload avatar. Please try again.'**
  String get profileFailedAvatar;

  /// No description provided for @notificationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Notification Preferences'**
  String get notificationsTitle;

  /// No description provided for @notificationsDescription.
  ///
  /// In en, this message translates to:
  /// **'Manage how you receive alerts and report updates across your devices.'**
  String get notificationsDescription;

  /// No description provided for @notifMobileTitle.
  ///
  /// In en, this message translates to:
  /// **'Mobile Push Notifications'**
  String get notifMobileTitle;

  /// No description provided for @notifMobileDescription.
  ///
  /// In en, this message translates to:
  /// **'Receive push notifications on your connected iOS and Android devices.'**
  String get notifMobileDescription;

  /// No description provided for @notifMailTitle.
  ///
  /// In en, this message translates to:
  /// **'Email Notifications'**
  String get notifMailTitle;

  /// No description provided for @notifMailDescription.
  ///
  /// In en, this message translates to:
  /// **'Receive an email summary whenever an artwork scan report is generated.'**
  String get notifMailDescription;

  /// No description provided for @notificationsEnabled.
  ///
  /// In en, this message translates to:
  /// **'Notifications enabled.'**
  String get notificationsEnabled;

  /// No description provided for @notificationsDisabled.
  ///
  /// In en, this message translates to:
  /// **'Notifications disabled.'**
  String get notificationsDisabled;

  /// No description provided for @notificationsDenied.
  ///
  /// In en, this message translates to:
  /// **'Browser notifications were denied. Change your browser permission to enable them.'**
  String get notificationsDenied;

  /// No description provided for @notificationsFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to update notification preferences. Please try again.'**
  String get notificationsFailed;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccount;

  /// No description provided for @deleteAccountConfirm.
  ///
  /// In en, this message translates to:
  /// **'Delete Account Permanently'**
  String get deleteAccountConfirm;

  /// No description provided for @deleteAccountWarning.
  ///
  /// In en, this message translates to:
  /// **'This action will permanently delete your account and all associated data. You will not be able to recover your account.'**
  String get deleteAccountWarning;

  /// No description provided for @deleteAccountIrreversible.
  ///
  /// In en, this message translates to:
  /// **'This action is irreversible. Please make sure you want to proceed.'**
  String get deleteAccountIrreversible;

  /// No description provided for @deletePermanently.
  ///
  /// In en, this message translates to:
  /// **'Delete Permanently'**
  String get deletePermanently;

  /// No description provided for @deleteAccountFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete account. Please try again.'**
  String get deleteAccountFailed;

  /// No description provided for @accountDeleted.
  ///
  /// In en, this message translates to:
  /// **'Account deleted successfully.'**
  String get accountDeleted;

  /// No description provided for @navGallery.
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get navGallery;

  /// No description provided for @uploadBrowse.
  ///
  /// In en, this message translates to:
  /// **'Browse'**
  String get uploadBrowse;

  /// No description provided for @uploadCamera.
  ///
  /// In en, this message translates to:
  /// **'Camera'**
  String get uploadCamera;

  /// No description provided for @uploadReady.
  ///
  /// In en, this message translates to:
  /// **'Ready to upload'**
  String get uploadReady;

  /// No description provided for @uploadDone.
  ///
  /// In en, this message translates to:
  /// **'Uploaded successfully'**
  String get uploadDone;

  /// No description provided for @scanInProgress.
  ///
  /// In en, this message translates to:
  /// **'Scan in progress'**
  String get scanInProgress;

  /// No description provided for @scanLimitTitle.
  ///
  /// In en, this message translates to:
  /// **'Scan limit'**
  String get scanLimitTitle;

  /// No description provided for @scanTimeout.
  ///
  /// In en, this message translates to:
  /// **'The scan is taking longer than expected. It keeps running: pull to refresh in a minute.'**
  String get scanTimeout;

  /// No description provided for @restrictedCopy.
  ///
  /// In en, this message translates to:
  /// **'Copy'**
  String get restrictedCopy;

  /// No description provided for @logoutConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get logoutConfirmTitle;

  /// No description provided for @logoutConfirmBody.
  ///
  /// In en, this message translates to:
  /// **'Do you really want to log out?'**
  String get logoutConfirmBody;

  /// No description provided for @preferencesTitle.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get preferencesTitle;

  /// No description provided for @openLinkFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not open the link'**
  String get openLinkFailed;

  /// No description provided for @passwordMinLength.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters long'**
  String get passwordMinLength;

  /// No description provided for @passwordLowercase.
  ///
  /// In en, this message translates to:
  /// **'Password must contain a lowercase letter'**
  String get passwordLowercase;

  /// No description provided for @passwordUppercase.
  ///
  /// In en, this message translates to:
  /// **'Password must contain an uppercase letter'**
  String get passwordUppercase;

  /// No description provided for @passwordNumber.
  ///
  /// In en, this message translates to:
  /// **'Password must contain a number'**
  String get passwordNumber;

  /// No description provided for @passwordSymbol.
  ///
  /// In en, this message translates to:
  /// **'Password must contain a symbol'**
  String get passwordSymbol;

  /// No description provided for @emailInvalid.
  ///
  /// In en, this message translates to:
  /// **'This email address is not valid'**
  String get emailInvalid;

  /// No description provided for @fieldRequired.
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get fieldRequired;

  /// No description provided for @notifPromptTitle.
  ///
  /// In en, this message translates to:
  /// **'Turn on notifications?'**
  String get notifPromptTitle;

  /// No description provided for @notifPromptNotNow.
  ///
  /// In en, this message translates to:
  /// **'Not now'**
  String get notifPromptNotNow;

  /// No description provided for @notifPromptEnable.
  ///
  /// In en, this message translates to:
  /// **'Turn on'**
  String get notifPromptEnable;

  /// No description provided for @scanConsentTitle.
  ///
  /// In en, this message translates to:
  /// **'How your artwork is searched'**
  String get scanConsentTitle;

  /// No description provided for @scanConsentBody.
  ///
  /// In en, this message translates to:
  /// **'To find where your artwork appears, VigilArt sends a temporary link to your image to SerpApi, which searches Google Lens. SerpApi deletes its search data after 31 days. Your artwork is stored privately, never published and never used to train AI models.'**
  String get scanConsentBody;

  /// No description provided for @scanConsentContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get scanConsentContinue;

  /// No description provided for @scanConsentPolicy.
  ///
  /// In en, this message translates to:
  /// **'Read the Privacy Policy'**
  String get scanConsentPolicy;

  /// No description provided for @viewReposts.
  ///
  /// In en, this message translates to:
  /// **'View reposts'**
  String get viewReposts;

  /// No description provided for @connectionError.
  ///
  /// In en, this message translates to:
  /// **'Could not reach VigilArt. Check your connection and try again.'**
  String get connectionError;

  /// No description provided for @sessionExpired.
  ///
  /// In en, this message translates to:
  /// **'Your session has expired. Please log in again.'**
  String get sessionExpired;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get loading;

  /// No description provided for @policyChanged.
  ///
  /// In en, this message translates to:
  /// **'Our Terms of Service or Privacy Policy changed. Update the app to sign up.'**
  String get policyChanged;

  /// No description provided for @accountExists.
  ///
  /// In en, this message translates to:
  /// **'An account with this email address already exists.'**
  String get accountExists;

  /// No description provided for @rangeToday.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get rangeToday;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
