-- AlterTable
ALTER TABLE "MatchingPage" ADD COLUMN     "unsafeDomain" BOOLEAN;
/*
  Warnings:

  - Made the column `unsafeDomain` on table `MatchingPage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MatchingPage" ALTER COLUMN "unsafeDomain" SET NOT NULL;

 -- Backfill existing NULL values before enforcing NOT NULL
 UPDATE "MatchingPage"
 SET "unsafeDomain" = false
 WHERE "unsafeDomain" IS NULL;
