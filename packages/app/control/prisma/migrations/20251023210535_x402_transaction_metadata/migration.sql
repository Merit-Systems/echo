-- CreateTable
CREATE TABLE "x402_transaction_metadata" (
    "id" UUID NOT NULL,
    "resourcePath" TEXT NOT NULL,
    "resourceArgs" JSONB NOT NULL,
    "resourceResponse" JSONB NOT NULL,
    "resourceError" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "x402_transaction_metadata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_id_fkey" FOREIGN KEY ("id") REFERENCES "x402_transaction_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
