-- CreateTable
CREATE TABLE "MatchingPage" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "WebsiteCategory" NOT NULL,
    "websiteName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "pageTitle" TEXT,
    "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtworksReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "detectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtworksReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtworksReportToMatchingPage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtworksReportToMatchingPage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchingPage_url_artworkId_key" ON "MatchingPage"("url", "artworkId");

-- CreateIndex
CREATE INDEX "_ArtworksReportToMatchingPage_B_index" ON "_ArtworksReportToMatchingPage"("B");

-- AddForeignKey
ALTER TABLE "MatchingPage" ADD CONSTRAINT "MatchingPage_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworksReport" ADD CONSTRAINT "ArtworksReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtworksReportToMatchingPage" ADD CONSTRAINT "_ArtworksReportToMatchingPage_A_fkey" FOREIGN KEY ("A") REFERENCES "ArtworksReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtworksReportToMatchingPage" ADD CONSTRAINT "_ArtworksReportToMatchingPage_B_fkey" FOREIGN KEY ("B") REFERENCES "MatchingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
