/*
  Warnings:

  - You are about to drop the column `imageUri` on the `Artwork` table. All the data in the column will be lost.
  - You are about to drop the `ArtworkIndividualReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkMetadataLabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkStatistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkWebEntity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingImage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `height` to the `Artwork` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `Artwork` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Artwork` table without a default value. This is not possible if the table is not empty.
  - Made the column `originalFilename` on table `Artwork` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contentType` on table `Artwork` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sizeBytes` on table `Artwork` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ArtworkIndividualReport" DROP CONSTRAINT "ArtworkIndividualReport_artworkId_fkey";

-- DropForeignKey
ALTER TABLE "ArtworkIndividualReport" DROP CONSTRAINT "ArtworkIndividualReport_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "ArtworkIndividualReport" DROP CONSTRAINT "ArtworkIndividualReport_statisticsId_fkey";

-- DropForeignKey
ALTER TABLE "ArtworkMetadataLabel" DROP CONSTRAINT "ArtworkMetadataLabel_artworkMetadataId_fkey";

-- DropForeignKey
ALTER TABLE "ArtworkWebEntity" DROP CONSTRAINT "ArtworkWebEntity_artworkMetadataId_fkey";

-- DropForeignKey
ALTER TABLE "MatchingImage" DROP CONSTRAINT "MatchingImage_artworkReportId_fkey";

-- AlterTable
ALTER TABLE "Artwork" DROP COLUMN "imageUri",
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "storageKey" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL,
ALTER COLUMN "originalFilename" SET NOT NULL,
ALTER COLUMN "contentType" SET NOT NULL,
ALTER COLUMN "sizeBytes" SET NOT NULL;

-- DropTable
DROP TABLE "ArtworkIndividualReport";

-- DropTable
DROP TABLE "ArtworkMetadata";

-- DropTable
DROP TABLE "ArtworkMetadataLabel";

-- DropTable
DROP TABLE "ArtworkStatistics";

-- DropTable
DROP TABLE "ArtworkWebEntity";

-- DropTable
DROP TABLE "MatchingImage";

-- DropEnum
DROP TYPE "MatchType";
