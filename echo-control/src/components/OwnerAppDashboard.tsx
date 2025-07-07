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
  EditIcon,
  SaveIcon,
  SettingsIcon,
} from 'lucide-react';
import MarkupSettingsCard from './MarkupSettingsCard';
import OAuthConfigSection from './OAuthConfigSection';
import AppFreeSpendPoolCard from './AppFreeSpendPoolCard';
import { GlassButton } from './glass-button';
import { formatCurrency } from '@/lib/balance';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  // App name editing state
  const [currentAppName, setCurrentAppName] = useState(appName);
  const [editingAppName, setEditingAppName] = useState(false);
  const [newAppName, setNewAppName] = useState(appName);
  const [updatingAppName, setUpdatingAppName] = useState(false);
  const [appNameError, setAppNameError] = useState<string | null>(null);
  const [showPoolFundedSuccess, setShowPoolFundedSuccess] = useState(false);

  // Generate the invite link client-side and check for pool funding success
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}/cli-auth?appId=${appId}`);

      // Check for pool funding success in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('pool_funded') === 'success') {
        setShowPoolFundedSuccess(true);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowPoolFundedSuccess(false), 5000);
      }
    }
  }, [appId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics and customers in parallel
      const [analyticsResponse, customersResponse] = await Promise.all([
        fetch(`/api/owner/apps/${appId}/analytics`),
        fetch(`/api/owner/apps/${appId}/customers`),
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.customers || []);
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

  const updateAppName = async () => {
    if (!newAppName.trim()) {
      setAppNameError('App name cannot be empty');
      return;
    }

    if (newAppName.trim() === currentAppName) {
      setEditingAppName(false);
      setAppNameError(null);
      return;
    }

    try {
      setUpdatingAppName(true);
      setAppNameError(null);

      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAppName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update app name');
      }

      setCurrentAppName(newAppName.trim());
      setEditingAppName(false);
    } catch (error) {
      console.error('Error updating app name:', error);
      setAppNameError(
        error instanceof Error ? error.message : 'Failed to update app name'
      );
    } finally {
      setUpdatingAppName(false);
    }
  };

  const cancelEditAppName = () => {
    setNewAppName(currentAppName);
    setEditingAppName(false);
    setAppNameError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section - More Compact */}
        <div className="mb-8">
          <nav className="flex items-center space-x-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Apps
            </Link>
            <div className="h-4 w-px bg-border"></div>
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </nav>
        </div>

        {/* Modern Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
            />
            <div className="relative bg-card/95 backdrop-blur-md p-8 rounded-2xl border border-border/50 shadow-2xl max-w-lg w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  Invite Customer
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors duration-200"
                >
                  <XIcon className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Share this link with customers to invite them to use your
                    app. They&apos;ll be able to sign up and generate API keys
                    for{' '}
                    <span className="font-semibold text-foreground">
                      {currentAppName}
                    </span>
                    .
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-foreground">
                    Invitation Link
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-4 py-3 border border-input bg-input/50 text-input-foreground rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="flex items-center justify-center w-12 h-12 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors duration-200"
                    >
                      {inviteLinkCopied ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <CopyIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-blue-800">How it works:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-700">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                        1
                      </div>
                      Customer clicks the invitation link
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                        2
                      </div>
                      Your app is automatically selected
                    </div>
                    <div className="flex items-center text-sm text-blue-700">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                        3
                      </div>
                      They can generate API keys to use your app
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <GlassButton
                    onClick={() => setShowInviteModal(false)}
                    variant="secondary"
                  >
                    Close
                  </GlassButton>
                  <GlassButton onClick={copyInviteLink} variant="primary">
                    {inviteLinkCopied ? 'Copied!' : 'Copy Link'}
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        {showPoolFundedSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Free spend pool successfully funded! Your users can now access
                these credits.
              </div>
              <button
                onClick={() => setShowPoolFundedSuccess(false)}
                className="ml-auto text-green-500 hover:text-green-700 dark:hover:text-green-200"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Analytics Overview - More Compact */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              Analytics Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalUsers}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              <div className="group relative bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      API Keys
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.totalApiKeys}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <KeyIcon className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              <div className="group relative bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(analytics.totalSpent)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <DollarSignIcon className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              <div className="group relative bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Avg per User
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $
                      {analytics.totalUsers > 0
                        ? (analytics.totalSpent / analytics.totalUsers).toFixed(
                            2
                          )
                        : '0.00'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid - Left-aligned compact layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Combined App Settings Card - Top Row spanning full width */}
          <div className="lg:col-span-3">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-6 mb-6">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <SettingsIcon className="h-5 w-5 mr-3 text-muted-foreground" />
                App Settings
              </h3>

              <div className="space-y-8">
                {/* App Name Section */}
                <div className="pb-6 border-b border-border/30">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      App Name
                    </label>
                    {editingAppName ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newAppName}
                          onChange={e => setNewAppName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-input bg-input/50 text-input-foreground rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200"
                          placeholder="Enter app name"
                          disabled={updatingAppName}
                        />
                        {appNameError && (
                          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                            {appNameError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <GlassButton
                            onClick={updateAppName}
                            disabled={updatingAppName || !newAppName.trim()}
                            variant="primary"
                          >
                            {updatingAppName ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            ) : (
                              <SaveIcon className="h-3 w-3 mr-1" />
                            )}
                            Save
                          </GlassButton>
                          <GlassButton
                            onClick={cancelEditAppName}
                            disabled={updatingAppName}
                            variant="secondary"
                          >
                            Cancel
                          </GlassButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 w-full">
                        <span className="text-foreground font-medium">
                          {currentAppName}
                        </span>
                        <GlassButton
                          onClick={() => setEditingAppName(true)}
                          variant="secondary"
                        >
                          <EditIcon className="h-3 w-3 mr-1" />
                          Edit
                        </GlassButton>
                      </div>
                    )}
                  </div>
                </div>

                {/* Markup Settings Section */}
                <div className="pb-6 border-b border-border/30">
                  <MarkupSettingsCard appId={appId} appName={currentAppName} />
                </div>

                {/* OAuth Configuration Section */}
                <div>
                  <OAuthConfigSection appId={appId} />
                </div>
              </div>
            </div>
          </div>

          {/* Free Spend Pool - Full Width Row */}
          <div className="lg:col-span-3">
            <AppFreeSpendPoolCard appId={appId} appName={currentAppName} />
          </div>

          {/* Top Performers - Full Width Row */}
          {analytics && analytics.topUsers.length > 0 && (
            <div className="lg:col-span-3">
              <section className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-5">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <TrendingUpIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  Top Performers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {analytics.topUsers.slice(0, 8).map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {user.name || user.email}
                          </p>
                          {user.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(user.totalSpent)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.apiKeyCount} keys
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Customers Section - Bottom row spanning full width */}
          <div className="lg:col-span-3">
            <section className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  Customers
                </h3>
                <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                  {customers.length} total
                </span>
              </div>

              {customers.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UsersIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">
                    No customers yet
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Invite customers to start using your app.
                  </p>
                  <GlassButton
                    onClick={() => setShowInviteModal(true)}
                    variant="primary"
                  >
                    <UserPlusIcon className="h-3 w-3 mr-1" />
                    Invite First Customer
                  </GlassButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {customers.map(customer => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-secondary">
                            {(customer.user.name || customer.user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {customer.user.name || customer.user.email}
                          </p>
                          {customer.user.name && (
                            <p className="text-xs text-muted-foreground">
                              {customer.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : customer.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
