"use client";

import { useTranslation } from "react-i18next";
import { FILTER_STATUS_TRANSLATION_KEYS, type ArtworkStatus } from "./types";

const STATUS_CLASSES: Record<ArtworkStatus, string> = {
  not_scanned: "bg-not-scanned text-white",
  matches_found: "bg-blue-500 text-white",
  no_matches: "bg-no-matches text-white",
  results_unavailable: "bg-muted-foreground text-background",
};

export const ArtworkStatusBadge = ({ status }: { status: ArtworkStatus }) => {
  const { t } = useTranslation();

  return (
    <span
      data-artwork-status={status}
      className={`inline-block max-w-full break-words rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASSES[status]}`}
    >
      {t(FILTER_STATUS_TRANSLATION_KEYS[status]).toUpperCase()}
    </span>
  );
};
