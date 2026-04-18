-- AlterTable
ALTER TABLE "LiveSession" ADD COLUMN "maxParticipants" INTEGER;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "pages" JSONB;
