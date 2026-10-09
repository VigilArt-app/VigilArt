import type { Metadata } from "next";
import { cookies } from "next/headers";
import en from "../../../public/locales/en/translation.json";
import fr from "../../../public/locales/fr/translation.json";
import { normalizeLanguage } from "../i18n/language";
import { selectLocalizedMetadata } from "../i18n/metadata";

export const generateMetadata = async (): Promise<Metadata> => {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("language")?.value);

  return selectLocalizedMetadata(language, {
    en: { title: en.terms_page.metadata_title },
    fr: { title: fr.terms_page.metadata_title },
  });
};

const TermsLayout = ({ children }: { children: React.ReactNode }) => children;

export default TermsLayout;
