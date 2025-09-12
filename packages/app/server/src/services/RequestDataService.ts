import { Request } from 'express';

export function extractGeminiModelName(req: Request): string | undefined {
  const path = req.path;

  // Expected format: /v1beta/models/{model-name}:streamGenerateContent or /v1beta/models/{model-name}:generateContent
  // OR: /models/{model-name}:streamGenerateContent or /models/{model-name}:generateContent
  const expectedPrefixes = ['/v1beta/models/', '/models/'];
  const expectedSuffixes = [':streamGenerateContent', ':generateContent'];

  // Check if path matches any of the expected prefixes
  const matchingPrefix = expectedPrefixes.find(prefix =>
    path.startsWith(prefix)
  );
  if (!matchingPrefix) {
    return undefined;
  }

  // Find which suffix matches
  const matchingSuffix = expectedSuffixes.find(suffix => path.endsWith(suffix));
  if (!matchingSuffix) {
    return undefined;
  }

  // Extract the model name from between the prefix and suffix
  const modelName = path.slice(
    matchingPrefix.length,
    path.length - matchingSuffix.length
  );
  // Ensure the model name is not empty
  if (!modelName) {
    return undefined;
  }

  return modelName;
}

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

export function extractGeminiIsStream(req: Request): boolean {
  const path = req.path;
  return path.endsWith(':streamGenerateContent');
}

export function extractIsStream(req: Request): boolean {
  const stream = req.body.stream;

  if (stream && stream !== undefined) {
    return stream;
  }

  if (extractGeminiIsStream(req)) {
    return true;
  }

  return false;
}
