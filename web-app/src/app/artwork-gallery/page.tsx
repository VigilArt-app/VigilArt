"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ArtworkWithInsights, FilterStatus, getArtworkStatus } from "./components/types";
import { fetchArtworks, fetchArtworkReportInsights, deleteArtwork } from "./components/api";
import { SearchAndFilters } from "./components/SearchAndFilters";
import { ArtworkCard } from "./components/ArtworkCard";
import { ArtworkDetails } from "./components/ArtworkDetails";
import { DeleteDialog } from "./components/DeleteDialog";
import { EmptyState } from "./components/EmptyState";
import { useAuth } from "@/src/components/contexts/authContext";
import { useTranslation } from "react-i18next";

export default function ArtworkGalleryPage() {
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<ArtworkWithInsights[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<ArtworkWithInsights[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("All");
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkWithInsights | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const loadArtworks = async () => {
      if (loading) {
        return;
      }

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      const userId = user.id;

      try {
        const [data, insightsByArtwork] = await Promise.all([
          fetchArtworks(userId),
          fetchArtworkReportInsights(userId),
        ]);

        const enrichedArtworks: ArtworkWithInsights[] = data.map((artwork) => ({
          ...artwork,
          reportInsights: insightsByArtwork[artwork.id],
        }));

        setArtworks(enrichedArtworks);
        setFilteredArtworks(enrichedArtworks);
      } finally {
        setIsLoading(false);
      }
    };

    loadArtworks();
  }, [loading, user?.id]);

  useEffect(() => {
    let filtered = [...artworks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (artwork) =>
          artwork.id.toLowerCase().includes(query) ||
          artwork.originalFilename?.toLowerCase().includes(query) ||
          artwork.description?.toLowerCase().includes(query) ||
          artwork.reportInsights?.mostRecentSource?.toLowerCase().includes(query) ||
          new Date(artwork.createdAt).toLocaleDateString().includes(searchQuery)
      );
    }

    if (selectedFilter !== "All") {
      filtered = filtered.filter((artwork) => {
        return getArtworkStatus(artwork) === selectedFilter;
      });
    }

    setFilteredArtworks(filtered);
  }, [searchQuery, selectedFilter, artworks]);

  const handleDeleteArtwork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArtworkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!artworkToDelete) return;

    setIsDeleting(true);
    try {
      await deleteArtwork(artworkToDelete);
      setArtworks((prev) => prev.filter((a) => a.id !== artworkToDelete));
      if (selectedArtwork?.id === artworkToDelete) {
        setSelectedArtwork(null);
      }
      setDeleteDialogOpen(false);
      setArtworkToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 p-8 overflow-y-auto scrollbar-soft">
        <div className="bg-black text-white rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold">{t("artwork_gallery_page.artwork_gallery")}</h1>
        </div>

        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          filteredCount={filteredArtworks.length}
        />

        {filteredArtworks.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            selectedFilter={selectedFilter}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                isSelected={selectedArtwork?.id === artwork.id}
                onSelect={setSelectedArtwork}
                onDelete={handleDeleteArtwork}
              />
            ))}
          </div>
        )}
      </div>

      {selectedArtwork && <ArtworkDetails artwork={selectedArtwork} />}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
