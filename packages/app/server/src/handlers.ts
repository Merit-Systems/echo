import { FacilitatorClient } from "./facilitatorClient";
import { TransactionEscrowMiddleware } from "./middleware/transaction-escrow-middleware";
import { modelRequestService } from "./services/ModelRequestService";
import { HandlerInput, X402Version } from "./types";
import { parseX402Headers } from "./utils";
import { settleWithAuthorization } from "./transferWithAuth";
import { checkBalance } from "./services/BalanceCheckService";
import { prisma } from "./server";

export async function handleX402Request(
        {req, res, processedHeaders, echoControlService}: HandlerInput
    ) {
    const facilitator = new FacilitatorClient();

    await facilitator.settle({
        x402_version: X402Version.V1,
        payment_payload: req.body.payment_payload,
        payment_requirements: req.body.payment_requirements,
    })

    const { transaction, isStream, data } =
      await modelRequestService.executeModelRequest(
        req,
        res,
        processedHeaders,
        echoControlService
      );

    const payload = parseX402Headers(processedHeaders)

    const inferenceCost = transaction.rawTransactionCost;
    const refundAmount = (Number(req.body.payment_payload.value) - Number(inferenceCost)).toString()
    const result = await settleWithAuthorization({...payload, value: refundAmount })

    return {transaction, isStream, data, result, refundAmount};
}

export async function handleApiKeyRequest(
    {req, res, processedHeaders, echoControlService}: HandlerInput
) {
    const transactionEscrowMiddleware = new TransactionEscrowMiddleware(prisma);
    const balanceCheckResult = await checkBalance(echoControlService);

    // Step 2: Set up escrow context and apply escrow middleware logic
    transactionEscrowMiddleware.setupEscrowContext(
        req,
        echoControlService.getUserId()!,
        echoControlService.getEchoAppId()!,
        balanceCheckResult.effectiveBalance ?? 0
    );

    await transactionEscrowMiddleware.handleInFlightRequestIncrement(req, res);

    // Step 3: Execute business logic
    const { transaction } =
      await modelRequestService.executeModelRequest(
        req,
        res,
        processedHeaders,
        echoControlService
      );

    await echoControlService.createTransaction(transaction);
}