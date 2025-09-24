import { Decimal } from '@prisma/client/runtime/library';
import { EchoControlService } from 'services/EchoControlService';
import { Transaction } from 'types';

/**
 * Verifies a payment payload against the required payment details regardless of the scheme
 * this function wraps all verify functions for each specific scheme
 *
 * @param payload - The signed payment payload containing transfer parameters and signature
 * @param paymentRequirements - The payment requirements that the payload must satisfy
 * @returns A ValidPaymentRequest indicating if the payment is valid and any invalidation reason
 */
export async function verify(
  echoControlService: EchoControlService,
  paymentRequirements: PaymentRequirements
): Promise<VerifyResponse> {
  // TODO: balance check, see if user can afford the payment
  const balanceCheckResult = await echoControlService.getBalance();
  if (balanceCheckResult < paymentRequirements.amount) {
    return {
      isValid: false,
      invalidReason: 'Insufficient balance',
      payer: echoControlService.getUserId()!,
    };
  }

  return {
    isValid: true,
    payer: echoControlService.getUserId()!,
  };
}

/**
 * Settles a payment payload against the required payment details regardless of the scheme
 * this function wraps all settle functions for each specific scheme
 *
 * @param payload - The signed payment payload containing transfer parameters and signature
 * @param paymentRequirements - The payment requirements that the payload must satisfy
 * @returns A SettleResponse indicating if the payment is settled and any settlement reason
 */
export async function settle(
  echoControlService: EchoControlService,
  paymentRequirements: PaymentRequirements
): Promise<SettleResponse> {
  // todo: create a transaction record
  const transaction = createTransaction(paymentRequirements);
  await echoControlService.createTransaction(transaction);
  return {
    success: true,
    payer: echoControlService.getUserId()!,
  };
}

function createTransaction(
  paymentRequirements: PaymentRequirements
): Transaction {
  return {
    metadata: {
      model: 'x402',
      provider: 'x402',
      providerId: 'x402',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
    rawTransactionCost: new Decimal(paymentRequirements.amount),
    status: 'completed',
  };
}
export interface SettleResponse {
  success: boolean;
  errorReason?: string;
  payer: string;
  transaction?: string;
  network?: string;
}

export interface VerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  payer: string;
}

export type Supported = {
  x402Version: number;
  kind: {
    scheme: string;
    networkId: string;
    extra: object;
  }[];
};

export interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: EchoPaymentPayload;
}

export interface EchoPaymentPayload {
  maxAmountRequired: string;
  accessKey: string;
}

// export const PaymentPayloadSchema = z.object({
//   x402Version: z.number().refine(val => x402Versions.includes(val as 1)),
//   scheme: z.enum(schemes),
//   network: NetworkSchema,
//   payload: z.union([ExactEvmPayloadSchema, ExactSvmPayloadSchema]),
// });

export interface PaymentRequirements {
  amount: number;
  currency: string;
}

// export interface PaymentRequirements {
//   scheme: 'exact';
//   network: string;
//   maxAmountRequired: string; // Atomic units
//   resource: string;
//   description: string;
//   mimeType: string;
//   payTo: string;
//   maxTimeoutSeconds: number;
//   asset: string; // Token contract address
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   extra?: Record<string, any>;
// }
