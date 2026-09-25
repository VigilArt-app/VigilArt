import type { Metadata } from "next";
import { LegalPageShell } from "../../components/legal/legal-page-shell";
import { TERMS_CONTENT } from "../../components/legal/content/terms-content";
import { getLandingLocale } from "../landing/locale";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLandingLocale();

  return {
    title:
      locale === "fr"
        ? "Conditions d’utilisation | VigilArt"
        : "Terms of Service | VigilArt",
  };
};

const TermsPage = async (): Promise<React.JSX.Element> => {
  const locale = await getLandingLocale();

  return (
    <LegalPageShell locale={locale}>{TERMS_CONTENT[locale]}</LegalPageShell>
  );
};

export default TermsPage;
