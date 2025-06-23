'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UsersIcon,
  KeyIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ChartBarIcon,
  UserPlusIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';
import MarkupSettingsCard from './MarkupSettingsCard';
import MarketplaceSettingsCard from './MarketplaceSettingsCard';
import OAuthConfigSection from './OAuthConfigSection';
import { GlassButton } from './glass-button';

interface AppAnalytics {
  totalUsers: number;
  totalApiKeys: number;
  totalSpent: number;
  topUsers: Array<{
    id: string;
    email: string;
    name?: string;
    apiKeyCount: number;
    totalSpent: number;
  }>;
}

interface Customer {
  id: string;
  userId: string;
  role: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
  };
}

interface MarketplaceSettings {
  marketplaceName?: string;
  marketplaceDescription?: string;
  marketplaceImageUrl?: string;
  marketplaceUrl?: string;
}

interface OwnerAppDashboardProps {
  appId: string;
  appName: string;
}

export default function OwnerAppDashboard({
  appId,
  appName,
}: OwnerAppDashboardProps) {
  const [analytics, setAnalytics] = useState<AppAnalytics | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [marketplaceSettings, setMarketplaceSettings] =
    useState<MarketplaceSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  // Generate the invite link client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}/cli-auth?appId=${appId}`);
    }
  }, [appId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics, customers, and marketplace settings in parallel
      const [analyticsResponse, customersResponse, marketplaceResponse] =
        await Promise.all([
          fetch(`/api/owner/apps/${appId}/analytics`),
          fetch(`/api/owner/apps/${appId}/customers`),
          fetch(`/api/owner/apps/${appId}/marketplace-settings`),
        ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers || []);
      }

      if (marketplaceResponse.ok) {
        const marketplaceData = await marketplaceResponse.json();
        setMarketplaceSettings({
          marketplaceName: marketplaceData.app.marketplaceName,
          marketplaceDescription: marketplaceData.app.marketplaceDescription,
          marketplaceImageUrl: marketplaceData.app.marketplaceImageUrl,
          marketplaceUrl: marketplaceData.app.marketplaceUrl,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  const handleMarketplaceSettingsSave = async (
    settings: MarketplaceSettings
  ) => {
    try {
      const response = await fetch(
        `/api/owner/apps/${appId}/marketplace-settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarketplaceSettings({
          marketplaceName: data.app.marketplaceName,
          marketplaceDescription: data.app.marketplaceDescription,
          marketplaceImageUrl: data.app.marketplaceImageUrl,
          marketplaceUrl: data.app.marketplaceUrl,
        });
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to update marketplace settings'
        );
      }
    } catch (error) {
      console.error('Error updating marketplace settings:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Apps
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{appName}</h1>
            <p className="text-muted-foreground">
              Customer Analytics & Management
            </p>
          </div>
        </div>
        <GlassButton
          onClick={() => setShowInviteModal(true)}
          variant="secondary"
          className="flex items-center"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite Customer
        </GlassButton>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Invite Customer
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="!h-8 !w-8"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this link with customers to invite them to use your app.
                They&apos;ll be able to sign up and generate API keys for{' '}
                <strong>{appName}</strong>.
              </p>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Invitation Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-input bg-input text-input-foreground rounded-md text-sm"
                  />
                  <button onClick={copyInviteLink} className="!h-10 !w-10">
                    {inviteLinkCopied ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  How it works:
                </h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Customer clicks the invitation link</li>
                  <li>2. Your app is automatically selected</li>
                  <li>3. They can generate API keys to use your app</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <GlassButton
                  onClick={() => setShowInviteModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Close
                </GlassButton>
                <GlassButton
                  onClick={copyInviteLink}
                  variant="primary"
                  className="flex-1"
                >
                  {inviteLinkCopied ? 'Copied!' : 'Copy Link'}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/20 border border-destructive rounded-md p-4">
          <div className="text-sm text-destructive-foreground">{error}</div>
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center">
              <KeyIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  API Keys
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totalApiKeys}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center">
              <DollarSignIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg per User
                </p>
                <p className="text-2xl font-bold text-foreground">
                  $
                  {analytics.totalUsers > 0
                    ? (analytics.totalSpent / analytics.totalUsers).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markup Settings */}
      <MarkupSettingsCard appId={appId} appName={appName} />

      {/* Marketplace Settings */}
      <MarketplaceSettingsCard
        appId={appId}
        appName={appName}
        currentSettings={marketplaceSettings}
        onSave={handleMarketplaceSettingsSave}
      />

      {/* OAuth Config */}
      <OAuthConfigSection appId={appId} />

      {/* Top Users */}
      {analytics && analytics.topUsers.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-semibold text-foreground">
              Top Users by Spending
            </h3>
          </div>
          <div className="space-y-3">
            {analytics.topUsers.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-sm font-medium text-secondary">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">
                      {user.name || user.email}
                    </p>
                    {user.name && (
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    ${user.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.apiKeyCount} keys
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-lg font-semibold text-foreground">Customers</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {customers.length} total
          </span>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              No customers yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Invite customers to start using your app.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {customers.map(customer => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {customer.user.name || customer.user.email}
                  </p>
                  {customer.user.name && (
                    <p className="text-xs text-muted-foreground">
                      {customer.user.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : customer.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {customer.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {customer.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
