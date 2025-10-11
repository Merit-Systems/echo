import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";


function fetchAddPayment(originalFetch: typeof fetch, paymentAuthHeader: string | null | undefined) {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers: Record<string, any> = { ...init?.headers };
      if (paymentAuthHeader) {
        headers['x-payment'] = paymentAuthHeader;
      }
      delete headers['Authorization'];
      delete headers['authorization'];
      return originalFetch(input, {
        ...init,
        headers,
      });
    }
  }
  

  export function createX402OpenAIWithoutPayment(
    paymentAuthHeader?: string | null,  
    baseRouterUrl?: string,
  ): OpenAIProvider {
    return createOpenAI({
      baseURL: baseRouterUrl || 'https://echo.router.merit.systems',
      apiKey: 'placeholder_replaced_by_fetchAddPayment',
      fetch: fetchAddPayment(
        fetch,
        paymentAuthHeader,
      ),
    });
  }
  

export function UiStreamOnError(): (error: any) => string {
    return (error) => {
        const errorBody = error as { responseBody: string }
        return errorBody.responseBody
    }
}
