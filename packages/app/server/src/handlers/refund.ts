import { decimalToUsdcBigInt } from 'utils';
import { transfer } from 'transferWithAuth';
import { ExactEvmPayload } from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import { ResultAsync } from 'neverthrow';
import type { RefundError } from '../errors/results';

export function refund(
  paymentAmountDecimal: Decimal,
  payload: ExactEvmPayload
): ResultAsync<void, RefundError> {
  const refundAmountUsdcBigInt = decimalToUsdcBigInt(paymentAmountDecimal);
  const authPayload = payload.authorization;

  return ResultAsync.fromPromise(
    transfer(authPayload.from as `0x${string}`, refundAmountUsdcBigInt),
    (cause): RefundError => ({ type: 'REFUND_TRANSFER_FAILED', cause })
  ).map(() => undefined);
}
