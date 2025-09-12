/*
  Warnings:

  - You are about to drop the column `apiKeyId` on the `refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `llm_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_apiKeyId_fkey";

-- AlterTable
ALTER TABLE "app_memberships" ALTER COLUMN "totalSpent" SET DATA TYPE DECIMAL(65,14);

-- AlterTable
ALTER TABLE "echo_apps" ADD COLUMN     "markUp" DECIMAL(65,14) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "llm_transactions" ADD COLUMN     "providerId" TEXT NOT NULL,
ALTER COLUMN "cost" SET DATA TYPE DECIMAL(65,14),
ALTER COLUMN "apiKeyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,14);

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "apiKeyId";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "totalPaid" SET DATA TYPE DECIMAL(65,14),
ALTER COLUMN "totalSpent" SET DATA TYPE DECIMAL(65,14);
