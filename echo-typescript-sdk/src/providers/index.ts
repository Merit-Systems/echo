export * from './openai';
export * from './anthropic';
export * from './google';

export function fetchWith402Interceptor(
  originalFetch: typeof fetch,
  onInsufficientFunds: () => void
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    if (response.status === 402) {
      onInsufficientFunds();
    }
    return response;
  };
}
