import { createEnv } from '@t3-oss/env-nextjs'; // or core package
import { z } from 'zod';

const IS_VERCEL_PRODUCTION = ['production', 'staging'].includes(
  process.env.VERCEL_ENV ?? ''
);

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST_MODE === 'true';
const SKIP_ENV_VALIDATION = Boolean(process.env.SKIP_ENV_VALIDATION);
const IS_STRICT = IS_VERCEL_PRODUCTION && !IS_INTEGRATION_TEST;

export const env = createEnv({
  skipValidation: SKIP_ENV_VALIDATION,
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    // api keys

    API_KEY_PREFIX: z.string().default('echo_'),
    API_KEY_HASH_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('change-this-in-production-very-secret-key'),
    API_ECHO_ACCESS_JWT_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('api-jwt-secret-change-in-production'),

    // database

    DATABASE_URL: IS_STRICT
      ? z.url()
      : z
          .url()
          .default(
            'postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public'
          ),

    // auth

    AUTH_SECRET: z.string(),

    AUTH_GOOGLE_ID: IS_STRICT
      ? z.string()
      : z.string().default('get-a-google-id-for-production'),
    AUTH_GOOGLE_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('auth-google-secret-change-in-production'),

    AUTH_GITHUB_ID: IS_STRICT
      ? z.string()
      : z.string().default('get-a-github-id-for-production'),
    AUTH_GITHUB_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('auth-github-secret-change-in-production'),

    // email

    AUTH_RESEND_KEY: IS_STRICT ? z.string() : z.string().optional(),
    AUTH_RESEND_FROM_EMAIL: IS_STRICT ? z.email() : z.string().optional(),
    RESEND_FLOW_CONTROL_KEY: IS_STRICT ? z.string() : z.string().optional(),

    // stripe

    STRIPE_SECRET_KEY: IS_STRICT ? z.string() : z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: IS_STRICT ? z.string() : z.string().optional(),
    STRIPE_WEBHOOK_SECRET: IS_STRICT ? z.string() : z.string().optional(),
    WEBHOOK_URL: IS_STRICT
      ? z.url()
      : z.url().default('http://localhost:3000/stripe/webhook'),

    // telemetry

    SIGNOZ_INGESTION_KEY: IS_STRICT
      ? z.string()
      : z.string().default('signoz-ingestion-key-change-in-production'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url().default('https://ingest.signoz.io'),
    SIGNOZ_SERVICE_NAME: z.string().default('echo-control'),

    // blob storage

    BLOB_READ_WRITE_TOKEN: IS_VERCEL_PRODUCTION
      ? z.string()
      : z.string().default('you wont be able to upload files without this'),

    // x402

    NETWORK: z.string().default('base'),
    RESOURCE_WALLET_ADDRESS: IS_VERCEL_PRODUCTION
      ? z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
          message: 'RESOURCE_WALLET_ADDRESS must be a valid Ethereum address',
        })
      : z.string().default('0x1234567890123456789012345678901234567890'),

    // github

    GITHUB_TOKEN: IS_STRICT
      ? z.string()
      : z.string().default('github-token-change-in-production'),

    // free tier

    LATEST_FREE_TIER_CREDITS_ISSUANCE_AMOUNT: IS_STRICT
      ? z.coerce.number().positive()
      : z.coerce.number().positive().default(1),
    LATEST_FREE_TIER_CREDITS_ISSUANCE_VERSION: IS_STRICT
      ? z.coerce.number().positive()
      : z.coerce.number().positive().default(1),
    LATEST_TERMS_AND_SERVICES_VERSION: IS_STRICT
      ? z.coerce.number().positive()
      : z.coerce.number().positive().default(1),
    LATEST_PRIVACY_POLICY_VERSION: IS_STRICT
      ? z.coerce.number().positive()
      : z.coerce.number().positive().default(1),

    // node environment

    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // oauth

    OAUTH_CODE_SIGNING_JWT_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('your-secret-key-change-in-production'),
    OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS: z.coerce.number().positive().default(1),
    OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS: z.coerce.number().positive().default(1),
    OAUTH_REFRESH_TOKEN_ARCHIVE_GRACE_MS: z.coerce
      .number()
      .positive()
      .default(
        process.env.NODE_ENV === 'test' ||
          process.env.INTEGRATION_TEST_MODE === 'true'
          ? 0
          : 2 * 60 * 1000
      ),

    // integration tests

    INTEGRATION_TEST_MODE: z.coerce.boolean().default(false),

    // merit

    MERIT_API_KEY: IS_STRICT ? z.string() : z.string().default('abc123'),
    MERIT_BASE_URL: IS_STRICT
      ? z.url()
      : z.url().default('http://localhost:5174'),
    MERIT_CHECKOUT_URL: IS_STRICT
      ? z.url()
      : z.url().default('http://localhost:5174/pay'),
    MERIT_SENDER_GITHUB_ID: IS_STRICT
      ? z.coerce.number()
      : z.coerce.number().default(1),
    MERIT_CONTRACT_ADDRESS: IS_STRICT
      ? z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
          message: 'MERIT_CONTRACT_ADDRESS must be a valid Ethereum address',
        })
      : z.string().default('0x1234567890123456789012345678901234567890'),
    MERIT_REPO_ID: IS_STRICT ? z.string() : z.string().default('1'),

    // coinbase cdp

    CDP_API_KEY_ID: IS_STRICT
      ? z.string()
      : z.string().default('cdp-api-key-id'),
    CDP_API_KEY_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('cdp-api-key-secret'),
    CDP_WALLET_SECRET: IS_STRICT
      ? z.string()
      : z.string().default('cdp-wallet-secret'),
    WALLET_OWNER: IS_STRICT ? z.string() : z.string().default('wallet-owner'),
    BASE_RPC_URL: IS_STRICT ? z.string().url() : z.string().url().optional(),

    // crypto addresses

    USDC_ADDRESS: IS_STRICT
      ? z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
          message: 'USDC_ADDRESS must be a valid Ethereum address',
        })
      : z.string().default('0x1234567890123456789012345678901234567890'),
    ETH_ADDRESS: IS_STRICT
      ? z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
          message: 'ETH_ADDRESS must be a valid Ethereum address',
        })
      : z.string().default('0x1234567890123456789012345678901234567890'),
    ECHO_PAYOUTS_ADDRESS: IS_STRICT
      ? z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
          message: 'ECHO_PAYOUTS_ADDRESS must be a valid Ethereum address',
        })
      : z.string().default('0x1234567890123456789012345678901234567890'),

    // qstash

    QSTASH_TOKEN: IS_STRICT ? z.string() : z.string().default('qstash-token'),
    QSTASH_CURRENT_SIGNING_KEY: IS_STRICT
      ? z.string()
      : z.string().default('qstash-signing-key-1'),
    QSTASH_NEXT_SIGNING_KEY: IS_STRICT
      ? z.string()
      : z.string().default('qstash-signing-key-2'),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
    NEXT_PUBLIC_POSTHOG_KEY: IS_STRICT ? z.string() : z.string().optional(),
    NEXT_PUBLIC_NODE_ENV: z.string().default('development'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : (process.env.ECHO_CONTROL_URL ?? 'http://localhost:3000'),
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
