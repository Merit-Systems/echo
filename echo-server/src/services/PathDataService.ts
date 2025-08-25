/**
 * Utility for extracting app ID from request paths
 */

export interface PathExtractionResult {
  /** The extracted app ID if found, null otherwise */
  appId: string | null;
  /** The remaining path after removing the app ID segment */
  remainingPath: string;
  /** The type of app identifier detected */
  appIdType: 'uuid' | 'repo-slug' | null;
}

/**
 * Extracts an app ID from the beginning of a request path if present.
 *
 * This function looks for either a UUID pattern or owner/repo pattern at the start of the path.
 * UUID patterns take precedence over owner/repo patterns for collision resolution.
 * If found, it returns the app ID and the remaining path with the app ID segment removed.
 *
 * Examples:
 * - `/12345678-1234-1234-1234-123456789012/v1/chat/completions`
 *   → { appId: "12345678-1234-1234-1234-123456789012", remainingPath: "/v1/chat/completions", appIdType: "uuid" }
 * - `/facebook/react/v1/chat/completions`
 *   → { appId: "facebook/react", remainingPath: "/v1/chat/completions", appIdType: "repo-slug" }
 * - `/v1/chat/completions`
 *   → { appId: null, remainingPath: "/v1/chat/completions", appIdType: null }
 * - `/invalid-path/v1/chat/completions`
 *   → { appId: null, remainingPath: "/invalid-path/v1/chat/completions", appIdType: null }
 *
 * @param originalPath - The original request path to process
 * @returns Object containing the extracted app ID (if any), the remaining path, and the app ID type
 */
export function extractAppIdFromPath(
  originalPath: string
): PathExtractionResult {
  // Remove leading slash and split by '/'
  const pathSegments = originalPath.replace(/^\//, '').split('/');

  if (pathSegments.length === 0 || !pathSegments[0]) {
    return { appId: null, remainingPath: originalPath, appIdType: null };
  }

  // Check if the first segment looks like a UUID (app ID)
  // UUID pattern: 8-4-4-4-12 characters (hexadecimal with hyphens)
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidPattern.test(pathSegments[0])) {
    const appId = pathSegments[0];
    const remainingPath = '/' + pathSegments.slice(1).join('/');
    return { appId, remainingPath, appIdType: 'uuid' };
  }

  // Check if we have at least two segments for owner/repo pattern
  if (pathSegments.length >= 2) {
    const owner = pathSegments[0];
    const repo = pathSegments[1];

    // Validate owner/repo format (GitHub username/repository name rules)
    // - Both owner and repo must be valid GitHub identifiers
    // - Allow alphanumeric, hyphens, underscores, but not starting/ending with hyphen
    // - Be more conservative to avoid false positives with common API paths
    const githubIdentifierPattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
    
    // Exclude common API path patterns that might look like repo slugs
    const commonApiPatterns = /^(v\d+|api|health|status|docs|swagger)$/i;
    
    if (
      githubIdentifierPattern.test(owner) && 
      githubIdentifierPattern.test(repo) &&
      owner.length >= 1 && owner.length <= 39 &&
      repo.length >= 1 && repo.length <= 100 &&
      !commonApiPatterns.test(owner) &&
      !commonApiPatterns.test(repo) &&
      // Ensure owner/repo don't look like UUIDs or other technical identifiers
      !/^[0-9a-f-]{8,}$/i.test(owner) &&
      !/^[0-9a-f-]{8,}$/i.test(repo)
    ) {
      const appId = `${owner}/${repo}`;
      const remainingPath = '/' + pathSegments.slice(2).join('/');
      return { appId, remainingPath, appIdType: 'repo-slug' };
    }
  }

  // No valid app ID found, return original path
  return { appId: null, remainingPath: originalPath, appIdType: null };
}

/**
 * Type guard to check if an extracted app ID is present
 *
 * @param result - The result from extractAppIdFromPath
 * @returns True if app ID was extracted, false otherwise
 */
export function hasAppId(
  result: PathExtractionResult
): result is PathExtractionResult & { appId: string; appIdType: 'uuid' | 'repo-slug' } {
  return result.appId !== null && result.appIdType !== null;
}

/**
 * Type guard to check if the extracted app ID is a UUID
 *
 * @param result - The result from extractAppIdFromPath
 * @returns True if app ID is a UUID, false otherwise
 */
export function isUuidAppId(
  result: PathExtractionResult
): result is PathExtractionResult & { appId: string; appIdType: 'uuid' } {
  return result.appIdType === 'uuid';
}

/**
 * Type guard to check if the extracted app ID is a repo slug
 *
 * @param result - The result from extractAppIdFromPath
 * @returns True if app ID is a repo slug, false otherwise
 */
export function isRepoSlugAppId(
  result: PathExtractionResult
): result is PathExtractionResult & { appId: string; appIdType: 'repo-slug' } {
  return result.appIdType === 'repo-slug';
}
