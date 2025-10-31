import { decimalToUsdcBigInt, calculateRefundAmount } from 'utils';
import { transfer } from 'transferWithAuth';
import { ExactEvmPayload } from 'services/facilitator/x402-types';
import { Decimal } from '@prisma/client/runtime/library';
import { Transaction } from 'types';

export async function finalize(
  originalPaymentAmountDecimal: Decimal,
  rawTransactionCost: Decimal,
  appMarkupProfit: Decimal,
  echoMarkupProfit: Decimal,
  payload: ExactEvmPayload
) {
  const appMarkupAmount = rawTransactionCost.plus(appMarkupProfit);

  const totalCostToUser = appMarkupAmount.add(echoMarkupProfit);

  const refundAmount = calculateRefundAmount(
    originalPaymentAmountDecimal,
    totalCostToUser
  );

  if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
    const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
    const authPayload = payload.authorization;
    await transfer(authPayload.from as `0x${string}`, refundAmountUsdcBigInt);
  }
}

export async function finalizeResource(
  originalPaymentAmountDecimal: Decimal,
  transaction: Transaction,
  payload: ExactEvmPayload
) {
  const refundAmount = calculateRefundAmount(
    originalPaymentAmountDecimal,
    transaction.rawTransactionCost
  );

  if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
    const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
    const authPayload = payload.authorization;
    await transfer(authPayload.from as `0x${string}`, refundAmountUsdcBigInt);
  }
}
