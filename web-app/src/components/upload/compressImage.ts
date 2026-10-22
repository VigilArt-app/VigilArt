import imageCompression from "browser-image-compression";

/**
 * Shrink an image before upload so the visitor's connection carries a few
 * hundred KB instead of several MB.
 *
 * `maxSizeMB` is deliberately loose. The library reaches a size target by
 * re-encoding in a loop, and PNG is lossless, so lowering quality barely
 * shrinks it and the loop runs many times: a 2.97 MB 1350x1688 PNG took 12.4
 * seconds against a 1 MB target. The 1920px cap does the real work, and 4 MB
 * sits under the server's 5 MB limit, so the loop only ever runs for images
 * that would otherwise be rejected.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 4,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(file, options);

  return compressedFile as File;
}

/**
 * Extract image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
