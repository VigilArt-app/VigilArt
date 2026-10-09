"use client";

import { useTranslation } from "react-i18next";
import { LegalPageShell } from "../../components/legal/legal-page-shell";
import { TranslatedLegalContent } from "../../components/legal/translated-legal-content";

const PrivacyPage = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <LegalPageShell>
      <h1>{t("privacy_page.title")}</h1>
      <p>
        <strong>{t("privacy_page.last_updated")}</strong>
      </p>
      <TranslatedLegalContent translationKey="privacy_page.blocks" />
    </LegalPageShell>
  );
};

export default PrivacyPage;
