import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { useTranslation } from "react-i18next";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <DialogTitle className="text-xl">{t("artwork_gallery_page.delete_artwork")}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {t("artwork_gallery_page.confirm_delete")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("artwork_gallery_page.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("artwork_gallery_page.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {t("artwork_gallery_page.delete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
