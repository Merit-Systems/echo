-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "sessionId" UUID;

-- CreateTable
CREATE TABLE "app_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "echoAppId" UUID NOT NULL,
    "deviceName" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastSeenAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "app_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "app_sessions_userId_echoAppId_idx" ON "app_sessions"("userId", "echoAppId");

-- CreateIndex
CREATE INDEX "app_sessions_echoAppId_isArchived_idx" ON "app_sessions"("echoAppId", "isArchived");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_echoAppId_isArchived_idx" ON "refresh_tokens"("userId", "echoAppId", "isArchived");

-- CreateIndex
CREATE INDEX "refresh_tokens_sessionId_isArchived_idx" ON "refresh_tokens"("sessionId", "isArchived");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "app_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
