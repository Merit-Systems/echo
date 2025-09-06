import {
  createEchoAnthropic,
  createEchoGoogle,
  createEchoOpenAI,
  createEchoGroq,
} from '@merit-systems/echo-typescript-sdk';
import { useMemo } from 'react';
import { useEcho } from './useEcho';

export const useEchoModelProviders = () => {
  const { token, config, setIsInsufficientFunds } = useEcho();

  const onInsufficientFunds = () => setIsInsufficientFunds(true);

  return useMemo(() => {
    const baseConfig = {
      appId: config.appId!,
      baseRouterUrl: config.baseRouterUrl!,
    };
    const getToken = async () => token;

    return {
      openai: createEchoOpenAI(baseConfig, getToken, onInsufficientFunds),
      anthropic: createEchoAnthropic(baseConfig, getToken, onInsufficientFunds),
      google: createEchoGoogle(baseConfig, getToken, onInsufficientFunds),
      groq: createEchoGroq(baseConfig, getToken, onInsufficientFunds),
    };
  }, [token, config.appId, config.baseRouterUrl, setIsInsufficientFunds]);
};
