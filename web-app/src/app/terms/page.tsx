"use client";

import { useTranslation } from "react-i18next";
import { LegalPageShell } from "../../components/legal/legal-page-shell";
import { TranslatedLegalContent } from "../../components/legal/translated-legal-content";

const TermsPage = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <LegalPageShell>
      <h1>{t("terms_page.title")}</h1>
      <p>
        <strong>{t("terms_page.last_updated")}</strong>
      </p>
      <TranslatedLegalContent translationKey="terms_page.blocks" />
    </LegalPageShell>
  );
};

export default TermsPage;
