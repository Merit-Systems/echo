import { isX402Request } from 'utils';
import type { PrismaClient } from '../generated/prisma';
import { EchoControlService } from '../services/EchoControlService';
import { verifyUserHeaderCheck } from './headers';
import { 
  AppResultAsync, 
  AuthenticationError, 
  MissingHeaderError, 
  InvalidApiKeyError 
} from '../errors';

/**
 * Handles complete authentication flow including path extraction, header verification, and app ID validation.
 *
 * This function:
 * 1. Extracts app ID from the request path if present
 * 2. Verifies user authentication headers
 * 3. Validates that the authenticated user has permission to use the specified app
 *
 * @param headers - The request headers
 * @param prisma - Prisma client instance
 * @returns ResultAsync containing object with processedHeaders and echoControlService
 */
export function authenticateRequest(
  headers: Record<string, string>,
  prisma: PrismaClient
): AppResultAsync<{
  processedHeaders: Record<string, string>;
  echoControlService: EchoControlService;
}, AuthenticationError | MissingHeaderError | InvalidApiKeyError> {
  return verifyUserHeaderCheck(headers, prisma)
    .map(([processedHeaders, echoControlService]) => ({
      processedHeaders,
      echoControlService,
    }));
}
