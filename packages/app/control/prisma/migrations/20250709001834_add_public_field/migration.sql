-- AlterTable
ALTER TABLE "echo_apps" ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "githubType" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
