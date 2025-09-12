import type { PrismaClient } from '../generated/prisma';
import { EchoControlService } from '../services/EchoControlService';
import { verifyUserHeaderCheck } from './headers';

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
  headers: Record<string, string>,
  prisma: PrismaClient
): Promise<{
  processedHeaders: Record<string, string>;
  echoControlService: EchoControlService;
}> {
  // Process headers and instantiate provider
  const [processedHeaders, echoControlService] = await verifyUserHeaderCheck(
    headers,
    prisma
  );

  return {
    processedHeaders,
    echoControlService,
  };
}
