// logger.ts
import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  context,
  trace,
} from '@opentelemetry/api';
import type { LogRecord, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { logs } from '@opentelemetry/api-logs';
import { env } from './env';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const SIGNOZ_INGESTION_KEY = env.SIGNOZ_INGESTION_KEY;
const OTEL_EXPORTER_OTLP_ENDPOINT = env.OTEL_EXPORTER_OTLP_ENDPOINT;
const SIGNOZ_SERVICE_NAME = env.SIGNOZ_SERVICE_NAME;
const NODE_ENV = env.NODE_ENV;

// --- Custom processor to inject trace/span IDs ---
class TraceContextLogProcessor implements LogRecordProcessor {
  private _processor: LogRecordProcessor;

  constructor(innerProcessor: LogRecordProcessor) {
    this._processor = innerProcessor;
  }

  onEmit(logRecord: LogRecord): void {
    const span = trace.getSpan(context.active());
    const spanContext = span?.spanContext();

    if (spanContext) {
      logRecord.setAttribute('trace_id', spanContext.traceId);
      logRecord.setAttribute('span_id', spanContext.spanId);
    }

    this._processor.onEmit(logRecord);
  }

  forceFlush() {
    return this._processor.forceFlush();
  }

  shutdown() {
    return this._processor.shutdown();
  }
}

// --- Console processor for local development ---
class ConsoleLogProcessor implements LogRecordProcessor {
  onEmit(logRecord: LogRecord): void {
    // Convert HrTime to milliseconds for Date constructor
    let timestampMs: number;
    if (logRecord.hrTime) {
      // HrTime[0] is seconds since Unix epoch, HrTime[1] is nanoseconds
      // Convert to milliseconds: seconds * 1000 + nanoseconds / 1000000
      timestampMs =
        logRecord.hrTime[0] * 1000 + Math.floor(logRecord.hrTime[1] / 1000000);
    } else {
      timestampMs = Date.now();
    }

    const timestamp = new Date(timestampMs).toISOString();
    const severity = logRecord.severityText ?? 'INFO';
    const body = logRecord.body;

    // Extract attributes for context
    const attributes = logRecord.attributes;
    const traceId = attributes?.trace_id as string;
    const spanId = attributes?.span_id as string;

    // Format the log message
    let message = `[${timestamp}] ${severity}: ${typeof body === 'string' ? body : JSON.stringify(body)}`;

    if (traceId && spanId) {
      message += ` [trace_id=${traceId}, span_id=${spanId}]`;
    }

    // Add other attributes if present
    if (attributes) {
      const otherAttrs = Object.entries(attributes)
        .filter(([key]) => !['trace_id', 'span_id'].includes(key))
        .map(
          ([key, value]) =>
            `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`
        )
        .join(', ');

      if (otherAttrs) {
        message += ` {${otherAttrs}}`;
      }
    }

    // Use appropriate console method based on severity
    switch (severity?.toUpperCase()) {
      case 'ERROR':
      case 'FATAL':
        console.error(message);
        break;
      case 'WARN':
        console.warn(message);
        break;
      case 'DEBUG':
        console.debug(message);
        break;
      default:
        console.log(message);
    }
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

// --- Setup function ---
export function setupLoggerProvider() {
  // Check if telemetry config is properly set
  const isTelemetryConfigured =
    OTEL_EXPORTER_OTLP_ENDPOINT &&
    OTEL_EXPORTER_OTLP_ENDPOINT !== 'undefined' &&
    SIGNOZ_SERVICE_NAME &&
    SIGNOZ_SERVICE_NAME !== 'undefined';

  const resource = new Resource({
    'service.name': SIGNOZ_SERVICE_NAME || 'echo-control-local',
    'service.environment': NODE_ENV,
  });

  const loggerProvider = new LoggerProvider({ resource });

  // Only set up OTLP exporter if telemetry is properly configured
  if (isTelemetryConfigured) {
    const logExporter = new OTLPLogExporter({
      url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
      headers: SIGNOZ_INGESTION_KEY
        ? {
            'signoz-access-token': SIGNOZ_INGESTION_KEY,
          }
        : {},
    });

    const batchProcessor = new BatchLogRecordProcessor(logExporter);

    // Add the OTLP processor with trace context injection
    loggerProvider.addLogRecordProcessor(
      new TraceContextLogProcessor(batchProcessor)
    );
  }

  // Always add console processor for local development and debugging
  loggerProvider.addLogRecordProcessor(
    new TraceContextLogProcessor(new ConsoleLogProcessor())
  );

  logs.setGlobalLoggerProvider(loggerProvider);

  return logs.getLogger(SIGNOZ_SERVICE_NAME || 'echo-control-local');
}

export const logger = setupLoggerProvider();
