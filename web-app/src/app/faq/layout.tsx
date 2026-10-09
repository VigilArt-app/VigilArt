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
    en: { title: en.faq_page.metadata_title },
    fr: { title: fr.faq_page.metadata_title },
  });
};

const FaqLayout = ({ children }: { children: React.ReactNode }) => children;

export default FaqLayout;
