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

export interface LlmTransactionMetadata {
  providerId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  prompt?: string;
  response?: string;
  toolCost?: Decimal;
  audioData?: {
    durationSeconds: number;
    responseFormat: string;
    characterCount: number;
  };
}

export interface Transaction {
  metadata: LlmTransactionMetadata;
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
