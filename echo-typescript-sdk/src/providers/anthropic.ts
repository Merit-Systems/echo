import {
  anthropic,
  AnthropicProvider,
  createAnthropic as createAnthropicBase,
} from '@ai-sdk/anthropic';
import { fetchWith402Interceptor } from './index';
import { ROUTER_BASE_URL } from '../config';
// import { getEchoToken } from '../auth/token-manager';
import { AsyncProvider, EchoConfig } from '../types';

export type EchoAnthropicProvider = AsyncProvider<AnthropicProvider>;

export function createEchoAnthropic(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): EchoAnthropicProvider {
  const getProvider = async () => {
    const token = await getTokenFn(appId);
    return createAnthropicBase({
      baseURL: baseRouterUrl,
      apiKey: token ?? '', // null will fail auth
      headers: {
        // this is safe in Echo because the token is an echo oauth jwt
        // not a long lived anthropic api key
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      ...(onInsufficientFunds && {
        fetch: fetchWith402Interceptor(fetch, onInsufficientFunds),
      }),
    });
  };

  const anthropicFunction = async (modelId: string) => {
    const provider = await getProvider();
    return provider(modelId);
  };

  const implementation: EchoAnthropicProvider = Object.assign(
    anthropicFunction,
    {
      languageModel: async (modelId: string) => {
        const provider = await getProvider();
        return provider.languageModel(modelId);
      },
      chat: async (modelId: string) => {
        const provider = await getProvider();
        return provider.chat(modelId);
      },
      messages: async (modelId: string) => {
        const provider = await getProvider();
        return provider.messages(modelId);
      },
      // These are from the base provider, unclear if they actually work
      // (this is just passing on vercel's incomplete types)
      textEmbeddingModel: async (modelId: string) => {
        const provider = await getProvider();
        return provider.textEmbeddingModel(modelId);
      },
      imageModel: async (modelId: string) => {
        const provider = await getProvider();
        return provider.imageModel(modelId);
      },
      tools: anthropic.tools,
    }
  );

  return implementation;
}
