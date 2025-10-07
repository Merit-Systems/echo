import { Network, Transaction, X402HandlerInput } from 'types';
import {
  usdcBigIntToDecimal,
  decimalToUsdcBigInt,
  buildX402Response,
  getSmartAccount,
  calculateRefundAmount,
  validateXPaymentHeader,
} from 'utils';
import { transfer } from 'transferWithAuth';
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

type X402Context = {
  payload: ExactEvmPayload;
  paymentAmount: Decimal;
};

async function settle(
  req: X402HandlerInput['req'],
  res: X402HandlerInput['res'],
  headers: Record<string, string>,
  maxCost: Decimal,
) {
  const network = process.env.NETWORK as Network;
  
  let recipient: string;
  const smartAccountResult = await getSmartAccount().catch(() => null);
  if (!smartAccountResult) {
    buildX402Response(req, res, maxCost);
    return null;
  }
  recipient = smartAccountResult.smartAccount.address;

  const xPaymentData: PaymentPayload = validateXPaymentHeader(headers, req);
  const payload = xPaymentData.payload as ExactEvmPayload;

  const paymentAmount = payload.authorization.value;

  if (BigInt(paymentAmount) < decimalToUsdcBigInt(maxCost)) {
    buildX402Response(req, res, maxCost);
    return null;
  }

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

  const facilitatorClient = new FacilitatorClient();
  const settleResult = await facilitatorClient.settle(settleRequest);

  if (!settleResult.success || !settleResult.transaction) {
    buildX402Response(req, res, maxCost);
    return null;
  }

  return {
    payload,
    paymentAmount: usdcBigIntToDecimal(paymentAmount),
  };
}

async function refund(
  transaction: Transaction,
  context: X402Context,
) {
  const refundAmount = calculateRefundAmount(
    context.paymentAmount,
    transaction.rawTransactionCost
  );

  if (!refundAmount.equals(0) && refundAmount.greaterThan(0)) {
    const refundAmountUsdcBigInt = decimalToUsdcBigInt(refundAmount);
    const authPayload = context.payload.authorization;
    await transfer(
      authPayload.from as `0x${string}`,
      refundAmountUsdcBigInt
    ).catch((transferError) => {
      logger.error('Failed to process refund', {
        error: transferError,
        refundAmount: refundAmount.toString(),
      });
    });
  }
}

async function refundOnError(context: X402Context) {
  const refundAmountUsdcBigInt = decimalToUsdcBigInt(context.paymentAmount);
  const authPayload = context.payload.authorization;
  await transfer(
    authPayload.from as `0x${string}`,
    refundAmountUsdcBigInt
  ).catch((transferError) => {
    logger.error('Failed to process full refund after error', {
      error: transferError,
      refundAmount: context.paymentAmount.toString(),
    });
  });
}

export async function handleX402Request(input: X402HandlerInput) {
  const { handleEchoTransaction } = await import('./handler');
  
  await handleEchoTransaction(
    input,
    () => settle(input.req, input.res, input.headers, input.maxCost),
    refund,
    refundOnError
  );
}
