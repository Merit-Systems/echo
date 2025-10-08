import { TransactionEscrowMiddleware } from 'middleware/transaction-escrow-middleware';
import { modelRequestService } from 'services/ModelRequestService';
import { HandlerInput, Network, Transaction, X402HandlerInput } from 'types';
import {
  usdcBigIntToDecimal,
  decimalToUsdcBigInt,
  buildX402Response,
  getSmartAccount,
  calculateRefundAmount,
  validateXPaymentHeader,
} from 'utils';
import { transfer } from 'transferWithAuth';
import { checkBalance } from 'services/BalanceCheckService';
import { prisma } from 'server';
import { makeProxyPassthroughRequest } from 'services/ProxyPassthroughService';
import { USDC_ADDRESS } from 'services/fund-repo/constants';
import { FacilitatorClient } from 'services/facilitator/facilitatorService';
import {
  ExactEvmPayload,
  PaymentPayload,
  PaymentRequirementsSchema,
  SettleRequestSchema,
} from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import logger from 'logger';

export async function handleX402Request({
  req,
  res,
  headers,
  maxCost,
  isPassthroughProxyRoute,
  provider,
  isStream,
}: X402HandlerInput) {
  if (isPassthroughProxyRoute) {
    return await makeProxyPassthroughRequest(req, res, provider, headers);
  }

  // Apply x402 payment middleware with the calculated maxCost
  const network = process.env.NETWORK as Network;

  let recipient: string;
  try {
    recipient = (await getSmartAccount()).smartAccount.address;
  } catch (error) {
    return buildX402Response(req, res, maxCost);
  }
  let xPaymentData: PaymentPayload;
  try {
    xPaymentData = validateXPaymentHeader(headers, req);
  } catch (error) {
    return buildX402Response(req, res, maxCost);
  }

  const payload = xPaymentData.payload as ExactEvmPayload;

  const paymentAmount = payload.authorization.value;
  const paymentAmountDecimal = usdcBigIntToDecimal(paymentAmount);

  // Note(shafu, alvaro): Edge case where client sends the x402-challenge
  // but the payment amount is less than what we returned in the first response
  if (BigInt(paymentAmount) < decimalToUsdcBigInt(maxCost)) {
    return buildX402Response(req, res, maxCost);
  }

  const facilitatorClient = new FacilitatorClient();
  try {
    // Default to no refund
    let refundAmount = new Decimal(0);
    let transaction: Transaction | null = null;
    let data: unknown = null;

    // Construct and validate PaymentRequirements using Zod schema
    const paymentRequirements = PaymentRequirementsSchema.parse({
      scheme: 'exact',
      network,
      maxAmountRequired: paymentAmount,
      resource: `${req.protocol}://${req.get('host')}${req.url}`,
      description: 'Echo x402',
      mimeType: 'application/json',
      payTo: recipient,
      maxTimeoutSeconds: 60,
      asset: USDC_ADDRESS,
      extra: {
        name: 'USD Coin',
        version: '2',
      },
    });
    // Validate and execute settle request
    const settleRequest = SettleRequestSchema.parse({
      paymentPayload: xPaymentData,
      paymentRequirements,
    });

    const settleResult = await facilitatorClient.settle(settleRequest);

    if (!settleResult.success || !settleResult.transaction) {
      return buildX402Response(req, res, maxCost);
    }

    try {
      const transactionResult = await modelRequestService.executeModelRequest(
        req,
        res,
        headers,
        provider,
        isStream
      );
      transaction = transactionResult.transaction;
      data = transactionResult.data;

      // Send the response - the middleware has intercepted res.end()/res.json()
      // and will actually send it after settlement completes
      modelRequestService.handleResolveResponse(res, isStream, data);

      refundAmount = calculateRefundAmount(
        paymentAmountDecimal,
        transaction.rawTransactionCost
      );

      // Process refund if needed
      if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
        const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
        const authPayload = payload.authorization;
        await transfer(
          authPayload.from as `0x${string}`,
          refundAmountUsdcBigInt
        ).catch(transferError => {
          logger.error('Failed to process refund', {
            error: transferError,
            refundAmount: refundAmount.toString(),
          });
        });
      }
    } catch (error) {
      // In case of error, do full refund
      refundAmount = paymentAmountDecimal;

      if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
        const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
        const authPayload = payload.authorization;
        await transfer(
          authPayload.from as `0x${string}`,
          refundAmountUsdcBigInt
        ).catch(transferError => {
          logger.error('Failed to process full refund after error', {
            error: transferError,
            originalError: error,
            refundAmount: refundAmount.toString(),
          });
        });
      }
    }
  } catch (error) {
    throw error;
  }
}

export async function handleApiKeyRequest({
  req,
  res,
  headers,
  echoControlService,
  maxCost,
  isPassthroughProxyRoute,
  provider,
  isStream,
}: HandlerInput) {
  const transactionEscrowMiddleware = new TransactionEscrowMiddleware(prisma);

  if (isPassthroughProxyRoute) {
    return await makeProxyPassthroughRequest(req, res, provider, headers);
  }

  const balanceCheckResult = await checkBalance(echoControlService);

  // Step 2: Set up escrow context and apply escrow middleware logic
  transactionEscrowMiddleware.setupEscrowContext(
    req,
    echoControlService.getUserId()!,
    echoControlService.getEchoAppId()!,
    balanceCheckResult.effectiveBalance ?? 0
  );

  await transactionEscrowMiddleware.handleInFlightRequestIncrement(req, res);

  if (isPassthroughProxyRoute) {
    return await makeProxyPassthroughRequest(req, res, provider, headers);
  }

  // Step 3: Execute business logic
  const { transaction, data } = await modelRequestService.executeModelRequest(
    req,
    res,
    headers,
    provider,
    isStream
  );

  // There is no actual refund, this logs if we underestimate the raw cost
  calculateRefundAmount(maxCost, transaction.rawTransactionCost);

  modelRequestService.handleResolveResponse(res, isStream, data);

  await echoControlService.createTransaction(transaction, maxCost);
}
