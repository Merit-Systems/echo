/*
  Warnings:

  - You are about to drop the column `llmTransactionId` on the `credit_grants` table. All the data in the column will be lost.
  - You are about to drop the column `markUp` on the `echo_apps` table. All the data in the column will be lost.
  - You are about to drop the `llm_transactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[currentMarkupId]` on the table `echo_apps` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "credit_grants" DROP CONSTRAINT "credit_grants_llmTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_echoAppId_fkey";

-- DropForeignKey
ALTER TABLE "llm_transactions" DROP CONSTRAINT "llm_transactions_userId_fkey";

-- AlterTable
ALTER TABLE "credit_grants" DROP COLUMN "llmTransactionId",
ADD COLUMN     "markupId" UUID,
ADD COLUMN     "transactionId" UUID;

-- AlterTable
ALTER TABLE "echo_apps" DROP COLUMN "markUp",
ADD COLUMN     "currentMarkupId" UUID;

-- DropTable
DROP TABLE "llm_transactions";

-- CreateTable
CREATE TABLE "usage_products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "providerId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputPricePerToken" DECIMAL(65,14),
    "outputPricePerToken" DECIMAL(65,14),
    "category" TEXT NOT NULL DEFAULT 'llm',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "echoAppId" UUID NOT NULL,

    CONSTRAINT "usage_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "providerId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DECIMAL(65,14) NOT NULL,
    "prompt" TEXT,
    "response" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "echoAppId" UUID NOT NULL,
    "apiKeyId" UUID,
    "usageProductId" UUID NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markups" (
    "id" UUID NOT NULL,
    "rate" DECIMAL(65,14) NOT NULL DEFAULT 1.0,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "echoAppId" UUID NOT NULL,

    CONSTRAINT "markups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenues" (
    "id" UUID NOT NULL,
    "rawCost" DECIMAL(65,14) NOT NULL,
    "markupRate" DECIMAL(65,14) NOT NULL,
    "markupAmount" DECIMAL(65,14) NOT NULL,
    "amount" DECIMAL(65,14) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "userId" UUID NOT NULL,
    "echoAppId" UUID NOT NULL,
    "markupId" UUID,
    "paymentId" UUID,
    "creditGrantId" UUID,
    "transactionId" UUID,

    CONSTRAINT "revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "echo_apps_currentMarkupId_key" ON "echo_apps"("currentMarkupId");

-- AddForeignKey
ALTER TABLE "echo_apps" ADD CONSTRAINT "echo_apps_currentMarkupId_fkey" FOREIGN KEY ("currentMarkupId") REFERENCES "markups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_products" ADD CONSTRAINT "usage_products_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_usageProductId_fkey" FOREIGN KEY ("usageProductId") REFERENCES "usage_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_grants" ADD CONSTRAINT "credit_grants_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_grants" ADD CONSTRAINT "credit_grants_markupId_fkey" FOREIGN KEY ("markupId") REFERENCES "markups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markups" ADD CONSTRAINT "markups_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_markupId_fkey" FOREIGN KEY ("markupId") REFERENCES "markups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_creditGrantId_fkey" FOREIGN KEY ("creditGrantId") REFERENCES "credit_grants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
