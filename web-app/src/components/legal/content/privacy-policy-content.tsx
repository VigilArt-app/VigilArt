import type { LandingLocale } from "../../../app/landing/locale";

const ENGLISH_PRIVACY_POLICY = (
  <>
    <h1>Privacy Policy</h1>
    <p>
      <strong>Last updated: September 9, 2026</strong>
    </p>

    <h2>1. About This Policy</h2>
    <p>
      This Privacy Policy explains what personal data VigilArt processes and how
      we use it.
    </p>
    <p>
      VigilArt is a student project developed as part of Epitech&apos;s EIP
      program.
    </p>
    <p>For privacy-related questions or requests:</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>

    <h2>2. Data We Process and Why</h2>
    <p>When you use VigilArt, we may process:</p>
    <ul>
      <li>
        your name, email address, profile information, and notification
        preferences;
      </li>
      <li>artwork you upload and related information;</li>
      <li>scan history and potential matches found online;</li>
      <li>information used to generate copyright or DMCA reports;</li>
      <li>
        your IP address, session information, device information, and technical
        logs necessary to operate and secure the service.
      </li>
    </ul>
    <p>
      We use this data to provide VigilArt&apos;s features, perform
      reverse-image searches, secure and maintain the service, prevent abuse,
      and provide requested notifications.
    </p>
    <p>
      If you voluntarily complete a feedback or beta-testing form, we may also
      process the information you provide to improve VigilArt and contact you
      about your feedback.
    </p>
    <p>
      Depending on the purpose, we process your data because it is necessary to
      provide VigilArt&apos;s features, to keep the service secure and
      operational, because you have given consent where required, or because the
      law requires it.
    </p>
    <p>
      VigilArt does not use your artwork or personal data to train AI models.
    </p>

    <h2>3. Artwork and Third-Party Services</h2>
    <p>
      Uploaded artwork is stored privately and is not published by VigilArt.
    </p>
    <p>VigilArt currently uses:</p>
    <p>
      <strong>
        <a href="https://serpapi.com/legal">SerpApi Google Lens API</a>
      </strong>{" "}
      — used for reverse-image searches. A temporary URL allowing access to the
      artwork being searched is sent to SerpApi. SerpApi states that search data
      is automatically deleted 31 days after a search is completed.
    </p>
    <p>
      <strong>
        <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">
          Cloudflare R2
        </a>
      </strong>{" "}
      — used to store uploaded artwork and temporary guest-scan images.
    </p>
    <p>
      <strong>Cloudflare Turnstile</strong> — used to prevent automated abuse
      and may process technical information such as your IP address and browser
      information.
    </p>
    <p>
      <strong>
        <a href="https://firebase.google.com/terms/data-processing-terms">
          Firebase Cloud Messaging (Google)
        </a>
      </strong>{" "}
      — used for push notifications where enabled.
    </p>
    <p>
      <strong>Google Forms / Google Sheets</strong> — used for optional
      beta-testing and feedback forms.
    </p>
    <p>
      <strong>Epitech infrastructure</strong> — VigilArt&apos;s production
      backend, PostgreSQL database, and cache are hosted on an Epitech-provided
      virtual machine.
    </p>
    <p>VigilArt does not sell your personal data.</p>

    <h2>4. Data Retention and Deletion</h2>
    <p>
      Account data, artwork records, scan history, and matches are generally
      retained while your account is active or until you delete them.
    </p>
    <p>
      Guest-scan results are currently retained for approximately one hour.
      Temporary guest-scan images are deleted after processing completes. A
      storage lifecycle rule removes abandoned guest-scan images within one day
      if processing does not complete normally.
    </p>
    <p>SerpApi retains search data for 31 days under its own policy.</p>
    <p>
      Feedback-form responses are retained only as long as reasonably necessary
      to analyze feedback and improve VigilArt.
    </p>
    <p>You may delete individual artworks or your account through VigilArt.</p>
    <p>
      At present, deleting your account removes the account and most associated
      records from VigilArt&apos;s main database. DMCA notice records are
      retained without a link to the deleted account. Artwork files and profile
      images are not automatically removed from object storage when the account
      is deleted.
    </p>
    <p>
      For requests concerning your data, including feedback-form data, contact{" "}
      <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>.
    </p>

    <h2>5. International Data Transfers</h2>
    <p>
      Some third-party providers used by VigilArt may process data outside the
      European Economic Area, including:
    </p>
    <ul>
      <li>
        <a href="https://serpapi.com/legal">SerpApi legal and privacy terms</a>
      </li>
      <li>
        <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">
          Cloudflare Data Processing Addendum
        </a>
      </li>
      <li>
        Google services, including{" "}
        <a href="https://firebase.google.com/terms/data-processing-terms">
          Firebase Cloud Messaging
        </a>
        , Google Forms, and Google Sheets.
      </li>
    </ul>
    <p>
      When personal data is transferred outside the European Economic Area, our
      providers may rely on recognized transfer mechanisms, including adequacy
      decisions or Standard Contractual Clauses. The mechanism applicable to
      each provider depends on its terms and our account arrangements.
    </p>
    <p>
      European Commission guidance:{" "}
      <a href="https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/rules-international-data-transfers_en">
        Rules on international data transfers
      </a>
    </p>

    <h2>6. Your Rights</h2>
    <p>
      Under applicable data-protection law, you may have the right to access,
      correct, delete, or obtain a copy of your personal data, restrict or
      object to certain processing, and withdraw consent where processing is
      based on consent.
    </p>
    <p>To exercise these rights, contact:</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>
    <p>
      You may also lodge a complaint with the CNIL or another competent
      data-protection authority.
    </p>

    <h2>7. Security</h2>
    <p>
      We use measures including hashed passwords, HTTPS, authentication tokens,
      pre-signed URLs for stored artwork, and abuse-prevention mechanisms.
    </p>
    <p>However, no online service can guarantee complete security.</p>

    <h2>8. Changes</h2>
    <p>
      We may update this Privacy Policy as VigilArt and its data practices
      evolve.
    </p>
    <p>The latest version will be available through the service.</p>
  </>
);

const FRENCH_PRIVACY_POLICY = (
  <>
    <h1>Politique de confidentialité</h1>
    <p>
      <strong>Dernière mise à jour : 9 septembre 2026</strong>
    </p>

    <h2>1. À propos de cette politique</h2>
    <p>
      Cette Politique de confidentialité explique quelles données personnelles
      VigilArt traite et comment nous les utilisons.
    </p>
    <p>
      VigilArt est un projet étudiant développé dans le cadre du programme EIP
      d’Epitech.
    </p>
    <p>Pour toute question ou demande relative à vos données :</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>

    <h2>2. Données traitées et finalités</h2>
    <p>Lorsque vous utilisez VigilArt, nous pouvons traiter :</p>
    <ul>
      <li>
        votre nom, votre adresse e-mail, vos informations de profil et vos
        préférences de notification ;
      </li>
      <li>les œuvres que vous importez et les informations associées ;</li>
      <li>
        l’historique des analyses et les correspondances potentielles trouvées
        en ligne ;
      </li>
      <li>
        les informations utilisées pour générer des signalements liés au droit
        d’auteur ou au DMCA ;
      </li>
      <li>
        votre adresse IP, vos informations de session et d’appareil ainsi que
        les journaux techniques nécessaires au fonctionnement et à la sécurité
        du service.
      </li>
    </ul>
    <p>
      Nous utilisons ces données pour fournir les fonctionnalités de VigilArt,
      effectuer des recherches d’images inversées, sécuriser et maintenir le
      service, prévenir les abus et envoyer les notifications demandées.
    </p>
    <p>
      Si vous remplissez volontairement un formulaire de bêta-test ou de retour
      d’expérience, nous pouvons également traiter les informations fournies
      afin d’améliorer VigilArt et de vous contacter au sujet de vos retours.
    </p>
    <p>
      Selon la finalité, nous traitons vos données parce que cela est nécessaire
      pour fournir les fonctionnalités de VigilArt, assurer le fonctionnement et
      la sécurité du service, parce que vous avez donné votre consentement
      lorsque celui-ci est requis, ou parce que la loi nous y oblige.
    </p>
    <p>
      VigilArt n’utilise pas vos œuvres ni vos données personnelles pour
      entraîner des modèles d’intelligence artificielle.
    </p>

    <h2>3. Œuvres et services tiers</h2>
    <p>
      Les œuvres importées sont stockées de manière privée et ne sont pas
      publiées par VigilArt.
    </p>
    <p>VigilArt utilise actuellement :</p>
    <p>
      <strong>
        <a href="https://serpapi.com/legal">SerpApi Google Lens API</a>
      </strong>{" "}
      — utilisé pour effectuer les recherches d’images inversées. Une URL
      temporaire permettant d’accéder à l’œuvre recherchée est transmise à
      SerpApi. SerpApi indique que les données de recherche sont automatiquement
      supprimées 31 jours après la réalisation d’une recherche.
    </p>
    <p>
      <strong>
        <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">
          Cloudflare R2
        </a>
      </strong>{" "}
      — utilisé pour stocker les œuvres importées et les images temporaires
      utilisées lors des analyses sans compte.
    </p>
    <p>
      <strong>Cloudflare Turnstile</strong> — utilisé pour prévenir les abus
      automatisés et peut traiter certaines informations techniques telles que
      votre adresse IP ou des informations relatives à votre navigateur.
    </p>
    <p>
      <strong>
        <a href="https://firebase.google.com/terms/data-processing-terms">
          Firebase Cloud Messaging (Google)
        </a>
      </strong>{" "}
      — utilisé pour les notifications push lorsqu’elles sont activées.
    </p>
    <p>
      <strong>Google Forms / Google Sheets</strong> — utilisés pour les
      formulaires facultatifs de bêta-test et de retour d’expérience.
    </p>
    <p>
      <strong>Infrastructure Epitech</strong> — le backend de production, la
      base de données PostgreSQL et le cache de VigilArt sont hébergés sur une
      machine virtuelle fournie par Epitech.
    </p>
    <p>VigilArt ne vend pas vos données personnelles.</p>

    <h2>4. Conservation et suppression</h2>
    <p>
      Les données de compte, enregistrements d’œuvres, historiques d’analyse et
      correspondances sont généralement conservés tant que votre compte est
      actif ou jusqu’à leur suppression.
    </p>
    <p>
      Les résultats des analyses sans compte sont actuellement conservés pendant
      environ une heure. Les images temporaires sont supprimées à la fin du
      traitement. Une règle de cycle de vie du stockage supprime sous un jour
      les images abandonnées si le traitement ne se termine pas normalement.
    </p>
    <p>
      SerpApi conserve les données de recherche pendant 31 jours conformément à
      sa propre politique.
    </p>
    <p>
      Les réponses aux formulaires de retour d’expérience sont conservées
      uniquement pendant la durée raisonnablement nécessaire à l’analyse des
      retours et à l’amélioration de VigilArt.
    </p>
    <p>
      Vous pouvez supprimer individuellement vos œuvres ou votre compte via
      VigilArt.
    </p>
    <p>
      À l’heure actuelle, la suppression du compte efface le compte et la
      plupart des enregistrements associés de la base de données principale de
      VigilArt. Les notifications DMCA sont conservées sans lien avec le compte
      supprimé. Les fichiers d’œuvres et images de profil ne sont pas
      automatiquement supprimés du stockage d’objets lors de la suppression du
      compte.
    </p>
    <p>
      Pour toute demande relative à vos données, y compris celles fournies via
      les formulaires de retour d’expérience, contactez{" "}
      <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>.
    </p>

    <h2>5. Transferts internationaux</h2>
    <p>
      Certains fournisseurs tiers utilisés par VigilArt peuvent traiter des
      données en dehors de l’Espace économique européen, notamment :
    </p>
    <ul>
      <li>
        <a href="https://serpapi.com/legal">
          Conditions juridiques et politique de confidentialité de SerpApi
        </a>
      </li>
      <li>
        <a href="https://www.cloudflare.com/cloudflare-customer-dpa/">
          Addendum de Cloudflare relatif au traitement des données
        </a>
      </li>
      <li>
        les services Google, notamment{" "}
        <a href="https://firebase.google.com/terms/data-processing-terms">
          Firebase Cloud Messaging
        </a>
        , Google Forms et Google Sheets.
      </li>
    </ul>
    <p>
      Lorsque des données personnelles sont transférées en dehors de l’Espace
      économique européen, nos fournisseurs peuvent s’appuyer sur des mécanismes
      de transfert reconnus, notamment des décisions d’adéquation ou des clauses
      contractuelles types. Le mécanisme applicable à chaque fournisseur dépend
      de ses conditions et de la configuration de nos comptes.
    </p>
    <p>
      Commission européenne :{" "}
      <a href="https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/rules-international-data-transfers_en">
        Règles relatives aux transferts internationaux de données
      </a>
    </p>

    <h2>6. Vos droits</h2>
    <p>
      Selon la législation applicable, vous pouvez disposer du droit d’accéder à
      vos données personnelles, de les corriger, de les supprimer ou d’en
      obtenir une copie, de limiter certains traitements ou de vous y opposer,
      ainsi que de retirer votre consentement lorsque le traitement repose sur
      celui-ci.
    </p>
    <p>Pour exercer ces droits :</p>
    <p>
      <strong>
        <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>
      </strong>
    </p>
    <p>
      Vous pouvez également déposer une réclamation auprès de la CNIL ou d’une
      autre autorité compétente.
    </p>

    <h2>7. Sécurité</h2>
    <p>
      Nous utilisons notamment le hachage des mots de passe, HTTPS, des jetons
      d’authentification, des URL pré-signées pour les œuvres stockées et des
      mécanismes de prévention des abus.
    </p>
    <p>
      Cependant, aucun service en ligne ne peut garantir une sécurité totale.
    </p>

    <h2>8. Modifications</h2>
    <p>
      Nous pouvons mettre à jour cette Politique de confidentialité lorsque
      VigilArt ou ses pratiques de traitement des données évoluent.
    </p>
    <p>La dernière version sera disponible via le service.</p>
  </>
);

export const PRIVACY_POLICY_CONTENT: Readonly<
  Record<LandingLocale, React.JSX.Element>
> = {
  en: ENGLISH_PRIVACY_POLICY,
  fr: FRENCH_PRIVACY_POLICY
};
