CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "subscriptionPlans" JSONB NOT NULL,
    "courses" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
