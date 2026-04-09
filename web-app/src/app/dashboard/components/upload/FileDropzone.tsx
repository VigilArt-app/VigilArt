import { Cloud } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "./imageUtils";
import { useTranslation } from "react-i18next";

interface FileDropzoneProps {
  onFilesAdded: (files: Array<{ file: File; preview: string; description: string }>) => void;
}

export function FileDropzone({ onFilesAdded }: FileDropzoneProps) {
  const { t } = useTranslation();
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const processedFiles: Array<{ file: File; preview: string; description: string }> = [];

    for (const file of files) {
      try {
        const compressedFile = await compressImage(file);

        processedFiles.push({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          description: "",
        });
      } catch (error) {
        toast.error(`${t("dashboard_page.upload.error_process")} ${file.name}`);
      }
    }

    if (processedFiles.length > 0) {
      onFilesAdded(processedFiles);
    }
  };

  return (
    <div>
      <label htmlFor="file-input" className="block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent transition-colors">
          <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            {t("dashboard_page.upload.drag_or")} <span className="text-primary">{t("dashboard_page.upload.click_to_select")}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">{t("dashboard_page.upload.supported_formats")}</p>
        </div>
      </label>
      <input id="file-input" type="file" multiple accept="image/jpeg,image/png" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}
