"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  ArtworkReportInsights,
  ArtworkWithInsights,
  FilterStatus,
  getArtworkStatus
} from "./components/types";
import {
  fetchArtworks,
  fetchArtworkReportInsights,
  deleteArtwork
} from "./components/api";
import { SearchAndFilters } from "./components/SearchAndFilters";
import { ArtworkCard } from "./components/ArtworkCard";
import { ArtworkDetails } from "./components/ArtworkDetails";
import { DeleteDialog } from "./components/DeleteDialog";
import { EmptyState } from "./components/EmptyState";
import EditArtworkModal from "./components/EditArtworkModal";
import { Button } from "@/src/components/ui/button";
import { UploadModal } from "../dashboard/components/UploadModal";
import { useAuth } from "@/src/components/contexts/authContext";
import { useTranslation } from "react-i18next";
import React from "react";

export default function ArtworkGalleryPage() {
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<ArtworkWithInsights[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<
    ArtworkWithInsights[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [insightsByArtwork, setInsightsByArtwork] = useState<
    Record<string, ArtworkReportInsights>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("All");
  const [selectedArtwork, setSelectedArtwork] =
    useState<ArtworkWithInsights | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [artworkToEdit, setArtworkToEdit] =
    useState<ArtworkWithInsights | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
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
        const [page, insights] = await Promise.all([
          fetchArtworks(userId),
          fetchArtworkReportInsights(userId)
        ]);

        const enrichedArtworks: ArtworkWithInsights[] = page.items.map(
          (artwork) => ({
            ...artwork,
            reportInsights: insights[artwork.id]
          })
        );

        setInsightsByArtwork(insights);
        setArtworks(enrichedArtworks);
        setFilteredArtworks(enrichedArtworks);
        setNextCursor(page.nextCursor);
      } catch {
        // Errors are already surfaced via toast in the fetch helpers.
      } finally {
        setIsLoading(false);
      }
    };

    loadArtworks();
  }, [loading, user?.id, refreshKey]);

  useEffect(() => {
    let filtered = [...artworks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (artwork) =>
          artwork.id.toLowerCase().includes(query) ||
          artwork.originalFilename?.toLowerCase().includes(query) ||
          artwork.description?.toLowerCase().includes(query) ||
          artwork.reportInsights?.mostRecentSource
            ?.toLowerCase()
            .includes(query) ||
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

  const handleLoadMore = async () => {
    if (!nextCursor || !user?.id) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchArtworks(user.id, nextCursor);
      const enriched = page.items.map((artwork) => ({
        ...artwork,
        reportInsights: insightsByArtwork[artwork.id]
      }));
      setArtworks((prev) => prev.concat(enriched));
      setNextCursor(page.nextCursor);
    } catch {
      // Errors are already surfaced via toast in fetchArtworks.
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDeleteArtwork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArtworkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditArtwork = (
    artwork: ArtworkWithInsights,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setArtworkToEdit(artwork);
    setEditModalOpen(true);
  };

  React.useEffect(() => {
    const listener = (ev: any) => {
      setArtworkToEdit(ev.detail);
      setEditModalOpen(true);
    };

    window.addEventListener("openEditArtwork", listener as EventListener);
    return () =>
      window.removeEventListener("openEditArtwork", listener as EventListener);
  }, []);

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
      <div
        className="flex-1 p-8 overflow-y-auto scrollbar-soft"
        onClick={() => setSelectedArtwork(null)}
      >
        <div className="bg-black text-white rounded-lg p-6 mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {t("artwork_gallery_page.artwork_gallery")}
          </h1>
          <Button
            className="flex items-center gap-2 mt-4"
            onClick={() => setUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4" />
            {t("dashboard_page.upload.upload_artworks")}
          </Button>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  isSelected={selectedArtwork?.id === artwork.id}
                  onSelect={setSelectedArtwork}
                  onEdit={handleEditArtwork}
                  onDelete={handleDeleteArtwork}
                />
              ))}
            </div>
            {nextCursor && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {t("artwork_gallery_page.load_more", "Load more")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedArtwork && <ArtworkDetails artwork={selectedArtwork} />}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={() => setRefreshKey((value) => value + 1)}
      />
      <EditArtworkModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        artwork={artworkToEdit}
        onSaved={(updated) => {
          if (!updated) return;
          setArtworks((prev) =>
            prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
          );
          setFilteredArtworks((prev) =>
            prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
          );
          if (selectedArtwork?.id === updated.id) {
            setSelectedArtwork((s) => (s ? { ...s, ...updated } : s));
          }
        }}
      />
    </div>
  );
}
