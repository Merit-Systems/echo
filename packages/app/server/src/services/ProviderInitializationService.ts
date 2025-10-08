import { Request, Response } from 'express';
import { PaymentRequiredError, UnknownModelError } from '../errors/http';
import logger from '../logger';
import { BaseProvider } from '../providers/BaseProvider';
import { GeminiVeoProvider } from '../providers/GeminiVeoProvider';
import { VertexAIProvider } from '../providers/VertexAIProvider';
import { getProvider } from '../providers/ProviderFactory';
import {
  isValidImageModel,
  isValidModel,
  isValidVideoModel,
} from './AccountingService';
import { extractIsStream, extractModelName } from './RequestDataService';
import { OpenAIVideoProvider } from 'providers/OpenAIVideoProvider';
import { buildX402Response, isX402Request, isApiRequest } from 'utils';
import { Decimal } from 'generated/prisma/runtime/library';

/**
 * Detects if the request is a proxy route, and should be forwarded rather
 * than initializing a provider. Returns true if this is a simple proxy route.
 * @param req
 *
 * @returns
 */
export function detectPassthroughProxyRoute(req: Request):
  | {
      provider: BaseProvider;
      model: string;
      isStream: boolean;
    }
  | undefined {
  // Check for Vertex AI proxy routes first
  const vertexAIProxy = VertexAIProvider.detectPassthroughProxy(
    req,
    extractIsStream
  );
  const openAIVideoProxy = OpenAIVideoProvider.detectPassthroughProxy(
    req,
    extractIsStream
  );
  if (openAIVideoProxy) {
    return openAIVideoProxy;
  }
  if (vertexAIProxy) {
    return vertexAIProxy;
  }

  // Then check for Gemini VEO proxy routes
  return GeminiVeoProvider.detectPassthroughProxy(req, extractIsStream);
}

export async function initializeProvider(
  req: Request,
  res: Response
): Promise<{
  provider: BaseProvider;
  model: string;
  isStream: boolean;
  isPassthroughProxyRoute: boolean;
}> {
  const passthroughProxyRoute = detectPassthroughProxyRoute(req);
  if (passthroughProxyRoute)
    return { ...passthroughProxyRoute, isPassthroughProxyRoute: true };

  const model = extractModelName(req);
  if (
    !model ||
    (!isValidModel(model) &&
      !isValidImageModel(model) &&
      !isValidVideoModel(model))
  ) {
    logger.error(`Invalid model: ${model}`);
    // if auth or x402 header, return 422
    if (isApiRequest(req.headers as Record<string, string>) || isX402Request(req.headers as Record<string, string>)) {
      res.status(422).json({
        error: `Invalid model: ${model} Echo does not yet support this model.`,
      });
      throw new UnknownModelError('Invalid model');
    } else {
    await buildX402Response(req, res, new Decimal(0));
    throw new PaymentRequiredError('No Model or Auth method detected, returning 402 Schema');
    }
  }

  // Extract stream flag
  const isStream = extractIsStream(req);

  // Get the appropriate provider
  const provider = getProvider(model, isStream, req.path);

  return {
    provider,
    model,
    isStream,
    isPassthroughProxyRoute: false,
  };
}
