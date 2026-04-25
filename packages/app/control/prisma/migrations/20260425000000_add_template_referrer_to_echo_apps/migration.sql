-- AlterTable: add templateReferrerCodeId to echo_apps
-- This links an app to the referral code of the external template creator
-- who should receive referral rewards when the app is used.
ALTER TABLE "echo_apps" ADD COLUMN "templateReferrerCodeId" UUID;

-- AddForeignKey
ALTER TABLE "echo_apps" ADD CONSTRAINT "echo_apps_templateReferrerCodeId_fkey"
  FOREIGN KEY ("templateReferrerCodeId")
  REFERENCES "referral_codes"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
