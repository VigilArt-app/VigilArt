"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface RestrictedMatchProps {
  unsafeDomain: boolean;
  resetKey: string;
  children: ReactNode;
  compact?: boolean;
}

const RestrictedContent = ({ children, compact }: Pick<RestrictedMatchProps, "children" | "compact">) => {
  const [revealed, setRevealed] = useState(false);
  const { t } = useTranslation();

  return (
    <div className={compact ? "rounded-lg bg-background p-2 text-xs text-foreground" : "text-sm text-foreground"}>
      <div className="flex flex-wrap items-center gap-2">
        {!revealed && <span className="text-muted-foreground">{t("restricted_match.hidden")}</span>}
        <button
          type="button"
          aria-expanded={revealed}
          className="rounded-lg text-primary font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            // Summary controls also live inside clickable artwork cards/rows.
            event.stopPropagation();
            setRevealed((value) => !value);
          }}
        >
          {t(revealed ? "restricted_match.hide" : "restricted_match.show")}
        </button>
      </div>
      {revealed && <div className="mt-2">{children}</div>}
    </div>
  );
};

interface IdentifiedMatch {
  id: string;
  artworkId: string;
  url: string;
  firstDetectedAt?: string | Date;
}

// O(1) reset key part: serializing the whole dataset per row was too slow on every render.
export const matchIdentity = (match?: IdentifiedMatch) =>
  match ? `${match.artworkId}-${match.id}-${match.url}-${String(match.firstDetectedAt)}` : "";

// A changed selection/result remounts the state before rendering sensitive children.
export const RestrictedMatch = ({ unsafeDomain, resetKey, children, compact }: RestrictedMatchProps) =>
  unsafeDomain ? (
    <RestrictedContent key={resetKey} compact={compact}>{children}</RestrictedContent>
  ) : <>{children}</>;
