export default function ArtworkGalleryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Artwork Gallery</h1>
      <p>Browse and manage your artwork collection.</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="aspect-square bg-muted rounded mb-2"></div>
          <p className="font-medium">Artwork 1</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="aspect-square bg-muted rounded mb-2"></div>
          <p className="font-medium">Artwork 2</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="aspect-square bg-muted rounded mb-2"></div>
          <p className="font-medium">Artwork 3</p>
        </div>
      </div>
    </div>
  );
}
