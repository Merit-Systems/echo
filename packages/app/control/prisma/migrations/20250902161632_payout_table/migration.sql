-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(65,14) NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT,
    "transactionId" TEXT,
    "senderAddress" TEXT,
    "recipientGithubLinkId" UUID,
    "recipientAddress" TEXT,
    "userId" UUID,
    "echoAppId" UUID,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_recipientGithubLinkId_fkey" FOREIGN KEY ("recipientGithubLinkId") REFERENCES "github_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Add referralGithubUserId to users and set FK to github_links(id)
ALTER TABLE "users" ADD COLUMN "referralGithubUserId" UUID;
ALTER TABLE "users" ADD CONSTRAINT "users_referralGithubUserId_fkey" FOREIGN KEY ("referralGithubUserId") REFERENCES "github_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;