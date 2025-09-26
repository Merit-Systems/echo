import { FacilitatorClient } from 'facilitatorClient';
import { TransactionEscrowMiddleware } from 'middleware/transaction-escrow-middleware';
import { modelRequestService } from 'services/ModelRequestService';
import { HandlerInput, X402Version } from 'types';
import {
  parseX402Headers,
  usdcBigIntToDecimal,
  decimalToUsdcBigInt,
  buildX402Response,
} from 'utils';
import { settleWithAuthorization } from 'transferWithAuth';
import { checkBalance } from 'services/BalanceCheckService';
import { prisma } from 'server';
import { makeProxyPassthroughRequest } from 'services/ProxyPassthroughService';

export async function handleX402Request({
  req,
  res,
  processedHeaders,
  echoControlService,
  maxCost,
  isPassthroughProxyRoute,
  providerId,
  provider,
  isStream,
}: HandlerInput) {
  const payload = parseX402Headers(processedHeaders);

  const paymentAmount = usdcBigIntToDecimal(
    req.body.payment_payload.payload.authorization.value
  );
  if (paymentAmount.lessThan(maxCost)) {
    buildX402Response(res, maxCost);
    return;
  }

  const facilitator = new FacilitatorClient(process.env.FACILITATOR_BASE_URL!);

  await facilitator.settle({
    x402_version: X402Version.V1,
    payment_payload: req.body.payment_payload,
    payment_requirements: req.body.payment_requirements,
  });

  if (isPassthroughProxyRoute && providerId) {
    return await makeProxyPassthroughRequest(
      req,
      res,
      provider,
      processedHeaders,
      providerId
    );
  }

  const { transaction, data } = await modelRequestService.executeModelRequest(
    req,
    res,
    processedHeaders,
    provider,
    isStream
  );
  modelRequestService.handleResolveResponse(res, isStream, data);

  // x402 refund logic
  const inferenceCost = transaction.rawTransactionCost;
  const refundAmountDecimal = paymentAmount.minus(inferenceCost);
  const refundAmountBigInt = decimalToUsdcBigInt(refundAmountDecimal);
  const result = await settleWithAuthorization({
    ...payload,
    value: refundAmountBigInt.toString(),
  });

  return {
    transaction,
    isStream,
    data,
    result,
    refundAmount: refundAmountDecimal,
  };
}

export async function handleApiKeyRequest({
  req,
  res,
  processedHeaders,
  echoControlService,
  isPassthroughProxyRoute,
  providerId,
  provider,
  isStream,
}: HandlerInput) {
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

  if (isPassthroughProxyRoute && providerId) {
    return await makeProxyPassthroughRequest(
      req,
      res,
      provider,
      processedHeaders,
      providerId
    );
  }

  // Step 3: Execute business logic
  const { transaction, data } = await modelRequestService.executeModelRequest(
    req,
    res,
    processedHeaders,
    provider,
    isStream
  );

  modelRequestService.handleResolveResponse(res, isStream, data);

  await echoControlService.createTransaction(transaction);
}
