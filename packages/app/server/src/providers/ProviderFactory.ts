import { UnknownModelError } from '../errors/http';
import {
  ALL_SUPPORTED_IMAGE_MODELS,
  ALL_SUPPORTED_MODELS,
  ALL_SUPPORTED_VIDEO_MODELS,
} from '../services/AccountingService';
import { AnthropicGPTProvider } from './AnthropicGPTProvider';
import { AnthropicNativeProvider } from './AnthropicNativeProvider';
import type { BaseProvider } from './BaseProvider';
import { GeminiGPTProvider } from './GeminiGPTProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIVideoProvider } from './OpenAIVideoProvider';
import { GroqProvider } from './GroqProvider';
import {
  GeminiVeoProvider,
  PROXY_PASSTHROUGH_ONLY_MODEL as GeminiVeoProxyPassthroughOnlyModel,
} from './GeminiVeoProvider';
import { GPTProvider } from './GPTProvider';
import { OpenAIImageProvider } from './OpenAIImageProvider';
import { OpenAIResponsesProvider } from './OpenAIResponsesProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { ProviderType } from './ProviderType';
import { XAIProvider } from './XAIProvider';
import {
  VertexAIProvider,
  PROXY_PASSTHROUGH_ONLY_MODEL as VertexAIProxyPassthroughOnlyModel,
} from './VertexAIProvider';

/**
 * Creates model-to-provider mapping from the model_prices_and_context_window.json file.
 * This dynamically loads all supported models and maps them to their appropriate provider types
 * based on the litellm_provider field in the JSON configuration.
 */
const createChatModelToProviderMapping = (): Record<string, ProviderType> => {
  const mapping: Record<string, ProviderType> = {};

  for (const modelConfig of ALL_SUPPORTED_MODELS) {
    if (modelConfig.provider) {
      switch (modelConfig.provider) {
        case 'OpenAI':
          mapping[modelConfig.model_id] = ProviderType.GPT;
          break;
        case 'Anthropic':
          mapping[modelConfig.model_id] = ProviderType.ANTHROPIC_GPT;
          break;
        case 'Gemini':
          mapping[modelConfig.model_id] = ProviderType.GEMINI;
          break;
        case 'OpenRouter':
          mapping[modelConfig.model_id] = ProviderType.OPENROUTER;
          break;
        case 'Groq':
          mapping[modelConfig.model_id] = ProviderType.GROQ;
          break;
        case 'xAI':
        case 'XAI':
        case 'Xai':
          mapping[modelConfig.model_id] = ProviderType.XAI;
          break;
        // Add other providers as needed
        default:
          // Skip models with unsupported providers
          break;
      }
    }
  }

  return mapping;
};

const createImageModelToProviderMapping = (): Record<string, ProviderType> => {
  const mapping: Record<string, ProviderType> = {};

  for (const modelConfig of ALL_SUPPORTED_IMAGE_MODELS) {
    if (modelConfig.provider === 'OpenAI') {
      mapping[modelConfig.model_id] = ProviderType.OPENAI_IMAGES;
    }
  }
  return mapping;
};

const createVideoModelToProviderMapping = (): Record<string, ProviderType> => {
  const mapping: Record<string, ProviderType> = {};

  for (const modelConfig of ALL_SUPPORTED_VIDEO_MODELS) {
    if (modelConfig.provider === 'Gemini') {
      mapping[modelConfig.model_id] = ProviderType.GEMINI_VEO;
    }
    if (modelConfig.provider === 'VertexAI') {
      mapping[modelConfig.model_id] = ProviderType.VERTEX_AI;
    }
    if (modelConfig.provider === 'OpenAI') {
      mapping[modelConfig.model_id] = ProviderType.OPENAI_VIDEOS;
    }
  }
  return mapping;
};

/**
 * Model-to-provider mapping loaded from model_prices_and_context_window.json
 * This replaces the previous hardcoded mapping and automatically includes all
 * supported models from the JSON configuration file.
 */
export const MODEL_TO_PROVIDER: Record<string, ProviderType> =
  createChatModelToProviderMapping();

export const IMAGE_MODEL_TO_PROVIDER: Record<string, ProviderType> =
  createImageModelToProviderMapping();

export const VIDEO_MODEL_TO_PROVIDER: Record<string, ProviderType> =
  createVideoModelToProviderMapping();

export const getProvider = (
  model: string,
  stream: boolean,
  completionPath: string
): BaseProvider => {
  // First check if the model is in the model to provider mapping
  let type = MODEL_TO_PROVIDER[model];

  const imageType = IMAGE_MODEL_TO_PROVIDER[model];
  if (imageType) {
    type = imageType;
  }

  const videoType = VIDEO_MODEL_TO_PROVIDER[model];
  if (videoType) {
    type = videoType;
  }

  if (model === GeminiVeoProxyPassthroughOnlyModel) {
    type = ProviderType.GEMINI_VEO;
  }

  if (model === VertexAIProxyPassthroughOnlyModel) {
    type = ProviderType.VERTEX_AI;
  }

  // If the model is not in the model to provider mapping, throw an error
  if (type === undefined) {
    throw new UnknownModelError(`Unknown model: ${model}`);
  }

  // Check if this is a Responses API endpoint
  if (completionPath.includes('responses')) {
    type = ProviderType.OPENAI_RESPONSES;
  }

  if (completionPath.includes('images/generations')) {
    type = ProviderType.OPENAI_IMAGES;
  }

  // We select for Anthropic Native if the completionPath includes "messages"
  // The OpenAI Format does not hit /v1/messages, it hits /v1/chat/completions
  // but the anthropic native format hits /v1/messages
  else if (
    type === ProviderType.ANTHROPIC_GPT &&
    completionPath.includes('messages')
  ) {
    type = ProviderType.ANTHROPIC_NATIVE;
  }

  if (type === ProviderType.GEMINI && completionPath.includes('completions')) {
    type = ProviderType.GEMINI_GPT;
  }

  switch (type) {
    case ProviderType.GPT:
      return new GPTProvider(stream, model);
    case ProviderType.ANTHROPIC_GPT:
      return new AnthropicGPTProvider(stream, model);
    case ProviderType.ANTHROPIC_NATIVE:
      return new AnthropicNativeProvider(stream, model);
    case ProviderType.GEMINI:
      return new GeminiProvider(stream, model);
    case ProviderType.GEMINI_GPT:
      return new GeminiGPTProvider(stream, model);
    case ProviderType.OPENAI_RESPONSES:
      return new OpenAIResponsesProvider(stream, model);
    case ProviderType.OPENROUTER:
      return new OpenRouterProvider(stream, model);
    case ProviderType.OPENAI_IMAGES:
      return new OpenAIImageProvider(stream, model);
    case ProviderType.GEMINI_VEO:
      return new GeminiVeoProvider(stream, model);
    case ProviderType.VERTEX_AI:
      return new VertexAIProvider(stream, model);
    case ProviderType.OPENAI_VIDEOS:
      return new OpenAIVideoProvider(stream, model);
    case ProviderType.GROQ:
      return new GroqProvider(stream, model);
    case ProviderType.XAI:
      return new XAIProvider(stream, model);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
};
