import { USDC_ADDRESS } from "services/fund-repo/constants";
import { base, baseSepolia } from "viem/chains";
import { Address } from "viem";

export const WALLET_OWNER = process.env.WALLET_OWNER
  ? `${process.env.WALLET_OWNER}`
  : 'echo-fund-owner';
export const WALLET_SMART_ACCOUNT = process.env.WALLET_OWNER + '-smart-account';

export const DOMAIN_NAME = 'USD Coin';
export const DOMAIN_VERSION = '2';

export const TRANSFER_WITH_AUTHORIZATION_NAME = 'TransferWithAuthorization';
export const TRANSFER_WITH_AUTHORIZATION_TYPE = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

export const USDC_DECIMALS = 6;
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



// Chain IDs
const BASE_CHAIN_ID = 8453;
const BASE_SEPOLIA_CHAIN_ID = 84532;
const AVALANCHE_FUJI_CHAIN_ID = 43113;
const AVALANCHE_CHAIN_ID = 43114;
const POLYGON_CHAIN_ID = 137;
const POLYGON_AMOY_CHAIN_ID = 80002;

export const NETWORK_TO_CHAIN_ID: Record<string, number> = {
  'base': BASE_CHAIN_ID,
  'base-sepolia': BASE_SEPOLIA_CHAIN_ID,
  'avalanche-fuji': AVALANCHE_FUJI_CHAIN_ID,
  'avalanche': AVALANCHE_CHAIN_ID,
  'polygon': POLYGON_CHAIN_ID,
  'polygon-amoy': POLYGON_AMOY_CHAIN_ID,
};

export const NETWORK_TO_CHAIN = {
  'base': base,
  'base-sepolia': baseSepolia,
};

export const USDC_ADDRESS_BY_NETWORK: Record<string, Address> = {
  'base': USDC_ADDRESS,
};