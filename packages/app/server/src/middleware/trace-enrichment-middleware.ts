// trace-enrichment-middleware.ts
import { context, trace } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import logger, { requestIdStorage } from '../logger';

// PART 1: Early middleware - runs BEFORE body parsing
// Sets up requestId, span attributes, and AsyncLocalStorage context
export function traceSetupMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();

  // Generate requestId (use X-Request-ID header if provided, otherwise generate new)
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();

  // Store requestId and startTime on request for later use
  (req as any).requestId = requestId;
  (req as any).startTime = startTime;

  // Set response header so client can correlate
  res.setHeader('X-Request-ID', requestId);

  // Set requestId on the span immediately so it's available for the entire trace
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttribute('request.id', requestId);
    span.setAttribute('http.request_id', requestId); // Alternative standard attribute name
  }

  // Store requestId in AsyncLocalStorage so it's available to all logs
  // This wraps the entire request handling in the context
  requestIdStorage.run(requestId, () => {
    next();
  });
}

// PART 2: Late middleware - runs AFTER body parsing
// Logs the request with parsed body and sets up response logging
export function traceLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log inbound request (requestId will be automatically injected by logger format)
  // Avoid logging large bodies (files, images, etc.)
  const contentType = req.headers['content-type'] || '';
  const shouldLogBody =
    contentType.includes('application/json') &&
    JSON.stringify(req.body || {}).length < 10000; // Max 10KB

  logger.info('REQUEST', {
    method: req.method,
    path: req.path,
    contentType,
    contentLength: req.headers['content-length'],
    body: shouldLogBody ? req.body : '[BODY_TOO_LARGE_OR_BINARY]',
  });

  // Set up span enrichment and logging on response finish
  res.on('finish', () => {
    const startTime = (req as any).startTime || Date.now();
    const duration = Date.now() - startTime;

    // Log response (requestId will be automatically injected by logger format)
    logger.info('RESPONSE', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });

    // Enrich OpenTelemetry span on finish
    const span = trace.getSpan(context.active());
    if (!span) return;

    // 🔹 Standard semantic HTTP attributes
    span.setAttribute(SemanticAttributes.HTTP_METHOD, req.method);
    span.setAttribute(
      SemanticAttributes.HTTP_ROUTE,
      req.route?.path || req.path
    );
    span.setAttribute(SemanticAttributes.HTTP_TARGET, req.originalUrl);
    span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, res.statusCode);

    // Mark span status (0=UNSET, 1=OK, 2=ERROR)
    if (res.statusCode >= 500) {
      span.setStatus({ code: 2, message: `HTTP ${res.statusCode}` });
    } else {
      span.setStatus({ code: 1 });
    }
  });

  next();
}

// Backward compatibility export (uses both parts)
export function traceEnrichmentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  traceSetupMiddleware(req, res, () => {
    traceLoggingMiddleware(req, res, next);
  });
}
