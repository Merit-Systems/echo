import { context, metrics, trace } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import { AsyncLocalStorage } from 'async_hooks';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// AsyncLocalStorage for storing requestId across async operations
export const requestIdStorage = new AsyncLocalStorage<string>();

const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME!;
const OTEL_SERVICE_VERSION = process.env.OTEL_SERVICE_VERSION!;
const NODE_ENV = process.env.NODE_ENV!;
const OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT!;
const SIGNOZ_INGESTION_KEY = process.env.SIGNOZ_INGESTION_KEY!;
const OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT!;

const resource = resourceFromAttributes({
  'service.name': OTEL_SERVICE_NAME,
  'service.version': OTEL_SERVICE_VERSION,
  'deployment.environment': NODE_ENV,
});

// Initialize the Logger provider
const loggerProvider = new LoggerProvider({
  resource: resource,
});

const otlpExporter = new OTLPLogExporter({
  url: OTEL_EXPORTER_OTLP_ENDPOINT,
  headers: {
    'signoz-access-token': SIGNOZ_INGESTION_KEY,
  },
});

// Add processor with the OTLP exporter
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(otlpExporter)
);

// Register the logger provider
logs.setGlobalLoggerProvider(loggerProvider);

// Custom Winston format to inject traceId/spanId/requestId
const traceContextFormat = winston.format(info => {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    info.traceId = spanContext.traceId;
    info.spanId = spanContext.spanId;
  }

  // Inject requestId from AsyncLocalStorage
  const requestId = requestIdStorage.getStore();
  if (requestId) {
    info.requestId = requestId;
  }

  return info;
});

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    traceContextFormat(), // 👈 injects traceId/spanId into each log
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.json()
  ),
  defaultMeta: {
    service: OTEL_SERVICE_NAME,
    environment: NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    new OpenTelemetryTransportV3(),
  ],
});

// -------------------------
// 🔹 METRICS SETUP
// -------------------------

const metricExporter = new OTLPMetricExporter({
  url: OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
  headers: {
    'signoz-access-token': SIGNOZ_INGESTION_KEY,
  },
});

const meterProvider = new MeterProvider({
  resource: resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000, // optional, defaults to 60s
    }),
  ],
});

// Register the meter provider globally
metrics.setGlobalMeterProvider(meterProvider);

const meter = meterProvider.getMeter(OTEL_SERVICE_NAME);

// Cache for counters
const counters: Record<string, ReturnType<typeof meter.createCounter>> = {};

// Custom metric function
export const logMetric = (
  metricName: string,
  value: number = 1,
  attributes?: Record<string, string | number | boolean>
) => {
  if (!counters[metricName]) {
    logger.info(`Creating counter for ${metricName}`);
    counters[metricName] = meter.createCounter(metricName, {
      description: `${metricName} counter`,
    });
  }

  counters[metricName].add(value, attributes);
};

export default logger;
