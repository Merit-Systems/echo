import { UnknownModelError } from '../errors/http';
import type { EchoControlService } from '../services/EchoControlService';
import { AnthropicGPTProvider } from './AnthropicGPTProvider';
import { AnthropicNativeProvider } from './AnthropicNativeProvider';
import type { BaseProvider } from './BaseProvider';
import { GeminiProvider } from './GeminiProvider';
import { GPTProvider } from './GPTProvider';
import { ProviderType } from './ProviderType';
import { GeminiGPTProvider } from './GeminiGPTProvider';
import { OpenAIResponsesProvider } from './OpenAIResponsesProvider';
import { OpenRouterProvider } from './OpenRouterProvider';
import { OpenAIImageProvider } from './OpenAIImageProvider';
import {
  ALL_SUPPORTED_IMAGE_MODELS,
  ALL_SUPPORTED_MODELS,
} from '../services/AccountingService';

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

/**
 * Model-to-provider mapping loaded from model_prices_and_context_window.json
 * This replaces the previous hardcoded mapping and automatically includes all
 * supported models from the JSON configuration file.
 */
export const MODEL_TO_PROVIDER: Record<string, ProviderType> =
  createChatModelToProviderMapping();

export const IMAGE_MODEL_TO_PROVIDER: Record<string, ProviderType> =
  createImageModelToProviderMapping();

export const getProvider = (
  model: string,
  echoControlService: EchoControlService,
  stream: boolean,
  completionPath: string
): BaseProvider => {
  // First check if the model is in the model to provider mapping
  let type = MODEL_TO_PROVIDER[model];

  const imageType = IMAGE_MODEL_TO_PROVIDER[model];
  if (imageType) {
    type = imageType;
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
      return new GPTProvider(echoControlService, stream, model);
    case ProviderType.ANTHROPIC_GPT:
      return new AnthropicGPTProvider(echoControlService, stream, model);
    case ProviderType.ANTHROPIC_NATIVE:
      return new AnthropicNativeProvider(echoControlService, stream, model);
    case ProviderType.GEMINI:
      return new GeminiProvider(echoControlService, stream, model);
    case ProviderType.GEMINI_GPT:
      return new GeminiGPTProvider(echoControlService, stream, model);
    case ProviderType.OPENAI_RESPONSES:
      return new OpenAIResponsesProvider(echoControlService, stream, model);
    case ProviderType.OPENROUTER:
      return new OpenRouterProvider(echoControlService, stream, model);
    case ProviderType.OPENAI_IMAGES:
      return new OpenAIImageProvider(echoControlService, stream, model);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
};
