-- AlterTable
ALTER TABLE "public"."transaction_metadata" ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "generateAudio" BOOLEAN,
ALTER COLUMN "inputTokens" DROP NOT NULL,
ALTER COLUMN "outputTokens" DROP NOT NULL,
ALTER COLUMN "totalTokens" DROP NOT NULL;
