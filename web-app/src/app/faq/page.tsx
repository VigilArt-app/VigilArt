"use client";

import { useTranslation } from "react-i18next";
import { FaqList } from "../../components/faq/faq-list";
import { useFaqContent } from "../../components/faq/faq-content";
import { LegalPageShell } from "../../components/legal/legal-page-shell";

const FaqPage = (): React.JSX.Element => {
  const { t } = useTranslation();
  const items = useFaqContent();

  return (
    <LegalPageShell>
      <header>
        <h1>{t("faq_page.title")}</h1>
        <p>{t("faq_page.introduction")}</p>
      </header>
      <FaqList items={items} />
    </LegalPageShell>
  );
};

export default FaqPage;
