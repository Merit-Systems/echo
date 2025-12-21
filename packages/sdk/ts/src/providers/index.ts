export * from './anthropic';
export * from './google';
export * from './groq';
export * from './xai';
export * from './openai';
export * from './openrouter';
export * from './vercel-ai-gateway';

export function echoFetch(
  originalFetch: typeof fetch,
  getTokenFn: () => Promise<string | null>,
  onInsufficientFunds?: () => void
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const initialToken = await getTokenFn();

    const mergeHeaders = (
      first?: HeadersInit,
      second?: HeadersInit
    ): Headers => {
      const merged = new Headers(first || {});
      if (second) new Headers(second).forEach((v, k) => merged.set(k, v));
      return merged;
    };

    const composeRequest = (token: string | null): Request => {
      if (input instanceof Request) {
        const base = input.clone();
        const merged = mergeHeaders(base.headers, init?.headers);
        merged.delete('Authorization');
        if (token) merged.set('Authorization', `Bearer ${token}`);
        return new Request(base, { ...init, headers: merged });
      }
      const headers = mergeHeaders(undefined, init?.headers);
      headers.delete('Authorization');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return new Request(input, { ...init, headers });
    };

    let request = composeRequest(initialToken);
    // Do the actual fetch
    let response = await originalFetch(request);
    if (response.status === 401) {
      // Hard Refresh of the token, and do a request once more with the new token
      const token = await getTokenFn();
      request = composeRequest(token);
      const newResponse = await originalFetch(request);
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
export { type GroqProvider } from '@ai-sdk/groq';
export { type OpenAIProvider } from '@ai-sdk/openai';
export { type OpenRouterProvider } from '@openrouter/ai-sdk-provider';
export { type XaiProvider } from '@ai-sdk/xai';
