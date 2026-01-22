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
CREATE TYPE "DmcaStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE';

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
    "street" TEXT NOT NULL,
    "aptSuite" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "DmcaNoticeData" (
    "id" TEXT NOT NULL,
    "dmcaNoticeId" TEXT NOT NULL,
    "generatedPdfs" INTEGER NOT NULL DEFAULT 0,
    "generatedMails" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DmcaNoticeData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DmcaPlatform_slug_key" ON "DmcaPlatform"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaPlatform_domain_key" ON "DmcaPlatform"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaProfile_userId_key" ON "DmcaProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaNoticeData_dmcaNoticeId_key" ON "DmcaNoticeData"("dmcaNoticeId");

-- AddForeignKey
ALTER TABLE "DmcaProfile" ADD CONSTRAINT "DmcaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_dmcaPlatformSlug_fkey" FOREIGN KEY ("dmcaPlatformSlug") REFERENCES "DmcaPlatform"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNoticeData" ADD CONSTRAINT "DmcaNoticeData_dmcaNoticeId_fkey" FOREIGN KEY ("dmcaNoticeId") REFERENCES "DmcaNotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;