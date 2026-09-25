import type { Metadata } from "next";
import { LegalPageShell } from "../../components/legal/legal-page-shell";
import { PRIVACY_POLICY_CONTENT } from "../../components/legal/content/privacy-policy-content";
import { getLandingLocale } from "../landing/locale";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLandingLocale();

  return {
    title:
      locale === "fr"
        ? "Politique de confidentialité | VigilArt"
        : "Privacy Policy | VigilArt",
  };
};

const PrivacyPage = async (): Promise<React.JSX.Element> => {
  const locale = await getLandingLocale();

  return (
    <LegalPageShell locale={locale}>
      {PRIVACY_POLICY_CONTENT[locale]}
    </LegalPageShell>
  );
};

export default PrivacyPage;
