import { X } from "lucide-react";
import { Input } from "../../../../components/ui/input";

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
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Uploaded Files</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <img
              src={item.preview}
              alt="preview"
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">{item.file.name}</p>
              <div className="text-xs text-gray-500">
                {(item.file.size / 1024).toFixed(2)} KB
              </div>
              <Input
                placeholder="Add a description (optional)"
                value={item.description}
                onChange={(e) => onDescriptionChange(index, e.target.value)}
                className="text-sm"
              />
            </div>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
