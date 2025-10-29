import { TransactionEscrowMiddleware } from 'middleware/transaction-escrow-middleware';
import { modelRequestService } from 'services/ModelRequestService';
import {
  HandlerInput,
  Network,
  Transaction,
  X402HandlerInput,
  SendUserOperationReturnType,
} from 'types';
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
  ExactEvmPayloadSchema,
} from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import logger from 'logger';
import { Request, Response } from 'express';
import { ProviderType } from 'providers/ProviderType';
import { safeFundRepoIfWorthwhile } from 'services/fund-repo/fundRepoService';
import { applyMaxCostMarkup } from 'services/PricingService';
import { ResultAsync, fromPromise, ok } from 'neverthrow';

export function refund(
  paymentAmountDecimal: Decimal,
  payload: ExactEvmPayload
): ResultAsync<SendUserOperationReturnType, Error> {
  const refundAmountUsdcBigInt = decimalToUsdcBigInt(paymentAmountDecimal);
  const authPayload = payload.authorization;

  return transfer(
    authPayload.from as `0x${string}`,
    refundAmountUsdcBigInt
  ).mapErr(error => {
    logger.error('Failed to refund', error);
    return error;
  });
}

export function settle(
  req: Request,
  res: Response,
  headers: Record<string, string>,
  maxCost: Decimal
): ResultAsync<
  { payload: ExactEvmPayload; paymentAmountDecimal: Decimal },
  Error
> {
  const network = process.env.NETWORK as Network;

  return getSmartAccount()
    .andThen(smartAccount => {
      const recipient = smartAccount.smartAccount.address;

      return validateXPaymentHeader(headers, req).asyncAndThen(xPaymentData => {
        const parseResult = ExactEvmPayloadSchema.safeParse(
          xPaymentData.payload
        );

        if (!parseResult.success) {
          logger.error('Invalid EVM payload', {
            error: parseResult.error.format(),
          });
          return buildX402Response(req, res, maxCost).andThen(() =>
            ResultAsync.fromSafePromise(
              Promise.reject(new Error('Invalid EVM payload'))
            )
          );
        }

        const payload = parseResult.data;
        logger.info(`Payment payload: ${JSON.stringify(payload)}`);

        const paymentAmount = payload.authorization.value;
        const paymentAmountDecimal = usdcBigIntToDecimal(paymentAmount);

        // Note(shafu, alvaro): Edge case where client sends the x402-challenge
        // but the payment amount is less than what we returned in the first response
        if (BigInt(paymentAmount) < decimalToUsdcBigInt(maxCost)) {
          return buildX402Response(req, res, maxCost).andThen(() =>
            ResultAsync.fromSafePromise(
              Promise.reject(new Error('Payment amount less than required'))
            )
          );
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

        return fromPromise(facilitatorClient.settle(settleRequest), error => {
          logger.error('Facilitator settle failed', {
            error: error instanceof Error ? error.message : String(error),
          });
          return error instanceof Error ? error : new Error(String(error));
        }).andThen(settleResult => {
          if (settleResult.isErr()) {
            logger.error('Facilitator settle failed', {
              error: settleResult.error.message,
            });
            return buildX402Response(req, res, maxCost).andThen(() =>
              ResultAsync.fromSafePromise(
                Promise.reject(new Error('Facilitator settle failed'))
              )
            );
          }

          const settleData = settleResult.value;
          if (!settleData.success || !settleData.transaction) {
            return buildX402Response(req, res, maxCost).andThen(() =>
              ResultAsync.fromSafePromise(
                Promise.reject(new Error('Settle data invalid'))
              )
            );
          }

          return ResultAsync.fromSafePromise(
            Promise.resolve({ payload, paymentAmountDecimal })
          );
        });
      });
    })
    .mapErr(error => {
      // Note: buildX402Response is async but we can't await here
      // The error will be handled by the caller
      return error;
    });
}

export function finalize(
  paymentAmountDecimal: Decimal,
  transaction: Transaction,
  payload: ExactEvmPayload
): ResultAsync<void, Error> {
  const transactionCostWithMarkup = applyMaxCostMarkup(
    transaction.rawTransactionCost
  );

  // rawTransactionCost is what we pay to OpenAI
  // transactionCostWithMarkup is what we charge the user
  // markup is the difference between the two, and is sent with fundRepo (not every time, just when it is worthwhile to send a payment)

  // The user should be refunded paymentAmountDecimal - transactionCostWithMarkup\

  const refundAmount = calculateRefundAmount(
    paymentAmountDecimal,
    transactionCostWithMarkup
  );
  logger.info(`Payment amount decimal: ${paymentAmountDecimal.toNumber()} USD`);
  logger.info(`Refunding ${refundAmount.toNumber()} USD`);
  logger.info(
    `Transaction cost with markup: ${transactionCostWithMarkup.toNumber()} USD`
  );
  logger.info(
    `Transaction cost: ${transaction.rawTransactionCost.toNumber()} USD`
  );

  if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
    const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
    const authPayload = payload.authorization;

    return transfer(
      authPayload.from as `0x${string}`,
      refundAmountUsdcBigInt
    ).andThen(() => {
      const markUpAmount = transactionCostWithMarkup.minus(
        transaction.rawTransactionCost
      );

      if (markUpAmount.greaterThan(0)) {
        logger.info(
          `PROFIT RECEIVED: ${markUpAmount.toNumber()} USD, checking for a repo send operation`
        );

        return fromPromise(safeFundRepoIfWorthwhile(), error => {
          logger.error('Failed to fund repo', error);
          // Don't re-throw - repo funding is not critical to the transaction
          return error instanceof Error ? error : new Error(String(error));
        }).map(() => undefined);
      }

      return ok(undefined);
    });
  }

  // No refund needed, just handle markup
  const markUpAmount = transactionCostWithMarkup.minus(
    transaction.rawTransactionCost
  );

  if (markUpAmount.greaterThan(0)) {
    logger.info(
      `PROFIT RECEIVED: ${markUpAmount.toNumber()} USD, checking for a repo send operation`
    );

    return fromPromise(safeFundRepoIfWorthwhile(), error => {
      logger.error('Failed to fund repo', error);
      // Don't re-throw - repo funding is not critical to the transaction
      return error instanceof Error ? error : new Error(String(error));
    }).map(() => undefined);
  }

  return ResultAsync.fromSafePromise(Promise.resolve(undefined));
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
  if (settleResult.isErr()) {
    return;
  }

  const { payload, paymentAmountDecimal } = settleResult.value;

  const transactionResult = await modelRequestService.executeModelRequest(
    req,
    res,
    headers,
    provider,
    isStream
  );

  if (transactionResult.isErr()) {
    const refundResult = await refund(paymentAmountDecimal, payload);
    if (refundResult.isErr()) {
      logger.error(
        'Failed to refund after transaction error',
        refundResult.error
      );
    }
    return;
  }

  const transaction = transactionResult.value.transaction;

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
    transactionResult.value.data
  );

  const finalizeResult = await finalize(
    paymentAmountDecimal,
    transactionResult.value.transaction,
    payload
  );
  if (finalizeResult.isErr()) {
    logger.error('Failed to finalize transaction', finalizeResult.error);
  }

  const refundResult = await refund(paymentAmountDecimal, payload);
  if (refundResult.isErr()) {
    logger.error('Failed to refund after finalization', refundResult.error);
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
  const transactionResult = await modelRequestService.executeModelRequest(
    req,
    res,
    headers,
    provider,
    isStream
  );

  if (transactionResult.isErr()) {
    return;
  }

  const { transaction, data } = transactionResult.value;

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
