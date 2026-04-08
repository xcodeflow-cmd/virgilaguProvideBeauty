-- CreateEnum
CREATE TYPE "LiveSignalType" AS ENUM ('REQUEST', 'OFFER', 'ANSWER');

-- AlterTable
ALTER TABLE "LiveSession"
ADD COLUMN "recordingMimeType" TEXT,
ADD COLUMN "recordingData" BYTEA;

-- CreateTable
CREATE TABLE "LiveSignal" (
    "id" TEXT NOT NULL,
    "liveSessionId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "type" "LiveSignalType" NOT NULL,
    "sdp" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveSignal_liveSessionId_type_createdAt_idx" ON "LiveSignal"("liveSessionId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "LiveSignal_liveSessionId_viewerId_type_createdAt_idx" ON "LiveSignal"("liveSessionId", "viewerId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "LiveSignal" ADD CONSTRAINT "LiveSignal_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
