import { HttpClient } from '../http-client';
import { BaseResource } from '../utils/error-handling';
import {
  OpenAIModels,
  AnthropicModels,
  GeminiModels,
  OpenRouterModels,
  OpenAIImageModels,
  SupportedModel,
  SupportedImageModel,
  SupportedVideoModel,
  GeminiVideoModels,
} from '../supported-models';

export class ModelsResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get supported models as a flat array of model names
   */
  async listSupportedChatModels(): Promise<SupportedModel[]> {
    const allModels = [
      ...OpenAIModels,
      ...AnthropicModels,
      ...GeminiModels,
      ...OpenRouterModels,
    ];

    return allModels;
  }

  async listSupportedImageModels(): Promise<SupportedImageModel[]> {
    return OpenAIImageModels;
  }

  async listSupportedVideoModels(): Promise<SupportedVideoModel[]> {
    return GeminiVideoModels;
  }
}
