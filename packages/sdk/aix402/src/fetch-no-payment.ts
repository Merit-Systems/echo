import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';

function fetchAddPayment(
  originalFetch: typeof fetch,
  paymentAuthHeader: string | null | undefined,
  echoAppId?: string
) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers: Record<string, any> = { ...init?.headers };
    if (paymentAuthHeader) {
      headers['x-payment'] = paymentAuthHeader;
    }
    if (echoAppId) {
      headers['x-echo-app-id'] = echoAppId;
    }
    delete headers['Authorization'];
    delete headers['authorization'];
    return originalFetch(input, {
      ...init,
      headers,
    });
  };
}

export interface X402OpenAIWithoutPaymentConfig {
  paymentAuthHeader?: string | null;
  baseRouterUrl?: string;
  echoAppId?: string;
}

export function createX402OpenAIWithoutPayment({
  paymentAuthHeader,
  baseRouterUrl,
  echoAppId,
}: X402OpenAIWithoutPaymentConfig): OpenAIProvider {
  return createOpenAI({
    baseURL: baseRouterUrl || 'https://echo.router.merit.systems',
    apiKey: 'placeholder_replaced_by_fetchAddPayment',
    fetch: fetchAddPayment(fetch, paymentAuthHeader, echoAppId),
  });
}

export function UiStreamOnError(): (error: any) => string {
  return error => {
    const errorBody = error as { responseBody: string };
    return errorBody.responseBody;
  };
}
