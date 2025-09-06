export * from './anthropic';
export * from './google';
export * from './openai';
export * from './groq';

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
    const response = await originalFetch(input, init);

    // post processing
    if (response.status === 402) {
      onInsufficientFunds?.();
    }

    if (response.status === 401) {
      // TODO: retry with a new token (do a refresh)
    }

    return response;
  };
}

// re-export the underlying types so that next doesn't need to depend on provider specific types
export { type AnthropicProvider } from '@ai-sdk/anthropic';
export { type GoogleGenerativeAIProvider } from '@ai-sdk/google';
export { type OpenAIProvider } from '@ai-sdk/openai';
