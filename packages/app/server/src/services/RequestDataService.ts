import { Request } from 'express';
import { BaseProvider } from '../providers/BaseProvider';
import {
  isGeminiStreamingPath,
  extractGeminiModelName,
} from '../utils/gemini/string-parsing.js';

export function extractModelName(req: Request): string | undefined {
  const model = req.body.model;

  if (model && model !== undefined) {
    return model;
  }

  const modelFromPath = extractGeminiModelName(req);

  if (modelFromPath && modelFromPath !== undefined) {
    return modelFromPath;
  }

  return undefined;
}

export function extractIsStream(req: Request): boolean {
  const stream = req.body.stream;

  if (stream && stream !== undefined) {
    return stream;
  }

  if (isGeminiStreamingPath(req.path)) {
    return true;
  }

  return false;
}

export function formatUpstreamUrl(
  provider: BaseProvider,
  req: Request
): string {
  return provider.formatUpstreamUrl(req);
}
