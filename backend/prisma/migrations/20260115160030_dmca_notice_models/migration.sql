/*
  Warnings:

  - You are about to drop the `ArtworkIndividualReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkMetadataLabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkStatistics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArtworkWebEntity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WebsiteCategory" AS ENUM ('SOCIAL', 'ART_PLATFORMS', 'MARKETPLACES', 'BLOG', 'MEDIA', 'SEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "DmcaStatus" AS ENUM ('DRAFT', 'GENERATED', 'EXPORTED', 'SUBMITTED');

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
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE';

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

-- CreateTable
CREATE TABLE "DmcaPlatform" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "dmcaUrl" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "websiteCategory" "WebsiteCategory" NOT NULL,
    "formSchema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmcaPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DmcaProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmcaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DmcaNotice" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "dmcaPlatformSlug" TEXT NOT NULL,
    "artworkId" TEXT,
    "status" "DmcaStatus" NOT NULL DEFAULT 'DRAFT',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmcaNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DmcaPlatform_slug_key" ON "DmcaPlatform"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaPlatform_domain_key" ON "DmcaPlatform"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaProfile_userId_key" ON "DmcaProfile"("userId");

-- AddForeignKey
ALTER TABLE "DmcaProfile" ADD CONSTRAINT "DmcaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_dmcaPlatformSlug_fkey" FOREIGN KEY ("dmcaPlatformSlug") REFERENCES "DmcaPlatform"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;
