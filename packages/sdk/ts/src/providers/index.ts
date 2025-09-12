export * from './anthropic';
export * from './google';
export * from './openai';
export * from './openrouter';

export function echoFetch(
  originalFetch: typeof fetch,
  getTokenFn: () => Promise<string | null>,
  onInsufficientFunds?: () => void
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = await getTokenFn();
    if (init)
      init.headers = { ...init.headers, Authorization: `Bearer ${token}` };

    // Do the actual fetch
    let response = await originalFetch(input, init);
    if (response.status === 401) {
      // Hard Refresh of the token, and do a request once more with the new token
      const token = await getTokenFn();

      if (init)
        init.headers = {
          ...init.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        };

      const newResponse = await originalFetch(input, init);
      response = newResponse;
    }

    // post processing
    if (response.status === 402) {
      onInsufficientFunds?.();
    }

    return response;
  };
}

// re-export the underlying types so that next doesn't need to depend on provider specific types
export { type AnthropicProvider } from '@ai-sdk/anthropic';
export { type GoogleGenerativeAIProvider } from '@ai-sdk/google';
export { type OpenAIProvider } from '@ai-sdk/openai';
export { type OpenRouterProvider } from '@openrouter/ai-sdk-provider';
