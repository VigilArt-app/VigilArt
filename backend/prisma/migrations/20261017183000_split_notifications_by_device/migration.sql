-- AlterTable: Add new notification preference columns
ALTER TABLE "User" ADD COLUMN "mailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "mobileNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "webNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Copy existing notification preferences to new device columns
UPDATE "User"
SET "webNotificationsEnabled" = "notificationsEnabled",
    "mobileNotificationsEnabled" = "notificationsEnabled";

-- Drop legacy notificationsEnabled column
ALTER TABLE "User" DROP COLUMN "notificationsEnabled";
