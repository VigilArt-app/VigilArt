import { Info } from "lucide-react";
import { Artwork, getArtworkStatus } from "./types";

interface ArtworkDetailsProps {
  artwork: Artwork;
}

export function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
  const status = getArtworkStatus(artwork);

  return (
    <div className="w-96 border-l bg-background p-6 overflow-y-auto">
      <div className="bg-black text-white rounded-lg p-4 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Selected Artwork</h2>
      </div>

      <div className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden border">
          <img
            src={artwork.imageUri}
            alt={artwork.description || "Artwork"}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
            status === "Scanned"
              ? "bg-green-500 text-white"
              : status === "Scanning"
              ? "bg-purple-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {status.toUpperCase()}
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">File name:</p>
            <p className="text-muted-foreground break-all">
              {artwork.originalFilename || "Untitled"}
            </p>
          </div>

          {artwork.description && (
            <div>
              <p className="font-semibold">Description:</p>
              <p className="text-muted-foreground">{artwork.description}</p>
            </div>
          )}

          <div>
            <p className="font-semibold">Upload date:</p>
            <p className="text-muted-foreground">
              {new Date(artwork.createdAt).toLocaleString()}
            </p>
          </div>

          {artwork.sizeBytes && (
            <div>
              <p className="font-semibold">File size:</p>
              <p className="text-muted-foreground">
                {(artwork.sizeBytes / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div>
            <p className="font-semibold">ID:</p>
            <p className="text-muted-foreground font-mono text-xs break-all">
              {artwork.id}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">All links of matches:</h3>
          <div className="text-xs text-muted-foreground">
            No matches found yet
          </div>
        </div>
      </div>
    </div>
  );
}
