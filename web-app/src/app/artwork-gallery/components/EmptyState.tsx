import { Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "react-i18next";
import { FilterStatus } from "./types";

interface EmptyStateProps {
  searchQuery: string;
  selectedFilter: FilterStatus;
  /** True when the user has no artwork at all, not just none matching. */
  isGalleryEmpty: boolean;
  onUpload: () => void;
}

const GHOST_CARDS = 8;

export function EmptyState({ searchQuery, selectedFilter, isGalleryEmpty, onUpload }: EmptyStateProps) {
  const { t } = useTranslation();

  if (!isGalleryEmpty) {
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

  return (
    // Fills the rest of the viewport (below the header and the page padding)
    // so the card sits in the middle of the screen; the ghost grid is clipped.
    <div className="relative h-[calc(100svh-11.5rem)] min-h-[420px] overflow-hidden">
      {/* Placeholder cards hint at what the gallery becomes, fading out so they
          read as a preview rather than as real, broken artworks. */}
      <div
        aria-hidden="true"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      >
        {Array.from({ length: GHOST_CARDS }, (_, index) => (
          <div key={index} className="aspect-square rounded-lg border border-dashed bg-muted/30 p-4 flex flex-col justify-end gap-2">
            <div className="h-3 w-2/3 rounded-full bg-muted" />
            <div className="h-2.5 w-1/2 rounded-full bg-muted/70" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-xl border bg-card p-10 text-center shadow-lg space-y-8">
          <div className="space-y-3">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ImageIcon className="size-8" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold">{t("artwork_gallery_page.empty_title")}</h2>
            <p className="text-lg text-muted-foreground">{t("artwork_gallery_page.empty_subtitle")}</p>
          </div>
          <Button size="lg" onClick={onUpload} className="h-12 px-8 text-base gap-2">
            <Upload className="size-5" />
            {t("dashboard_page.upload.upload_artworks")}
          </Button>
        </div>
      </div>
    </div>
  );
}
