import { LlmTransactionMetadata, Transaction } from '../types';
import { getCostPerToken, getModelPrice, isValidModel } from '../services/AccountingService';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import logger from '../logger';
import { env } from '../env';
import { parseSSEGPTFormat, type CompletionStateBody } from './GPTProvider';
import { Decimal } from '@prisma/client/runtime/library';

export class VercelAIGatewayProvider extends BaseProvider {
  private readonly VERCEL_AI_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1';

  getType(): ProviderType {
    return ProviderType.VERCEL_AI_GATEWAY;
  }

  getBaseUrl(): string {
    return this.VERCEL_AI_GATEWAY_BASE_URL;
  }

  getApiKey(): string | undefined {
    return env.VERCEL_AI_GATEWAY_API_KEY;
  }

  async handleBody(
    data: string,
    requestBody?: Record<string, unknown>
  ): Promise<Transaction> {
    try {
      const model = this.getModel().toLowerCase();
      const isTranscriptionModel = model.includes('whisper') || model.includes('transcription');
      const isSpeechModel = model.includes('tts') || model.includes('speech');

      let isTranscriptionResponse = false;
      try {
        const parsed = JSON.parse(data);
        if (parsed.text !== undefined && typeof parsed.text === 'string') {
          isTranscriptionResponse = true;
        }
      } catch {
      }

      if (isTranscriptionModel || isTranscriptionResponse) {
        return this.handleAudioResponse(data, requestBody, 'transcription');
      }

      if (isSpeechModel) {
        return this.handleAudioResponse(data, requestBody, 'speech');
      }

      return this.handleChatCompletionResponse(data);
    } catch (error) {
      logger.error(`Error processing Vercel AI Gateway response: ${error}`);
      throw error;
    }
  }

  private handleChatCompletionResponse(data: string): Transaction {
    let prompt_tokens = 0;
    let completion_tokens = 0;
    let total_tokens = 0;
    let providerId = 'null';

    if (this.getIsStream()) {
      const chunks = parseSSEGPTFormat(data);

      for (const chunk of chunks) {
        if (chunk.usage && chunk.usage !== null) {
          prompt_tokens += chunk.usage.prompt_tokens;
          completion_tokens += chunk.usage.completion_tokens;
          total_tokens += chunk.usage.total_tokens;
        }
        providerId = chunk.id || 'null';
      }
    } else {
      const parsed = JSON.parse(data) as CompletionStateBody;
      prompt_tokens += parsed.usage.prompt_tokens;
      completion_tokens += parsed.usage.completion_tokens;
      total_tokens += parsed.usage.total_tokens;
      providerId = parsed.id || 'null';
    }

    const cost = getCostPerToken(
      this.getModel(),
      prompt_tokens,
      completion_tokens
    );

    const metadata: LlmTransactionMetadata = {
      providerId: providerId,
      provider: this.getType(),
      model: this.getModel(),
      inputTokens: prompt_tokens,
      outputTokens: completion_tokens,
      totalTokens: total_tokens,
    };

    return {
      rawTransactionCost: cost,
      metadata: metadata,
      status: 'success',
    };
  }

  private handleAudioResponse(
    data: string,
    requestBody: Record<string, unknown> | undefined,
    endpointType: 'transcription' | 'speech'
  ): Transaction {
    let cost = new Decimal(0);
    let metadata: LlmTransactionMetadata;
    const model = this.getModel();

    const modelPrice = getModelPrice(model);
    
    if (endpointType === 'transcription') {
      try {
        const transcriptionData = JSON.parse(data);
        const text = transcriptionData.text || '';
        
        if (modelPrice && isValidModel(model)) {
          const textTokens = Math.ceil(text.length / 4);
          cost = getCostPerToken(model, 0, textTokens);
        } else {
          cost = new Decimal(0.01);
        }

        metadata = {
          providerId: 'transcription',
          provider: this.getType(),
          model: model,
          inputTokens: 0,
          outputTokens: text.length,
          totalTokens: text.length,
        };
      } catch (error) {
        logger.error(`Error parsing transcription response: ${error}`);
        cost = modelPrice && isValidModel(model) ? new Decimal(0) : new Decimal(0.01);
        metadata = {
          providerId: 'transcription',
          provider: this.getType(),
          model: model,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        };
      }
    } else if (endpointType === 'speech') {
      const inputText = (requestBody?.input as string) || '';
      const characterCount = inputText.length;
      
      if (modelPrice && isValidModel(model)) {
        const inputTokens = Math.ceil(characterCount / 4);
        cost = getCostPerToken(model, inputTokens, 0);
      } else {
        const costPerCharacter = new Decimal(0.000015);
        cost = costPerCharacter.mul(characterCount);
      }

      metadata = {
        providerId: 'speech',
        provider: this.getType(),
        model: model,
        inputTokens: characterCount,
        outputTokens: 0,
        totalTokens: characterCount,
      };
    } else {
      cost = modelPrice && isValidModel(model) ? new Decimal(0) : new Decimal(0.01);
      metadata = {
        providerId: 'audio',
        provider: this.getType(),
        model: model,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      };
    }

    return {
      rawTransactionCost: cost,
      metadata: metadata,
      status: 'success',
    };
  }
}

