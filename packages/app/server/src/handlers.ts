import { TransactionEscrowMiddleware } from 'middleware/transaction-escrow-middleware';
import { modelRequestService } from 'services/ModelRequestService';
import { ApiKeyHandlerInput, X402HandlerInput } from 'types';
import { calculateRefundAmount } from 'utils';
import { checkBalance } from 'services/BalanceCheckService';
import { prisma } from 'server';
import { makeProxyPassthroughRequest } from 'services/ProxyPassthroughService';
import logger, { logMetric } from 'logger';
import { ProviderType } from 'providers/ProviderType';
import { settle } from 'handlers/settle';
import { finalize } from 'handlers/finalize';
import { refund } from 'handlers/refund';

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

  const settlePromise = settle(req, res, headers, maxCost);

  const modelResultPromise = modelRequestService
    .executeModelRequest(req, res, headers, provider, isStream)
    .then((data) => ({ success: true as const, data }))
    .catch((error) => ({ success: false as const, error: error as Error }));

  const [settleResult, modelResult] = await Promise.all([
    settlePromise,
    modelResultPromise,
  ]);

  // Case 1: Settle failed and model failed
  if (!settleResult && !modelResult.success) {
    return;
  }

  // Case 2: Settle failed but model succeeded
  if (!settleResult && modelResult.success) {
    const { data } = modelResult;
    logger.error('Settle failed but model request succeeded', {
      provider: provider.getType(),
      url: req.url,
      metadata: data.transaction.metadata,
    });
    logMetric('x402_request_settle_failed_model_request_succeeded', 1, {
      provider: provider.getType(),
      url: req.url,
    });
    modelRequestService.handleResolveResponse(
      res,
      isStream,
      data
    );
    return;
  }

  // At this point, settleResult is guaranteed to exist
  if (!settleResult) {
    return;
  }

  const { payload, paymentAmountDecimal } = settleResult;

  // Case 3: Settle succeeded but model failed
  if (!modelResult.success) {
    await refund(paymentAmountDecimal, payload);
    return;
  }

  // Case 4: Both settle and model succeeded
  const transactionResult = modelResult.data;
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

  logger.info(
    `Creating X402 transaction for app. Metadata: ${JSON.stringify(transaction.metadata)}`
  );
  const transactionCosts =
    await x402AuthenticationService.createX402Transaction(transaction);

  await finalize(
    paymentAmountDecimal,
    transactionCosts.rawTransactionCost,
    transactionCosts.totalAppProfit,
    transactionCosts.echoProfit,
    payload
  );
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

  await echoControlService.createTransaction(transaction);

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
