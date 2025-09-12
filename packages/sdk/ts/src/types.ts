export type AsyncProvider<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K];
} & (T extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : {});

export interface EchoConfig {
  appId: string;
  basePath?: string;
  baseRouterUrl?: string;
  baseEchoUrl?: string; // control plane url
}

export interface EchoApp {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
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
  picture?: string;
}

export interface LlmTransaction {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  prompt?: string;
  response?: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
  userId: string;
  echoAppId: string;
  apiKeyId: string;
}

export interface Balance {
  totalPaid: number;
  totalSpent: number;
  balance: number;
}

export interface CreateEchoAppRequest {
  name: string;
  description?: string;
}

export interface CreateEchoAppResponse {
  echoApp: EchoApp;
}

export interface ListEchoAppsResponse {
  apps: EchoApp[];
}

export interface CreateApiKeyRequest {
  echoAppId: string;
  name?: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
}

export interface ListApiKeysResponse {
  apiKeys: ApiKey[];
}

export interface GetBalanceResponse {
  balance: Balance;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  description?: string;
  successUrl?: string;
}

export interface CreatePaymentLinkResponse {
  paymentLink: {
    id: string;
    url: string;
    amount: number;
    currency: string;
    description?: string;
  };
}

export interface CreateLlmTransactionRequest {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  providerId: string;
  cost: number;
  prompt?: string;
  response?: string;
  status?: string;
  errorMessage?: string;
}

export interface CreateLlmTransactionResponse {
  transaction: LlmTransaction;
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

/**
 * User spend information for a specific app
 */
export interface UserSpendInfo {
  userId: string;
  echoAppId: string;
  spendPoolId: string | null;
  amountSpent: number;
  spendLimit: number | null;
  amountLeft: number;
}

/**
 * Request for getting free tier balance
 */
export interface GetFreeBalanceRequest {
  echoAppId: string;
}

/**
 * Response from the free balance endpoint
 */
export interface FreeBalance {
  spendPoolBalance: number;
  userSpendInfo: UserSpendInfo;
}

/**
 * Request for registering a referral code
 */
export interface RegisterReferralCodeRequest {
  echoAppId: string;
  code: string;
}

/**
 * Response from the referral code registration endpoint
 */
export interface RegisterReferralCodeResponse {
  success: boolean;
  message: string;
}
