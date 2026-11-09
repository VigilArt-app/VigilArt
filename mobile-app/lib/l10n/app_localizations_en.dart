// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get navDashboard => 'Dashboard';

  @override
  String get navDmca => 'DMCA';

  @override
  String get navProfile => 'Profile';

  @override
  String get logout => 'Logout';

  @override
  String get themeLabel => 'Theme';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get themeSystem => 'System';

  @override
  String get languageLabel => 'Language';

  @override
  String get linkPrivacy => 'Privacy';

  @override
  String get linkTerms => 'Terms';

  @override
  String get linkLegalNotice => 'Legal notice';

  @override
  String get linkFaq => 'FAQ';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';

  @override
  String get delete => 'Delete';

  @override
  String get next => 'Next';

  @override
  String get back => 'Back';

  @override
  String get retry => 'Retry';

  @override
  String get errorTitle => 'Error';

  @override
  String get loginWelcome => 'Welcome';

  @override
  String get loginOn => 'on';

  @override
  String get loginGreetings => 'Nice to see you again';

  @override
  String get loginEmail => 'Email address';

  @override
  String get loginPassword => 'Password';

  @override
  String get loginPlaceholderEmail => 'Enter your email';

  @override
  String get loginPlaceholderPassword => 'Enter your password';

  @override
  String get loginSignIn => 'Sign in';

  @override
  String get loginSigningIn => 'Signing in...';

  @override
  String get loginNoAccount => 'Don\'t have an account?';

  @override
  String get loginSignUp => 'Sign up now';

  @override
  String get loginErrorFailed => 'Login failed. Please check your credentials.';

  @override
  String get loginErrorNoToken => 'No authentication token received.';

  @override
  String get loginErrorUnexpected =>
      'An unexpected error occurred. Please try again.';

  @override
  String get signupWelcome => 'Welcome';

  @override
  String get signupOn => 'on';

  @override
  String get signupReady => 'Ready to sign up?';

  @override
  String get signupConsent =>
      'I accept the <terms>Terms of Service</terms> and acknowledge the <privacy>Privacy Policy</privacy>.';

  @override
  String get signupConsentRequired =>
      'Accept the Terms of Service and acknowledge the Privacy Policy to create your account.';

  @override
  String get signupEmail => 'Email address';

  @override
  String get signupPlaceholderEmail => 'john.doe@example.com';

  @override
  String get signupPassword => 'Password';

  @override
  String get signupConfirmPassword => 'Confirm password';

  @override
  String get signupPasswordsDoNotMatch => 'Passwords do not match';

  @override
  String get signupSignUp => 'Sign up';

  @override
  String get signupAlreadyHaveAccount => 'Already have an account?';

  @override
  String get signupSignIn => 'Sign in';

  @override
  String get signupSigningUp => 'Signing up...';

  @override
  String get signupErrorUnexpected =>
      'An unexpected error occurred. Please try again.';

  @override
  String get signupFailed =>
      'Sign up failed. Please check your information and try again.';

  @override
  String get signupDisabled =>
      'Account creation is disabled on this environment.';

  @override
  String get tabStatistics => 'Statistics';

  @override
  String get tabReposts => 'Scans Report';

  @override
  String get tabUpload => 'Upload';

  @override
  String get searchByName => 'Search by name or source';

  @override
  String get timelineAll => 'All Time';

  @override
  String get timelineWeek => 'Last Week';

  @override
  String get timelineMonth => 'Last Month';

  @override
  String get timelineQuarter => 'Last 3 Months';

  @override
  String get timelineYear => 'Last Year';

  @override
  String get onlyUncredited => 'Only uncredited';

  @override
  String get noScans => 'No scans found';

  @override
  String get failedToLoadReposts =>
      'Failed to load scans report. Please try again.';

  @override
  String get matchesLabel => 'Matches';

  @override
  String get mostRecentSource => 'Most recent source';

  @override
  String get allDetectedReposts => 'All detected reposts';

  @override
  String get noMatchesForArtwork => 'No matches found for this artwork';

  @override
  String get repostCategory => 'Category';

  @override
  String get repostFound => 'Found';

  @override
  String get repostVisit => 'Visit';

  @override
  String get allCategories => 'All categories';

  @override
  String get filterByCategory => 'Filter by category';

  @override
  String get startScan => 'Create report';

  @override
  String quotaOne(int count, int limit) {
    return '$count scan left out of $limit';
  }

  @override
  String quotaOther(int count, int limit) {
    return '$count scans left out of $limit';
  }

  @override
  String get quotaWindow =>
      'Each scan becomes available again 30 days after it started.';

  @override
  String get quotaLoading => 'Loading scan quota…';

  @override
  String get quotaUnavailable => 'Scan quota unavailable.';

  @override
  String nextScanAvailable(String date) {
    return 'Next scan available on $date.';
  }

  @override
  String get reportCreated => 'Report created';

  @override
  String get detectionsFound => 'matches found';

  @override
  String get scanQueued => 'Queued…';

  @override
  String scanningArtwork(int processed, int total) {
    return 'Scanning artwork $processed of $total';
  }

  @override
  String get scanFailed => 'The scan failed. Please try again.';

  @override
  String get coverageNote =>
      'This scan is not exhaustive: some content may not be detected.';

  @override
  String get restrictedHidden => 'Blacklisted site: content hidden';

  @override
  String get restrictedShow => 'Show';

  @override
  String get restrictedHide => 'Hide';

  @override
  String get statsTitle => 'Statistics';

  @override
  String get statsTotalMatches => 'total matches';

  @override
  String get statsRangeAll => 'All Time';

  @override
  String get statsRangeMonth => 'Last 30 days';

  @override
  String get statsNoData => 'No reposts found yet';

  @override
  String get statsLoadError => 'Could not load matches';

  @override
  String statsMatchesTitle(String category) {
    return '$category reposts';
  }

  @override
  String statsReportMatchesTitle(String date) {
    return 'Reposts from $date';
  }

  @override
  String get statsNoMatches => 'No reposts in this category';

  @override
  String get statsNoMatchesReport => 'No reposts in this report';

  @override
  String statsShowingFirst(int count, int total) {
    return 'Showing the $count most recent of $total';
  }

  @override
  String get catSocial => 'Social media';

  @override
  String get catArtPlatforms => 'Art platforms';

  @override
  String get catMarketplaces => 'Marketplaces';

  @override
  String get catBlog => 'Blogs';

  @override
  String get catMedia => 'Media';

  @override
  String get catSearch => 'Search engines';

  @override
  String get catOther => 'Other';

  @override
  String get recentScans => 'Recent Scans';

  @override
  String get recentScansHint => 'Click a bar to see that scan\'s reposts';

  @override
  String get recentScansEmpty => 'No reports yet';

  @override
  String get uploadArtworks => 'Upload artworks';

  @override
  String get uploadSupportedFormats => 'Supported formats: JPEG, PNG';

  @override
  String get uploadErrorType => 'Only JPEG and PNG images are supported.';

  @override
  String get uploadErrorSize => 'Images must be 5 MB or smaller.';

  @override
  String get uploadAddDescription => 'Add a description (optional)';

  @override
  String get uploadAction => 'Upload files';

  @override
  String get uploadUploading => 'Uploading...';

  @override
  String get uploadPreparing => 'Preparing your image...';

  @override
  String get uploadSelectOne => 'Please select at least one file.';

  @override
  String uploadArtworkLimit(int limit) {
    return 'A free account is limited to $limit artworks. Delete some to add new ones.';
  }

  @override
  String get uploadFailedAny => 'Failed to upload any files. Please try again.';

  @override
  String get uploadSeeGallery => 'See gallery';

  @override
  String get uploadScanReportFailed => 'Failed to generate the scan report.';

  @override
  String get galleryTitle => 'Artwork Gallery';

  @override
  String get gallerySearch => 'Search by ID, date...';

  @override
  String get galleryImages => 'images';

  @override
  String get filterAll => 'All';

  @override
  String get statusNotScanned => 'Not scanned yet';

  @override
  String get statusNoMatches => 'No matches found';

  @override
  String get statusMatchesFound => 'Matches found';

  @override
  String get statusUnavailable => 'Results unavailable';

  @override
  String get galleryUntitled => 'Untitled';

  @override
  String get galleryEmptyTitle => 'Protect your first artwork';

  @override
  String get galleryEmptySubtitle =>
      'Upload your work: VigilArt searches the web and shows you where it gets reposted.';

  @override
  String get galleryNoArtworks => 'No artworks found';

  @override
  String get galleryTryAdjusting =>
      'Try adjusting your filters to find artworks.';

  @override
  String get selectedArtwork => 'Selected artwork';

  @override
  String get artworkFileName => 'File name:';

  @override
  String get artworkDescription => 'Description:';

  @override
  String get artworkUploadDate => 'Upload date:';

  @override
  String get artworkFileSize => 'File size:';

  @override
  String get artworkId => 'ID:';

  @override
  String get artworkAllLinks => 'All links of matches:';

  @override
  String get artworkNoMatches => 'No matches recorded for this artwork.';

  @override
  String get artworkNotScannedBody => 'This artwork has not been scanned yet.';

  @override
  String get artworkMatches => 'Matches';

  @override
  String get artworkLastDetected => 'Last detected';

  @override
  String get artworkEditTitle => 'Edit description';

  @override
  String get artworkEditBody => 'Edit the description of your artwork.';

  @override
  String get artworkDelete => 'Delete artwork';

  @override
  String get artworkConfirmDelete =>
      'Are you sure you want to delete this artwork? This action cannot be undone.';

  @override
  String get artworkDeleting => 'Deleting...';

  @override
  String get artworkFailedLoad => 'Failed to load artworks. Please try again.';

  @override
  String get artworkFailedDelete =>
      'Failed to delete artwork. Please try again.';

  @override
  String get artworkDeleted => 'Artwork deleted successfully.';

  @override
  String blacklistedSitesOne(int count) {
    return '$count blacklisted site';
  }

  @override
  String blacklistedSitesOther(int count) {
    return '$count blacklisted sites';
  }

  @override
  String get createDmcaNotice => 'Create DMCA notice';

  @override
  String get dmcaTitle => 'DMCA Assistant';

  @override
  String get dmcaProfileTitle => '1) DMCA profile';

  @override
  String get dmcaProfileSubtitle =>
      'These details are reused to prefill matching platform form fields.';

  @override
  String get dmcaSaveProfile => 'Save DMCA profile';

  @override
  String get dmcaProfileSaved => 'DMCA profile saved.';

  @override
  String get dmcaProfileSaveFailed => 'Failed to save DMCA profile.';

  @override
  String get dmcaNoticeTitle => '2) Notice preparation';

  @override
  String get dmcaNoticeSubtitle =>
      'Choose a platform and fill in the requested fields.';

  @override
  String get dmcaPlatform => 'Platform';

  @override
  String get dmcaSelectPlatform => 'Select a platform';

  @override
  String get dmcaPrepareNotice => 'Prepare notice';

  @override
  String get dmcaNoticePrepared => 'DMCA notice prepared.';

  @override
  String get dmcaNoticePrepareFailed => 'Failed to prepare notice.';

  @override
  String get dmcaGenerateContent => 'Generate email + PDF';

  @override
  String get dmcaContentGenerated => 'Content generated.';

  @override
  String get dmcaContentGenerationFailed => 'Failed to generate content.';

  @override
  String get dmcaGenerateFirst =>
      'Generate the email and PDF first to see the content.';

  @override
  String get dmcaSendTitle => '3) Manual submission';

  @override
  String get dmcaSendSubtitle =>
      'Use generated assets, then submit the report directly on the platform website.';

  @override
  String get dmcaLegalNotice =>
      'Important: VigilArt never files a DMCA complaint on your behalf. You must review and submit it yourself on the target website.';

  @override
  String get dmcaCopySubject => 'Copy subject';

  @override
  String get dmcaCopyBody => 'Copy body';

  @override
  String get dmcaOpenMail => 'Open mail app';

  @override
  String get dmcaDownloadPdf => 'Download PDF';

  @override
  String get dmcaOpenPlatformForm => 'Open external DMCA form';

  @override
  String get dmcaPlatformFormUnavailable =>
      'Platform form URL is not available for this service';

  @override
  String get dmcaEmailTo => 'To';

  @override
  String get dmcaEmailSubject => 'Subject';

  @override
  String get dmcaStatus => 'Status';

  @override
  String get dmcaHistory => 'Previous DMCA Notices';

  @override
  String get dmcaHistorySubtitle =>
      'Click \'Load\' to restore a previous notice and continue editing';

  @override
  String get dmcaLoad => 'Load';

  @override
  String get dmcaStartNew => 'Start new report';

  @override
  String get dmcaMarkSubmitted => 'Mark as submitted';

  @override
  String get dmcaMarkSubmittedWarning =>
      'Once you have submitted the DMCA report on the platform, mark it as submitted below. This will lock the report and prevent further modifications.';

  @override
  String get dmcaConfirmSubmitTitle => 'Mark notice as submitted?';

  @override
  String get dmcaConfirmSubmitDescription =>
      'This action is irreversible. Once marked as submitted, the notice can no longer be modified.';

  @override
  String get dmcaConfirmSubmit => 'Confirm';

  @override
  String get dmcaNoticeLoaded => 'Notice loaded successfully';

  @override
  String get dmcaStatusUpdated => 'Notice marked as submitted.';

  @override
  String get dmcaStatusUpdateFailed => 'Failed to update notice status.';

  @override
  String get dmcaNoNotices => 'No DMCA notices yet';

  @override
  String get dmcaSubmitted => 'Submitted';

  @override
  String get dmcaFieldRequired => 'This field is required';

  @override
  String get dmcaRequiredFields => 'Required fields';

  @override
  String get dmcaFailedToLoad => 'Failed to load DMCA data.';

  @override
  String get dmcaFullName => 'Full name';

  @override
  String get dmcaStreet => 'Street address';

  @override
  String get dmcaAptSuite => 'Apartment / Suite';

  @override
  String get dmcaCity => 'City';

  @override
  String get dmcaPostalCode => 'Postal code';

  @override
  String get dmcaCountry => 'Country';

  @override
  String get dmcaEmail => 'Email';

  @override
  String get dmcaPhone => 'Phone';

  @override
  String get dmcaSignature => 'Signature';

  @override
  String get dmcaOriginalWork => 'Identification of the original work';

  @override
  String get dmcaOriginalWorkPlaceholder =>
      'Title / description of your original work';

  @override
  String get dmcaOriginalWorkUrl => 'Original work URL';

  @override
  String get dmcaDetectedUrls => 'Detected URLs for this artwork';

  @override
  String get dmcaSelectDetectedUrl => 'Select a detected URL';

  @override
  String get dmcaAddUrl => 'Add';

  @override
  String get dmcaManualUrl => 'Add a URL manually';

  @override
  String get dmcaAddManualUrl => 'Add manually';

  @override
  String get dmcaSelectedUrls => 'Selected infringing URLs';

  @override
  String get dmcaNoSelectedUrls => 'No URL selected.';

  @override
  String get dmcaRemoveUrl => 'Remove';

  @override
  String get profileWelcome => 'Welcome';

  @override
  String get profilePicture => 'Profile Picture';

  @override
  String get profileFirstName => 'First name';

  @override
  String get profileLastName => 'Last name';

  @override
  String get profileEmail => 'Email address';

  @override
  String get profileUploadPicture => 'Upload picture';

  @override
  String get profileUploading => 'Uploading...';

  @override
  String get profileSave => 'Save';

  @override
  String get profileUpdated => 'Profile updated successfully.';

  @override
  String get profileErrorUpdating =>
      'Error updating profile. Please try again.';

  @override
  String get profileFailedToLoad =>
      'Failed to load profile information. Please try again.';

  @override
  String get profileFailedAvatar =>
      'Failed to upload avatar. Please try again.';

  @override
  String get notificationsTitle => 'Notification Preferences';

  @override
  String get notificationsDescription =>
      'Manage how you receive alerts and report updates across your devices.';

  @override
  String get notifMobileTitle => 'Mobile Push Notifications';

  @override
  String get notifMobileDescription =>
      'Receive push notifications on your connected iOS and Android devices.';

  @override
  String get notifMailTitle => 'Email Notifications';

  @override
  String get notifMailDescription =>
      'Receive an email summary whenever an artwork scan report is generated.';

  @override
  String get notificationsEnabled => 'Notifications enabled.';

  @override
  String get notificationsDisabled => 'Notifications disabled.';

  @override
  String get notificationsDenied =>
      'Browser notifications were denied. Change your browser permission to enable them.';

  @override
  String get notificationsFailed =>
      'Failed to update notification preferences. Please try again.';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get deleteAccountConfirm => 'Delete Account Permanently';

  @override
  String get deleteAccountWarning =>
      'This action will permanently delete your account and all associated data. You will not be able to recover your account.';

  @override
  String get deleteAccountIrreversible =>
      'This action is irreversible. Please make sure you want to proceed.';

  @override
  String get deletePermanently => 'Delete Permanently';

  @override
  String get deleteAccountFailed =>
      'Failed to delete account. Please try again.';

  @override
  String get accountDeleted => 'Account deleted successfully.';

  @override
  String get navGallery => 'Gallery';

  @override
  String get uploadBrowse => 'Browse';

  @override
  String get uploadCamera => 'Camera';

  @override
  String get uploadReady => 'Ready to upload';

  @override
  String get uploadDone => 'Uploaded successfully';

  @override
  String get scanInProgress => 'Scan in progress';

  @override
  String get scanLimitTitle => 'Scan limit';

  @override
  String get scanTimeout =>
      'The scan is taking longer than expected. It keeps running: pull to refresh in a minute.';

  @override
  String get restrictedCopy => 'Copy';

  @override
  String get logoutConfirmTitle => 'Log out';

  @override
  String get logoutConfirmBody => 'Do you really want to log out?';

  @override
  String get preferencesTitle => 'Preferences';

  @override
  String get openLinkFailed => 'Could not open the link';

  @override
  String get passwordMinLength => 'Password must be at least 8 characters long';

  @override
  String get passwordLowercase => 'Password must contain a lowercase letter';

  @override
  String get passwordUppercase => 'Password must contain an uppercase letter';

  @override
  String get passwordNumber => 'Password must contain a number';

  @override
  String get passwordSymbol => 'Password must contain a symbol';

  @override
  String get emailInvalid => 'This email address is not valid';

  @override
  String get fieldRequired => 'This field is required';

  @override
  String get notifPromptTitle => 'Turn on notifications?';

  @override
  String get notifPromptNotNow => 'Not now';

  @override
  String get notifPromptEnable => 'Turn on';

  @override
  String get scanConsentTitle => 'How your artwork is searched';

  @override
  String get scanConsentBody =>
      'To find where your artwork appears, VigilArt sends a temporary link to your image to SerpApi, which searches Google Lens. SerpApi deletes its search data after 31 days. Your artwork is stored privately, never published and never used to train AI models.';

  @override
  String get scanConsentContinue => 'Continue';

  @override
  String get scanConsentPolicy => 'Read the Privacy Policy';

  @override
  String get viewReposts => 'View reposts';

  @override
  String get connectionError =>
      'Could not reach VigilArt. Check your connection and try again.';

  @override
  String get sessionExpired => 'Your session has expired. Please log in again.';

  @override
  String get loading => 'Loading…';

  @override
  String get policyChanged =>
      'Our Terms of Service or Privacy Policy changed. Update the app to sign up.';

  @override
  String get accountExists =>
      'An account with this email address already exists.';

  @override
  String get rangeToday => 'Today';
}
