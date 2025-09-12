-- CreateEnum
CREATE TYPE "EnumPaymentSource" AS ENUM ('stripe', 'admin', 'signUpGift');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "source" "EnumPaymentSource" NOT NULL DEFAULT 'stripe';
