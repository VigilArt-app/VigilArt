import type { Metadata } from "next";
import { FaqList } from "../../components/faq/faq-list";
import { FAQ_CONTENT } from "../../components/faq/faq-content";
import { LegalPageShell } from "../../components/legal/legal-page-shell";
import { getLandingLocale } from "../landing/locale";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLandingLocale();

  return {
    title:
      locale === "fr"
        ? "Questions fréquentes | VigilArt"
        : "Frequently Asked Questions | VigilArt",
  };
};

const FaqPage = async (): Promise<React.JSX.Element> => {
  const locale = await getLandingLocale();
  const copy =
    locale === "fr"
      ? {
          title: "Questions fréquentes",
          introduction:
            "Retrouvez les réponses essentielles sur vos données, vos œuvres et le fonctionnement de VigilArt.",
        }
      : {
          title: "Frequently asked questions",
          introduction:
            "Find clear answers about your data, your artwork, and how VigilArt works.",
        };

  return (
    <LegalPageShell locale={locale}>
      <header>
        <h1>{copy.title}</h1>
        <p>{copy.introduction}</p>
      </header>
      <FaqList items={FAQ_CONTENT[locale]} />
    </LegalPageShell>
  );
};

export default FaqPage;
