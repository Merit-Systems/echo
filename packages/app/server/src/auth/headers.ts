import { context, trace } from '@opentelemetry/api';
import { ResultAsync } from 'neverthrow';
import { 
  AuthenticationError, 
  MissingHeaderError,
  InvalidApiKeyError 
} from '../errors';
import { AppResultAsync } from '../errors/result-helpers';
import type { PrismaClient } from '../generated/prisma';
import logger from '../logger';
import { EchoControlService } from '../services/EchoControlService';

/**
 * Processes authentication headers and returns processed headers with EchoControlService
 * 
 * @param headers - Request headers
 * @param prisma - Prisma client instance
 * @returns ResultAsync containing tuple of processed headers and EchoControlService
 */
export const verifyUserHeaderCheck = (
  headers: Record<string, string>,
  prisma: PrismaClient
): AppResultAsync<[Record<string, string>, EchoControlService], AuthenticationError | MissingHeaderError | InvalidApiKeyError> => {
  /**
   * Process authentication for the user (authenticated with Echo Api Key)
   *
   * We have to handle two cases:
   * 1. Authentication: Bearer Token
   * 2. x-api-key
   *
   * This is because the Anthropic Native API uses x-api-key, but the OpenAI API format uses Bearer Token
   *
   * We also swap problematic headers for the request (this is vibes IDK how much of this is needed).
   * Some of the removal of headers is absolutely necessary.
   *
   * @returns [processedHeaders, echoControlService]
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    host: _host,
    authorization,
    'content-encoding': _contentEncoding,
    'content-length': _contentLength,
    'transfer-encoding': _transferEncoding,
    connection: _connection,
    'x-api-key': xApiKey,
    'x-goog-api-key': xGoogleApiKey,
    'x-payment': xPayment,
    ...restHeaders
  } = headers;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  if (!(authorization || xApiKey || xGoogleApiKey)) {
    logger.error(`Missing authentication headers: ${JSON.stringify(headers)}`);
    return ResultAsync.fromPromise(
      Promise.reject(new MissingHeaderError('authentication', 'Please include auth headers.')),
      (e) => e as MissingHeaderError
    );
  }

  const apiKey = authorization ?? xApiKey ?? xGoogleApiKey;
  const cleanApiKey = apiKey?.replace('Bearer ', '') ?? '';
  
  const echoControlService = new EchoControlService(prisma, cleanApiKey);
  
  return ResultAsync.fromPromise(
    echoControlService.verifyApiKey(),
    (e) => new InvalidApiKeyError({ apiKey: cleanApiKey.substring(0, 8) + '...' })
  )
    .andThen((authResult) => {
      if (!authResult) {
        logger.error('API key validation returned null');
        return ResultAsync.fromPromise(
          Promise.reject(new InvalidApiKeyError({ apiKey: cleanApiKey.substring(0, 8) + '...' })),
          (e) => e as InvalidApiKeyError
        );
      }

      const span = trace.getSpan(context.active());
      if (span) {
        span.setAttribute('echo.app.id', authResult.echoApp.id);
        span.setAttribute('echo.app.name', authResult.echoApp.name);
        span.setAttribute('echo.user.id', authResult.user.id);
        span.setAttribute('echo.user.email', authResult.user.email);
        span.setAttribute('echo.user.name', authResult.user.name ?? '');
      }

      const processedHeaders = {
        ...restHeaders,
        'accept-encoding': 'gzip, deflate',
      };

      return ResultAsync.fromPromise(
        Promise.resolve([processedHeaders, echoControlService] as [Record<string, string>, EchoControlService]),
        (e) => new AuthenticationError('Failed to create auth result')
      );
    });
};
