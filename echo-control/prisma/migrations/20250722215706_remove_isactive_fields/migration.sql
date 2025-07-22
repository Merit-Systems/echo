/*
  Warnings:

  - You are about to drop the column `isActive` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `credit_grants` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `echo_apps` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `markups` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `revenues` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `subscription_package_products` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `subscription_packages` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `subscription_products` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `usage_products` table. All the data in the column will be lost.
  - You are about to drop the column `totalPaid` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `totalSpent` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "credit_grants" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "echo_apps" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "markups" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "revenues" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "subscription_package_products" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "subscription_packages" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "subscription_products" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "usage_products" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "totalPaid",
DROP COLUMN "totalSpent";
