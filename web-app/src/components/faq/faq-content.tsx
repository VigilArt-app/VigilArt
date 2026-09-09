import type { LandingLocale } from "../../app/landing/locale";

export type FaqItem = Readonly<{
  question: string;
  answer: React.ReactNode;
}>;

const ENGLISH_FAQ: readonly FaqItem[] = [
  {
    question: "What data does VigilArt collect?",
    answer: (
      <>
        <p>
          We currently collect your name and email address. If you filled out
          the “Join the private beta” registration form, we also have the email
          address and social media usernames you provided.
        </p>
        <p>We process and store the artwork you upload to the app.</p>
      </>
    ),
  },
  {
    question: "How is my data stored, secured, and used?",
    answer: (
      <>
        <p>
          Uploaded artwork is stored in a private Cloudflare R2 bucket, and
          user data is stored in a private PostgreSQL database.
        </p>
        <p>
          Passwords are hashed with bcrypt, all traffic is served over HTTPS,
          and we use pre-signed URLs to upload and access artwork.
        </p>
        <p>
          Uploaded artwork is sent to a third-party provider, SerpApi, which we
          currently use to query Google Lens and detect matches on the web.
        </p>
      </>
    ),
  },
  {
    question: "Does VigilArt use my artwork to train AI models?",
    answer: (
      <p>
        No. VigilArt does not use your artwork or personal data to train AI
        models.
      </p>
    ),
  },
  {
    question: "Can I withdraw and delete my data?",
    answer: (
      <>
        <p>
          You can delete your account at any time. Account deletion removes
          your account records, although some uploaded files may temporarily
          remain in object storage while we improve the deletion process.
        </p>
        <p>
          If you want us to delete the information you provided through the
          beta registration form, contact us at{" "}
          <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>.
        </p>
      </>
    ),
  },
  {
    question:
      "Does VigilArt request intrusive permissions unrelated to its core features, such as geolocation?",
    answer: (
      <p>
        No. VigilArt does not request geolocation or other unrelated device
        permissions.
      </p>
    ),
  },
  {
    question:
      "How can an artist check where their work has been reposted? Do I need to upload my artwork to the app?",
    answer: (
      <p>
        Yes. Artists upload their artwork to VigilArt, which then searches for
        matching images across the web.
      </p>
    ),
  },
  {
    question: "What’s the current progress?",
    answer: (
      <p>
        VigilArt is still in development. The core features are available, and
        we are currently improving and testing the app.
      </p>
    ),
  },
  {
    question: "Is the codebase publicly available?",
    answer: (
      <p>
        Yes. You can view the code on our GitHub repository:{" "}
        <a
          href="https://github.com/VigilArt-app/VigilArt"
          rel="noreferrer"
          target="_blank"
        >
          github.com/VigilArt-app/VigilArt
        </a>
        .
      </p>
    ),
  },
];

const FRENCH_FAQ: readonly FaqItem[] = [
  {
    question: "Quelles données VigilArt collecte-t-il ?",
    answer: (
      <>
        <p>
          Nous collectons actuellement votre nom et votre adresse e-mail. Si
          vous avez rempli le formulaire « Join the private beta », nous
          disposons également de l’adresse e-mail et des identifiants de réseaux
          sociaux que vous avez fournis.
        </p>
        <p>
          Nous traitons et stockons les œuvres que vous importez dans
          l’application.
        </p>
      </>
    ),
  },
  {
    question: "Comment mes données sont-elles stockées, sécurisées et utilisées ?",
    answer: (
      <>
        <p>
          Les œuvres importées sont stockées dans un bucket privé Cloudflare
          R2, et les données utilisateur sont stockées dans une base de données
          PostgreSQL privée.
        </p>
        <p>
          Les mots de passe sont hachés avec bcrypt, tout le trafic est servi
          via HTTPS, et nous utilisons des URL pré-signées pour importer et
          accéder aux œuvres.
        </p>
        <p>
          Les œuvres importées sont envoyées à un fournisseur tiers, SerpApi,
          que nous utilisons actuellement pour interroger Google Lens et
          détecter des correspondances sur le web.
        </p>
      </>
    ),
  },
  {
    question:
      "VigilArt utilise-t-il mes œuvres pour entraîner des modèles d’intelligence artificielle ?",
    answer: (
      <p>
        Non. VigilArt n’utilise ni vos œuvres ni vos données personnelles pour
        entraîner des modèles d’intelligence artificielle.
      </p>
    ),
  },
  {
    question: "Puis-je retirer mon consentement et supprimer mes données ?",
    answer: (
      <>
        <p>
          Vous pouvez supprimer votre compte à tout moment. La suppression du
          compte supprime les données associées à votre compte, mais certains
          fichiers importés peuvent temporairement rester présents dans le
          stockage d’objets pendant que nous améliorons le processus de
          suppression.
        </p>
        <p>
          Si vous souhaitez que nous supprimions les informations fournies via
          le formulaire d’inscription à la bêta, contactez-nous à l’adresse{" "}
          <a href="mailto:vigilart.app@gmail.com">vigilart.app@gmail.com</a>.
        </p>
      </>
    ),
  },
  {
    question:
      "VigilArt demande-t-il des autorisations intrusives sans lien avec ses fonctionnalités principales, comme la géolocalisation ?",
    answer: (
      <p>
        Non. VigilArt ne demande pas l’accès à la géolocalisation ni à d’autres
        autorisations de l’appareil sans rapport avec ses fonctionnalités.
      </p>
    ),
  },
  {
    question:
      "Comment un artiste peut-il vérifier où son travail a été republié ? Dois-je importer mes œuvres dans l’application ?",
    answer: (
      <p>
        Oui. Les artistes importent leurs œuvres dans VigilArt, qui recherche
        ensuite des images correspondantes sur le web.
      </p>
    ),
  },
  {
    question: "Où en est le développement ?",
    answer: (
      <p>
        VigilArt est toujours en cours de développement. Les fonctionnalités
        principales sont disponibles, et nous améliorons et testons
        actuellement l’application.
      </p>
    ),
  },
  {
    question: "Le code source est-il public ?",
    answer: (
      <p>
        Oui. Vous pouvez consulter le code sur notre dépôt GitHub :{" "}
        <a
          href="https://github.com/VigilArt-app/VigilArt"
          rel="noreferrer"
          target="_blank"
        >
          github.com/VigilArt-app/VigilArt
        </a>
        .
      </p>
    ),
  },
];

export const FAQ_CONTENT: Readonly<
  Record<LandingLocale, readonly FaqItem[]>
> = {
  en: ENGLISH_FAQ,
  fr: FRENCH_FAQ,
};
