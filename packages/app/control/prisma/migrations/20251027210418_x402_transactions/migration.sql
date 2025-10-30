-- CreateEnum
CREATE TYPE "EnumTransactionType" AS ENUM ('X402', 'BALANCE');

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_echoAppId_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "transactionType" "EnumTransactionType" NOT NULL DEFAULT 'BALANCE',
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "echoAppId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "echo_apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
