// instrumentation.ts
import { registerOTel, OTLPHttpJsonTraceExporter } from '@vercel/otel';
import { setupLoggerProvider } from './logger';
import { env } from './env';

const SIGNOZ_INGESTION_KEY = env.SIGNOZ_INGESTION_KEY;
const OTEL_EXPORTER_OTLP_ENDPOINT = env.OTEL_EXPORTER_OTLP_ENDPOINT;
const SIGNOZ_SERVICE_NAME = env.SIGNOZ_SERVICE_NAME;

// Check if telemetry config is properly set
const isTelemetryConfigured =
  OTEL_EXPORTER_OTLP_ENDPOINT &&
  OTEL_EXPORTER_OTLP_ENDPOINT !== 'undefined' &&
  SIGNOZ_SERVICE_NAME &&
  SIGNOZ_SERVICE_NAME !== 'undefined';

export function register() {
  // Skip telemetry setup if config is missing or invalid
  if (!isTelemetryConfigured) {
    console.log('[Instrumentation] Skipping telemetry setup (config missing)');
    return;
  }

  // --- Traces ---
  registerOTel({
    serviceName: SIGNOZ_SERVICE_NAME,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
      headers: SIGNOZ_INGESTION_KEY
        ? {
            'signoz-access-token': SIGNOZ_INGESTION_KEY,
          }
        : {},
    }),
  });

  // --- Logs ---
  setupLoggerProvider();
}
