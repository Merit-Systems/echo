import { env } from './env';

export const WALLET_OWNER = env.WALLET_OWNER || 'echo-fund-owner';
export const WALLET_SMART_ACCOUNT =
  (env.WALLET_OWNER || 'echo-fund-owner') + '-smart-account';

export const DOMAIN_NAME = 'USD Coin';
export const DOMAIN_VERSION = '2';

const USDC_DECIMALS = 6;
export const USDC_MULTIPLIER = 10 ** USDC_DECIMALS;

export const ECHO_DESCRIPTION = 'Echo x402';
export const MIME_TYPE = 'application/json';
export const MAX_TIMEOUT_SECONDS = 1000;
export const DISCOVERABLE = true;

export const X402_TYPE = 'http';
export const X402_SCHEME = 'exact';
export const X402_VERSION = '1';
export const X402_ERROR_MESSAGE = 'Payment Required';
export const X402_PAYMENT_HEADER = 'x-payment';
export const X402_REALM = 'echo';

// Removed unused constants
