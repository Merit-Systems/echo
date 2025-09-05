-- CreateTable
CREATE TABLE "in_flight_requests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "echoAppId" UUID NOT NULL,
    "numberInFlight" INTEGER NOT NULL DEFAULT 0,
    "totalEscrowed" DECIMAL(65,14) NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "in_flight_requests_pkey" PRIMARY KEY ("id")
);
