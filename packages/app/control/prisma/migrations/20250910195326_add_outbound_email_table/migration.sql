-- CreateTable
CREATE TABLE "public"."outbound_emails_sent" (
    "id" UUID NOT NULL,
    "emailCampaignId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "echoAppId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbound_emails_sent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbound_emails_sent_emailCampaignId_idx" ON "public"."outbound_emails_sent"("emailCampaignId");

-- AddForeignKey
ALTER TABLE "public"."outbound_emails_sent" ADD CONSTRAINT "outbound_emails_sent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outbound_emails_sent" ADD CONSTRAINT "outbound_emails_sent_echoAppId_fkey" FOREIGN KEY ("echoAppId") REFERENCES "public"."echo_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
