-- AlterTable
ALTER TABLE "echo_apps" ADD COLUMN "templateReferrerCodeId" UUID;

-- AddForeignKey
ALTER TABLE "echo_apps" ADD CONSTRAINT "echo_apps_templateReferrerCodeId_fkey" FOREIGN KEY ("templateReferrerCodeId") REFERENCES "referral_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
