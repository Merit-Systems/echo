export interface EchoApp {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
  userId: string;
  echoAppId?: string;
  echoApp?: EchoApp;
}

export interface Balance {
  balance: string;
  totalCredits: string;
  totalSpent: string;
  currency: string;
  echoAppId?: string | null;
}

export interface PaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  metadata: {
    userId: string;
    echoAppId: string;
    description: string;
  };
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

export interface CreatePaymentLinkRequest {
  amount: number;
  description?: string;
  echoAppId: string;
}

export interface CreatePaymentLinkResponse {
  paymentLink: PaymentLink;
  payment: Payment;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ListEchoAppsResponse {
  echoApps: EchoApp[];
}

export interface ListApiKeysResponse {
  apiKeys: ApiKey[];
} 