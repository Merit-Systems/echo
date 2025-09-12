// instrumentation.ts
import { registerOTel, OTLPHttpJsonTraceExporter } from '@vercel/otel';
import { setupLoggerProvider } from './logger';

const SIGNOZ_INGESTION_KEY = process.env.SIGNOZ_INGESTION_KEY;
const OTEL_EXPORTER_OTLP_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.signoz.io';
const SIGNOZ_SERVICE_NAME = process.env.SIGNOZ_SERVICE_NAME || 'echo-control';

export function register() {
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
