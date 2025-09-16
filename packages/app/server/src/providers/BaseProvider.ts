import { Transaction } from '../types';
import type { EchoControlService } from '../services/EchoControlService';

import type { ProviderType } from './ProviderType';

export abstract class BaseProvider {
  protected readonly OPENAI_BASE_URL = 'https://api.openai.com/v1';
  protected readonly ANTHROPIC_BASE_URL = 'https://api.anthropic.com';
  protected readonly GEMINI_BASE_URL =
    'https://generativelanguage.googleapis.com/';
  protected readonly GEMINI_GPT_BASE_URL =
    'https://generativelanguage.googleapis.com/v1beta/openai';
  protected readonly OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

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
  abstract handleBody(data: string): Promise<Transaction>;
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

  // This is specific to OpenAI Format, Anthropic Native and others will need to override this
  ensureStreamUsage(
    reqBody: Record<string, unknown>,
    _reqPath: string
  ): Record<string, unknown> {
    if (this.isStream) {
      reqBody.stream_options = {
        include_usage: true,
      };
    }
    return reqBody;
  }
}
