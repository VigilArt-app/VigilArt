"use client";

import { useTranslation } from "react-i18next";
import { LegalPageShell } from "../../components/legal/legal-page-shell";
import { TranslatedLegalContent } from "../../components/legal/translated-legal-content";

const LegalNoticePage = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <LegalPageShell>
      <h1>{t("legal_notice_page.title")}</h1>
      <p>
        <strong>{t("legal_notice_page.last_updated")}</strong>
      </p>
      <TranslatedLegalContent translationKey="legal_notice_page.blocks" />
    </LegalPageShell>
  );
};

export default LegalNoticePage;
