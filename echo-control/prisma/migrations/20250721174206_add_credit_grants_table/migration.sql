-- CreateTable
CREATE TABLE "credit_grants" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,14) NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "expiresAt" TIMESTAMPTZ,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "userId" UUID NOT NULL,
    "paymentId" UUID,
    "llmTransactionId" UUID,

    CONSTRAINT "credit_grants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credit_grants" ADD CONSTRAINT "credit_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_grants" ADD CONSTRAINT "credit_grants_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_grants" ADD CONSTRAINT "credit_grants_llmTransactionId_fkey" FOREIGN KEY ("llmTransactionId") REFERENCES "llm_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
