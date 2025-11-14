import { Request, Response } from 'express';
import { ok, err } from 'neverthrow';
import { HttpError } from '../errors/http';
import { 
  AppResult, 
  AppResultAsync, 
  ProviderError, 
  ValidationError,
  safeAsync 
} from '../errors';
import logger from '../logger';
import { BaseProvider } from '../providers/BaseProvider';
import { Transaction } from '../types';
import { handleNonStreamingService } from './HandleNonStreamingService';
import { handleStreamService } from './HandleStreamService';
import { formatUpstreamUrl } from './RequestDataService';

class ModelRequestService {
  /**
   * Validates and executes a model request, handling the response directly
   * @param req - Express request object containing the model request
   * @param res - Express response object to send the result to
   * @param processedHeaders - Headers processed for authentication
   * @param echoControlService - Service for Echo control operations
   * @param forwardingPath - Path to forward the request to
   * @returns Promise<void> - Handles the response directly
   */
  async executeModelRequest(
    req: Request,
    res: Response,
    processedHeaders: Record<string, string>,
    provider: BaseProvider,
    isStream: boolean
  ): Promise<AppResult<{
    transaction: Transaction;
    data: unknown;
  }, ProviderError | ValidationError>> {
    try {
      const authenticatedHeaders =
        await provider.formatAuthHeaders(processedHeaders);

      logger.info(
        `New outbound request: ${req.method} ${provider.getBaseUrl(req.path)}${req.path}`
      );

      req.body = provider.ensureStreamUsage(req.body, req.path);

      req.body = provider.transformRequestBody(req.body, req.path);

      const { requestBody, headers: formattedHeaders } = this.formatRequestBody(
        req,
        authenticatedHeaders
      );

      const upstreamUrl = formatUpstreamUrl(provider, req);

      const response = await fetch(upstreamUrl, {
        method: req.method,
        headers: formattedHeaders,
        ...(requestBody && { body: requestBody }),
      });

      if (response.status !== 200) {
        const errorMessage = `${response.status} ${response.statusText}`;
        logger.error(`Error response: ${errorMessage}`);

        const errorBody = await response.text().catch(() => '');
        const error = this.parseErrorResponse(errorBody, response.status);

        logger.error(`Error details: ${JSON.stringify(error)}`);
        
        res.status(response.status).json({ error });
        
        return err(new ProviderError(
          provider.getType(),
          typeof error === 'object' && error !== null && 'message' in error 
            ? String(error.message) 
            : errorMessage,
          response.status,
          { errorBody: error }
        ));
      }

      if (isStream) {
        const transaction = await handleStreamService.handleStream(
          response,
          provider,
          req,
          res
        );
        return ok({
          transaction,
          data: null,
        });
      } else {
        const { transaction, data } =
          await handleNonStreamingService.handleNonStreaming(
            response,
            provider,
            req,
            res
          );
        return ok({ transaction, data });
      }
    } catch (error) {
      logger.error('Unexpected error in executeModelRequest', { error });
      return err(new ProviderError(
        provider.getType(),
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        { originalError: error }
      ));
    }
  }

  handleResolveResponse(res: Response, isStream: boolean, data: unknown): void {
    if (isStream) {
      res.end();
      return;
    } else {
      res.json(data);
    }
    return;
  }

  /**
   * Formats the request body and headers based on content type
   * @param req - Express request object
   * @param authenticatedHeaders - Base authenticated headers
   * @returns Object with formatted requestBody and headers
   */
  formatRequestBody(
    req: Request,
    authenticatedHeaders: Record<string, string>
  ): {
    requestBody: string | FormData | undefined;
    headers: Record<string, string>;
  } {
    let requestBody: string | FormData | undefined;
    let finalHeaders = { ...authenticatedHeaders };

    if (req.method !== 'GET') {
      const hasFiles =
        req.files && Array.isArray(req.files) && req.files.length > 0;
      const isMultipart =
        req.get('content-type')?.includes('multipart/form-data') ?? false;

      if (hasFiles || isMultipart) {
        const formData = new FormData();

        Object.entries(req.body || {}).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        if (req.files && Array.isArray(req.files)) {
          req.files.forEach(file => {
            const blob = new Blob([new Uint8Array(file.buffer)], {
              type: file.mimetype,
            });
            formData.append(file.fieldname, blob, file.originalname);
          });
        }

        requestBody = formData;
        delete finalHeaders['content-type'];
        delete finalHeaders['Content-Type'];

        logger.info('Forwarding form data request with files');
      } else {
        requestBody = JSON.stringify(req.body);
      }
    }

    return { requestBody, headers: finalHeaders };
  }

  private parseErrorResponse(errorBody: string, status: number): object {
    if (!errorBody.trim()) {
      return { message: `HTTP ${status} error` };
    }

    try {
      return JSON.parse(errorBody);
    } catch {
      return { message: errorBody };
    }
  }
}

export const modelRequestService = new ModelRequestService();
