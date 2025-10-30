import { Decimal } from '@prisma/client/runtime/library';
import { EscrowRequest } from 'middleware/transaction-escrow-middleware';
import { EchoControlService } from 'services/EchoControlService';
import { Response } from 'express';
import { BaseProvider } from 'providers/BaseProvider';
import { Hex } from 'viem';
import { X402AuthenticationService } from 'services/x402AuthenticationService';
import { EnumTransactionType } from 'generated/prisma';

export interface EchoApp {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  totalTokens?: number;
  totalCost?: number;
  apiKeys?: ApiKey[];
  _count?: {
    apiKeys: number;
    llmTransactions: number;
  };
}

export interface ApiKey {
  id: string;
  key: string;
  name?: string;
  isActive: boolean;
  lastUsed?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
  echoAppId: string;
  echoApp?: EchoApp;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  totalPaid?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  totalPaid: number;
  totalSpent: number;
  balance: number;
}

export interface TransactionMetadata {
  providerId: string;
  provider: string;
  model: string;
}

export interface LlmTransactionMetadata extends TransactionMetadata {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  prompt?: string;
  response?: string;
  toolCost?: Decimal;
}

export interface VeoTransactionMetadata extends TransactionMetadata {
  durationSeconds: number;
  generateAudio: boolean;
}

export interface Transaction {
  metadata: LlmTransactionMetadata | VeoTransactionMetadata;
  rawTransactionCost: Decimal;
  status: string;
}

export interface TransactionRequest extends Transaction {
  totalCost: Decimal;
  appProfit: Decimal;
  markUpProfit: Decimal;
  referralProfit: Decimal;
  echoProfit: Decimal;
  userId?: string;
  echoAppId?: string;
  apiKeyId?: string;
  markUpId?: string;
  spendPoolId?: string;
  referralCodeId?: string;
  referrerRewardId?: string;
  transactionType?: EnumTransactionType;
}

export interface ApiKeyValidationResult {
  userId: string;
  echoAppId: string;
  user: User;
  echoApp: EchoApp;
  apiKeyId?: string;
  apiKey?: ApiKey;
}

export interface X402AuthenticationResult {
  echoApp: EchoApp;
  echoAppId: string;
}

/**
 * JWT payload for Echo Access Tokens
 */
export interface EchoAccessJwtPayload {
  user_id: string;
  app_id: string;
  scope: string;
  exp: number;
  iat: number;
  jti: string;
}

// Type guard functions for transaction metadata
export function isLlmTransactionMetadata(
  metadata: LlmTransactionMetadata | VeoTransactionMetadata
): metadata is LlmTransactionMetadata {
  return 'inputTokens' in metadata;
}

export function isVeoTransactionMetadata(
  metadata: LlmTransactionMetadata | VeoTransactionMetadata
): metadata is VeoTransactionMetadata {
  return 'durationSeconds' in metadata;
}

export enum Network {
  BASE = 'base',
  BASE_SEPOLIA = 'base-sepolia',
}

export interface X402ChallengeParams {
  realm: string;
  link: string;
  network: Network;
}

export interface X402PaymentBody {
  type: 'x402';
  url: string;
  network: Network;
}

export enum X402Version {
  V1 = 'V1',
}

export enum Schema {
  Exact = 'Exact',
}

export type Address = string;
export type TokenAmount = string;
export type Url = string;
export type Nonce = string;

export interface ExactEvmPayloadAuthorization {
  from: Address;
  to: Address;
  value: TokenAmount;
  valid_after: number;
  valid_before: number;
  nonce: Nonce;
}

export interface ExactEvmPayload {
  signature: string;
  authorization: ExactEvmPayloadAuthorization;
}

export interface PaymentPayload {
  x402_version: X402Version;
  schema: Schema;
  network: Network;
  payload: ExactEvmPayload;
}

export interface PaymentRequirements {
  schema: Schema;
  network: Network;
  max_amount_required: TokenAmount;
  resource: Url;
  description: string;
  mime_type: string;
  output_schema?: unknown;
  pay_to: Address;
  max_timeout_seconds: number;
  asset: Address;
  extra?: unknown;
}

export interface VerifyResponse {
  verified: boolean;
  transaction_id?: string;
}

export interface VerifyRequest {
  x402_version: X402Version;
  payment_payload: PaymentPayload;
  payment_requirements: PaymentRequirements;
}

export type SettleRequest = VerifyRequest;
export type SettleResponse = VerifyResponse;

export interface PaymentRequiredResponse {
  error: string;
  accepts: PaymentRequirements[];
  x402_version: X402Version;
}

export interface SupportedPaymentKind {
  x402_version: X402Version;
  schema: Schema;
  network: Network;
  extra?: { fee_payer: Address };
}

export interface SupportedPaymentKindsResponse {
  kinds: SupportedPaymentKind[];
}

export type TransferWithAuthorization = Omit<
  ExactEvmPayloadAuthorization,
  'from'
>;

export type HandlerInput = {
  req: EscrowRequest;
  res: Response;
  headers: Record<string, string>;
  echoControlService: EchoControlService;
  maxCost: Decimal;
  isPassthroughProxyRoute: boolean;
  provider: BaseProvider;
  isStream: boolean;
  x402AuthenticationService: X402AuthenticationService;
};

export type ApiKeyHandlerInput = Omit<HandlerInput, 'x402AuthenticationService'>;

export type X402HandlerInput = Omit<HandlerInput, 'echoControlService'>;

/**
 * Note(Ben): Lazily redefining the type for the sendUserOperation function, because CDP doesn't export it
 */
export type SendUserOperationReturnType = {
  /** The address of the smart wallet. */
  smartAccountAddress: Address;
  /** The hash of the user operation. This is not the transaction hash which is only available after the operation is completed.*/
  userOpHash: Hex;
};


export interface TransactionCosts {
  rawTransactionCost: Decimal;
  totalTransactionCost: Decimal;
  totalAppProfit: Decimal;
  referralProfit: Decimal;
  markUpProfit: Decimal;
  echoProfit: Decimal;
}