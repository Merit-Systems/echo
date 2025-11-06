import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url().optional(),

    // Server
    PORT: z.coerce.number().default(3069),
    NODE_ENV: z
      .enum(['development', 'production', 'staging', "test"])
      .default('development'),

    // Network & Blockchain
    NETWORK: z.string().default('base-sepolia'),
    BASE_RPC_URL: z.string().url().optional(),
    ETH_WARNING_THRESHOLD: z.string().default('0.0001'),

    // Wallet & CDP
    WALLET_OWNER: z.string().optional(),
    CDP_API_KEY_ID: z.string().optional(),
    CDP_API_KEY_SECRET: z.string().optional(),
    CDP_WALLET_SECRET: z.string().optional(),

    // Facilitator URLs
    PROXY_FACILITATOR_URL: z.string().url().optional(),
    COINBASE_FACILITATOR_BASE_URL: z.string().url().optional(),
    COINBASE_FACILITATOR_METHOD_PREFIX: z.string().optional(),
    X402RS_FACILITATOR_BASE_URL: z.string().url().optional(),
    X402RS_FACILITATOR_METHOD_PREFIX: z.string().optional(),
    PAYAI_FACILITATOR_BASE_URL: z.string().url().optional(),
    PAYAI_FACILITATOR_METHOD_PREFIX: z.string().optional(),
    FACILITATOR_REQUEST_TIMEOUT: z.coerce.number().default(20000),

    // API Keys - Providers
    ECHO_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    XAI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    TAVILY_API_KEY: z.string().optional(),
    E2B_API_KEY: z.string().optional(),
    GOOGLE_SERVICE_ACCOUNT_KEY_ENCODED: z.string().optional(),

    // API Keys - Echo
    API_KEY_HASH_SECRET: z.string().default('change-this-in-production-very-secret-key'),
    API_ECHO_ACCESS_JWT_SECRET: z.string().default('api-jwt-secret-change-in-production'),

    // Echo Configuration
    ECHO_MARKUP: z.string().default('1.25'),
    APPLY_ECHO_MARKUP: z.enum(['true', 'false']).default('false'),
    ECHO_ROUTER_BASE_URL: z.string().url().optional(),

    // Google Cloud
    GOOGLE_CLOUD_LOCATION: z.string().default('global'),

    // Contract Addresses
    USDC_ADDRESS: z.string().optional(),
    ETH_ADDRESS: z.string().optional(),

    // OpenTelemetry
    OTEL_SERVICE_NAME: z.string().default('echo-server'),
    OTEL_SERVICE_VERSION: z.string().default('1.0.0'),
    OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: z.string().url().optional(),
    OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z.string().url().optional(),
    SIGNOZ_INGESTION_KEY: z.string().optional(),

    // Request Configuration
    MAX_OUTPUT_TOKENS: z.coerce.number().default(4096),
    MAX_IN_FLIGHT_REQUESTS: z.coerce.number().default(10),
    ESTIMATED_COST_PER_TRANSACTION: z.coerce.number().default(0.01),
    CLEANUP_INTERVAL_MS: z.coerce.number().default(300000),
    REQUEST_TIMEOUT_MS: z.coerce.number().default(300000),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
