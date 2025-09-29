import { PaymentRequirementsSchema } from "./x402";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatCompletionInput } from "./input/chat-completions";
import { ChatCompletionOutput } from "./output/chat-completions";
import { USDC_ADDRESS } from "services/fund-repo/constants";
import { Network } from "types";

function chatCompletionsRequirements(maxCostBigInt: bigint, paymentUrl: string) {
  return PaymentRequirementsSchema.parse({
    scheme: 'exact',
    network: process.env.NETWORK as Network,
    maxAmountRequired: maxCostBigInt.toString(),
    resource: `${process.env.ECHO_ROUTER_BASE_URL}/v1/chat/completions`,
    description: 'Echo chat completions endpoint.',
    mimeType: 'application/json',
    payTo: paymentUrl,
    maxTimeoutSeconds: 5000,
    asset: USDC_ADDRESS,
    outputSchema: {
      input: zodToJsonSchema(ChatCompletionInput),
      output: zodToJsonSchema(ChatCompletionOutput),
    },
    extra: {},
  });
}

export { chatCompletionsRequirements };