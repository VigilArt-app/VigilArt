import { Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterStatus } from "./types";

interface EmptyStateProps {
  searchQuery: string;
  selectedFilter: FilterStatus;
}

export function EmptyState({ searchQuery, selectedFilter }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t("artwork_gallery_page.no_artworks")}</h2>
      <p className="text-muted-foreground mb-4">
        {searchQuery || selectedFilter !== "All"
          ? t("artwork_gallery_page.try_adjusting")
          : t("artwork_gallery_page.start_uploading")}
      </p>
    </div>
  );
}
