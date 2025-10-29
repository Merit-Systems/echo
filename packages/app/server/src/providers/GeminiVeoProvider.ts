import { HttpError, UnknownModelError } from '../errors/http';
import { Transaction } from '../types';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';
import { Decimal } from '@prisma/client/runtime/library';
import { EscrowRequest } from '../middleware/transaction-escrow-middleware';
import { Response } from 'express';
import { getVideoModelPrice } from '../services/AccountingService';
import { EchoDbService } from '../services/DbService';
import { prisma } from '../server';
import logger from '../logger';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { ReadableStream as NodeWebReadableStream } from 'node:stream/web';
import { GenerateVideosResponse, GeneratedVideo } from '@google/genai';
import {
  extractOperationId,
  extractFileId,
  isOperationsPath,
  isFilesPath,
} from '../utils/gemini/string-parsing.js';
import type { Request } from 'express';
import type { EchoControlService } from '../services/EchoControlService';

export const PROXY_PASSTHROUGH_ONLY_MODEL = 'PROXY_PLACEHOLDER_GEMINI_VEO';

export class GeminiVeoProvider extends BaseProvider {
  /**
   * Detects if the request should use Gemini VEO passthrough proxy.
   * Returns the initialized provider and metadata if it matches, undefined otherwise.
   */
  static detectPassthroughProxy(
    req: Request,
    extractIsStream: (req: Request) => boolean,
    echoControlService?: EchoControlService
  ):
    | {
        provider: BaseProvider;
        model: string;
        isStream: boolean;
      }
    | undefined {
    // Check for Gemini VEO passthrough patterns:
    // - Files: /v1beta/files/{fileId}
    // - Operations: /v1beta/models/{model}/operations/{operationId}
    const isFilesEndpoint = isFilesPath(req.path);
    const isOperationsEndpoint = isOperationsPath(req.path);

    if (!isFilesEndpoint && !isOperationsEndpoint) {
      return undefined;
    }

    const model = PROXY_PASSTHROUGH_ONLY_MODEL;
    const isStream = extractIsStream(req);
    const provider = new GeminiVeoProvider(isStream, model);

    return {
      provider,
      model,
      isStream,
    };
  }

  getType(): ProviderType {
    return ProviderType.GEMINI_VEO;
  }

  getBaseUrl(reqPath?: string): string {
    // For Gemini native API, we use the Google AI API endpoint
    if (reqPath && reqPath.startsWith('/v1beta')) {
      return 'https://generativelanguage.googleapis.com';
    } else {
      return 'https://generativelanguage.googleapis.com/v1beta';
    }
  }

  getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  override supportsStream(): boolean {
    // Veo3 video generation is typically async/long-running, not streaming
    return true;
  }

  override async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const apiKey = this.getApiKey();
    if (apiKey === undefined || apiKey.length === 0) {
      throw new Error('No Gemini API key found for Veo3');
    }

    // Veo3 uses Google's API key format, not Bearer token
    return {
      ...headers,
      'x-goog-api-key': apiKey,
    };
  }

  override async handleBody(
    data: unknown,
    requestBody?: Record<string, unknown>
  ): Promise<Transaction> {
    const providerId = this.parseProviderIdFromResponseBody(data);
    if (!requestBody) {
      throw new Error(
        'In GeminiVeo3, the request body dictates the parameters for the request'
      );
    }

    const durationSeconds: number = Number(requestBody.durationSeconds) || 8;
    const generateAudio: boolean = Boolean(requestBody.generateAudio) || true;

    const videoModelPrice = getVideoModelPrice(this.getModel());

    if (!videoModelPrice) {
      throw new UnknownModelError(
        `No price found for model: ${this.getModel()}`
      );
    }

    const totalCost = new Decimal(
      generateAudio
        ? videoModelPrice.cost_per_second_with_audio
        : videoModelPrice.cost_per_second_without_audio
    ).mul(durationSeconds);

    // Left unimplemented as requested
    return {
      metadata: {
        durationSeconds: durationSeconds,
        generateAudio: generateAudio,
        model: this.getModel(),
        providerId: providerId,
        provider: this.getType(),
      },
      rawTransactionCost: totalCost,
      status: 'success',
    };
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    // Veo3 doesn't use streaming, so no special stream usage handling needed
    return reqBody;
  }

  /**
   * Forwards a proxy request to the provider's API.
   * This will be the last function called in the proxy request chain,
   * and will resolve the request by writing the response to the response object.
   *
   * @param req
   * @param res
   * @param formattedHeaders
   * @param upstreamUrl
   * @param requestBody
   * @returns
   */
  override async forwardProxyRequest(
    req: EscrowRequest,
    res: Response,
    formattedHeaders: Record<string, string>,
    upstreamUrl: string,
    requestBody: string | FormData | undefined
  ): Promise<void> {
    if (this.getModel() !== PROXY_PASSTHROUGH_ONLY_MODEL) {
      throw new HttpError(400, 'Invalid model');
    }

    // Extract provider ID from either files or operations path for access control
    const fileId = extractFileId(req.path);
    const operationId = extractOperationId(req.path);
    const providerId = fileId ?? operationId;

    if (!providerId) {
      throw new HttpError(400, 'Invalid file or operation ID');
    }

    const isOperationsEndpoint = isOperationsPath(upstreamUrl);

    if (
      isOperationsEndpoint &&
      !(await this.confirmAccessControl(this.getUserId()!, providerId))
    ) {
      throw new HttpError(403, 'Access denied');
    }

    // Forward the request to the provider's API
    const response = await fetch(upstreamUrl, {
      method: req.method,
      headers: formattedHeaders,
      ...(requestBody && { body: requestBody }),
    });
    // Handle non-200 responses
    if (response.status !== 200) {
      throw new HttpError(
        response.status,
        `${response.status} ${response.statusText}`
      );
    }

    if (response.headers.get('content-type') !== 'video/mp4') {
      const responseData = await response.json();
      this.parseCompletedOperationsResponse(responseData);
      res.json(responseData);
      return;
    }
    // Forward important headers
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    // Pipe the body
    if (response.body) {
      await pipeline(
        Readable.fromWeb(response.body as NodeWebReadableStream<Uint8Array>),
        res
      );
    } else {
      res.status(500).send('No body in upstream response');
    }
    return;
  }

  async confirmAccessControl(
    userId: string,
    providerId: string
  ): Promise<boolean> {
    const dbService = new EchoDbService(prisma);
    const result = await dbService.confirmAccessControl(userId, providerId);

    if (result.isErr()) {
      logger.error(`Error confirming access control: ${result.error}`);
      return false;
    }

    return result.value;
  }

  parseProviderIdFromResponseBody(data: unknown): string {
    if (typeof data !== 'string') {
      throw new Error('Expected response data to be a string');
    }

    const responseData = JSON.parse(data);

    if (responseData.name && typeof responseData.name === 'string') {
      return extractOperationId(responseData.name);
    }

    return 'unknown';
  }

  parseCompletedOperationsResponse(
    responseData: Record<string, unknown>
  ): boolean {
    if (!responseData.done) {
      return false;
    }
    const response = responseData.response as
      | GenerateVideosResponse
      | undefined;
    if (!response?.generatedVideos) {
      return false;
    }
    const uris = response.generatedVideos
      .map((video: GeneratedVideo) => video.video?.uri)
      .filter((uri: string | undefined) => uri !== undefined);
    logger.info(
      `Generated video URIs for ${this.getUserId()} and ${responseData.name}: ${JSON.stringify(uris)}`
    );
    return true;
  }
}
