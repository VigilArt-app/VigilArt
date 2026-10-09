"use client";

import { Trans, useTranslation } from "react-i18next";

export type FaqItem = Readonly<{
  question: string;
  answer: React.ReactNode;
}>;

const FAQ_ITEMS = [
  ["data", 2],
  ["storage", 3],
  ["ai_training", 1],
  ["deletion", 2],
  ["permissions", 1],
  ["workflow", 1],
  ["progress", 1],
  ["source", 1],
] as const;

const answerComponents = {
  email: <a href="mailto:vigilart.app@gmail.com" />,
  github: (
    <a
      href="https://github.com/VigilArt-app/VigilArt"
      rel="noreferrer"
      target="_blank"
    />
  ),
};

export const useFaqContent = (): readonly FaqItem[] => {
  const { t } = useTranslation();

  return FAQ_ITEMS.map(([id, paragraphCount]) => ({
    question: t(`faq_page.items.${id}.question`),
    answer: (
      <>
        {Array.from({ length: paragraphCount }, (_, index) => (
          <p key={`${id}-${index}`}>
            <Trans
              i18nKey={`faq_page.items.${id}.answer_${index + 1}`}
              components={answerComponents}
            />
          </p>
        ))}
      </>
    ),
  }));
};
