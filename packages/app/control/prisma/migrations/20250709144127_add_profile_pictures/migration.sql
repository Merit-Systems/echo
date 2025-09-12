-- AlterTable
ALTER TABLE "echo_apps" ADD COLUMN     "bannerImageUrl" TEXT,
ADD COLUMN     "profilePictureUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePictureUrl" TEXT;
