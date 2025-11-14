import { TransactionEscrowMiddleware } from 'middleware/transaction-escrow-middleware';
import { modelRequestService } from 'services/ModelRequestService';
import { ApiKeyHandlerInput, X402HandlerInput } from 'types';
import { calculateRefundAmount } from 'utils';
import { checkBalance } from 'services/BalanceCheckService';
import { prisma } from 'server';
import { makeProxyPassthroughRequest } from 'services/ProxyPassthroughService';
import logger from 'logger';
import { ProviderType } from 'providers/ProviderType';
import { settle } from 'handlers/settle';
import { finalize } from 'handlers/finalize';
import { refund } from 'handlers/refund';
import { AppResult, ProviderError, ValidationError, DatabaseError } from 'errors';

export async function handleX402Request({
  req,
  res,
  headers,
  maxCost,
  isPassthroughProxyRoute,
  provider,
  isStream,
  x402AuthenticationService,
}: X402HandlerInput) {
  if (isPassthroughProxyRoute) {
    return await makeProxyPassthroughRequest(req, res, provider, headers);
  }
  
  const settleResult = await settle(req, res, headers, maxCost);
  if (!settleResult) {
    return;
  }

  const { payload, paymentAmountDecimal } = settleResult;

  const transactionResult = await modelRequestService.executeModelRequest(
    req,
    res,
    headers,
    provider,
    isStream
  );

  if (transactionResult.isErr()) {
    logger.error('Model request failed for X402', { 
      error: transactionResult.error,
      type: transactionResult.error.type 
    });
    await refund(paymentAmountDecimal, payload);
    return;
  }

  const { transaction, data } = transactionResult.value;

  if (provider.getType() === ProviderType.OPENAI_VIDEOS) {
    try {
      await prisma.videoGenerationX402.create({
        data: {
          videoId: transaction.metadata.providerId,
          wallet: payload.authorization.from,
          cost: transaction.rawTransactionCost,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 1),
        },
      });
    } catch (error) {
      logger.error('Failed to create video generation record', { error });
    }
  }

  modelRequestService.handleResolveResponse(res, isStream, data);

  logger.info(
    `Creating X402 transaction for app. Metadata: ${JSON.stringify(transaction.metadata)}`
  );

  const transactionCostsResult =
    await x402AuthenticationService.createX402Transaction(transaction);

  if (transactionCostsResult.isErr()) {
    logger.error('Failed to create X402 transaction', { 
      error: transactionCostsResult.error 
    });
    await refund(paymentAmountDecimal, payload);
    return;
  }

  const transactionCosts = transactionCostsResult.value;

  try {
    await finalize(
      paymentAmountDecimal,
      transactionCosts.rawTransactionCost,
      transactionCosts.totalAppProfit,
      transactionCosts.echoProfit,
      payload
    );
  } catch (error) {
    logger.error('Failed to finalize payment', { error });
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
}: ApiKeyHandlerInput) {
  const transactionEscrowMiddleware = new TransactionEscrowMiddleware(prisma);

  if (isPassthroughProxyRoute) {
    return await makeProxyPassthroughRequest(req, res, provider, headers);
  }

  const balanceCheckResult = await checkBalance(echoControlService);

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

  const transactionResult = await modelRequestService.executeModelRequest(
    req,
    res,
    headers,
    provider,
    isStream
  );

  if (transactionResult.isErr()) {
    logger.error('Model request failed for API key request', { 
      error: transactionResult.error,
      type: transactionResult.error.type 
    });
    return;
  }

  const { transaction, data } = transactionResult.value;

  calculateRefundAmount(maxCost, transaction.rawTransactionCost);

  modelRequestService.handleResolveResponse(res, isStream, data);

  const createTransactionResult = await echoControlService.createTransaction(transaction);
  
  if (createTransactionResult.isErr()) {
    logger.error('Failed to create transaction', { 
      error: createTransactionResult.error 
    });
  }

  if (provider.getType() === ProviderType.OPENAI_VIDEOS) {
    const transactionCostResult = await echoControlService.computeTransactionCosts(
      transaction,
      null
    );
    
    if (transactionCostResult.isErr()) {
      logger.error('Failed to compute transaction costs for video', { 
        error: transactionCostResult.error 
      });
      return;
    }

    try {
      await prisma.videoGenerationX402.create({
        data: {
          videoId: transaction.metadata.providerId,
          userId: echoControlService.getUserId()!,
          echoAppId: echoControlService.getEchoAppId()!,
          cost: transactionCostResult.value.totalTransactionCost,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 1),
        },
      });
    } catch (error) {
      logger.error('Failed to create video generation record', { error });
    }
  }
}
