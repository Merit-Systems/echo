/**
 * Utility for extracting app ID from request paths
 */

export interface PathExtractionResult {
  /** The extracted app ID if found, null otherwise */
  appId: string | null;
  /** The remaining path after removing the app ID segment */
  remainingPath: string;
}

/**
 * Extracts an app ID from the beginning of a request path if present.
 *
 * This function looks for a UUID pattern at the start of the path and treats it as an app ID.
 * If found, it returns the app ID and the remaining path with the app ID segment removed.
 *
 * Examples:
 * - `/12345678-1234-1234-1234-123456789012/v1/chat/completions`
 *   → { appId: "12345678-1234-1234-1234-123456789012", remainingPath: "/v1/chat/completions" }
 * - `/v1/chat/completions`
 *   → { appId: null, remainingPath: "/v1/chat/completions" }
 * - `/invalid-uuid/v1/chat/completions`
 *   → { appId: null, remainingPath: "/invalid-uuid/v1/chat/completions" }
 *
 * @param originalPath - The original request path to process
 * @returns Object containing the extracted app ID (if any) and the remaining path
 */
export function extractAppIdFromPath(
  originalPath: string
): PathExtractionResult {
  // Remove leading slash and split by '/'
  const pathSegments = originalPath.replace(/^\//, '').split('/');

  // Check if the first segment looks like a UUID (app ID)
  // UUID pattern: 8-4-4-4-12 characters (hexadecimal with hyphens)
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    pathSegments.length > 0 &&
    pathSegments[0] &&
    uuidPattern.test(pathSegments[0])
  ) {
    const appId = pathSegments[0];
    const remainingPath = '/' + pathSegments.slice(1).join('/');
    return { appId, remainingPath };
  }

  // No app ID found, return original path
  return { appId: null, remainingPath: originalPath };
}

/**
 * Type guard to check if an extracted app ID is present
 *
 * @param result - The result from extractAppIdFromPath
 * @returns True if app ID was extracted, false otherwise
 */
export function hasAppId(
  result: PathExtractionResult
): result is PathExtractionResult & { appId: string } {
  return result.appId !== null;
}
