-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('FULL', 'PARTIAL');

-- DropForeignKey
ALTER TABLE "Artwork" DROP CONSTRAINT "Artwork_userId_fkey";

-- DropIndex
DROP INDEX "Artwork_imageUri_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(254),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(64);

-- CreateTable
CREATE TABLE "ArtworkStatistics" (
    "id" TEXT NOT NULL,
    "totalMatches" INTEGER NOT NULL,
    "totalFullMatchingImages" INTEGER NOT NULL,
    "totalPartialMatchingImages" INTEGER NOT NULL,

    CONSTRAINT "ArtworkStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtworkMetadataLabel" (
    "id" TEXT NOT NULL,
    "artworkMetadataId" TEXT NOT NULL,
    "label" INTEGER NOT NULL,
    "languageCode" TEXT,

    CONSTRAINT "ArtworkMetadataLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtworkWebEntity" (
    "id" TEXT NOT NULL,
    "artworkMetadataId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ArtworkWebEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtworkMetadata" (
    "id" TEXT NOT NULL,

    CONSTRAINT "ArtworkMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingImage" (
    "id" TEXT NOT NULL,
    "artworkReportId" TEXT NOT NULL,
    "matchType" "MatchType" NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL,
    "pageUrl" TEXT,
    "pageTitle" TEXT,

    CONSTRAINT "MatchingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtworkIndividualReport" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "detectionDate" TIMESTAMP(3) NOT NULL,
    "statisticsId" TEXT NOT NULL,
    "metadataId" TEXT NOT NULL,

    CONSTRAINT "ArtworkIndividualReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtworkIndividualReport_statisticsId_key" ON "ArtworkIndividualReport"("statisticsId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtworkIndividualReport_metadataId_key" ON "ArtworkIndividualReport"("metadataId");

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkMetadataLabel" ADD CONSTRAINT "ArtworkMetadataLabel_artworkMetadataId_fkey" FOREIGN KEY ("artworkMetadataId") REFERENCES "ArtworkMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkWebEntity" ADD CONSTRAINT "ArtworkWebEntity_artworkMetadataId_fkey" FOREIGN KEY ("artworkMetadataId") REFERENCES "ArtworkMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingImage" ADD CONSTRAINT "MatchingImage_artworkReportId_fkey" FOREIGN KEY ("artworkReportId") REFERENCES "ArtworkIndividualReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkIndividualReport" ADD CONSTRAINT "ArtworkIndividualReport_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkIndividualReport" ADD CONSTRAINT "ArtworkIndividualReport_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "ArtworkStatistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtworkIndividualReport" ADD CONSTRAINT "ArtworkIndividualReport_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "ArtworkMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
