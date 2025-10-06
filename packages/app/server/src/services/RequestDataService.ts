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

export function extractMaxOutputTokens(req: Request): number {
  // OpenAI Format
  const maxOutputTokens = req.body.max_output_tokens;
  if (maxOutputTokens && maxOutputTokens !== undefined) {
    return maxOutputTokens;
  }
  // Anthropic Format
  const maxTokens = req.body.max_tokens;
  if (maxTokens && maxTokens !== undefined) {
    return maxTokens;
  }

  // Gemini Format
  const geminiMaxOutputTokens = req.body.generationConfig?.maxOutputTokens;
  if (geminiMaxOutputTokens && geminiMaxOutputTokens !== undefined) {
    return geminiMaxOutputTokens;
  }

  return Number(process.env.MAX_OUTPUT_TOKENS) || 4096;
}

export function extractGeminiIsStream(req: Request): boolean {
  const path = req.path;
  return path.endsWith(':streamGenerateContent');
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
