import { Request } from 'express';
/**
 * Utility functions for handling Gemini VEO operations and file IDs
 */

/**
 * Extracts operation ID from operation name patterns like:
 * "models/veo-3.0-fast-generate-001/operations/nl6hlo12axz7"
 * or from URL paths like "/v1beta/models/veo-3.0-generate-001/operations/i7yyoxmbqsib"
 */
export function extractOperationId(operationNameOrPath: string): string {
  const operationMatch = operationNameOrPath.match(/operations\/([^/]+)$/);
  if (operationMatch) {
    return operationMatch[1] || 'unknown';
  }
  // Fallback to the last segment
  return operationNameOrPath.split('/').pop() || 'unknown';
}

/**
 * Extracts file ID from URL paths like:
 * "/v1beta/files/abc123" or "/v1beta/files/abc123:action"
 */
export function extractFileId(path: string): string | null {
  const fileMatch = path.match(/\/files\/([^/:]+)(?::|$)/);
  return fileMatch?.[1] || null;
}

/**
 * Checks if a path is a Gemini streaming endpoint
 */
export function isGeminiStreamingPath(path: string): boolean {
  return path.endsWith(':streamGenerateContent');
}

/**
 * Checks if a path contains an operations endpoint
 */
export function isOperationsPath(path: string): boolean {
  return path.includes('/operations/');
}

/**
 * Checks if a path contains a files endpoint
 */
export function isFilesPath(path: string): boolean {
  return path.includes('/v1beta/files/');
}

export function extractGeminiModelName(req: Request): string | undefined {
  const path = req.path;

  // Expected format: /v1beta/models/{model-name}:streamGenerateContent or /v1beta/models/{model-name}:generateContent
  // OR: /models/{model-name}:streamGenerateContent or /models/{model-name}:generateContent
  // OR: /v1beta1/publishers/google/models/{model-name}:predictLongRunning (Vertex AI format)
  const expectedPrefixes = [
    '/v1beta/models/',
    '/models/',
    '/v1beta1/publishers/google/models/',
    '/v1/publishers/google/models/',
  ];
  const expectedSuffixes = [
    ':streamGenerateContent',
    ':generateContent',
    ':predictLongRunning',
  ];

  // Check if path matches any of the expected prefixes
  const matchingPrefix = expectedPrefixes.find(prefix =>
    path.startsWith(prefix)
  );
  if (!matchingPrefix) {
    return undefined;
  }

  // Find which suffix matches
  const matchingSuffix = expectedSuffixes.find(suffix => path.endsWith(suffix));

  // Handle /operations/* pattern: /v1beta/models/{model-name}/operations/{operation-id}
  if (!matchingSuffix && isOperationsPath(path)) {
    const operationsIndex = path.indexOf('/operations/');
    const modelName = path.slice(matchingPrefix.length, operationsIndex);
    return modelName || undefined;
  }

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
