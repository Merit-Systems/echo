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
import { Request, Response } from 'express';
import { ProviderType } from 'providers/ProviderType';
import { safeFundRepoIfWorthwhile } from 'services/fund-repo/fundRepoService';
import { applyMaxCostMarkup } from 'services/PricingService';

export async function refund(
  paymentAmountDecimal: Decimal,
  payload: ExactEvmPayload
) {
  try {
    const refundAmountUsdcBigInt = decimalToUsdcBigInt(paymentAmountDecimal);
    const authPayload = payload.authorization;
    await transfer(authPayload.from as `0x${string}`, refundAmountUsdcBigInt);
  } catch (error) {
    logger.error('Failed to refund', error);
  }
}

export async function settle(
  req: Request,
  res: Response,
  headers: Record<string, string>,
  maxCost: Decimal
): Promise<
  { payload: ExactEvmPayload; paymentAmountDecimal: Decimal } | undefined
> {
  const network = process.env.NETWORK as Network;

  let recipient: string;
  try {
    recipient = (await getSmartAccount()).smartAccount.address;
  } catch (error) {
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  let xPaymentData: PaymentPayload;
  try {
    xPaymentData = validateXPaymentHeader(headers, req);
  } catch (error) {
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  const payload = xPaymentData.payload as ExactEvmPayload;
  logger.info(`Payment payload: ${JSON.stringify(payload)}`);

  const paymentAmount = payload.authorization.value;
  const paymentAmountDecimal = usdcBigIntToDecimal(paymentAmount);

  // Note(shafu, alvaro): Edge case where client sends the x402-challenge
  // but the payment amount is less than what we returned in the first response
  if (BigInt(paymentAmount) < decimalToUsdcBigInt(maxCost)) {
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  const facilitatorClient = new FacilitatorClient();
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

  const settleRequest = SettleRequestSchema.parse({
    paymentPayload: xPaymentData,
    paymentRequirements,
  });

  const settleResult = await facilitatorClient.settle(settleRequest);

  if (!settleResult.success || !settleResult.transaction) {
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  return { payload, paymentAmountDecimal };
}

export async function finalize(
  paymentAmountDecimal: Decimal,
  transaction: Transaction,
  payload: ExactEvmPayload
) {

  const transactionCostWithMarkup = applyMaxCostMarkup(transaction.rawTransactionCost);

  // rawTransactionCost is what we pay to OpenAI
  // transactionCostWithMarkup is what we charge the user
  // markup is the difference between the two, and is sent with fundRepo (not every time, just when it is worthwhile to send a payment)

  // The user should be refunded paymentAmountDecimal - transactionCostWithMarkup\


  const refundAmount = calculateRefundAmount(
    paymentAmountDecimal,
    transactionCostWithMarkup
  );
  logger.info(`Payment amount decimal: ${paymentAmountDecimal.toNumber()} USD`)
  logger.info(`Refunding ${refundAmount.toNumber()} USD`)
  logger.info(`Transaction cost with markup: ${transactionCostWithMarkup.toNumber()} USD`)
  logger.info(`Transaction cost: ${transaction.rawTransactionCost.toNumber()} USD`)


  if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
    const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
    const authPayload = payload.authorization;
    await transfer(authPayload.from as `0x${string}`, refundAmountUsdcBigInt);
  }

  const markUpAmount = transactionCostWithMarkup.minus(transaction.rawTransactionCost);
  if (markUpAmount.greaterThan(0)) {
    logger.info(`PROFIT RECEIVED: ${markUpAmount.toNumber()} USD, checking for a repo send operation`);
    try {
      await safeFundRepoIfWorthwhile();
    } catch (error) {
      logger.error('Failed to fund repo', error);
      // Don't re-throw - repo funding is not critical to the transaction
    }
  }
}

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

  const settleResult = await settle(req, res, headers, maxCost);
  if (!settleResult) {
    return;
  }

  const { payload, paymentAmountDecimal } = settleResult;

  try {
    const transactionResult = await modelRequestService.executeModelRequest(
      req,
      res,
      headers,
      provider,
      isStream
    );
    const transaction = transactionResult.transaction;

    if (provider.getType() === ProviderType.OPENAI_VIDEOS) {
      await prisma.videoGenerationX402.create({
        data: {
          videoId: transaction.metadata.providerId,
          wallet: payload.authorization.from,
          cost: transaction.rawTransactionCost,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 1),
        },
      });
    }

    modelRequestService.handleResolveResponse(
      res,
      isStream,
      transactionResult.data
    );

    await finalize(
      paymentAmountDecimal,
      transactionResult.transaction,
      payload
    );

  } catch (error) {
    await refund(paymentAmountDecimal, payload);
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

  if (provider.getType() === ProviderType.OPENAI_VIDEOS) {
    const transactionCost = await echoControlService.computeTransactionCosts(
      transaction,
      null
    );
    await prisma.videoGenerationX402.create({
      data: {
        videoId: transaction.metadata.providerId,
        userId: echoControlService.getUserId()!,
        echoAppId: echoControlService.getEchoAppId()!,
        cost: transactionCost.totalTransactionCost,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 1),
      },
    });
  }
}
