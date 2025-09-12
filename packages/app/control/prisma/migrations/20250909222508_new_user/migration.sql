-- AlterTable
ALTER TABLE "users" ADD COLUMN     "latestFreeCreditsVersion" DECIMAL(65,30),
ADD COLUMN     "latestPrivacyVersion" DECIMAL(65,30),
ADD COLUMN     "latestTosVersion" DECIMAL(65,30);
