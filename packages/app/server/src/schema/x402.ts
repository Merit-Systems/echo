import { z } from "zod";

// InputSchema: always has type/method, may have discoverable, plus user-defined extras
const InputSchema = z.object({
  type: z.literal("http"),
  method: z.string(),
  discoverable: z.boolean().optional(),
}).catchall(z.any()); // allow arbitrary extra keys from config.inputSchema

// OutputSchema: user-defined
const OutputSchema = z.any();

// PaymentRequirements schema
export const PaymentRequirementsSchema = z.object({
  scheme: z.literal("exact"),
  network: z.string(),
  maxAmountRequired: z.string(), // atomic units
  resource: z.string(),
  description: z.string(),
  mimeType: z.string(),
  payTo: z.string(),
  maxTimeoutSeconds: z.number(),
  asset: z.string(),
  outputSchema: z.object({
    input: InputSchema,
    output: OutputSchema,
  }),
  extra: z.record(z.any()).optional(), // network-specific metadata
});

// Outer 402 response schema
export const PaymentRequiredResponseSchema = z.object({
  x402Version: z.number(),
  error: z.string().optional(),
  accepts: z.array(PaymentRequirementsSchema).optional(),
  payer: z.string().optional(),
});
