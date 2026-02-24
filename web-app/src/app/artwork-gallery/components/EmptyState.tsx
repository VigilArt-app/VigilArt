import { Image as ImageIcon } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
  selectedFilter: string;
}

export function EmptyState({ searchQuery, selectedFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <h2 className="text-xl font-semibold mb-2">No artworks found</h2>
      <p className="text-muted-foreground mb-4">
        {searchQuery || selectedFilter !== "All"
          ? "Try adjusting your filters"
          : "Start by uploading your first artwork"}
      </p>
    </div>
  );
}
