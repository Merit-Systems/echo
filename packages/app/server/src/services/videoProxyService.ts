import { HttpError } from 'errors/http';
import { Request, Response } from 'express';
import logger from 'logger';
import { extractIsStream, formatUpstreamUrl } from './RequestDataService';
import { getProvider } from 'providers/ProviderFactory';
import { EchoControlService } from './EchoControlService';
import { Transaction } from 'types';
import { Decimal } from '@prisma/client/runtime/library';

export async function checkProxyVideoDownload(
  req: Request,
  res: Response,
  echoControlService: EchoControlService,
  processedHeaders: Record<string, string>,
  formatRequestBody: (
    req: Request,
    authenticatedHeaders: Record<string, string>
  ) => {
    requestBody: string | FormData | undefined;
    headers: Record<string, string>;
  }
): Promise<
  false | { transaction: Transaction; isStream: boolean; data: unknown }
> {
  const passThroughPrefixes = ['/v1beta/files'];

  if (!passThroughPrefixes.find(prefix => req.path.startsWith(prefix))) {
    return false;
  }

  const requestId = req.path.match(/\/files\/([^/:]+)(?::|$)/)?.[1] ?? null;
  if (!requestId) {
    return false;
  }

  // This will always be veo-3.0-generate-001 because we only support veo-3.0-generate-001 for video generation
  const model = 'veo-3.0-generate-001';

  const isStream = extractIsStream(req);

  // Get the appropriate provider
  const provider = getProvider(model, echoControlService, isStream, req.path);

  // Format authentication headers
  const authenticatedHeaders = provider.formatAuthHeaders(processedHeaders);

  logger.info(
    `New outbound request for video proxy: ${req.method} ${provider.getBaseUrl(req.path)}${req.path}`
  );

  // Ensure stream usage is set correctly (OpenAI Format)
  req.body = provider.ensureStreamUsage(req.body, req.path);

  // Format request body and headers based on content type
  const { requestBody, headers: formattedHeaders } = formatRequestBody(
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
    throw new HttpError(
      response.status,
      `${response.status} ${response.statusText}`
    );
  }

  if (response.headers.get('content-type') !== 'video/mp4') {
    throw new HttpError(400, 'Invalid content type');
  }

  // Forward important headers
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  if (contentType) res.setHeader('Content-Type', contentType);
  if (contentLength) res.setHeader('Content-Length', contentLength);
  // Pipe the body
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } else {
    res.status(500).send('No body in upstream response');
  }
  return {
    transaction: {
      metadata: {
        model: model,
        providerId: `download-${requestId}`,
        provider: provider.getType(),
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      rawTransactionCost: new Decimal(0),
      status: 'success',
    },
    isStream: false,
    data: null,
  };
}
