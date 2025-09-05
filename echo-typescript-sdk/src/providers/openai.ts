import {
  createOpenAI as createOpenAIBase,
  openai,
  OpenAIProvider,
} from '@ai-sdk/openai';
import { ROUTER_BASE_URL } from 'config';
import { fetchWith402Interceptor } from './index';
import { AsyncProvider, EchoConfig } from '../types';

export type EchoOpenAIProvider = AsyncProvider<OpenAIProvider>;

export function createEchoOpenAI(
  { appId, baseRouterUrl = ROUTER_BASE_URL }: EchoConfig,
  getTokenFn: (appId: string) => Promise<string | null>,
  onInsufficientFunds?: () => void
): EchoOpenAIProvider {
  const getProvider = async () => {
    const token = await getTokenFn(appId);
    return createOpenAIBase({
      baseURL: baseRouterUrl,
      apiKey: token ?? '', // null will fail auth
      ...(onInsufficientFunds && {
        fetch: fetchWith402Interceptor(fetch, onInsufficientFunds),
      }),
    });
  };

  const openaiFunction = async (modelId: string) => {
    const provider = await getProvider();
    return provider(modelId);
  };

  const implementation: EchoOpenAIProvider = Object.assign(openaiFunction, {
    languageModel: async (modelId: string) => {
      const provider = await getProvider();
      return provider.languageModel(modelId);
    },
    chat: async (modelId: string) => {
      const provider = await getProvider();
      return provider.chat(modelId);
    },
    responses: async (modelId: string) => {
      const provider = await getProvider();
      return provider.responses(modelId);
    },
    completion: async (modelId: string) => {
      const provider = await getProvider();
      return provider.completion(modelId);
    },
    embedding: async (modelId: string) => {
      const provider = await getProvider();
      return provider.embedding(modelId);
    },
    textEmbedding: async (modelId: string) => {
      const provider = await getProvider();
      return provider.textEmbedding(modelId);
    },
    textEmbeddingModel: async (modelId: string) => {
      const provider = await getProvider();
      return provider.textEmbeddingModel(modelId);
    },
    image: async (modelId: string) => {
      const provider = await getProvider();
      return provider.image(modelId);
    },
    imageModel: async (modelId: string) => {
      const provider = await getProvider();
      return provider.imageModel(modelId);
    },
    transcription: async (modelId: string) => {
      const provider = await getProvider();
      return provider.transcription(modelId);
    },
    speech: async (modelId: string) => {
      const provider = await getProvider();
      return provider.speech(modelId);
    },
    tools: openai.tools,
  });

  return implementation;
}
