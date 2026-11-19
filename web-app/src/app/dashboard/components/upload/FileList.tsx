import { X } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { useTranslation } from "react-i18next";

interface UploadedFile {
  file: File;
  preview: string;
  description: string;
}

interface FileListProps {
  files: UploadedFile[];
  onRemove: (index: number) => void;
  onDescriptionChange: (index: number, description: string) => void;
}

export function FileList({ files, onRemove, onDescriptionChange }: FileListProps) {
  const { t } = useTranslation();
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">{t("dashboard_page.upload.uploaded_files")}</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map((item, index) => (
          <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors" >
            <img src={item.preview} alt="preview" className="w-16 h-16 object-cover rounded" />
            {/* min-w-0 + break-all: a long name without spaces must wrap, not widen the dialog. */}
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-sm font-medium break-all">{item.file.name}</p>
              <div className="text-xs text-muted-foreground">
                {(item.file.size / 1024).toFixed(2)} KB
              </div>
              <Input placeholder={t("dashboard_page.upload.add_description")} value={item.description} onChange={(e) => onDescriptionChange(index, e.target.value)} />
            </div>
            <button onClick={() => onRemove(index)} className="-m-2 flex size-11 shrink-0 items-center justify-center text-destructive hover:text-destructive/80 transition-colors" aria-label={t("dashboard_page.upload.remove_file")}>
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
