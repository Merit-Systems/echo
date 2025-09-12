/*
  Warnings:

  - You are about to drop the column `githubId` on the `echo_apps` table. All the data in the column will be lost.
  - You are about to drop the column `githubType` on the `echo_apps` table. All the data in the column will be lost.
  - You are about to drop the column `markUp` on the `echo_apps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app_memberships" ADD COLUMN     "amountSpent" DECIMAL(65,14) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "echo_apps" DROP COLUMN "githubId",
DROP COLUMN "githubType",
DROP COLUMN "markUp";

-- AlterTable
ALTER TABLE "llm_transactions" ADD COLUMN     "githubLinkId" UUID,
ADD COLUMN     "markUpId" UUID,
ADD COLUMN     "spendPoolId" UUID,
ADD COLUMN     "userSpendPoolUsageId" UUID;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "spendPoolId" UUID;

-- CreateTable
CREATE TABLE "markups" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(65,14) NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "echoAppId" UUID NOT NULL,

    CONSTRAINT "markups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_links" (
    "id" UUID NOT NULL,
    "githubId" TEXT NOT NULL,
    "githubType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "echoAppId" UUID NOT NULL,

    CONSTRAINT "github_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spend_pools" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
    "defaultSpendLimit" DECIMAL(65,14),
    "totalSpent" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "echoAppId" UUID NOT NULL,

    CONSTRAINT "spend_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_spend_pool_usage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "spendPoolId" UUID NOT NULL,
    "effectiveSpendLimit" DECIMAL(65,14),
    "totalSpent" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_spend_pool_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "markups_echoAppId_key" ON "markups"("echoAppId");

-- CreateIndex
CREATE UNIQUE INDEX "github_links_echoAppId_key" ON "github_links"("echoAppId");

-- CreateIndex
CREATE UNIQUE INDEX "user_spend_pool_usage_userId_spendPoolId_key" ON "user_spend_pool_usage"("userId", "spendPoolId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_spendPoolId_fkey" FOREIGN KEY ("spendPoolId") REFERENCES "spend_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markups" ADD CONSTRAINT "markups_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_links" ADD CONSTRAINT "github_links_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_transactions" ADD CONSTRAINT "llm_transactions_markUpId_fkey" FOREIGN KEY ("markUpId") REFERENCES "markups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_transactions" ADD CONSTRAINT "llm_transactions_githubLinkId_fkey" FOREIGN KEY ("githubLinkId") REFERENCES "github_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_transactions" ADD CONSTRAINT "llm_transactions_spendPoolId_fkey" FOREIGN KEY ("spendPoolId") REFERENCES "spend_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_transactions" ADD CONSTRAINT "llm_transactions_userSpendPoolUsageId_fkey" FOREIGN KEY ("userSpendPoolUsageId") REFERENCES "user_spend_pool_usage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_pools" ADD CONSTRAINT "spend_pools_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_spend_pool_usage" ADD CONSTRAINT "user_spend_pool_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_spend_pool_usage" ADD CONSTRAINT "user_spend_pool_usage_spendPoolId_fkey" FOREIGN KEY ("spendPoolId") REFERENCES "spend_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
