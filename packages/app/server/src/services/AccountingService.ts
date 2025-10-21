import {
  OpenAIModels,
  AnthropicModels,
  GeminiModels,
  OpenRouterModels,
  GroqModels,
  OpenAIImageModels,
  SupportedOpenAIResponseToolPricing,
  SupportedModel,
  SupportedImageModel,
  SupportedVideoModel,
} from '@merit-systems/echo-typescript-sdk';

import { Decimal } from '@prisma/client/runtime/library';
import { UnknownModelError } from '../errors/http';
import { Tool } from 'openai/resources/responses/responses';
import { logMetric } from '../logger';
import {
  GeminiVideoModels,
  VertexAIVideoModels,
  OpenAIVideoModels,
} from '@merit-systems/echo-typescript-sdk';

// Combine all supported chat models from the TypeScript SDK
export const ALL_SUPPORTED_MODELS: SupportedModel[] = [
  ...OpenAIModels,
  ...AnthropicModels,
  ...GeminiModels,
  ...OpenRouterModels,
  ...GroqModels,
];

// Handle image models separately since they have different pricing structure
export const ALL_SUPPORTED_IMAGE_MODELS: SupportedImageModel[] =
  OpenAIImageModels;

export const ALL_SUPPORTED_VIDEO_MODELS: SupportedVideoModel[] = [
  ...GeminiVideoModels,
  ...VertexAIVideoModels,
  ...OpenAIVideoModels,
];

// Create a lookup map for O(1) model price retrieval
const MODEL_PRICE_MAP = new Map<string, SupportedModel>();
ALL_SUPPORTED_MODELS.forEach(model => {
  MODEL_PRICE_MAP.set(model.model_id, model);
});

// Create a separate map for image models
const IMAGE_MODEL_MAP = new Map();
ALL_SUPPORTED_IMAGE_MODELS.forEach(model => {
  IMAGE_MODEL_MAP.set(model.model_id, model);
});

// Create a separate map for video models since they have different pricing structure
const VIDEO_MODEL_MAP = new Map();
ALL_SUPPORTED_VIDEO_MODELS.forEach(model => {
  VIDEO_MODEL_MAP.set(model.model_id, model);
});

export const getModelPrice = (model: string) => {
  const supportedModel = MODEL_PRICE_MAP.get(model);

  if (supportedModel) {
    return {
      input_cost_per_token: supportedModel.input_cost_per_token,
      output_cost_per_token: supportedModel.output_cost_per_token,
      provider: supportedModel.provider,
      model: supportedModel.model_id,
    };
  }

  return null;
};

export const getImageModelPrice = (model: string) => {
  const imageModel = IMAGE_MODEL_MAP.get(model);

  if (imageModel) {
    return {
      text_input_cost_per_token: imageModel.text_input_cost_per_token,
      image_input_cost_per_token: imageModel.image_input_cost_per_token,
      image_output_cost_per_token: imageModel.image_output_cost_per_token,
      provider: imageModel.provider,
      mode: 'image',
    };
  }

  return null;
};

export const getVideoModelPrice = (
  model: string
): SupportedVideoModel | null => {
  const videoModel = VIDEO_MODEL_MAP.get(model);

  if (videoModel) {
    return videoModel;
  }
  return null;
};

export const isValidModel = (model: string) => {
  return MODEL_PRICE_MAP.has(model);
};

export const isValidImageModel = (model: string) => {
  return IMAGE_MODEL_MAP.has(model);
};

export const isValidVideoModel = (model: string) => {
  return VIDEO_MODEL_MAP.has(model);
};

export const getCostPerToken = (
  model: string,
  inputTokens: number,
  outputTokens: number
) => {
  if (!isValidModel(model)) {
    logMetric('model.invalid', 1, { model });
    throw new UnknownModelError(`Invalid model: ${model}`);
  }

  const modelPrice = getModelPrice(model);
  if (!modelPrice) {
    throw new Error(`Pricing information not found for model: ${model}`);
  }
  if (
    modelPrice.input_cost_per_token < 0 ||
    modelPrice.output_cost_per_token < 0
  ) {
    throw new Error(`Invalid pricing for model: ${model}`);
  }

  const cost = new Decimal(modelPrice.input_cost_per_token)
    .mul(inputTokens)
    .plus(new Decimal(modelPrice.output_cost_per_token).mul(outputTokens));

  if (cost.lessThan(0)) {
    throw new Error(`Invalid cost for model: ${model}`);
  }

  return cost;
};

export const getImageModelCost = (
  model: string,
  textTokens: number,
  imageInputTokens: number,
  imageOutputTokens: number
) => {
  if (!isValidImageModel(model)) {
    throw new Error(`Invalid image model: ${model}`);
  }

  const imageModelPrice = getImageModelPrice(model);
  if (!imageModelPrice) {
    throw new Error(`Pricing information not found for image model: ${model}`);
  }

  const textCost = new Decimal(imageModelPrice.text_input_cost_per_token).mul(
    textTokens
  );
  const imageInputCost = new Decimal(
    imageModelPrice.image_input_cost_per_token
  ).mul(imageInputTokens);
  const imageOutputCost = new Decimal(
    imageModelPrice.image_output_cost_per_token
  ).mul(imageOutputTokens);

  return textCost.plus(imageInputCost).plus(imageOutputCost);
};

export const calculateToolCost = (tool: Tool): Decimal => {
  const toolPricing = SupportedOpenAIResponseToolPricing;

  switch (tool.type) {
    case 'image_generation': {
      const quality = tool.quality;
      const size = tool.size;

      // Get pricing from TypeScript SDK - assume gpt-image-1 if no model specified
      const gptImage1Prices = toolPricing.image_generation.gpt_image_1;

      if (quality && size) {
        // GPT Image 1 supports low, medium, high (auto defaults to medium)
        const gptQuality = quality === 'auto' ? 'medium' : quality;
        if (gptQuality in gptImage1Prices && size !== 'auto') {
          return new Decimal(
            gptImage1Prices[gptQuality as keyof typeof gptImage1Prices]?.[
              size
            ] || 0
          );
        }
      }
      return new Decimal(0);
    }

    case 'code_interpreter':
      return new Decimal(toolPricing.code_interpreter.cost_per_session);

    case 'file_search':
      return new Decimal(toolPricing.file_search.cost_per_call);

    case 'web_search_preview':
      // Default to gpt-4o pricing, could be enhanced to check model
      return new Decimal(toolPricing.web_search_preview.gpt_4o.cost_per_call);

    default:
      return new Decimal(0);
  }
};
