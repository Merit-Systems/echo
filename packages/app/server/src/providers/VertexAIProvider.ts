import { Storage } from '@google-cloud/storage';
import { Decimal } from '@prisma/client/runtime/library';
import type { Request } from 'express';
import { Response } from 'express';
import { GoogleAuth } from 'google-auth-library';
import { Result, ResultAsync, fromPromise, ok, err } from 'neverthrow';
import { HttpError, UnknownModelError } from '../errors/http';
import logger from '../logger';
import { EscrowRequest } from '../middleware/transaction-escrow-middleware';
import { prisma } from '../server';
import { getVideoModelPrice } from '../services/AccountingService';
import { EchoDbService } from '../services/DbService';
import type { EchoControlService } from '../services/EchoControlService';
import { Transaction } from '../types';
import { extractOperationId } from '../utils/gemini/string-parsing.js';
import { BaseProvider } from './BaseProvider';
import { ProviderType } from './ProviderType';

// Constants
export const PROXY_PASSTHROUGH_ONLY_MODEL = 'PROXY_PLACEHOLDER_VERTEX_AI';
const VEO3_MODELS = [
  'veo-3.0-fast-generate-preview',
  'veo-3.0-generate-preview',
];
const GCS_BUCKET_NAME = 'echo-veo3-videos';
const GCS_URI_PREFIX = 'gs://';
const TOKEN_CACHE_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
const TOKEN_EXPIRY_MS = 55 * 60 * 1000; // 55 minutes
const SIGNED_URL_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export class VertexAIProvider extends BaseProvider {
  private authCache: { token: string; expiry: number } | null = null;

  // ========== Static Factory Methods ==========

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
    if (!req.path.includes(':fetchPredictOperation')) {
      return undefined;
    }

    const model = PROXY_PASSTHROUGH_ONLY_MODEL;
    const isStream = extractIsStream(req);
    const provider = new VertexAIProvider(isStream, model);

    return { provider, model, isStream };
  }

  // ========== Provider Interface ==========

  getType(): ProviderType {
    return ProviderType.VERTEX_AI;
  }

  getBaseUrl(): string {
    const project = this.getRequiredEnvVar('GOOGLE_CLOUD_PROJECT');
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
    return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google`;
  }

  getApiKey(): string | undefined {
    return undefined; // Vertex AI uses service account authentication
  }

  override formatUpstreamUrl(req: { path: string; url: string }): string {
    const pathWithoutV1 = req.path.replace(/^\/v1/, '');
    const project = this.getRequiredEnvVar('GOOGLE_CLOUD_PROJECT');
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
    const queryString = req.url.includes('?')
      ? req.url.substring(req.url.indexOf('?'))
      : '';

    return `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${location}${pathWithoutV1}${queryString}`;
  }

  override supportsStream(): boolean {
    return true;
  }

  override async formatAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const accessToken = await this.getAccessToken();
    return {
      ...headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
  }

  override ensureStreamUsage(
    reqBody: Record<string, unknown>
  ): Record<string, unknown> {
    return reqBody;
  }

  override transformRequestBody(
    reqBody: Record<string, unknown>,
    reqPath: string
  ): Record<string, unknown> {
    const userId = this.getRequiredUserId();
    const modifiedBody = JSON.parse(JSON.stringify(reqBody));

    if (modifiedBody.parameters?.storageUri) {
      const params = modifiedBody.parameters as Record<string, unknown>;
      params.storageUri = this.buildUserGcsUri(
        userId,
        params.storageUri as string
      );
    }

    return modifiedBody;
  }

  override async transformResponse(responseData: unknown): Promise<unknown> {
    if (typeof responseData === 'object' && responseData !== null) {
      await this.transformResponseUris(responseData as Record<string, unknown>);
    }
    return responseData;
  }

  override async handleBody(
    data: unknown,
    requestBody?: Record<string, unknown>
  ): Promise<Transaction> {
    const providerId = this.parseProviderIdFromResponseBody(data);
    if (!requestBody) {
      throw new Error('Request body is required for Vertex AI');
    }

    const durationSeconds = Number(requestBody.durationSeconds) || 8;
    const generateAudio = Boolean(requestBody.generateAudio) || true;
    const videoModelPrice = getVideoModelPrice(this.getModel());

    if (!videoModelPrice) {
      throw new UnknownModelError(
        `No price found for model: ${this.getModel()}`
      );
    }

    const costPerSecond = generateAudio
      ? videoModelPrice.cost_per_second_with_audio
      : videoModelPrice.cost_per_second_without_audio;
    const totalCost = new Decimal(costPerSecond).mul(durationSeconds);

    return {
      metadata: {
        durationSeconds,
        generateAudio,
        model: this.getModel(),
        providerId,
        provider: this.getType(),
      },
      rawTransactionCost: totalCost,
      status: 'success',
    };
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

    const operationId = this.extractOperationIdFromRequest(requestBody);
    await this.verifyAccessControl(operationId);

    const accessToken = await this.getAccessToken();
    const headers = {
      ...formattedHeaders,
      Authorization: `Bearer ${accessToken}`,
    };

    const baseUrl = this.getBaseUrl();
    const pathAfterModels = this.extractPathAfterModels(req.path);
    const url = `${baseUrl}/models/${pathAfterModels}`;

    const response = await this.makeUpstreamRequest(
      url,
      req.method,
      headers,
      requestBody
    );
    const responseData = await response.json();

    await this.transformResponseUris(responseData);
    res.json(responseData);
  }

  // ========== Authentication ==========

  private async getAccessToken(): Promise<string> {
    if (
      this.authCache &&
      Date.now() < this.authCache.expiry - TOKEN_CACHE_BUFFER_MS
    ) {
      return this.authCache.token;
    }

    const credentialsResult = this.getServiceAccountCredentials();
    if (credentialsResult.isErr()) {
      throw new Error(
        `Failed to get service account credentials: ${credentialsResult.error.message}`
      );
    }

    const credentials = credentialsResult.value;
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();

    if (!tokenResponse.token) {
      throw new Error('Failed to get access token from Google Auth');
    }

    this.authCache = {
      token: tokenResponse.token,
      expiry: Date.now() + TOKEN_EXPIRY_MS,
    };

    return tokenResponse.token;
  }

  // ========== GCS Operations ==========

  private buildUserGcsUri(userId: string, userPath: string): string {
    const cleanPath = userPath.startsWith(GCS_URI_PREFIX)
      ? userPath.substring(GCS_URI_PREFIX.length)
      : userPath;

    const encodedPath = cleanPath
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');

    return `${GCS_URI_PREFIX}${GCS_BUCKET_NAME}/${userId}/${encodedPath}`;
  }

  private async transformResponseUris(
    responseData: Record<string, unknown>
  ): Promise<void> {
    const videos = this.extractVideosFromResponse(responseData);
    if (!videos || videos.length === 0) {
      return;
    }

    const storage = this.initializeStorage();
    if (!storage) {
      return;
    }

    for (const video of videos) {
      await this.transformVideoUri(video, storage);
    }
  }

  private extractVideosFromResponse(
    responseData: Record<string, unknown>
  ): any[] | null {
    if (!responseData.response || typeof responseData.response !== 'object') {
      return null;
    }

    const response = responseData.response as Record<string, unknown>;
    const videos = (response.generatedVideos || response.videos) as any[];

    return Array.isArray(videos) ? videos : null;
  }

  private initializeStorage(): Storage | null {
    const credentialsResult = this.getServiceAccountCredentials();
    if (credentialsResult.isErr() || !credentialsResult.value) {
      return null;
    }

    return new Storage({ credentials: credentialsResult.value });
  }

  private async transformVideoUri(video: any, storage: Storage): Promise<void> {
    const videoObj = video.video || video;
    const gcsUri = videoObj.gcsUri || videoObj.uri;

    if (
      !gcsUri ||
      typeof gcsUri !== 'string' ||
      !gcsUri.startsWith(GCS_URI_PREFIX)
    ) {
      return;
    }

    const result = await this.generateSignedUrl(storage, gcsUri);

    if (result.isErr()) {
      logger.error(
        `Failed to generate signed URL for ${gcsUri}:`,
        result.error
      );
      return;
    }

    const { signedUrl, expiresAt } = result.value;

    if (videoObj.gcsUri) {
      videoObj.gcsUri = signedUrl;
    } else {
      videoObj.uri = signedUrl;
    }
    videoObj.expiresAt = expiresAt;
  }

  private generateSignedUrl(
    storage: Storage,
    gcsUri: string
  ): ResultAsync<{ signedUrl: string; expiresAt: string }, Error> {
    const { bucket: bucketName, path: filePath } = this.parseGcsUri(gcsUri);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    const expirationTime = Date.now() + SIGNED_URL_EXPIRY_MS;

    return fromPromise(
      file.getSignedUrl({
        action: 'read',
        expires: expirationTime,
      }),
      error => new Error(`Failed to generate signed URL: ${error}`)
    ).map(([signedUrl]) => ({
      signedUrl,
      expiresAt: new Date(expirationTime).toISOString(),
    }));
  }

  private parseGcsUri(gcsUri: string): { bucket: string; path: string } {
    const uriWithoutProtocol = gcsUri.substring(GCS_URI_PREFIX.length);
    const firstSlashIndex = uriWithoutProtocol.indexOf('/');

    return {
      bucket: uriWithoutProtocol.substring(0, firstSlashIndex),
      path: uriWithoutProtocol.substring(firstSlashIndex + 1),
    };
  }

  // ========== Request Processing ==========

  private extractOperationIdFromRequest(
    requestBody: string | FormData | undefined
  ): string {
    const requestBodyObj =
      typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
    const operationId = extractOperationId(requestBodyObj?.operationName || '');

    if (!operationId) {
      throw new HttpError(400, 'Invalid operation ID');
    }

    return operationId;
  }

  private extractPathAfterModels(path: string): string {
    const modelsIndex = path.indexOf('/models/');
    if (modelsIndex === -1) {
      throw new Error(`Path does not contain "/models/": ${path}`);
    }

    return path.substring(modelsIndex + '/models/'.length);
  }

  private async makeUpstreamRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: string | FormData | undefined
  ): Promise<globalThis.Response> {
    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body }),
    });

    if (response.status !== 200) {
      await this.handleUpstreamError(response, url);
    }

    return response;
  }

  private async handleUpstreamError(
    response: globalThis.Response,
    url: string
  ): Promise<never> {
    let errorMessage = `${response.status} ${response.statusText}`;

    const textResult = await fromPromise(
      response.text(),
      error => new Error(`Failed to read response text: ${error}`)
    );

    if (textResult.isOk()) {
      const errorBody = textResult.value;
      logger.error(
        `Vertex AI request failed. URL: ${url}, Status: ${response.status}, Body:`,
        errorBody
      );
      errorMessage = errorBody || errorMessage;
    } else {
      logger.error(
        `Vertex AI request failed. URL: ${url}, Status: ${response.status}`,
        textResult.error
      );
    }

    throw new HttpError(response.status, errorMessage);
  }

  // ========== Access Control ==========

  private async verifyAccessControl(operationId: string): Promise<void> {
    const userId = this.getRequiredUserId();
    const hasAccessResult = await this.confirmAccessControl(
      userId,
      operationId
    );

    if (hasAccessResult.isErr()) {
      throw new HttpError(
        500,
        `Failed to verify access control: ${hasAccessResult.error.message}`
      );
    }

    if (!hasAccessResult.value) {
      throw new HttpError(403, 'Access denied');
    }
  }

  confirmAccessControl(
    userId: string,
    providerId: string
  ): ResultAsync<boolean, Error> {
    const dbService = new EchoDbService(prisma);
    return fromPromise(
      dbService.confirmAccessControl(userId, providerId),
      error => new Error(`Failed to confirm access control: ${error}`)
    ).andThen(result => result);
  }

  // ========== Response Parsing ==========

  parseProviderIdFromResponseBody(data: unknown): string {
    if (typeof data !== 'string') {
      throw new Error('Expected response data to be a string');
    }

    const responseData = JSON.parse(data);

    if (responseData.name && typeof responseData.name === 'string') {
      const operationId = extractOperationId(responseData.name);
      if (!operationId) {
        throw new Error(
          `Failed to extract operation ID from: ${responseData.name}`
        );
      }
      return operationId;
    }

    throw new Error('Response missing operation name');
  }

  // ========== Utility Methods ==========

  private getRequiredUserId(): string {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User ID is required for Vertex AI requests');
    }
    return userId;
  }

  private getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`${name} environment variable not set for Vertex AI`);
    }
    return value;
  }

  private getServiceAccountCredentials(): Result<any, Error> {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return ok(null);
    }

    const parseResult = Result.fromThrowable(
      () => JSON.parse(serviceAccountKey),
      error => new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: ${error}`)
    )();

    if (parseResult.isErr()) {
      logger.error(
        'Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY',
        parseResult.error
      );
      return ok(null);
    }

    return parseResult;
  }

  private isVeo3Model(): boolean {
    return VEO3_MODELS.includes(this.getModel());
  }
}
