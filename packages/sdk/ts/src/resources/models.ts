import { HttpClient } from '../http-client';
import { BaseResource } from '../utils/error-handling';
import {
  OpenAIModels,
  AnthropicModels,
  GeminiModels,
  OpenRouterModels,
  OpenAIImageModels,
  VercelAIGatewayModels,
  SupportedModel,
  SupportedImageModel,
  SupportedVideoModel,
  SupportedSpeechModel,
  SupportedTranscriptionModel,
  GeminiVideoModels,
  OpenAISpeechModels,
  OpenAITranscriptionModels,
} from '../supported-models';

export class ModelsResource extends BaseResource {
  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get supported chat models as a flat array
   */
  async listSupportedChatModels(): Promise<SupportedModel[]> {
    const allModels = [
      ...OpenAIModels,
      ...AnthropicModels,
      ...GeminiModels,
      ...OpenRouterModels,
      ...VercelAIGatewayModels,
    ];

    return allModels;
  }

  /**
   * Get supported image models
   */
  async listSupportedImageModels(): Promise<SupportedImageModel[]> {
    return OpenAIImageModels;
  }

  /**
   * Get supported video models
   */
  async listSupportedVideoModels(): Promise<SupportedVideoModel[]> {
    return GeminiVideoModels;
  }

  /**
   * Get supported speech (text-to-speech) models
   */
  async listSupportedSpeechModels(): Promise<SupportedSpeechModel[]> {
    return OpenAISpeechModels;
  }

  /**
   * Get supported transcription (speech-to-text) models
   */
  async listSupportedTranscriptionModels(): Promise<
    SupportedTranscriptionModel[]
  > {
    return OpenAITranscriptionModels;
  }
}
