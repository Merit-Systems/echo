import { Response } from 'express';
import logger from '../logger';
import { EscrowRequest } from '../middleware/transaction-escrow-middleware';
import { BaseProvider } from '../providers/BaseProvider';
import { modelRequestService } from './ModelRequestService';
import { formatUpstreamUrl } from './RequestDataService';

/**
 * Makes a proxy request to the provider.
 * This function is called when a request is made and
 * does not require
 * @param req
 * @param res
 * @param provider
 * @param isStream
 */

export async function makeProxyPassthroughRequest(
  req: EscrowRequest,
  res: Response,
  provider: BaseProvider,
  processedHeaders: Record<string, string>
): Promise<void> {
  // Format authentication headers
  const authenticatedHeaders =
    await provider.formatAuthHeaders(processedHeaders);

  logger.info(
    `New outbound request for passthrough proxy: ${req.method} ${provider.getBaseUrl(req.path)}${req.path}`
  );

  // Ensure stream usage is set correctly
  req.body = provider.ensureStreamUsage(req.body, req.path);

  // Apply provider-specific request body transformations
  req.body = provider.transformRequestBody(req.body, req.path);

  // Format request body and headers based on content type
  const { requestBody, headers: formattedHeaders } =
    modelRequestService.formatRequestBody(req, authenticatedHeaders);

  // this rewrites the base url to the provider's base url and retains the rest
  const upstreamUrl = formatUpstreamUrl(provider, req);

  return await provider.forwardProxyRequest(
    req,
    res,
    formattedHeaders,
    upstreamUrl,
    requestBody
  );
}
