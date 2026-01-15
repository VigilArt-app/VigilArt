"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";
import { Cloud, X } from "lucide-react";
import { getUserIdFromToken } from "../../artwork-gallery/components/utils";

interface UploadedFile {
  file: File;
  preview: string;
  description: string;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, file.type, quality);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });
        
        const newFile = {
          file: compressedFile,
          preview: URL.createObjectURL(compressedBlob),
          description: "",
        };
        
        setUploadedFiles((prev) => [...prev, newFile]);
        
        const savings = ((1 - compressedBlob.size / file.size) * 100).toFixed(0);
        console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedBlob.size / 1024).toFixed(0)}KB (${savings}% reduction)`);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateDescription = (index: number, description: string) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      updated[index].description = description;
      return updated;
    });
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setIsUploading(true);
    const totalFiles = uploadedFiles.length;
    let uploadedCount = 0;
    let failedCount = 0;
    const uploadedNames: string[] = [];

    toast.loading(`Uploading ${totalFiles} image${totalFiles > 1 ? 's' : ''}...`, { id: 'upload-progress' });

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;

      for (const { file, description } of uploadedFiles) {
        try {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const requestBody = {
            userId,
            imageUri: base64Data,
            originalFilename: file.name,
            contentType: file.type,
            sizeBytes: file.size,
            description: description || "",
          };

          const response = await fetch(`${API_BASE}/artworks`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            });

          if (!response.ok) {
            failedCount++;
            const contentType = response.headers.get("content-type");
            let errorMessage = "Unknown error";
            
            if (contentType?.includes("application/json")) {
              try {
                const error = await response.json();
                errorMessage = error.message || `Error: ${response.status}`;
              } catch {
                errorMessage = `Server error: ${response.status}`;
              }
            } else {
              errorMessage = `Server error: ${response.status}`;
            }
            
            toast.error(`Failed: ${file.name}`, { duration: 5000 });
            console.error(`Upload failed for ${file.name}:`, errorMessage);
          } else {
            uploadedCount++;
            uploadedNames.push(file.name);
            toast.loading(`Uploaded ${uploadedCount}/${totalFiles}...`, { id: 'upload-progress' });
          }
        } catch (error) {
          failedCount++;
          console.error("Upload error:", error);
          toast.error(`Error: ${file.name}`);
        }
      }

      toast.dismiss('upload-progress');
      
      if (uploadedCount > 0) {
        setUploadedFiles([]);
        onOpenChange(false);
        
        // Show success message after modal closes
        setTimeout(() => {
          if (failedCount === 0) {
            const namesDisplay = uploadedNames.length <= 3 
              ? uploadedNames.map(name => `'${name}'`).join(', ')
              : `${uploadedNames.length} artworks`;
            
            toast.success(
              `${namesDisplay} ${uploadedNames.length > 1 ? 'have' : 'has'} been uploaded, you can see ${uploadedNames.length > 1 ? 'them' : 'it'} in your artwork gallery`, 
              { duration: 5000 }
            );
          } else if (uploadedCount > 0) {
            toast.warning(`Uploaded ${uploadedCount}, failed ${failedCount}`, { duration: 5000 });
          }
        }, 300);
      } else if (failedCount > 0) {
        toast.error(`Failed to upload ${failedCount} image${failedCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.dismiss('upload-progress');
      console.error("Error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Pictures</DialogTitle>
          <DialogDescription>
            Drag & drop files or click to select files to upload
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label htmlFor="file-input" className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent transition-colors">
                <Cloud className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Drag & drop files or{" "}
                  <span className="text-primary">click to select</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPG, PNG
                </p>
              </div>
            </label>
            <input id="file-input" type="file" multiple accept="image/jpeg,image/png" onChange={handleFileSelect} className="hidden" />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Uploaded Files</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadedFiles.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-accent transition-colors" >
                    <img src={item.preview} alt="preview" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium">{item.file.name}</p>
                      <div className="text-xs text-gray-500">
                        {(item.file.size / 1024).toFixed(2)} KB
                      </div>
                      <Input placeholder="Add a description (optional)" value={item.description} 
                        onChange={(e) =>
                          updateDescription(index, e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>
                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 transition-colors" >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading} >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploadedFiles.length === 0 || isUploading} >
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
