-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privacyVersion" VARCHAR(64),
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsVersion" VARCHAR(64),
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
