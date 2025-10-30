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
    buildX402Response(req, res, maxCost);
    return undefined;
  }

  return { payload, paymentAmountDecimal };
}
