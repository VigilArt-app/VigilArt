import type { LandingLocale } from "../../../app/landing/locale";

const ENGLISH_PRIVACY_POLICY = (
  <>
    <h1>Privacy Policy</h1>
    <p>
      <strong>Last updated: September 3, 2026</strong>
    </p>

    <h2>1. About This Policy</h2>
    <p>
      This Privacy Policy explains what personal data VigilArt processes and how it
      is used.
    </p>
    <p>VigilArt is a student project developed as part of Epitech&apos;s EIP program.</p>
    <p>For privacy-related questions or requests:</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>

    <h2>2. Information We Process</h2>
    <h3>Information you provide</h3>
    <p>We may process:</p>
    <ul>
      <li>your first name, last name, and email address;</li>
      <li>your profile and notification preferences;</li>
      <li>
        JPG or PNG artwork you upload, together with information such as its
        filename, description, and image properties;
      </li>
      <li>
        information used to generate copyright infringement reports or DMCA
        takedown notices, including URLs, descriptions, and platform information;
        and
      </li>
      <li>
        if you create a DMCA takedown notice, information such as your legal name,
        address, email address, phone number, and electronic signature.
      </li>
    </ul>
    <p>Passwords are not stored in readable form.</p>

    <h3>Information collected when you use VigilArt</h3>
    <p>We may also process:</p>
    <ul>
      <li>
        your IP address and browser or device information for authentication,
        security, or abuse prevention;
      </li>
      <li>login and session information;</li>
      <li>scan history;</li>
      <li>
        potential matches, including page URLs, page titles, image URLs, website
        categories, and safety indicators;
      </li>
      <li>device identifiers used for notifications; and</li>
      <li>
        application logs and technical information used to operate, secure, and
        troubleshoot VigilArt.
      </li>
    </ul>

    <h3>Guest Scans</h3>
    <p>You can use the scan feature without creating an account.</p>
    <p>When you use a guest scan:</p>
    <ul>
      <li>your image is temporarily uploaded to perform the search;</li>
      <li>your IP address is used for rate limiting and abuse prevention;</li>
      <li>
        Cloudflare Turnstile may process information necessary to verify the
        request; and
      </li>
      <li>
        the scan result is retained temporarily, currently for approximately
        <strong> one hour</strong>.
      </li>
    </ul>
    <p>Guest scans are not stored in the main VigilArt account database.</p>

    <h2>3. How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
      <li>create, authenticate, and secure accounts;</li>
      <li>store and manage artwork;</li>
      <li>perform reverse-image searches;</li>
      <li>display potential matches and scan history;</li>
      <li>schedule scans where enabled;</li>
      <li>generate copyright infringement reports or DMCA takedown notices;</li>
      <li>send requested notifications;</li>
      <li>prevent abuse and enforce usage limits; and</li>
      <li>operate, secure, and troubleshoot VigilArt.</li>
    </ul>
    <p>
      VigilArt does <strong>not</strong> use your artwork or personal data to train
      AI models.
    </p>
    <p>
      For users protected by the GDPR, we process personal data only when we have a
      valid legal reason to do so. This may include providing the service you
      requested, keeping VigilArt secure and preventing abuse, complying with legal
      obligations, or obtaining your consent where required.
    </p>

    <h2>4. Third-Party Services</h2>
    <p>VigilArt currently relies on the following services:</p>
    <p>
      <strong>SerpAPI / Google Lens</strong> — used to perform reverse-image
      searches. A temporary URL allowing access to the artwork being searched may
      be sent to SerpAPI. SerpAPI states that search data is retained for
      <strong> 31 days after a search is completed</strong>, after which it is
      automatically deleted.
    </p>
    <p>
      Source:{" "}
      <strong>
        <a href="https://serpapi.com/legal">https://serpapi.com/legal</a>
      </strong>
    </p>
    <p>
      <strong>Cloudflare R2</strong> — used to store uploaded artwork and temporary
      guest-scan images.
    </p>
    <p>
      <strong>Cloudflare Turnstile</strong> — used to prevent automated abuse and
      may process information such as your IP address and browser or device
      information.
    </p>
    <p>
      <strong>Firebase Cloud Messaging</strong> — used to provide push
      notifications when enabled and may process device or installation identifiers
      and notification information.
    </p>
    <p>
      Our database, caching, and hosting infrastructure may also process information
      necessary to operate VigilArt.
    </p>
    <p>VigilArt does not sell your personal data.</p>

    <h2>5. Data Retention</h2>
    <p>
      Account information, artwork, scan history, matches, DMCA information, and
      notification-device records are generally retained while your account is
      active or until deleted through the relevant feature.
    </p>
    <p>
      Guest-scan results are currently retained for approximately
      <strong> one hour</strong>.
    </p>
    <p>
      Login and session information is retained until the relevant session expires
      or is deleted.
    </p>
    <p>
      SerpAPI retains search data for <strong>31 days</strong> under its current
      policy.
    </p>
    <p>
      Some information may remain temporarily in backups, logs, caches, object
      storage, or third-party systems after deletion.
    </p>

    <h2>6. Account and Artwork Deletion</h2>
    <p>You may delete individual artworks or your VigilArt account through the service.</p>
    <p>
      When you delete an artwork directly, VigilArt attempts to remove the associated
      stored file. If storage deletion fails, the file may remain temporarily.
    </p>
    <p>
      At present, deleting your account removes the associated records from
      VigilArt&apos;s main account database, but it may not reliably remove all artwork
      files or profile images from object storage.
    </p>
    <p>
      Some information may also remain temporarily in backups, logs, caches, or
      third-party systems while applicable deletion and retention processes
      complete.
    </p>

    <h2>7. Your Rights</h2>
    <p>If you are protected by the GDPR, you may have the right to:</p>
    <ul>
      <li>access your personal data;</li>
      <li>correct inaccurate information;</li>
      <li>request deletion;</li>
      <li>restrict or object to certain processing;</li>
      <li>request data portability; and</li>
      <li>withdraw consent where processing is based on consent.</li>
    </ul>
    <p>For privacy requests, contact:</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>
    <p>
      You may also lodge a complaint with the CNIL or another competent
      data-protection authority.
    </p>

    <h2>8. Security</h2>
    <p>
      We take measures to protect your information. Passwords are stored only in
      hashed form, authentication sessions use security tokens, and abuse-prevention
      measures such as Cloudflare Turnstile are used where applicable.
    </p>
    <p>However, no online service can guarantee complete security.</p>

    <h2>9. Changes</h2>
    <p>
      We may update this Privacy Policy when VigilArt&apos;s features, data practices,
      or third-party services change.
    </p>
    <p>The current version will be made available through the service.</p>

    <h2>10. Contact</h2>
    <p>For privacy-related questions or requests:</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>
  </>
);

const FRENCH_PRIVACY_POLICY = (
  <>
    <h1>Politique de confidentialité</h1>
    <p>
      <strong>Dernière mise à jour : 3 septembre 2026</strong>
    </p>

    <h2>1. À propos de cette politique</h2>
    <p>
      Cette Politique de confidentialité explique quelles données personnelles
      VigilArt traite et comment elles sont utilisées.
    </p>
    <p>VigilArt est un projet étudiant développé dans le cadre du programme EIP d’Epitech.</p>
    <p>Pour toute question ou demande relative à la confidentialité :</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>

    <h2>2. Informations que nous traitons</h2>
    <h3>Informations que vous fournissez</h3>
    <p>Nous pouvons traiter :</p>
    <ul>
      <li>votre prénom, votre nom et votre adresse e-mail ;</li>
      <li>vos informations de profil et vos préférences de notification ;</li>
      <li>
        les œuvres au format JPG ou PNG que vous importez, ainsi que des
        informations telles que leur nom de fichier, leur description et leurs
        propriétés ;
      </li>
      <li>
        les informations utilisées pour générer des signalements de violation du
        droit d’auteur ou des notifications de retrait DMCA, notamment les URL,
        descriptions et informations relatives à la plateforme concernée ; et
      </li>
      <li>
        si vous créez une notification de retrait DMCA, des informations telles que
        votre nom légal, votre adresse, votre adresse e-mail, votre numéro de
        téléphone et votre signature électronique.
      </li>
    </ul>
    <p>Les mots de passe ne sont pas stockés sous une forme lisible.</p>

    <h3>Informations collectées lorsque vous utilisez VigilArt</h3>
    <p>Nous pouvons également traiter :</p>
    <ul>
      <li>
        votre adresse IP et des informations relatives à votre navigateur ou
        appareil à des fins d’authentification, de sécurité ou de prévention des
        abus ;
      </li>
      <li>des informations relatives aux connexions et aux sessions ;</li>
      <li>l’historique des analyses ;</li>
      <li>
        les correspondances potentielles, notamment les URL des pages, les titres
        des pages, les URL des images, les catégories des sites et les indicateurs
        de sécurité ;
      </li>
      <li>les identifiants d’appareil utilisés pour les notifications ; et</li>
      <li>
        les journaux de l’application et les informations techniques utilisées pour
        faire fonctionner, sécuriser et dépanner VigilArt.
      </li>
    </ul>

    <h3>Analyses sans compte</h3>
    <p>Vous pouvez utiliser la fonctionnalité d’analyse sans créer de compte.</p>
    <p>Lorsque vous effectuez une analyse sans compte :</p>
    <ul>
      <li>votre image est temporairement importée afin d’effectuer la recherche ;</li>
      <li>
        votre adresse IP est utilisée pour limiter le nombre de requêtes et prévenir
        les abus ;
      </li>
      <li>
        Cloudflare Turnstile peut traiter les informations nécessaires à la
        vérification de la requête ; et
      </li>
      <li>
        le résultat de l’analyse est conservé temporairement, actuellement pendant
        environ <strong>une heure</strong>.
      </li>
    </ul>
    <p>
      Les analyses sans compte ne sont pas enregistrées dans la base de données
      principale des comptes VigilArt.
    </p>

    <h2>3. Comment nous utilisons vos informations</h2>
    <p>Nous utilisons vos informations pour :</p>
    <ul>
      <li>créer, authentifier et sécuriser les comptes ;</li>
      <li>stocker et gérer les œuvres ;</li>
      <li>effectuer des recherches d’images inversées ;</li>
      <li>afficher les correspondances potentielles et l’historique des analyses ;</li>
      <li>planifier des analyses lorsque cette fonctionnalité est activée ;</li>
      <li>
        générer des signalements de violation du droit d’auteur ou des notifications
        de retrait DMCA ;
      </li>
      <li>envoyer les notifications demandées ;</li>
      <li>prévenir les abus et appliquer les limites d’utilisation ; et</li>
      <li>faire fonctionner, sécuriser et dépanner VigilArt.</li>
    </ul>
    <p>
      VigilArt
      <strong>
        {" "}n’utilise pas vos œuvres ni vos données personnelles pour entraîner
        des modèles d’intelligence artificielle
      </strong>
      .
    </p>
    <p>
      Pour les utilisateurs protégés par le RGPD, nous traitons les données
      personnelles uniquement lorsque nous disposons d’une base juridique valable.
      Cela peut notamment inclure la fourniture du service demandé, la sécurisation
      de VigilArt et la prévention des abus, le respect de nos obligations légales
      ou l’obtention de votre consentement lorsque celui-ci est requis.
    </p>

    <h2>4. Services tiers</h2>
    <p>VigilArt utilise actuellement les services tiers suivants :</p>
    <p>
      <strong>SerpAPI / Google Lens</strong> — utilisé pour effectuer des recherches
      d’images inversées. Une URL temporaire permettant d’accéder à l’œuvre
      recherchée peut être transmise à SerpAPI. SerpAPI indique que les données de
      recherche sont conservées pendant
      <strong> 31 jours après la réalisation d’une recherche</strong>, puis supprimées
      automatiquement.
    </p>
    <p>
      Source :{" "}
      <strong>
        <a href="https://serpapi.com/legal">https://serpapi.com/legal</a>
      </strong>
    </p>
    <p>
      <strong>Cloudflare R2</strong> — utilisé pour stocker les œuvres importées et
      les images temporaires utilisées lors des analyses sans compte.
    </p>
    <p>
      <strong>Cloudflare Turnstile</strong> — utilisé pour prévenir les abus
      automatisés et peut traiter des informations telles que votre adresse IP ainsi
      que des informations relatives à votre navigateur ou appareil.
    </p>
    <p>
      <strong>Firebase Cloud Messaging</strong> — utilisé pour fournir des
      notifications push lorsqu’elles sont activées et peut traiter des identifiants
      d’appareil ou d’installation ainsi que les informations nécessaires à l’envoi
      des notifications.
    </p>
    <p>
      Notre infrastructure de base de données, de cache et d’hébergement peut
      également traiter les informations nécessaires au fonctionnement de VigilArt.
    </p>
    <p>VigilArt ne vend pas vos données personnelles.</p>

    <h2>5. Durée de conservation des données</h2>
    <p>
      Les informations de compte, œuvres, historiques d’analyse, correspondances,
      informations DMCA et identifiants d’appareils utilisés pour les notifications
      sont généralement conservés tant que votre compte est actif ou jusqu’à leur
      suppression via la fonctionnalité correspondante.
    </p>
    <p>
      Les résultats des analyses sans compte sont actuellement conservés pendant
      environ <strong>une heure</strong>.
    </p>
    <p>
      Les informations de connexion et de session sont conservées jusqu’à
      l’expiration ou la suppression de la session concernée.
    </p>
    <p>
      SerpAPI conserve actuellement les données de recherche pendant
      <strong> 31 jours</strong>, conformément à sa politique actuelle.
    </p>
    <p>
      Certaines informations peuvent rester temporairement présentes dans des
      sauvegardes, journaux, caches, systèmes de stockage d’objets ou systèmes de
      tiers après leur suppression.
    </p>

    <h2>6. Suppression du compte et des œuvres</h2>
    <p>
      Vous pouvez supprimer individuellement des œuvres ou supprimer votre compte
      VigilArt via le service.
    </p>
    <p>
      Lorsque vous supprimez directement une œuvre, VigilArt tente de supprimer le
      fichier stocké correspondant. Si la suppression du fichier échoue, celui-ci
      peut rester temporairement stocké.
    </p>
    <p>
      À l’heure actuelle, la suppression de votre compte supprime les enregistrements
      associés de la base de données principale de VigilArt, mais ne supprime pas de
      manière fiable l’ensemble des fichiers d’œuvres ou des images de profil
      présents dans le stockage d’objets.
    </p>
    <p>
      Certaines informations peuvent également rester temporairement présentes dans
      des sauvegardes, journaux, caches ou systèmes de tiers pendant l’exécution des
      procédures de suppression et de conservation applicables.
    </p>

    <h2>7. Vos droits</h2>
    <p>Si vous êtes protégé par le RGPD, vous pouvez notamment disposer du droit de :</p>
    <ul>
      <li>accéder à vos données personnelles ;</li>
      <li>corriger des informations inexactes ;</li>
      <li>demander leur suppression ;</li>
      <li>limiter certains traitements ou vous y opposer ;</li>
      <li>demander la portabilité de certaines données ; et</li>
      <li>retirer votre consentement lorsque le traitement repose sur celui-ci.</li>
    </ul>
    <p>Pour toute demande relative à vos données personnelles :</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>
    <p>
      Vous pouvez également déposer une réclamation auprès de la <strong>CNIL</strong>
      ou d’une autre autorité de protection des données compétente.
    </p>

    <h2>8. Sécurité</h2>
    <p>
      Nous prenons des mesures pour protéger vos informations. Les mots de passe
      sont stockés uniquement sous forme hachée, les sessions d’authentification
      utilisent des jetons de sécurité et des mécanismes de prévention des abus,
      tels que Cloudflare Turnstile, sont utilisés lorsque cela est applicable.
    </p>
    <p>Cependant, aucun service en ligne ne peut garantir une sécurité totale.</p>

    <h2>9. Modifications</h2>
    <p>
      Nous pouvons mettre à jour cette Politique de confidentialité lorsque les
      fonctionnalités, pratiques de traitement des données ou services tiers
      utilisés par VigilArt évoluent.
    </p>
    <p>La version en vigueur sera mise à disposition via le service.</p>

    <h2>10. Contact</h2>
    <p>Pour toute question ou demande relative à la confidentialité :</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>
  </>
);

export const PRIVACY_POLICY_CONTENT: Readonly<
  Record<LandingLocale, React.JSX.Element>
> = {
  en: ENGLISH_PRIVACY_POLICY,
  fr: FRENCH_PRIVACY_POLICY,
};
