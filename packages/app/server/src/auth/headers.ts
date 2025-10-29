import { context, trace } from '@opentelemetry/api';
import { UnauthorizedError } from '../errors/http';
import type { PrismaClient } from '../generated/prisma';
import logger from '../logger';
import { EchoControlService } from '../services/EchoControlService';

export const verifyUserHeaderCheck = async (
  headers: Record<string, string>,
  prisma: PrismaClient
): Promise<[Record<string, string>, EchoControlService]> => {
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
    throw new UnauthorizedError('Please include auth headers.');
  }

  const apiKey = authorization ?? xApiKey ?? xGoogleApiKey;
  const cleanApiKey = apiKey?.replace('Bearer ', '') ?? '';
  const echoControlService = new EchoControlService(prisma, cleanApiKey);
  const authResultResponse = await echoControlService.verifyApiKey();

  if (authResultResponse.isErr() || !authResultResponse.value) {
    throw new UnauthorizedError('Authentication failed.');
  }

  const authResult = authResultResponse.value;

  const span = trace.getSpan(context.active());
  if (span && authResult.echoApp && authResult.user) {
    span.setAttribute('echo.app.id', authResult.echoApp.id);
    span.setAttribute('echo.app.name', authResult.echoApp.name);
    span.setAttribute('echo.user.id', authResult.user.id);
    span.setAttribute('echo.user.email', authResult.user.email);
    span.setAttribute('echo.user.name', authResult.user.name ?? '');
  }

  return [
    {
      ...restHeaders,
      'accept-encoding': 'gzip, deflate',
    },
    echoControlService,
  ];
};
