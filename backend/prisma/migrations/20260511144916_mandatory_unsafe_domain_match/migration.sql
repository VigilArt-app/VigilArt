/*
  Warnings:

  - Made the column `unsafeDomain` on table `MatchingPage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MatchingPage" ALTER COLUMN "unsafeDomain" SET NOT NULL;
