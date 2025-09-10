import type { EchoApp, ApiKey, GithubLink } from '@/generated/prisma';
import type { SerializedTransaction } from '@/lib/utils/serialization';
import type { UserSpendInfo } from '@/lib/spend-pools';

export type Owner = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type ModelUsage = {
  model: string;
  totalTokens: number;
  totalModelCost: number; // Total cost incurred by the model for this app.
};

type UserSpendStatistics = Omit<UserSpendInfo, 'echoAppId' | 'spendPoolId'>;

export type GlobalStatistics = {
  globalTotalTransactions: number;
  globalTotalRevenue: number;
  globalTotalTokens: number;
  globalTotalInputTokens: number;
  globalTotalOutputTokens: number;
  globalActivityData: AppActivity[];
  globalModelUsage: ModelUsage[];
  globalFreeTierSpendPoolBalance: number;
  globalFreetierSpendPoolPerUserLimit: number | null;
};

type AppGithubLink = Omit<
  GithubLink,
  | 'id'
  | 'echoAppId'
  | 'createdAt'
  | 'updatedAt'
  | 'archivedAt'
  | 'Transactions'
  | 'userId'
>;

export type CustomerApiKey = Omit<
  ApiKey,
  'keyHash' | 'metadata' | 'scope' | 'Transactions' | 'user' | 'echoApp'
>;

export type CustomerStatistics = GlobalStatistics & {
  personalTotalTransactions: number;
  personalTotalRevenue: number;
  personalTotalTokens: number;
  personalTotalInputTokens: number;
  personalTotalOutputTokens: number;
  personalRecentTransactions: SerializedTransaction[];
  personalModelUsage: ModelUsage[];
  personalActivityData: AppActivity[];
  personalApiKeys: CustomerApiKey[];
  personalUserSpendStatistics: UserSpendStatistics;
};

export type OwnerStatistics = CustomerStatistics &
  GlobalStatistics & {
    globalApiKeys: CustomerApiKey[];
    recentGlobalTransactions: SerializedTransaction[];
    globalUserSpendStatistics: UserSpendStatistics[];
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
   
  | 'authorizedCallbackUrls'
> & {
  // Owner information (limited for privacy)
  owner: Owner;
  // Aggregated statistics
  stats: GlobalStatistics;
  githubLink?: AppGithubLink;
  type: 'public';
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
  githubLink?: AppGithubLink;
  type: 'customer';
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
  githubLink?: AppGithubLink;
  type: 'owner';
};

export interface AppActivity {
  timestamp: Date;
  totalCost: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}
