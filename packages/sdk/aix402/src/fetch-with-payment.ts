import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { createPaymentHeader, selectPaymentRequirements } from 'x402/client';
import { PaymentRequirementsSchema, Signer } from 'x402/types';

export async function getPaymentHeaderFromBody(
  body: any,
  walletClient: Signer
) {
  const { x402Version, accepts } = body as {
    x402Version: number;
    accepts: unknown[];
  };
  const parsedPaymentRequirements = accepts.map(x =>
    PaymentRequirementsSchema.parse(x)
  );

  const selectedPaymentRequirements = selectPaymentRequirements(
    parsedPaymentRequirements
  );

  const paymentHeader = await createPaymentHeader(
    walletClient,
    x402Version,
    selectedPaymentRequirements
  );
  return paymentHeader;
}

function fetchWithX402Payment(fetch: any, walletClient: Signer): typeof fetch {
  return async (input: URL, init?: RequestInit) => {
    const headers: Record<string, any> = { ...init?.headers };

    delete headers['Authorization'];
    delete headers['authorization'];

    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (response.status === 402) {
      const paymentRequiredJson = await response.json();
      const paymentHeader = await getPaymentHeaderFromBody(
        paymentRequiredJson,
        walletClient
      );
      headers['x-payment'] = paymentHeader;
      const newResponse = await fetch(input, {
        ...init,
        headers,
      });
      return newResponse;
    }

    return response;
  };
}

export function createX402OpenAI(
  walletClient: Signer,
  baseRouterUrl?: string
): OpenAIProvider {
  return createOpenAI({
    baseURL: baseRouterUrl || 'https://echo.router.merit.systems',
    apiKey: 'placeholder_replaced_by_echoFetch',
    fetch: fetchWithX402Payment(fetch, walletClient),
  });
}
