-- AlterTable
ALTER TABLE "MatchingPage" ADD COLUMN     "unsafeDomain" BOOLEAN;

-- Backfill existing NULL values before enforcing NOT NULL
UPDATE "MatchingPage"
SET "unsafeDomain" = false
WHERE "unsafeDomain" IS NULL;

-- AlterTable
ALTER TABLE "MatchingPage" ALTER COLUMN "unsafeDomain" SET NOT NULL;
