-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_id_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "x402TransactionMetadataId" UUID;

-- AlterTable
ALTER TABLE "x402_transaction_metadata" ALTER COLUMN "resourceArgs" SET DEFAULT '{}',
ALTER COLUMN "resourceResponse" SET DEFAULT '{}',
ALTER COLUMN "resourceError" SET DEFAULT '{}';

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_x402TransactionMetadataId_fkey" FOREIGN KEY ("x402TransactionMetadataId") REFERENCES "x402_transaction_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
