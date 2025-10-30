import { decimalToUsdcBigInt } from 'utils';
import { transfer } from 'transferWithAuth';
import { ExactEvmPayload } from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import logger from 'logger';

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
