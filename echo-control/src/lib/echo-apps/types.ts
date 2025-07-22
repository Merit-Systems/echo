// Types for Echo Apps feature

import { AppRole } from '../permissions/types';

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

// Legacy type for backward compatibility with existing list views
export interface AppWithDetails {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  profilePictureUrl?: string | null;
  bannerImageUrl?: string | null;
  homepageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  authorizedCallbackUrls: string[];
  userRole: AppRole;
  totalTokens: number;
  totalCost: number;
  _count: {
    apiKeys: number;
    transactions: number;
  };
  owner: {
    id: string;
    email: string;
    name: string | null;
    profilePictureUrl?: string | null;
  };
  activityData: number[];
}
