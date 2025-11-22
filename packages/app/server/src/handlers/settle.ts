import {
  usdcBigIntToDecimal,
  decimalToUsdcBigInt,
  buildX402Response,
  getSmartAccount,
  validateXPaymentHeader,
} from 'utils';
import { USDC_ADDRESS } from 'services/fund-repo/constants';
import { FacilitatorClient } from 'services/facilitator/facilitatorService';
import {
  ExactEvmPayload,
  ExactEvmPayloadSchema,
  PaymentPayload,
  PaymentRequirementsSchema,
  SettleRequestSchema,
  Network,
} from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import logger from 'logger';
import { Request, Response } from 'express';
import { env } from '../env';

export async function settle(
  req: Request,
  res: Response,
  headers: Record<string, string>,
  maxCost: Decimal
): Promise<
  { payload: ExactEvmPayload; paymentAmountDecimal: Decimal } | undefined
> {
  const network = env.NETWORK as Network;

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
    logger.error('Payment header validation failed in settle', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
      method: req.method,
    });
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  const payloadResult = ExactEvmPayloadSchema.safeParse(xPaymentData.payload);
  if (!payloadResult.success) {
    logger.error('Invalid ExactEvmPayload in settle', {
      error: payloadResult.error,
      payload: xPaymentData.payload,
    });
    buildX402Response(req, res, maxCost);
    return undefined;
  }
  const payload = payloadResult.data;

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
    logger.error('Payment settlement failed', {
      errorReason: settleResult.errorReason,
      payer: settleResult.payer,
      paymentAmount: paymentAmount,
      nonce: payload.authorization.nonce,
      signature: payload.signature.substring(0, 20) + '...', // Log first 20 chars for debugging
      from: payload.authorization.from,
      to: payload.authorization.to,
      validAfter: payload.authorization.validAfter,
      validBefore: payload.authorization.validBefore,
      url: req.url,
      method: req.method,
    });
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  return { payload, paymentAmountDecimal };
}
