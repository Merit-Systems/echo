import { EchoApp, Transaction, ApiKey } from '@/generated/prisma';

export interface AppCreateInput {
  name: string;
  description?: string;
  githubType?: 'user' | 'repo';
  githubId?: string;
  authorizedCallbackUrls?: string[];
  isPublic?: boolean;
}

export interface AppUpdateInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  githubType?: 'user' | 'repo';
  githubId?: string;
  profilePictureUrl?: string;
  bannerImageUrl?: string;
  homepageUrl?: string;
  authorizedCallbackUrls?: string[];
}

export type Owner = {
  id: string;
  email: string;
  name: string | null;
  profilePictureUrl: string | null;
};

export type ModelUsage = {
  model: string;
  totalTokens: number;
  totalModelCost: number; // Total cost incurred by the model for this app.
};

export type GlobalStatistics = {
  globalTotalTransactions: number;
  globalTotalRevenue: number;
  globalTotalModelCost: number;
  globalTotalTokens: number;
  globalTotalInputTokens: number;
  globalTotalOutputTokens: number;
  globalActivityData: AppActivity[];
  globalModelUsage: ModelUsage[];
};

export type CustomerApiKey = Omit<ApiKey, 'keyHash' | 'metadata' | 'scope'> & {
  transactions: Transaction[];
};

export type CustomerStatistics = GlobalStatistics & {
  personalTotalRevenue: number;
  personalTotalModelCost: number;
  personalTotalTokens: number;
  personalTotalInputTokens: number;
  personalTotalOutputTokens: number;
  personalRecentTransactions: Transaction[];
  personalModelUsage: ModelUsage[];
  personalActivityData: AppActivity[];
  personalApiKeys: CustomerApiKey[];
};

export type OwnerStatistics = CustomerStatistics &
  GlobalStatistics & {
    globalApiKeys: CustomerApiKey[];
    recentGlobalTransactions: Transaction[];
  };

/** Echo App Type Hierarchy:
 *
 *
 * The app type with the most permissive access is PublicEchoApp.
 *
 *
 * PublicEchoApp should be returned by any high-level function which can be viewed by all users,
 * even if they are not a member. There should be no fetch for additional details for a single app.
 * The PublicEchoApp should return ALL information necessary to display on the app's public page. This amount
 * of data is also returned for list views.
 *
 * There should never be data about individual transactions or usage, only high-level metrics.
 *
 * PublicEchoApp should return
 * 1. Global Activity Data,
 * 2. Global Total transactions,
 * 3. Global Total Revenue
 * 4. Global Total Tokens
 * 5. Global Model Cost
 * 6. Global Model Usage Statistics
 *
 *
 *
 * We should distinguish Revenue (total amount made by markup)
 * from Total Model Cost (total cost incurred by the model for this app).
 *
 *
 *
 * CustomerEchoApp needs to return the Global Statistics, but also the
 * personal statistics. It should return the detailed transactions, model usage, and also API Keys.
 *
 *
 *
 * OwnerEchoApp needs to return the Global Statistics, personal statistics, and also the detailed transactions, model usage, API Keys globally.
 *
 *
 *
 */

export type PublicEchoApp = Omit<
  EchoApp,
  | 'currentMarkupId'
  | 'currentMarkup'
  | 'appMemberships'
  | 'apiKeys'
  | 'markups'
  | 'products'
  | 'refreshTokens'
  | 'revenues'
  | 'subscriptionPackages'
  | 'subscriptions'
  | 'transactions'
  | 'usageProducts'
  | 'isArchived'
  | 'archivedAt'
  | 'appMemberships'
  | 'authorizedCallbackUrls'
> & {
  // Owner information (limited for privacy)
  owner: Owner;
  // Aggregated statistics
  stats: GlobalStatistics;
};

export type CustomerEchoApp = Omit<
  EchoApp,
  | 'currentMarkupId'
  | 'currentMarkup'
  | 'appMemberships'
  | 'apiKeys'
  | 'markups'
  | 'products'
  | 'refreshTokens'
  | 'revenues'
  | 'subscriptions'
  | 'transactions'
  | 'usageProducts'
  | 'isArchived'
  | 'archivedAt'
  | 'authorizedCallbackUrls'
> & {
  owner: Owner;
  stats: CustomerStatistics;
};

export type OwnerEchoApp = Omit<
  EchoApp,
  | 'markups'
  | 'revenues'
  | 'subscriptions'
  | 'transactions'
  | 'usageProducts'
  | 'isArchived'
  | 'archivedAt'
  | 'appMemberships'
  | 'apiKeys'
  | 'products'
  | 'refreshTokens'
> & {
  owner: Owner;
  stats: OwnerStatistics;
};

export interface AppActivity {
  timestamp: Date;
  totalCost: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

/**
 * Represents user balance information with string values for display purposes.
 * Used across UI components that need to show formatted balance data.
 */
export interface Balance {
  balance: string;
  totalPaid: string;
  totalSpent: string;
  currency: string;
}
