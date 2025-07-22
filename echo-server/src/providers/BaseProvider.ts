import type { EchoControlService } from '../services/EchoControlService';
import { getCostPerToken } from '../services/AccountingService';

import type { ProviderType } from './ProviderType';
import { UsageProduct } from 'generated/prisma';

export abstract class BaseProvider {
  protected readonly OPENAI_BASE_URL = 'https://api.openai.com/v1';
  protected readonly ANTHROPIC_BASE_URL = 'https://api.anthropic.com';
  protected readonly GEMINI_BASE_URL =
    'https://generativelanguage.googleapis.com/';
  protected readonly GEMINI_GPT_BASE_URL =
    'https://generativelanguage.googleapis.com/v1beta/openai';

  private readonly echoControlService: EchoControlService;
  private readonly isStream: boolean;
  private readonly model: string;

  constructor(
    echoControlService: EchoControlService,
    stream: boolean,
    model: string
  ) {
    this.echoControlService = echoControlService;
    this.isStream = stream;
    this.model = model;
  }

  abstract getType(): ProviderType;
  abstract getBaseUrl(reqPath?: string): string;
  abstract getApiKey(): string | undefined;
  formatAuthHeaders(headers: Record<string, string>): Record<string, string> {
    const apiKey = this.getApiKey();
    if (apiKey === undefined || apiKey.length === 0) {
      throw new Error('No API key found');
    }
    return {
      ...headers,
      Authorization: `Bearer ${apiKey}`,
    };
  }
  abstract handleBody(data: string): Promise<void>;
  getEchoControlService(): EchoControlService {
    return this.echoControlService;
  }
  getUserId(): string | null {
    return this.echoControlService.getUserId();
  }
  getIsStream(): boolean {
    return this.isStream;
  }
  supportsStream(): boolean {
    return true;
  }
  getModel(): string {
    return this.model;
  }

  async getAppMarkup(): Promise<number> {
    const markUp = await this.echoControlService.getAppMarkup();
    return markUp;
  }

  /**
   * Calculate cost per token using the AccountingService
   * This method properly provides all required parameters to getCostPerToken
   */
  async getCostPerToken(
    inputTokens: number,
    outputTokens: number
  ): Promise<{ cost: number; usageProduct: UsageProduct }> {
    const db = this.echoControlService.getDb();
    const echoAppId = this.echoControlService.getEchoAppId();

    if (!echoAppId) {
      throw new Error('No echo app ID available for cost calculation');
    }

    return await getCostPerToken(
      db,
      this.model,
      echoAppId,
      inputTokens,
      outputTokens
    );
  }

  // This is specific to OpenAI Format, Anthropic Native and others will need to override this
  ensureStreamUsage(reqBody: Record<string, unknown>): Record<string, unknown> {
    if (this.isStream) {
      reqBody.stream_options = {
        include_usage: true,
      };
    }
    return reqBody;
  }
}
