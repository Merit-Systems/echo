/*
  Warnings:

  - You are about to rename the column `stripePaymentId` to `paymentId` on the `payments` table.

*/
-- DropIndex
DROP INDEX "payments_stripePaymentId_key";

-- AlterTable
ALTER TABLE "payments" RENAME COLUMN "stripePaymentId" TO "paymentId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentId_key" ON "payments"("paymentId");
