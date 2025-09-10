// logger.ts
import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  context,
  trace,
} from '@opentelemetry/api';
import type {
  LogRecord,
  LogRecordProcessor} from '@opentelemetry/sdk-logs';
import {
  LoggerProvider,
  BatchLogRecordProcessor
} from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { logs } from '@opentelemetry/api-logs';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const SIGNOZ_INGESTION_KEY = process.env.SIGNOZ_INGESTION_KEY;
const OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.signoz.io';
const SIGNOZ_SERVICE_NAME = process.env.SIGNOZ_SERVICE_NAME || 'echo-control';
const NODE_ENV = process.env.NODE_ENV || 'development';

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
    const severity = logRecord.severityText || 'INFO';
    const body = logRecord.body;

    // Extract attributes for context
    const attributes = logRecord.attributes;
    const traceId = attributes?.trace_id;
    const spanId = attributes?.span_id;

    // Format the log message
    let message = `[${timestamp}] ${severity}: ${body}`;

    if (traceId && spanId) {
      message += ` [trace_id=${traceId}, span_id=${spanId}]`;
    }

    // Add other attributes if present
    if (attributes) {
      const otherAttrs = Object.entries(attributes)
        .filter(([key]) => !['trace_id', 'span_id'].includes(key))
        .map(([key, value]) => `${key}=${value}`)
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
  const logExporter = new OTLPLogExporter({
    url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
    headers: SIGNOZ_INGESTION_KEY
      ? {
          'signoz-access-token': SIGNOZ_INGESTION_KEY,
        }
      : {},
  });

  const resource = new Resource({
    'service.name': SIGNOZ_SERVICE_NAME,
    'service.environment': NODE_ENV,
  });

  const loggerProvider = new LoggerProvider({ resource });
  const batchProcessor = new BatchLogRecordProcessor(logExporter);

  // Add the OTLP processor with trace context injection
  loggerProvider.addLogRecordProcessor(
    new TraceContextLogProcessor(batchProcessor)
  );

  // Add console processor for local development and debugging
  // You can control this with an environment variable if needed

  loggerProvider.addLogRecordProcessor(
    new TraceContextLogProcessor(new ConsoleLogProcessor())
  );

  logs.setGlobalLoggerProvider(loggerProvider);

  return logs.getLogger(SIGNOZ_SERVICE_NAME); // handy to export directly
}

export const logger = setupLoggerProvider();
