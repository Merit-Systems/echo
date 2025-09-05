/*
  Warnings:

  - You are about to drop the column `githubLinkId` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `github_links` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_githubLinkId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_referralGithubUserId_fkey";

-- AlterTable
ALTER TABLE "github_links" ADD COLUMN     "userId" UUID,
ALTER COLUMN "echoAppId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "githubLinkId";

-- CreateIndex
CREATE UNIQUE INDEX "github_links_userId_key" ON "github_links"("userId");

-- AddForeignKey
ALTER TABLE "github_links" ADD CONSTRAINT "github_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
