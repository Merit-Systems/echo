import {
  usdcBigIntToDecimal,
  decimalToUsdcBigInt,
  getSmartAccount,
  validateXPaymentHeader,
} from 'utils';
import { USDC_ADDRESS } from 'services/fund-repo/constants';
import { FacilitatorClient } from 'services/facilitator/facilitatorService';
import {
  ExactEvmPayload,
  ExactEvmPayloadSchema,
  PaymentRequirementsSchema,
  SettleRequestSchema,
  Network,
} from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import logger from 'logger';
import { Request } from 'express';
import { ResultAsync, fromThrowable, err, ok } from 'neverthrow';
import { env } from '../env';
import type { SettleError } from '../errors/results';

export type SettleSuccess = {
  payload: ExactEvmPayload;
  paymentAmountDecimal: Decimal;
};

const parseXPaymentHeader = fromThrowable(
  validateXPaymentHeader,
  (cause): SettleError => ({ type: 'SETTLE_INVALID_PAYMENT_HEADER', cause })
);

export function settle(
  req: Request,
  headers: Record<string, string>,
  maxCost: Decimal
): ResultAsync<SettleSuccess, SettleError> {
  const network = env.NETWORK as Network;

  return ResultAsync.fromPromise(
    getSmartAccount().then(({ smartAccount }) => smartAccount.address),
    (cause): SettleError => ({ type: 'SETTLE_SMART_ACCOUNT_FAILED', cause })
  )
    .andThen(recipient =>
      parseXPaymentHeader(headers, req).map(xPaymentData => ({
        recipient,
        xPaymentData,
      }))
    )
    .andThen(({ recipient, xPaymentData }) => {
      const payloadResult = ExactEvmPayloadSchema.safeParse(xPaymentData.payload);
      if (!payloadResult.success) {
        logger.error('Invalid ExactEvmPayload in settle', {
          error: payloadResult.error,
          payload: xPaymentData.payload,
        });
        return err<
          { recipient: string; xPaymentData: typeof xPaymentData; payload: ExactEvmPayload; paymentAmountDecimal: Decimal },
          SettleError
        >({ type: 'SETTLE_INVALID_PAYLOAD', cause: payloadResult.error });
      }

      const payload = payloadResult.data;
      const paymentAmount = payload.authorization.value;
      const paymentAmountDecimal = usdcBigIntToDecimal(paymentAmount);

      // Note(shafu, alvaro): Edge case where client sends the x402-challenge
      // but the payment amount is less than what we returned in the first response
      if (BigInt(paymentAmount) < decimalToUsdcBigInt(maxCost)) {
        return err<
          { recipient: string; xPaymentData: typeof xPaymentData; payload: ExactEvmPayload; paymentAmountDecimal: Decimal },
          SettleError
        >({
          type: 'SETTLE_INSUFFICIENT_PAYMENT',
          required: decimalToUsdcBigInt(maxCost),
          provided: BigInt(paymentAmount),
        });
      }

      return ok({ recipient, xPaymentData, payload, paymentAmountDecimal });
    })
    .andThen(({ recipient, xPaymentData, payload, paymentAmountDecimal }) => {
      const facilitatorClient = new FacilitatorClient();
      const paymentRequirements = PaymentRequirementsSchema.parse({
        scheme: 'exact',
        network,
        maxAmountRequired: payload.authorization.value,
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

      return ResultAsync.fromPromise(
        facilitatorClient.settle(settleRequest),
        (): SettleError => ({ type: 'SETTLE_FACILITATOR_FAILED' })
      ).andThen(settleResult => {
        if (!settleResult.success || !settleResult.transaction) {
          return err<SettleSuccess, SettleError>({ type: 'SETTLE_FACILITATOR_FAILED' });
        }
        return ok<SettleSuccess, SettleError>({ payload, paymentAmountDecimal });
      });
    });
}
