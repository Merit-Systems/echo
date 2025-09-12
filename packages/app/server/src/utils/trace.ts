import { context, trace } from '@opentelemetry/api';
import { v4 as uuidv4 } from 'uuid';
/**
 * Get the current request ID from OpenTelemetry trace context
 * @returns The trace ID as request ID for correlation
 * @returns A random UUID if no trace context is available
 *
 * This function should never throw an error, and should always return a valid request ID.
 * If OpenTelemetry is initialized, we will use the trace ID.
 * If OpenTelemetry is not initialized, we will use a random UUID.
 * In production environments, Otel will always be initialized.
 */
export function getRequestId(): string {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    return spanContext.traceId;
  }
  return uuidv4();
}
