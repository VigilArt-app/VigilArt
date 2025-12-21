-- CreateEnum
CREATE TYPE "DmcaPlatformCode" AS ENUM ('PINTEREST', 'ETSY', 'REDBUBBLE', 'INSTAGRAM', 'X', 'DEVIANTART', 'TUMBLR', 'OTHER');

-- CreateEnum
CREATE TYPE "DmcaStatus" AS ENUM ('DRAFT', 'GENERATED', 'EXPORTED', 'SUBMITTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(254),
ALTER COLUMN "avatar" DROP NOT NULL,
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "subscriptionTier" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DmcaPlatform" (
    "id" TEXT NOT NULL,
    "code" "DmcaPlatformCode" NOT NULL,
    "displayName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "dmcaUrl" TEXT NOT NULL,
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
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmcaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DmcaNotice" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "dmcaPlatformCode" "DmcaPlatformCode" NOT NULL,
    "status" "DmcaStatus" NOT NULL DEFAULT 'DRAFT',
    "body" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmcaNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DmcaPlatform_code_key" ON "DmcaPlatform"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaPlatform_domain_key" ON "DmcaPlatform"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "DmcaProfile_userId_key" ON "DmcaProfile"("userId");

-- AddForeignKey
ALTER TABLE "DmcaProfile" ADD CONSTRAINT "DmcaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_dmcaPlatformCode_fkey" FOREIGN KEY ("dmcaPlatformCode") REFERENCES "DmcaPlatform"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
