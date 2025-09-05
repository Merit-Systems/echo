import {
  createGoogleGenerativeAI as createGoogleBase,
  google,
  GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import { ROUTER_BASE_URL } from 'config';
import { fetchWith402Interceptor } from './index';
import { AsyncProvider, EchoConfig } from '../types';

export type EchoGoogleProvider = AsyncProvider<GoogleGenerativeAIProvider>;
interface GoogleGenerativeAIImageSettings {
  maxImagesPerCall?: number;
}

export function createEchoGoogle(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): EchoGoogleProvider {
  const getProvider = async () => {
    const token = await getTokenFn(appId);
    return createGoogleBase({
      baseURL: baseRouterUrl,
      apiKey: token ?? '', // null will fail auth
      ...(onInsufficientFunds && {
        fetch: fetchWith402Interceptor(fetch, onInsufficientFunds),
      }),
    });
  };

  const googleFunction = async (modelId: string) => {
    const provider = await getProvider();
    return provider(modelId);
  };

  const implementation: EchoGoogleProvider = Object.assign(googleFunction, {
    languageModel: async (modelId: string) => {
      const provider = await getProvider();
      return provider.languageModel(modelId);
    },
    chat: async (modelId: string) => {
      const provider = await getProvider();
      return provider.chat(modelId);
    },
    image: async (
      modelId: string,
      settings?: GoogleGenerativeAIImageSettings
    ) => {
      const provider = await getProvider();
      return provider.image(modelId, settings);
    },
    imageModel: async (modelId: string) => {
      const provider = await getProvider();
      return provider.imageModel(modelId);
    },
    textEmbedding: async (modelId: string) => {
      const provider = await getProvider();
      return provider.textEmbedding(modelId);
    },
    textEmbeddingModel: async (modelId: string) => {
      const provider = await getProvider();
      return provider.textEmbeddingModel(modelId);
    },
    /**
     * @deprecated Use `chat()` instead.
     */
    generativeAI: async (modelId: string) => {
      const provider = await getProvider();
      return provider.generativeAI(modelId);
    },
    /**
     * @deprecated Use `textEmbedding()` instead.
     */
    embedding: async (modelId: string) => {
      const provider = await getProvider();
      return provider.embedding(modelId);
    },
    tools: google.tools,
  });

  return implementation;
}
