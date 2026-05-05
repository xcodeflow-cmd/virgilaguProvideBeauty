ALTER TABLE "User"
ADD COLUMN "isChatBlocked" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "LiveChatRestriction" (
    "id" TEXT NOT NULL,
    "liveSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveChatRestriction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LiveChatRestriction_liveSessionId_userId_key" ON "LiveChatRestriction"("liveSessionId", "userId");
CREATE INDEX "LiveChatRestriction_userId_createdAt_idx" ON "LiveChatRestriction"("userId", "createdAt");

ALTER TABLE "LiveChatRestriction" ADD CONSTRAINT "LiveChatRestriction_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveChatRestriction" ADD CONSTRAINT "LiveChatRestriction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
