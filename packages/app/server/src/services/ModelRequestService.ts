import { Request, Response } from 'express';
import { HttpError } from '../errors/http';
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
  ): Promise<{
    transaction: Transaction;
    data: unknown;
  }> {
    // Format authentication headers
    const authenticatedHeaders =
      await provider.formatAuthHeaders(processedHeaders);

    logger.info(
      `New outbound request: ${req.method} ${provider.getBaseUrl(req.path)}${req.path}`
    );

    // Ensure stream usage is set correctly (OpenAI Format)
    req.body = provider.ensureStreamUsage(req.body, req.path);

    // Apply provider-specific request body transformations
    req.body = provider.transformRequestBody(req.body, req.path);

    // Format request body and headers based on content type
    const { requestBody, headers: formattedHeaders } = this.formatRequestBody(
      req,
      authenticatedHeaders
    );

    // this rewrites the base url to the provider's base url and retains the rest
    const upstreamUrl = formatUpstreamUrl(provider, req);

    // Forward the request to the provider's API
    const response = await fetch(upstreamUrl, {
      method: req.method,
      headers: formattedHeaders,
      ...(requestBody && { body: requestBody }),
    });

    // Handle non-200 responses
    if (response.status !== 200) {
      const errorMessage = `${response.status} ${response.statusText}`;
      logger.error(`Error response: ${errorMessage}`);

      const errorBody = await response.text().catch(() => '');
      const error = this.parseErrorResponse(errorBody, response.status);

      logger.error(`Error details: ${JSON.stringify(error)}`);
      res.status(response.status).json({ error });
      throw new HttpError(response.status, JSON.stringify(error));
    }

    // Handle the successful response based on stream type
    if (isStream) {
      const transaction = await handleStreamService.handleStream(
        response,
        provider,
        req,
        res
      );
      return {
        transaction,
        data: null,
      };
    } else {
      const { transaction, data } =
        await handleNonStreamingService.handleNonStreaming(
          response,
          provider,
          req,
          res
        );
      return { transaction, data };
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
      // Check if this is a form data request
      const hasFiles =
        req.files && Array.isArray(req.files) && req.files.length > 0;
      const isMultipart =
        req.get('content-type')?.includes('multipart/form-data') ?? false;

      if (hasFiles || isMultipart) {
        // Create FormData for multipart requests
        const formData = new FormData();

        // Add text fields from req.body
        Object.entries(req.body || {}).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        // Add files from req.files
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach(file => {
            const blob = new Blob([new Uint8Array(file.buffer)], {
              type: file.mimetype,
            });
            formData.append(file.fieldname, blob, file.originalname);
          });
        }

        requestBody = formData;
        // Remove content-type header to let fetch set it with boundary
        delete finalHeaders['content-type'];
        delete finalHeaders['Content-Type'];

        logger.info('Forwarding form data request with files');
      } else {
        // Handle as JSON request
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

// Export singleton instance
export const modelRequestService = new ModelRequestService();
