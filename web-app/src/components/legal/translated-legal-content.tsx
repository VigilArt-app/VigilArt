"use client";

import { Fragment } from "react";
import { useTranslation } from "react-i18next";

type InlineLink = Readonly<{
  text: string;
  href?: string;
  strong?: boolean;
}>;

type InlineContent = string | InlineLink;

type LegalBlock =
  | Readonly<{ type: "h2"; content: readonly InlineContent[] }>
  | Readonly<{ type: "p"; content: readonly InlineContent[] }>
  | Readonly<{ type: "ul"; items: readonly (readonly InlineContent[])[] }>;

const renderInlineContent = (
  content: readonly InlineContent[],
): React.ReactNode =>
  content.map((part, index) => {
    if (typeof part === "string") {
      return <Fragment key={index}>{part}</Fragment>;
    }

    const node = part.href ? (
      <a
        href={part.href}
        rel={part.href.startsWith("http") ? "noreferrer" : undefined}
        target={part.href.startsWith("http") ? "_blank" : undefined}
      >
        {part.text}
      </a>
    ) : (
      part.text
    );

    return part.strong ? (
      <strong key={index}>{node}</strong>
    ) : (
      <Fragment key={index}>{node}</Fragment>
    );
  });

export const TranslatedLegalContent = ({
  translationKey,
}: {
  translationKey: "privacy_page.blocks" | "terms_page.blocks";
}): React.JSX.Element => {
  const { t } = useTranslation();
  const blocks = t(translationKey, { returnObjects: true }) as LegalBlock[];

  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return <h2 key={index}>{renderInlineContent(block.content)}</h2>;
        }

        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineContent(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{renderInlineContent(block.content)}</p>;
      })}
    </>
  );
};
