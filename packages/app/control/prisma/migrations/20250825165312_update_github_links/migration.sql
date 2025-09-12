/*
  Warnings:

  - Added the required column `githubUrl` to the `github_links` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `githubId` on the `github_links` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `githubType` on the `github_links` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GithubType" AS ENUM ('user', 'repo');

-- AlterTable
ALTER TABLE "github_links" ADD COLUMN     "githubUrl" TEXT NOT NULL,
DROP COLUMN "githubId",
ADD COLUMN     "githubId" INTEGER NOT NULL,
DROP COLUMN "githubType",
ADD COLUMN     "githubType" "GithubType" NOT NULL;
