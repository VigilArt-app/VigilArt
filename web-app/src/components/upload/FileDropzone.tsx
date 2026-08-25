"use client";

import { useState } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { compressImage } from "./compressImage";

// `accept` on the input only filters the picker; a dropped file arrives
// whatever its type, so the check has to happen here.
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface DroppedFile {
  file: File;
  preview: string;
  description: string;
}

interface FileDropzoneProps {
  onFilesAdded: (files: DroppedFile[]) => void;
  /** The public scan takes one artwork; the dashboard uploads a batch. */
  multiple?: boolean;
  inputId?: string;
}

export function FileDropzone({
  onFilesAdded,
  multiple = true,
  inputId = "file-input"
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  // Compression is real work on a large file, and without this the dropzone
  // simply sits there looking broken while it runs.
  const [working, setWorking] = useState(false);

  const accept = async (list: FileList | null) => {
    const files = Array.from(list ?? []);
    const processed: DroppedFile[] = [];
    setWorking(true);

    for (const file of multiple ? files : files.slice(0, 1)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(t("dashboard_page.upload.error_type"));
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(t("dashboard_page.upload.error_size"));
        continue;
      }
      try {
        const compressed = await compressImage(file);
        processed.push({
          file: compressed,
          preview: URL.createObjectURL(compressed),
          description: ""
        });
      } catch {
        toast.error(`${t("dashboard_page.upload.error_process")} ${file.name}`);
      }
    }

    setWorking(false);
    if (processed.length > 0) onFilesAdded(processed);
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block"
        // The copy has always promised drag and drop; until now there were no
        // handlers behind it, so dropping a file did nothing.
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void accept(event.dataTransfer.files);
        }}
      >
        <div
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            working ? "cursor-progress opacity-70" : "cursor-pointer"
          } ${
            dragging
              ? "border-primary bg-accent"
              : "border-input hover:border-primary hover:bg-accent"
          }`}
          aria-busy={working}
        >
          {working ? (
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-muted-foreground" />
          ) : (
            <Cloud className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          )}
          <p className="text-sm font-medium text-foreground" role={working ? "status" : undefined}>
            {working ? t("dashboard_page.upload.preparing") : t(
              multiple
                ? "dashboard_page.upload.drag_or"
                : "dashboard_page.upload.drag_or_one"
            )}
            {!working && " "}
            {!working && (
              <span className="text-primary">
                {t(
                  multiple
                    ? "dashboard_page.upload.click_to_select"
                    : "dashboard_page.upload.click_to_select_one"
                )}
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("dashboard_page.upload.supported_formats")}
          </p>
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png"
        onChange={(event) => void accept(event.target.files)}
        className="hidden"
      />
    </div>
  );
}
