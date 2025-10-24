import {
  createEchoAnthropic,
  createEchoGoogle,
  createEchoGroq,
  createEchoOpenAI,
  createEchoOpenRouter,
  createEchoXAI,
} from '@merit-systems/echo-typescript-sdk';
import { useMemo } from 'react';
import { useEcho } from './useEcho';

export const useEchoModelProviders = () => {
  const { getToken, config, setIsInsufficientFunds } = useEcho();

  const onInsufficientFunds = () => setIsInsufficientFunds(true);

  return useMemo(() => {
    const baseConfig = {
      appId: config.appId!,
      baseRouterUrl: config.baseRouterUrl!,
    };

    return {
      openai: createEchoOpenAI(baseConfig, getToken, onInsufficientFunds),
      anthropic: createEchoAnthropic(baseConfig, getToken, onInsufficientFunds),
      google: createEchoGoogle(baseConfig, getToken, onInsufficientFunds),
      openrouter: createEchoOpenRouter(
        baseConfig,
        getToken,
        onInsufficientFunds
      ),
      groq: createEchoGroq(baseConfig, getToken, onInsufficientFunds),
      xai: createEchoXAI(baseConfig, getToken, onInsufficientFunds),
    };
  }, [getToken, config.appId, config.baseRouterUrl, setIsInsufficientFunds]);
};
