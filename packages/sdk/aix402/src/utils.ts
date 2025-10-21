import { z } from 'zod';

const evmAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address');
const hexString = z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid hex string');
const decimalString = z.string().regex(/^\d+$/, 'Must be a decimal string');

export const X402PaymentLinkSchema = z
  .object({
    asset: evmAddress,
    currency: evmAddress,
    description: z.string().min(1),
    discoverable: z.boolean(),
    extra: z
      .object({
        name: z.string().min(1),
        version: z.string().min(1),
      })
      .strict(),
    maxAmountRequired: decimalString,
    maxTimeoutSeconds: z.number().int().positive(),
    mimeType: z.literal('application/json'),
    network: z.literal('base'),
    nonce: hexString,
    payTo: evmAddress,
    recipient: evmAddress,
    resource: z.string().url(),
    scheme: z.literal('exact'),
    to: evmAddress,
    type: z.string(),
    url: z.string().url(),
    version: z.string().min(1),
  })
  .strict();

export const X402PaymentDetailsSchema = z.object({
  x402Version: z.number(),
  error: z.string(),
  accepts: z.array(X402PaymentLinkSchema),
});

export type X402PaymentDetails = z.infer<typeof X402PaymentDetailsSchema>;

export function handleX402Error(error: Error): X402PaymentDetails | false {
  try {
    const errorMessage = error.message;
    const parsedError = JSON.parse(errorMessage);
    const paymentDetails = X402PaymentDetailsSchema.parse(parsedError);
    return paymentDetails;
  } catch (error) {
    console.error('error: ', error);
    return false;
  }
}
