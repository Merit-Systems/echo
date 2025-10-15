import type { EchoControlService } from '../services/EchoControlService';
import { Transaction } from '../types';

import { Response } from 'express';
import { EscrowRequest } from 'middleware/transaction-escrow-middleware';
import type { ProviderType } from './ProviderType';

export abstract class BaseProvider {
  protected readonly OPENAI_BASE_URL = 'https://api.openai.com/v1';
  protected readonly ANTHROPIC_BASE_URL = 'https://api.anthropic.com';
  protected readonly GEMINI_BASE_URL =
    'https://generativelanguage.googleapis.com/';
  protected readonly GEMINI_GPT_BASE_URL =
    'https://generativelanguage.googleapis.com/v1beta/openai';
  protected readonly OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

  private echoControlService: EchoControlService | undefined;
  private readonly isStream: boolean;
  private readonly model: string;

  constructor(
    stream: boolean,
    model: string,
    echoControlService?: EchoControlService
  ) {
    this.echoControlService = echoControlService;
    this.isStream = stream;
    this.model = model;
  }

  abstract getType(): ProviderType;
  abstract getBaseUrl(reqPath?: string): string;
  abstract getApiKey(): string | undefined;

  // Default URL formatting for most providers
  formatUpstreamUrl(req: { path: string; url: string }): string {
    const upstreamUrl = `${this.getBaseUrl(req.path)}${req.path}${
      req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
    }`;
    return upstreamUrl;
  }

  async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const apiKey = this.getApiKey();
    if (apiKey === undefined || apiKey.length === 0) {
      throw new Error('No API key found');
    }
    delete headers['authorization'];
    return {
      ...headers,
      Authorization: `Bearer ${apiKey}`,
    };
  }
  abstract handleBody(
    data: string,
    requestBody?: Record<string, unknown>
  ): Promise<Transaction>;

  getUserId(): string | null {
    return this.echoControlService?.getUserId() ?? null;
  }
  setEchoControlService(echoControlService: EchoControlService) {
    this.echoControlService = echoControlService;
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

  // Provider-specific request body transformations (e.g., GCS bucket prefixing, special configs)
  // Override this in provider implementations for custom body modifications
  transformRequestBody(
    reqBody: Record<string, unknown>,
    _reqPath: string
  ): Record<string, unknown> {
    // Default: no transformation
    return reqBody;
  }

  // Provider-specific response transformations (e.g., replacing URIs with signed URLs)
  // Override this in provider implementations for custom response modifications
  async transformResponse(responseData: unknown): Promise<unknown> {
    // Default: no transformation
    return responseData;
  }

  // For provider such as gemini Veo3 that need to support passthrough requests
  // which do not create transactions.
  async forwardProxyRequest(
    _req: EscrowRequest,
    _res: Response,
    _formattedHeaders: Record<string, string>,
    _upstreamUrl: string,
    _requestBody: string | FormData | undefined
  ) {
    throw new Error('Not implemented');
  }
}
