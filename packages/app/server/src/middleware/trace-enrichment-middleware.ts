// trace-enrichment-middleware.ts
import { context, trace } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { Request, Response, NextFunction } from 'express';

// This middleware enriches every request span
export function traceEnrichmentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set up span enrichment on response finish
  res.on('finish', () => {
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
