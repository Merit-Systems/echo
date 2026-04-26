import { Request } from 'express';
import { BaseProvider } from '../providers/BaseProvider';
import {
  extractGeminiModelName,
  isGeminiStreamingPath,
} from '../utils/gemini/string-parsing';
import { env } from '../env';

export function extractModelName(req: Request): string | undefined {
  const model = req.body.model;

  if (model && model !== undefined) {
    return model;
  }

  const gatewayModel = req.headers['ai-language-model-id'];
  if (typeof gatewayModel === 'string' && gatewayModel.length > 0) {
    return gatewayModel;
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
  // AI SDK Gateway protocol
  const aiSdkMaxOutputTokens = req.body.maxOutputTokens;
  if (aiSdkMaxOutputTokens && aiSdkMaxOutputTokens !== undefined) {
    return aiSdkMaxOutputTokens;
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

  return Number(env.MAX_OUTPUT_TOKENS) || 4096;
}

function extractGeminiIsStream(req: Request): boolean {
  const path = req.path;
  return path.endsWith(':streamGenerateContent');
}

export function extractIsStream(req: Request): boolean {
  const stream = req.body.stream;

  if (stream && stream !== undefined) {
    return stream;
  }

  const aiSdkGatewayStream = req.headers['ai-language-model-streaming'];
  if (typeof aiSdkGatewayStream === 'string') {
    return aiSdkGatewayStream === 'true';
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
