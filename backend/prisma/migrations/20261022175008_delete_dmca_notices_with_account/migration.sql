-- Notices left by accounts deleted earlier still hold the artist's name,
-- address, phone and signature; DmcaNoticeData cascades with them.
DELETE FROM "DmcaNotice" WHERE "userId" IS NULL;

-- DropForeignKey
ALTER TABLE "DmcaNotice" DROP CONSTRAINT "DmcaNotice_userId_fkey";

-- AddForeignKey
ALTER TABLE "DmcaNotice" ADD CONSTRAINT "DmcaNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
