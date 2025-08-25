import { verifyUserHeaderCheck } from './headers';
import { extractAppIdFromPath, isRepoSlugAppId, hasAppId } from '../services/PathDataService';
import { EchoControlService } from '../services/EchoControlService';
import { RepoSlugService } from '../services/RepoSlugService';
import { UnauthorizedError } from '../errors/http';
import { PrismaClient } from '../generated/prisma';
import logger from '../logger';

// Shared database instance for repo slug service
const db = new PrismaClient();
const repoSlugService = new RepoSlugService(db);

/**
 * Handles complete authentication flow including path extraction, header verification, and app ID validation.
 *
 * This function:
 * 1. Extracts app ID from the request path if present
 * 2. Verifies user authentication headers
 * 3. Validates that the authenticated user has permission to use the specified app
 *
 * @param path - The request path
 * @param headers - The request headers
 * @returns Object containing processedHeaders, echoControlService, and forwardingPath
 * @throws UnauthorizedError if authentication fails or app ID validation fails
 */
export async function authenticateRequest(
  path: string,
  headers: Record<string, string>
): Promise<{
  processedHeaders: Record<string, string>;
  echoControlService: EchoControlService;
  forwardingPath: string;
}> {
  // Extract app identifier from path if present
  const pathResult = extractAppIdFromPath(path);
  
  // Use the remaining path for provider forwarding, or original path if no app ID found
  const forwardingPath = hasAppId(pathResult) ? pathResult.remainingPath : path;

  // Process headers and instantiate provider
  const [processedHeaders, echoControlService] =
    await verifyUserHeaderCheck(headers);

  // Validate app ID authorization if app identifier is in path
  if (hasAppId(pathResult)) {
    let resolvedAppId: string = pathResult.appId;

    // If we detected a repo slug, resolve it to an app UUID
    if (isRepoSlugAppId(pathResult)) {
      const [owner, repo] = pathResult.appId.split('/');
      logger.debug(`Resolving repo slug ${pathResult.appId} to app UUID`);

      const resolution = await repoSlugService.resolveSlugToAppId(owner, repo);
      
      if (!resolution) {
        logger.warn(`Failed to resolve repo slug ${pathResult.appId}: repo not found or private`);
        throw new UnauthorizedError('Repository not found or not accessible.');
      }

      resolvedAppId = resolution.appId;
      
      if (resolution.wasCreated) {
        logger.info(`Auto-created app ${resolvedAppId} for repository ${pathResult.appId}`);
      } else {
        logger.debug(`Resolved repo slug ${pathResult.appId} to existing app ${resolvedAppId}`);
      }
    }

    // Validate that the authenticated user has permission to use this app
    const authResult = echoControlService.getAuthResult();
    if (!authResult?.echoAppId || authResult.echoAppId !== resolvedAppId) {
      throw new UnauthorizedError('Unauthorized use of this app.');
    }
  }

  return {
    processedHeaders,
    echoControlService,
    forwardingPath,
  };
}
