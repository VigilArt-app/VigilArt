"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateArtwork } from "./api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: any | null;
  onSaved?: (updated: any) => void;
}

export function EditArtworkModal({ open, onOpenChange, artwork, onSaved }: Props) {
  const [description, setDescription] = useState(artwork?.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    setDescription(artwork?.description || "");
  }, [artwork]);

  const handleSave = async () => {
    if (!artwork) return;
    setIsSaving(true);
    try {
      const updated = await updateArtwork(artwork.id, { description });
      onSaved?.(updated);
      onOpenChange(false);
    } catch (e) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("artwork_gallery_page.edit_artwork_title")}</DialogTitle>
          <DialogDescription>{t("artwork_gallery_page.edit_artwork_description_modal")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">{t("artwork_gallery_page.file_name")}</label>
            <p className="text-muted-foreground break-all">{artwork?.originalFilename || t("artwork_gallery_page.untitled")}</p>
          </div>

          <div>
            <label className="text-sm font-medium">{t("artwork_gallery_page.description")}</label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t("artwork_gallery_page.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {t("artwork_gallery_page.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditArtworkModal;
