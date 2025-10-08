import { PROXY_PASSTHROUGH_ONLY_MODEL } from './VertexAIProvider';
import { BaseProvider } from './BaseProvider';
import { Request } from 'express';
import { ProviderType } from './ProviderType';
import { EscrowRequest } from '../middleware/transaction-escrow-middleware';
import { Response } from 'express';
import { getVideoModelPrice } from 'services/AccountingService';
import { HttpError, UnknownModelError } from 'errors/http';
import { Decimal } from 'generated/prisma/runtime/library';
import { Transaction } from '../types';
import { prisma } from '../server';
import { EchoDbService } from '../services/DbService';
import logger from '../logger';

export class OpenAIVideoProvider extends BaseProvider {
  static detectPassthroughProxy(
    req: Request,
    extractIsStream: (req: Request) => boolean
  ):
    | {
        provider: BaseProvider;
        model: string;
        isStream: boolean;
      }
    | undefined {
    const { method, path } = req;

    // 1. Create video route (POST /v1/videos) - return undefined (not passthrough)
    if (method === 'POST' && path.endsWith('/videos') && !path.includes('/videos/')) {
      return undefined;
    }

    // 2. Retrieve video (GET /v1/videos/{video_id}) - passthrough
    const isRetrieveRoute = method === 'GET' && /\/videos\/[^/]+$/.test(path);
    
    // 3. Download content (GET /v1/videos/{video_id}/content) - passthrough
    const isDownloadRoute = method === 'GET' && /\/videos\/[^/]+\/content$/.test(path);

    if (isRetrieveRoute || isDownloadRoute) {
      const model = PROXY_PASSTHROUGH_ONLY_MODEL;
      const isStream = extractIsStream(req);
      const provider = new OpenAIVideoProvider(isStream, model);

      return {
        provider,
        model,
        isStream,
      };
    }
    // 4. List videos (GET /v1/videos) - 404
    if (method === 'GET' && path.endsWith('/videos') && path.endsWith('/videos')) {
      throw new HttpError(404, 'List videos endpoint is not supported');
    }

    // 5. Delete video (DELETE /v1/videos/{video_id}) - 404
    if (method === 'DELETE' && /\/videos\/[^/]+$/.test(path)) {
      throw new HttpError(404, 'Delete video endpoint is not supported');
    }

    // 6. Remix video (POST /v1/videos/{video_id}/remix) - 404
    if (method === 'POST' && /\/videos\/[^/]+\/remix$/.test(path)) {
      throw new HttpError(404, 'Remix video endpoint is not supported');
    }

    return undefined;
  }

  // ========== Provider Interface ==========

  getType(): ProviderType {
    return ProviderType.OPENAI_VIDEOS;
  }

  getBaseUrl(): string {
    return this.OPENAI_BASE_URL;
  }

  getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  override async handleBody(
    data: string,
    requestBody?: Record<string, unknown>
  ): Promise<Transaction> {
    const providerId = this.parseProviderIdFromResponseBody(data);
    if (!requestBody) {
      throw new Error('Request body is required for OpenAI Videos');
    }

    const durationSeconds = Number(requestBody.seconds) || 4;
    // TODO: Size pricing??
    const size = requestBody.size || '720x1280';
    const videoModelPrice = getVideoModelPrice(this.getModel());

    if (!videoModelPrice) {
      throw new UnknownModelError(
        `No price found for model ${this.getModel()}`
      );
    }
    const costPerSecond = videoModelPrice.cost_per_second_with_audio;
    // TODO: Calculate cost based on size
    const totalCost = new Decimal(costPerSecond).mul(durationSeconds);

    return {
      metadata: {
        durationSeconds,
        generateAudio: true,
        model: this.getModel(),
        providerId,
        provider: this.getType(),
      },
      rawTransactionCost: totalCost,
      status: 'success',
    };
  }

  // ========== Response Parsing ==========

  parseProviderIdFromResponseBody(data: unknown): string {
    if (typeof data !== 'string') {
      throw new Error('Expected response data to be a string');
    }

    const responseData = JSON.parse(data);

    if (responseData.id && typeof responseData.id === 'string') {
      return responseData.id;
    }

    throw new Error('Response missing ID');
  }

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

    const isVideoDownload = this.isVideoContentDownload(req.path);

    if (isVideoDownload) {
      await this.handleVideoDownload(req, res, formattedHeaders, upstreamUrl);
      return;
    }

    const response = await fetch(upstreamUrl, {
      method: req.method,
      headers: formattedHeaders,
      ...(requestBody && { body: requestBody }),
    });

    if (!response.ok) {
      await this.handleUpstreamError(response, upstreamUrl);
    }

    const responseData = await response.json();
    res.json(responseData);
  }

  // ========== Video Download Handling ==========

  private isVideoContentDownload(path: string): boolean {
    return path.includes('/videos/') && path.endsWith('/content');
  }

  private extractVideoId(path: string): string {
    const match = path.match(/\/videos\/([^\/]+)\/content/);
    if (!match || !match[1]) {
      throw new HttpError(400, 'Invalid video content path');
    }
    return match[1];
  }

  private async handleVideoDownload(
    req: EscrowRequest,
    res: Response,
    formattedHeaders: Record<string, string>,
    upstreamUrl: string
  ): Promise<void> {
    const videoId = this.extractVideoId(req.path);
    // await this.verifyVideoAccess(videoId);

    const response = await fetch(upstreamUrl, {
      method: req.method,
      headers: formattedHeaders,
    });

    if (!response.ok) {
      await this.handleUpstreamError(response, upstreamUrl);
    }

    if (!response.body) {
      throw new HttpError(500, 'No response body from upstream');
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="video-${videoId}.mp4"`
    );

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    res.end();
  }

  private async verifyVideoAccess(videoId: string): Promise<void> {
    const userId = this.getRequiredUserId();
    const dbService = new EchoDbService(prisma);
    const hasAccess = await dbService.confirmAccessControl(userId, videoId);

    if (!hasAccess) {
      throw new HttpError(403, 'Access denied to this video');
    }
  }

  private getRequiredUserId(): string {
    const userId = this.getUserId();
    if (!userId) {
      throw new HttpError(401, 'User ID is required');
    }
    return userId;
  }

  private async handleUpstreamError(
    response: globalThis.Response,
    url: string
  ): Promise<never> {
    let errorMessage = `${response.status} ${response.statusText}`;

    const errorBody = await response.text().catch(() => '');
    if (errorBody) {
      logger.error(
        `OpenAI Video request failed. URL: ${url}, Status: ${response.status}, Body:`,
        errorBody
      );
      errorMessage = errorBody;
    } else {
      logger.error(
        `OpenAI Video request failed. URL: ${url}, Status: ${response.status}`
      );
    }

    throw new HttpError(response.status, errorMessage);
  }
}
