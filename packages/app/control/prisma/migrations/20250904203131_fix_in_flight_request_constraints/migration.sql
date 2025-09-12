/*
  Warnings:

  - A unique constraint covering the columns `[userId,echoAppId]` on the table `in_flight_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "in_flight_requests_userId_echoAppId_key" ON "in_flight_requests"("userId", "echoAppId");
