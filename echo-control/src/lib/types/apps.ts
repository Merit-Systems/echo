import { AppRole, Permission } from '@/lib/permissions/types';

/**
 * Represents the public-facing details of an Echo App.
 * This type is used for anonymous or general app listings.
 */
export interface PublicEchoApp {
  id: string;
  name: string;
  description: string | null;
  profilePictureUrl: string | null;
  bannerImageUrl: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  totalTokens: number;
  totalCost: number;
  githubId: string | null;
  githubType: string | null;
  authorizedCallbackUrls: string[];
  userRole: AppRole;
  permissions: Permission[];
  _count: {
    apiKeys: number;
    transactions: number;
  };
  owner: {
    id: string;
    email: string;
    name: string | null;
    profilePictureUrl: string | null;
  };
  activityData: number[];
  stats: {
    totalTransactions: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    modelUsage: Array<{
      model: string;
      _sum: {
        totalTokens: number | null;
        cost: number | null;
      };
      _count: number;
    }>;
  };
  recentTransactions: Array<{
    id: string;
    model: string;
    totalTokens: number;
    cost: number;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Extends PublicEchoApp with user-specific details.
 * This type is used when a user is authenticated and their relationship
 * with the app (e.g., role and permissions) is known.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthenticatedEchoApp extends PublicEchoApp {
  // Additional fields for authenticated users can be added here
}

/**
 * Detailed app info returned by the API with additional fields for authenticated users.
 * This is the primary type for app detail views and should be used throughout the frontend.
 */
export interface DetailedEchoApp extends AuthenticatedEchoApp {
  homepageUrl?: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    profilePictureUrl: string | null;
  };
  apiKeys: Array<{
    id: string;
    name?: string;
    isActive: boolean;
    createdAt: string;
    lastUsed?: string;
    totalSpent: number;
    creator: {
      email: string;
      name?: string;
    } | null;
  }>;
  stats: {
    totalTransactions: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    modelUsage: Array<{
      model: string;
      _sum: {
        totalTokens: number | null;
        cost: number | null;
      };
      _count: number;
    }>;
  };
  recentTransactions: Array<{
    id: string;
    model: string;
    totalTokens: number;
    cost: number;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Enhanced app data that includes global statistics and activity data.
 * Used for comprehensive app analytics and reporting.
 */
export interface EnhancedAppData extends DetailedEchoApp {
  globalStats?: {
    totalTransactions: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    modelUsage: Array<{
      model: string;
      _sum: {
        totalTokens: number | null;
        cost: number | null;
      };
      _count: number;
    }>;
  };
  globalActivityData?: number[];
  globalRecentTransactions?: Array<{
    id: string;
    model: string;
    totalTokens: number;
    cost: number;
    status: string;
    createdAt: string;
  }>;
}

/**
 * A union type representing any shape of an Echo App.
 * Useful for components that can handle both public and authenticated app data.
 */
export type EchoApp = PublicEchoApp | AuthenticatedEchoApp;

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
