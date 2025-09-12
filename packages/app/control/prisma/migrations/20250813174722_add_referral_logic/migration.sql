/*
  Warnings:

  - You are about to drop the column `cost` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `totalCost` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app_memberships" ADD COLUMN     "referrerId" UUID;

-- AlterTable
ALTER TABLE "echo_apps" ADD COLUMN     "currentReferralRewardId" UUID;

-- AlterTable
ALTER TABLE "transactions"
RENAME COLUMN "cost" TO "totalCost";

-- AlterTable
ALTER TABLE "transactions"
ADD COLUMN     "appProfit" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
ADD COLUMN     "markUpProfit" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
ADD COLUMN     "rawTransactionCost" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
ADD COLUMN     "referralCodeId" UUID,
ADD COLUMN     "referralProfit" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
ADD COLUMN     "referrerRewardId" UUID;

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "userId" UUID,
    "echoAppId" UUID,
    "grantType" TEXT NOT NULL,
    "grantAmount" DECIMAL(65,14) DEFAULT 0.0,
    "reusable" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "usedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(65,14) NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "echoAppId" UUID NOT NULL,
    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- AddForeignKey
ALTER TABLE "echo_apps" ADD CONSTRAINT "echo_apps_currentReferralRewardId_fkey" FOREIGN KEY ("currentReferralRewardId") REFERENCES "referral_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_memberships" ADD CONSTRAINT "app_memberships_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "referral_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_referrerRewardId_fkey" FOREIGN KEY ("referrerRewardId") REFERENCES "referral_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
