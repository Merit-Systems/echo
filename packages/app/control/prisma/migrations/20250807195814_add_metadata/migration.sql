/*
  Warnings:

  - You are about to drop the column `isActive` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `echo_apps` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `github_links` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `markups` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `consumed` on the `spend_pools` table. All the data in the column will be lost.
  - You are about to drop the column `defaultSpendLimit` on the `spend_pools` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `spend_pools` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `spend_pools` table. All the data in the column will be lost.
  - You are about to drop the column `effectiveSpendLimit` on the `user_spend_pool_usage` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `user_spend_pool_usage` table. All the data in the column will be lost.
  - You are about to drop the `llm_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_echoAppId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_githubLinkId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_markUpId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_spendPoolId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_userSpendPoolUsageId_fkey";

-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "echo_apps" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "github_links" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "markups" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "spend_pools" DROP COLUMN "consumed",
DROP COLUMN "defaultSpendLimit",
DROP COLUMN "isActive",
DROP COLUMN "totalAmount",
ADD COLUMN     "perUserSpendLimit" DECIMAL(65,14),
ADD COLUMN     "totalPaid" DECIMAL(65,14) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "user_spend_pool_usage" DROP COLUMN "effectiveSpendLimit",
DROP COLUMN "isActive",
ADD COLUMN     "archivedAt" TIMESTAMPTZ,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "llm_transactions";

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "transactionMetadataId" UUID,
    "cost" DECIMAL(65,14) NOT NULL,
    "status" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "echoAppId" UUID NOT NULL,
    "apiKeyId" UUID,
    "markUpId" UUID,
    "githubLinkId" UUID,
    "spendPoolId" UUID,
    "userSpendPoolUsageId" UUID,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_metadata" (
    "id" UUID NOT NULL,
    "providerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "prompt" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transaction_metadata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_markUpId_fkey" FOREIGN KEY ("markUpId") REFERENCES "markups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_githubLinkId_fkey" FOREIGN KEY ("githubLinkId") REFERENCES "github_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_spendPoolId_fkey" FOREIGN KEY ("spendPoolId") REFERENCES "spend_pools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userSpendPoolUsageId_fkey" FOREIGN KEY ("userSpendPoolUsageId") REFERENCES "user_spend_pool_usage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transactionMetadataId_fkey" FOREIGN KEY ("transactionMetadataId") REFERENCES "transaction_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
