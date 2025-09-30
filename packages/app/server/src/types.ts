import { Decimal } from '@prisma/client/runtime/library';

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
  userId: string;
  echoAppId: string;
  apiKeyId?: string;
  markUpId?: string;
  spendPoolId?: string;
  referralCodeId?: string;
  referrerRewardId?: string;
}

export interface ApiKeyValidationResult {
  userId: string;
  echoAppId: string;
  user: User;
  echoApp: EchoApp;
  apiKeyId?: string;
  apiKey?: ApiKey;
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
