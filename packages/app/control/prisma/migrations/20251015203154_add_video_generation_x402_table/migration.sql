-- CreateTable
CREATE TABLE "video_generation_x402" (
    "videoId" TEXT NOT NULL,
    "wallet" TEXT,
    "userId" UUID,
    "echoAppId" UUID,
    "cost" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "video_generation_x402_pkey" PRIMARY KEY ("videoId")
);

-- AddForeignKey
ALTER TABLE "video_generation_x402" ADD CONSTRAINT "video_generation_x402_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_generation_x402" ADD CONSTRAINT "video_generation_x402_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
