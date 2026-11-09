// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get navDashboard => 'Tableau de bord';

  @override
  String get navDmca => 'DMCA';

  @override
  String get navProfile => 'Profil';

  @override
  String get logout => 'Déconnexion';

  @override
  String get themeLabel => 'Thème';

  @override
  String get themeLight => 'Clair';

  @override
  String get themeDark => 'Sombre';

  @override
  String get themeSystem => 'Système';

  @override
  String get languageLabel => 'Langue';

  @override
  String get linkPrivacy => 'Confidentialité';

  @override
  String get linkTerms => 'Conditions';

  @override
  String get linkLegalNotice => 'Mentions légales';

  @override
  String get linkFaq => 'FAQ';

  @override
  String get cancel => 'Annuler';

  @override
  String get save => 'Enregistrer';

  @override
  String get delete => 'Supprimer';

  @override
  String get next => 'Suivant';

  @override
  String get back => 'Retour';

  @override
  String get retry => 'Réessayer';

  @override
  String get errorTitle => 'Erreur';

  @override
  String get loginWelcome => 'Bienvenue';

  @override
  String get loginOn => 'sur';

  @override
  String get loginGreetings => 'Ravi de vous revoir !';

  @override
  String get loginEmail => 'Adresse e-mail';

  @override
  String get loginPassword => 'Mot de passe';

  @override
  String get loginPlaceholderEmail => 'Entrez votre adresse e-mail';

  @override
  String get loginPlaceholderPassword => 'Entrez votre mot de passe';

  @override
  String get loginSignIn => 'Se connecter';

  @override
  String get loginSigningIn => 'Connexion en cours...';

  @override
  String get loginNoAccount => 'Vous n\'avez pas de compte ?';

  @override
  String get loginSignUp => 'S\'inscrire';

  @override
  String get loginErrorFailed =>
      'La connexion a échoué. Veuillez vérifier vos identifiants.';

  @override
  String get loginErrorNoToken => 'Aucun jeton d\'authentification reçu.';

  @override
  String get loginErrorUnexpected =>
      'Une erreur inattendue s\'est produite. Veuillez réessayer.';

  @override
  String get signupWelcome => 'Bienvenue';

  @override
  String get signupOn => 'sur';

  @override
  String get signupReady => 'Prêt à vous inscrire ?';

  @override
  String get signupConsent =>
      'J’accepte les <terms>Conditions d’utilisation</terms> et reconnais avoir pris connaissance de la <privacy>Politique de confidentialité</privacy>.';

  @override
  String get signupConsentRequired =>
      'Acceptez les Conditions d’utilisation et prenez connaissance de la Politique de confidentialité pour créer votre compte.';

  @override
  String get signupEmail => 'Adresse e-mail';

  @override
  String get signupPlaceholderEmail => 'john.doe@exemple.com';

  @override
  String get signupPassword => 'Mot de passe';

  @override
  String get signupConfirmPassword => 'Confirmer le mot de passe';

  @override
  String get signupPasswordsDoNotMatch =>
      'Les mots de passe ne correspondent pas';

  @override
  String get signupSignUp => 'S\'inscrire';

  @override
  String get signupAlreadyHaveAccount => 'Vous avez déjà un compte ?';

  @override
  String get signupSignIn => 'Se connecter';

  @override
  String get signupSigningUp => 'Inscription en cours...';

  @override
  String get signupErrorUnexpected =>
      'Une erreur inattendue s\'est produite. Veuillez réessayer.';

  @override
  String get signupFailed =>
      'L\'inscription a échoué. Veuillez vérifier vos informations et réessayer.';

  @override
  String get signupDisabled =>
      'La création de compte est désactivée sur cet environnement.';

  @override
  String get tabStatistics => 'Statistiques';

  @override
  String get tabReposts => 'Rapport des scans';

  @override
  String get tabUpload => 'Télécharger';

  @override
  String get searchByName => 'Rechercher par nom ou source';

  @override
  String get timelineAll => 'Depuis le début';

  @override
  String get timelineWeek => 'Semaine dernière';

  @override
  String get timelineMonth => 'Mois dernier';

  @override
  String get timelineQuarter => '3 derniers mois';

  @override
  String get timelineYear => 'Dernière année';

  @override
  String get onlyUncredited => 'Uniquement non créditées';

  @override
  String get noScans => 'Aucun scan trouvé';

  @override
  String get failedToLoadReposts =>
      'Impossible de charger le rapport de scans. Veuillez réessayer.';

  @override
  String get matchesLabel => 'Correspondances';

  @override
  String get mostRecentSource => 'Source la plus récente';

  @override
  String get allDetectedReposts => 'Toutes les republications détectées';

  @override
  String get noMatchesForArtwork =>
      'Aucune correspondance trouvée pour cette œuvre';

  @override
  String get repostCategory => 'Catégorie';

  @override
  String get repostFound => 'Détecté le';

  @override
  String get repostVisit => 'Visiter';

  @override
  String get allCategories => 'Toutes les catégories';

  @override
  String get filterByCategory => 'Filtrer par catégorie';

  @override
  String get startScan => 'Créer le report';

  @override
  String quotaOne(int count, String limit) {
    return '$count scan restant sur $limit';
  }

  @override
  String quotaOther(int count, String limit) {
    return '$count scans restants sur $limit';
  }

  @override
  String get quotaWindow =>
      'Chaque scan redevient disponible 30 jours après son lancement.';

  @override
  String get quotaLoading => 'Chargement du quota de scans…';

  @override
  String get quotaUnavailable => 'Quota de scans indisponible.';

  @override
  String nextScanAvailable(String date) {
    return 'Prochain scan disponible le $date.';
  }

  @override
  String get reportCreated => 'Report créé';

  @override
  String get detectionsFound => 'correspondances trouvées';

  @override
  String get scanQueued => 'En file d\'attente…';

  @override
  String scanningArtwork(String processed, int total) {
    return 'Analyse de l\'artwork $processed sur $total';
  }

  @override
  String get scanFailed => 'L\'analyse a échoué. Veuillez réessayer.';

  @override
  String get coverageNote =>
      'Ce scan n’est pas exhaustif : certains contenus peuvent ne pas être détectés.';

  @override
  String get restrictedHidden => 'Site blacklisté : contenu masqué';

  @override
  String get restrictedShow => 'Afficher';

  @override
  String get restrictedHide => 'Masquer';

  @override
  String get statsTitle => 'Statistiques';

  @override
  String get statsTotalMatches => 'correspondances au total';

  @override
  String get statsRangeAll => 'Tout';

  @override
  String get statsRangeMonth => '30 derniers jours';

  @override
  String get statsNoData => 'Aucune reprise trouvée pour l\'instant';

  @override
  String get statsLoadError => 'Impossible de charger les reposts';

  @override
  String statsMatchesTitle(String category) {
    return 'Reposts – $category';
  }

  @override
  String statsReportMatchesTitle(String date) {
    return 'Reposts du $date';
  }

  @override
  String get statsNoMatches => 'Aucun repost dans cette catégorie';

  @override
  String get statsNoMatchesReport => 'Aucun repost dans ce scan';

  @override
  String statsShowingFirst(int count, int total) {
    return 'Affichage des $count plus récents sur $total';
  }

  @override
  String get catSocial => 'Réseaux sociaux';

  @override
  String get catArtPlatforms => 'Plateformes d\'art';

  @override
  String get catMarketplaces => 'Places de marché';

  @override
  String get catBlog => 'Blogs';

  @override
  String get catMedia => 'Médias';

  @override
  String get catSearch => 'Moteurs de recherche';

  @override
  String get catOther => 'Autre';

  @override
  String get recentScans => 'Scans récents';

  @override
  String get recentScansHint =>
      'Cliquez sur une barre pour voir les reposts de ce scan';

  @override
  String get recentScansEmpty => 'Aucun rapport pour l\'instant';

  @override
  String get uploadArtworks => 'Télécharger des œuvres';

  @override
  String get uploadSupportedFormats => 'Formats supportés : JPEG, PNG';

  @override
  String get uploadErrorType => 'Seules les images JPEG et PNG sont acceptées.';

  @override
  String get uploadErrorSize => 'Les images doivent faire 5 Mo ou moins.';

  @override
  String get uploadAddDescription => 'Ajouter une description (optionnel)';

  @override
  String get uploadAction => 'Télécharger';

  @override
  String get uploadUploading => 'Téléchargement en cours...';

  @override
  String get uploadPreparing => 'Préparation de votre image...';

  @override
  String get uploadSelectOne => 'Veuillez sélectionner au moins un fichier.';

  @override
  String uploadArtworkLimit(String limit) {
    return 'Un compte gratuit est limité à $limit œuvres. Supprimez-en pour en ajouter.';
  }

  @override
  String get uploadFailedAny =>
      'Échec du téléchargement de tous les fichiers. Veuillez réessayer.';

  @override
  String get uploadSeeGallery => 'Voir la galerie';

  @override
  String get uploadScanReportFailed => 'Échec de la génération du scan report.';

  @override
  String get galleryTitle => 'Galerie d\'œuvres';

  @override
  String get gallerySearch => 'Rechercher par ID, date...';

  @override
  String get galleryImages => 'images';

  @override
  String get filterAll => 'Tous';

  @override
  String get statusNotScanned => 'Pas encore scannée';

  @override
  String get statusNoMatches => 'Aucune correspondance trouvée';

  @override
  String get statusMatchesFound => 'Correspondances trouvées';

  @override
  String get statusUnavailable => 'Résultats indisponibles';

  @override
  String get galleryUntitled => 'Sans titre';

  @override
  String get galleryEmptyTitle => 'Protégez votre première œuvre';

  @override
  String get galleryEmptySubtitle =>
      'Importez vos créations : VigilArt les recherche sur le web et vous montre où elles sont republiées.';

  @override
  String get galleryNoArtworks => 'Aucune œuvre trouvée';

  @override
  String get galleryTryAdjusting =>
      'Essayez d\'ajuster vos filtres pour trouver des œuvres.';

  @override
  String get selectedArtwork => 'Œuvre sélectionnée';

  @override
  String get artworkFileName => 'Nom du fichier:';

  @override
  String get artworkDescription => 'Description:';

  @override
  String get artworkUploadDate => 'Date de téléchargement:';

  @override
  String get artworkFileSize => 'Taille du fichier:';

  @override
  String get artworkId => 'ID:';

  @override
  String get artworkAllLinks => 'Tous les liens des correspondances:';

  @override
  String get artworkNoMatches =>
      'Aucune correspondance enregistrée pour cette œuvre.';

  @override
  String get artworkNotScannedBody => 'Cette œuvre n’a pas encore été scannée.';

  @override
  String get artworkMatches => 'Correspondances';

  @override
  String get artworkLastDetected => 'Dernière détection';

  @override
  String get artworkEditTitle => 'Modifier la description';

  @override
  String get artworkEditBody => 'Modifiez la description de votre œuvre.';

  @override
  String get artworkDelete => 'Supprimer l\'œuvre';

  @override
  String get artworkConfirmDelete =>
      'Êtes-vous sûr de vouloir supprimer cette œuvre ? Cette action ne peut pas être annulée.';

  @override
  String get artworkDeleting => 'Suppression en cours...';

  @override
  String get artworkFailedLoad =>
      'Échec du chargement des œuvres. Veuillez réessayer.';

  @override
  String get artworkFailedDelete =>
      'Échec de la suppression de l\'œuvre. Veuillez réessayer.';

  @override
  String get artworkDeleted => 'Œuvre supprimée avec succès.';

  @override
  String blacklistedSitesOne(int count) {
    return '$count site blacklisté';
  }

  @override
  String blacklistedSitesOther(int count) {
    return '$count sites blacklistés';
  }

  @override
  String get createDmcaNotice => 'Créer un avis DMCA';

  @override
  String get dmcaTitle => 'Assistant DMCA';

  @override
  String get dmcaProfileTitle => '1) Profil DMCA';

  @override
  String get dmcaProfileSubtitle =>
      'Ces informations sont réutilisées pour préremplir certains champs du formulaire de plateforme.';

  @override
  String get dmcaSaveProfile => 'Enregistrer le profil DMCA';

  @override
  String get dmcaProfileSaved => 'Profil DMCA enregistré.';

  @override
  String get dmcaProfileSaveFailed =>
      'Échec de l\'enregistrement du profil DMCA.';

  @override
  String get dmcaNoticeTitle => '2) Préparation de la notice';

  @override
  String get dmcaNoticeSubtitle =>
      'Choisissez une plateforme puis remplissez les champs demandés.';

  @override
  String get dmcaPlatform => 'Plateforme';

  @override
  String get dmcaSelectPlatform => 'Sélectionner une plateforme';

  @override
  String get dmcaPrepareNotice => 'Préparer la notice';

  @override
  String get dmcaNoticePrepared => 'Notice DMCA préparée.';

  @override
  String get dmcaNoticePrepareFailed => 'Échec de préparation de la notice.';

  @override
  String get dmcaGenerateContent => 'Générer email + PDF';

  @override
  String get dmcaContentGenerated => 'Contenu généré.';

  @override
  String get dmcaContentGenerationFailed => 'Échec de génération du contenu.';

  @override
  String get dmcaGenerateFirst =>
      'Générez d\'abord l\'email et le PDF pour voir le contenu.';

  @override
  String get dmcaSendTitle => '3) Envoi manuel';

  @override
  String get dmcaSendSubtitle =>
      'Utilisez les éléments générés, puis envoyez la demande directement sur la plateforme.';

  @override
  String get dmcaLegalNotice =>
      'Important : VigilArt ne soumet jamais une plainte DMCA à votre place. Vous devez vérifier le contenu puis l\'envoyer vous-même sur le site concerné.';

  @override
  String get dmcaCopySubject => 'Copier l\'objet';

  @override
  String get dmcaCopyBody => 'Copier le corps';

  @override
  String get dmcaOpenMail => 'Ouvrir l\'application email';

  @override
  String get dmcaDownloadPdf => 'Télécharger le PDF';

  @override
  String get dmcaOpenPlatformForm => 'Ouvrir le formulaire DMCA externe';

  @override
  String get dmcaPlatformFormUnavailable =>
      'L\'URL du formulaire de la plateforme n\'est pas disponible pour ce service';

  @override
  String get dmcaEmailTo => 'À';

  @override
  String get dmcaEmailSubject => 'Objet';

  @override
  String get dmcaStatus => 'Statut';

  @override
  String get dmcaHistory => 'Avis DMCA précédents';

  @override
  String get dmcaHistorySubtitle =>
      'Cliquez sur \'Charger\' pour restaurer une notice précédente et continuer l\'édition';

  @override
  String get dmcaLoad => 'Charger';

  @override
  String get dmcaStartNew => 'Nouveau rapport';

  @override
  String get dmcaMarkSubmitted => 'Marquer comme soumis';

  @override
  String get dmcaMarkSubmittedWarning =>
      'Une fois le rapport DMCA soumis sur la plateforme, marquez-le comme soumis ci-dessous. Cela verrouillera le rapport et empêchera toute modification ultérieure.';

  @override
  String get dmcaConfirmSubmitTitle => 'Marquer la notice comme soumise ?';

  @override
  String get dmcaConfirmSubmitDescription =>
      'Cette action est irréversible. Une fois marquée comme soumise, la notice ne pourra plus être modifiée.';

  @override
  String get dmcaConfirmSubmit => 'Confirmer';

  @override
  String get dmcaStatusUpdated => 'Notice marquée comme soumise.';

  @override
  String get dmcaStatusUpdateFailed =>
      'Échec de la mise à jour du statut de la notice.';

  @override
  String get dmcaNoNotices => 'Aucun avis DMCA pour le moment';

  @override
  String get dmcaSubmitted => 'Soumis';

  @override
  String get dmcaFieldRequired => 'Ce champ est obligatoire';

  @override
  String get dmcaRequiredFields => 'Champs obligatoires';

  @override
  String get dmcaFailedToLoad => 'Impossible de charger les données DMCA.';

  @override
  String get dmcaFullName => 'Nom complet';

  @override
  String get dmcaStreet => 'Adresse';

  @override
  String get dmcaAptSuite => 'Appartement / Suite';

  @override
  String get dmcaCity => 'Ville';

  @override
  String get dmcaPostalCode => 'Code postal';

  @override
  String get dmcaCountry => 'Pays';

  @override
  String get dmcaEmail => 'Email';

  @override
  String get dmcaPhone => 'Téléphone';

  @override
  String get dmcaSignature => 'Signature';

  @override
  String get dmcaOriginalWork => 'Identification de l\'oeuvre originale';

  @override
  String get dmcaOriginalWorkPlaceholder =>
      'Titre / description de votre oeuvre originale';

  @override
  String get dmcaOriginalWorkUrl => 'URL de l\'oeuvre originale';

  @override
  String get dmcaDetectedUrls => 'URLs détectées pour cette oeuvre';

  @override
  String get dmcaSelectDetectedUrl => 'Sélectionner une URL détectée';

  @override
  String get dmcaAddUrl => 'Ajouter';

  @override
  String get dmcaManualUrl => 'Ajouter une URL manuellement';

  @override
  String get dmcaAddManualUrl => 'Ajouter manuellement';

  @override
  String get dmcaSelectedUrls => 'URLs en infraction sélectionnées';

  @override
  String get dmcaNoSelectedUrls => 'Aucune URL sélectionnée.';

  @override
  String get dmcaRemoveUrl => 'Retirer';

  @override
  String get profileWelcome => 'Bienvenue';

  @override
  String get profilePicture => 'Photo de profil';

  @override
  String get profileFirstName => 'Prénom';

  @override
  String get profileLastName => 'Nom de famille';

  @override
  String get profileEmail => 'Adresse email';

  @override
  String get profileUploadPicture => 'Télécharger une photo';

  @override
  String get profileUploading => 'Téléchargement en cours...';

  @override
  String get profileSave => 'Enregistrer';

  @override
  String get profileUpdated => 'Profil mis à jour avec succès.';

  @override
  String get profileErrorUpdating =>
      'Erreur lors de la mise à jour du profil. Veuillez réessayer.';

  @override
  String get profileFailedToLoad =>
      'Échec du chargement des informations de profil. Veuillez réessayer.';

  @override
  String get profileFailedAvatar =>
      'Échec du téléchargement de l\'avatar. Veuillez réessayer.';

  @override
  String get notificationsTitle => 'Préférences de notification';

  @override
  String get notificationsDescription =>
      'Gérez la façon dont vous recevez les alertes et les rapports sur vos appareils.';

  @override
  String get notifMobileTitle => 'Notifications Mobiles Push';

  @override
  String get notifMobileDescription =>
      'Recevez des notifications push sur vos appareils mobiles connectés (iOS et Android).';

  @override
  String get notifMailTitle => 'Notifications par e-mail';

  @override
  String get notifMailDescription =>
      'Recevez un récapitulatif par e-mail chaque fois qu\'un rapport de scan est généré.';

  @override
  String get notificationsEnabled => 'Notifications activées.';

  @override
  String get notificationsDisabled => 'Notifications désactivées.';

  @override
  String get notificationsDenied =>
      'Les notifications du navigateur ont été refusées. Modifiez l\'autorisation du navigateur pour les activer.';

  @override
  String get notificationsFailed =>
      'Impossible de mettre à jour les préférences de notification. Veuillez réessayer.';

  @override
  String get deleteAccount => 'Supprimer le compte';

  @override
  String get deleteAccountConfirm => 'Supprimer le compte définitivement';

  @override
  String get deleteAccountWarning =>
      'Cette action supprimera définitivement votre compte et toutes les données associées. Vous ne pourrez pas récupérer votre compte.';

  @override
  String get deleteAccountIrreversible =>
      'Cette action est irréversible. Veuillez vous assurer que vous voulez continuer.';

  @override
  String get deletePermanently => 'Supprimer définitivement';

  @override
  String get deleteAccountFailed =>
      'Échec de la suppression du compte. Veuillez réessayer.';

  @override
  String get accountDeleted => 'Compte supprimé avec succès.';

  @override
  String get navGallery => 'Galerie';

  @override
  String get uploadBrowse => 'Parcourir';

  @override
  String get uploadCamera => 'Appareil photo';

  @override
  String get uploadReady => 'Prêtes à importer';

  @override
  String get uploadDone => 'Importé avec succès';

  @override
  String get scanInProgress => 'Scan en cours';

  @override
  String get scanLimitTitle => 'Limite de scans';

  @override
  String get scanTimeout =>
      'Le scan prend plus de temps que prévu. Il continue : actualisez dans une minute.';

  @override
  String get restrictedCopy => 'Copier';

  @override
  String get logoutConfirmTitle => 'Déconnexion';

  @override
  String get logoutConfirmBody => 'Souhaitez-vous vraiment vous déconnecter ?';

  @override
  String get preferencesTitle => 'Préférences';

  @override
  String get openLinkFailed => 'Impossible d’ouvrir le lien';

  @override
  String get passwordMinLength =>
      'Le mot de passe doit contenir au moins 8 caractères';

  @override
  String get passwordLowercase => 'Le mot de passe doit contenir une minuscule';

  @override
  String get passwordUppercase => 'Le mot de passe doit contenir une majuscule';

  @override
  String get passwordNumber => 'Le mot de passe doit contenir un chiffre';

  @override
  String get passwordSymbol => 'Le mot de passe doit contenir un symbole';

  @override
  String get emailInvalid => 'Cette adresse e-mail n’est pas valide';

  @override
  String get fieldRequired => 'Ce champ est obligatoire';

  @override
  String get notifPromptTitle => 'Activer les notifications ?';

  @override
  String get notifPromptNotNow => 'Plus tard';

  @override
  String get notifPromptEnable => 'Activer';

  @override
  String get scanConsentTitle => 'Comment vos œuvres sont recherchées';

  @override
  String get scanConsentBody =>
      'Pour trouver où vos œuvres apparaissent, VigilArt envoie un lien temporaire vers votre image à SerpApi, qui interroge Google Lens. SerpApi supprime ses données de recherche au bout de 31 jours. Vos œuvres sont stockées de manière privée, jamais publiées et jamais utilisées pour entraîner des modèles d’IA.';

  @override
  String get scanConsentContinue => 'Continuer';

  @override
  String get scanConsentPolicy => 'Lire la politique de confidentialité';

  @override
  String get viewReposts => 'Voir les reposts';

  @override
  String get connectionError =>
      'Impossible de joindre VigilArt. Vérifiez votre connexion et réessayez.';

  @override
  String get sessionExpired =>
      'Votre session a expiré. Veuillez vous reconnecter.';

  @override
  String get loading => 'Chargement…';

  @override
  String get rangeToday => 'Aujourd’hui';
}
