-- CreateTable
CREATE TABLE "ScanUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanUsage_userId_startedAt_idx" ON "ScanUsage"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "ScanUsage" ADD CONSTRAINT "ScanUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve completed historical scans; failed starts were never persisted.
INSERT INTO "ScanUsage" ("id", "userId", "startedAt")
SELECT "id", "userId", "detectionDate" FROM "ArtworksReport";
