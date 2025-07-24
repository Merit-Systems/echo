import { CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AppRole, Permission } from '@/lib/permissions/types';
import {
  CustomerEchoApp,
  OwnerEchoApp,
  OwnerStatistics,
} from '@/lib/echo-apps/types';
import { formatCurrency } from '@/lib/balance';
import { useState, useEffect, useCallback } from 'react';
import {
  AppDetailLayout,
  AppBanner,
  AppProfile,
  ActivityChart,
  ApiKeysCard,
  SubscriptionCard,
  ActiveSubscriptionsCard,
  RecentActivityCard,
  formatNumber,
  TopModelsCard,
} from './AppDetailShared';
import { AppHomepageCard } from './AppHomepageCard';

interface CustomerAppDetailProps {
  app: CustomerEchoApp | OwnerEchoApp;
  hasPermission: (permission: Permission) => boolean;
  onCreateApiKey?: () => void;
  onArchiveApiKey?: (id: string) => void;
  deletingKeyId?: string | null;
  showPaymentSuccess?: boolean;
  onDismissPaymentSuccess?: () => void;
}

export function CustomerAppDetail({
  app,
  hasPermission,
  onCreateApiKey,
  onArchiveApiKey,
  deletingKeyId,
  showPaymentSuccess,
  onDismissPaymentSuccess,
}: CustomerAppDetailProps) {
  // View toggle state - 0 for personal, 1 for global
  const [viewMode, setViewMode] = useState([0]);
  const [globalStats, setGlobalStats] = useState<OwnerStatistics | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const isGlobalView = viewMode[0] === 1;

  // Check if this is an OwnerEchoApp (which has both personal and global stats)
  const isOwnerApp = 'globalTotalTransactions' in app.stats;
  const ownerApp = isOwnerApp ? (app as OwnerEchoApp) : null;
  const customerApp = app as CustomerEchoApp;

  // Function to fetch global data if not already available
  const fetchGlobalData = useCallback(async () => {
    if (isOwnerApp || globalStats) return; // Already have global data or this is an owner app

    setIsLoadingGlobal(true);
    try {
      const response = await fetch(`/api/apps/${app.id}?view=global`);
      if (!response.ok) {
        throw new Error('Failed to fetch global data');
      }
      const globalData = await response.json();
      setGlobalStats(globalData.stats);
    } catch (error) {
      console.error('Error fetching global data:', error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [app.id, isOwnerApp, globalStats]);

  // Fetch global data when switching to global view
  useEffect(() => {
    if (isGlobalView && !isOwnerApp && !globalStats) {
      fetchGlobalData();
    }
  }, [isGlobalView, isOwnerApp, globalStats, fetchGlobalData]);

  // Handle subscription enrollment
  const handleSubscribe = async (type: 'product' | 'package', id: string) => {
    try {
      const response = await fetch('/api/stripe/subscriptions/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id,
          appId: app.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subscription');
      }

      // Redirect to payment URL
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        console.error('No payment URL returned');
        alert('Subscription created but no payment URL available');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to create subscription'
      );
    }
  };

  // Get activity data based on view mode
  const getActivityData = () => {
    if (isGlobalView) {
      if (ownerApp) {
        return ownerApp.stats.globalActivityData;
      }
      return globalStats?.globalActivityData || [];
    }
    return customerApp.stats.personalActivityData || [];
  };

  // Get recent transactions based on view mode
  const getRecentTransactions = () => {
    if (isGlobalView) {
      if (ownerApp) {
        return ownerApp.stats.recentGlobalTransactions;
      }
      return globalStats?.recentGlobalTransactions || [];
    }
    return customerApp.stats.personalRecentTransactions || [];
  };

  // Get model usage based on view mode
  const getModelUsage = () => {
    if (isGlobalView) {
      if (ownerApp) {
        return ownerApp.stats.globalModelUsage;
      }
      return globalStats?.globalModelUsage || [];
    }
    return customerApp.stats.personalModelUsage || [];
  };

  // Clean stats display with slider in bottom right
  const enhancedStats = (
    <div className="relative">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {/* Owner Information */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Owner
          </p>
          <p className="text-sm text-foreground font-medium truncate">
            {app.owner?.name || app.owner?.email || 'Unknown'}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isGlobalView ? 'Total Requests' : 'Your Requests'}
          </p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingGlobal && isGlobalView && !isOwnerApp
              ? '...'
              : formatNumber(
                  isGlobalView
                    ? ownerApp
                      ? ownerApp.stats.globalTotalTransactions
                      : globalStats?.globalTotalTransactions
                    : customerApp.stats.personalTotalTokens // Using tokens as proxy for transactions for personal view
                )}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isGlobalView ? 'Total Tokens' : 'Your Tokens'}
          </p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingGlobal && isGlobalView && !isOwnerApp
              ? '...'
              : formatNumber(
                  isGlobalView
                    ? ownerApp
                      ? ownerApp.stats.globalTotalTokens
                      : globalStats?.globalTotalTokens
                    : customerApp.stats.personalTotalTokens
                )}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isGlobalView ? 'Total Revenue' : 'Your Revenue'}
          </p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingGlobal && isGlobalView && !isOwnerApp
              ? '...'
              : formatCurrency(
                  isGlobalView
                    ? ownerApp
                      ? ownerApp.stats.globalTotalRevenue
                      : globalStats?.globalTotalRevenue
                    : customerApp.stats.personalTotalRevenue
                )}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Your API Keys
          </p>
          <p className="text-lg font-bold text-foreground">
            {customerApp.stats.personalApiKeys?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );

  const enhancedActions = (
    <div className="flex items-center gap-3">
      <Link href="/credits">
        <Button size="default" variant="outline">
          <CreditCard className="h-4 w-4" />
          Add Credits
        </Button>
      </Link>
      <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border px-2 py-1">
        <span className="text-xs font-medium text-muted-foreground">
          Personal
        </span>
        <div className="w-12">
          <Switch
            checked={isGlobalView}
            onCheckedChange={checked => setViewMode([checked ? 1 : 0])}
            className="cursor-pointer"
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Global
        </span>
      </div>
    </div>
  );

  return (
    <AppDetailLayout
      showPaymentSuccess={showPaymentSuccess}
      onDismissPaymentSuccess={onDismissPaymentSuccess}
    >
      <div className="relative z-10">
        <AppBanner app={app} />

        <AppProfile
          app={app}
          userRole={AppRole.CUSTOMER}
          roleLabel="Customer Access"
          actions={enhancedActions}
        >
          {enhancedStats}
        </AppProfile>
      </div>

      {/* Tokens Over Time Chart - Full Width */}
      <div className="px-6 mb-32 relative z-10">
        <div className="h-64">
          <ActivityChart
            app={app}
            activityData={getActivityData()}
            title={
              isGlobalView ? 'Global Tokens Over Time' : 'Your Tokens Over Time'
            }
          />
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="px-6 mt-8 mb-8 relative z-10">
        {/* First Row - Homepage, API Keys, Subscriptions, and Active Subscriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {/* Homepage Card */}
          <AppHomepageCard app={app} />

          {/* API Keys Card */}
          <ApiKeysCard
            app={app}
            hasCreatePermission={hasPermission(Permission.CREATE_API_KEYS)}
            hasManagePermission={hasPermission(Permission.MANAGE_OWN_API_KEYS)}
            onCreateApiKey={onCreateApiKey}
            onArchiveApiKey={onArchiveApiKey}
            deletingKeyId={deletingKeyId}
          />

          {/* Subscription Card */}
          <SubscriptionCard app={app} onSubscribe={handleSubscribe} />

          {/* Active Subscriptions Card */}
          <ActiveSubscriptionsCard app={app} />
        </div>

        {/* Second Row - Activity and Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity Card */}
          <RecentActivityCard
            app={app}
            recentTransactions={getRecentTransactions()}
            title={
              isGlobalView ? 'Global Recent Activity' : 'Your Recent Activity'
            }
          />

          {/* Models Usage Card */}
          <TopModelsCard
            app={app}
            modelUsage={getModelUsage()}
            title={isGlobalView ? 'Global Model Usage' : 'Your Model Usage'}
          />
        </div>
      </div>
    </AppDetailLayout>
  );
}
