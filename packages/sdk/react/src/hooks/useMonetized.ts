import { useCallback } from 'react';
import type { LanguageModel } from 'ai';
import {
  ROUTER_BASE_URL,
  monetized as createMonetizedModel,
} from '@merit-systems/echo-typescript-sdk';
import { useEcho } from './useEcho';

export interface UseMonetizedOptions {
  /** Override the Echo router URL (defaults to hosted router). */
  baseRouterUrl?: string;
}

/**
 * Returns a helper that wraps Vercel AI SDK models so calls are metered through Echo.
 */
export function useMonetized(options?: UseMonetizedOptions) {
  const { config, getToken, setIsInsufficientFunds } = useEcho();
  const overrideRouterUrl = options?.baseRouterUrl;

  return useCallback(
    (model: LanguageModel) => {
      const appId = config.appId;
      if (!appId) {
        throw new Error('Echo appId is required to monetize AI models. Create one at https://echo.merit.systems/');
      }

      return createMonetizedModel(model, {
        appId,
        baseRouterUrl:
          overrideRouterUrl ?? config.baseRouterUrl ?? ROUTER_BASE_URL,
        getAccessToken: async () => await getToken(),
        onInsufficientFunds: () => setIsInsufficientFunds(true),
      });
    },
    [
      config.appId,
      config.baseRouterUrl,
      getToken,
      overrideRouterUrl,
      setIsInsufficientFunds,
    ]
  );
}
