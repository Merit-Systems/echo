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
  clerkId: string;
  totalPaid?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
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

export interface Payment {
  id: string;
  stripePaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  echoAppId?: string;
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
 * Supported model information
 */
export interface SupportedModel {
  name: string;
  provider: string;
  pricing: {
    input_cost_per_token: number;
    output_cost_per_token: number;
  };
  limits: {
    max_tokens: number;
    max_input_tokens: number;
    max_output_tokens: number;
  };
  capabilities: {
    mode: string;
    supports_function_calling: boolean;
    supports_system_messages: boolean;
    supports_native_streaming: boolean;
  };
  metadata: {
    deprecation_date?: string;
    supported_endpoints?: string[];
    tool_use_system_prompt_tokens?: number;
  };
}

/**
 * Response from the supported models endpoint
 */
export interface SupportedModelsResponse {
  models: SupportedModel[];
  models_by_provider: Record<string, SupportedModel[]>;
}
