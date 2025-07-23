import { Settings } from 'lucide-react';
import Link from 'next/link';
import { EnhancedAppData } from '@/hooks/useEchoAppDetail';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AppRole, Permission } from '@/lib/permissions/types';
import { DetailedEchoApp } from '@/hooks/useEchoAppDetail';
import { formatCurrency } from '@/lib/balance';
import { Switch } from '@/components/ui/switch';
import {
  AppDetailLayout,
  AppBanner,
  AppProfile,
  ActivityChart,
  TopModelsCard,
  ApiKeysCard,
  RecentActivityCard,
  formatNumber,
} from './AppDetailShared';
import { AppHomepageCard } from './AppHomepageCard';

interface OwnerAppDetailProps {
  app: DetailedEchoApp;
  hasPermission: (permission: Permission) => boolean;
  onCreateApiKey?: () => void;
  onArchiveApiKey?: (id: string) => void;
  deletingKeyId?: string | null;
  showPaymentSuccess?: boolean;
  onDismissPaymentSuccess?: () => void;
}

export function OwnerAppDetail({
  app,
  hasPermission,
  onCreateApiKey,
  onArchiveApiKey,
  deletingKeyId,
  showPaymentSuccess,
  onDismissPaymentSuccess,
}: OwnerAppDetailProps) {
  // View toggle state - 0 for personal, 1 for global
  const [viewMode, setViewMode] = useState([1]);
  const [enhancedApp, setEnhancedApp] = useState<EnhancedAppData>(app);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const isGlobalView = viewMode[0] === 1;

  // Function to fetch global data
  const fetchGlobalData = useCallback(async () => {
    if (enhancedApp.globalStats) return; // Already fetched

    setIsLoadingGlobal(true);
    try {
      const response = await fetch(`/api/apps/${app.id}?view=global`);
      if (!response.ok) {
        throw new Error('Failed to fetch global data');
      }
      const globalData = await response.json();
      setEnhancedApp(prev => ({
        ...prev,
        globalStats: globalData.stats,
        globalActivityData: globalData.activityData,
        globalRecentTransactions: globalData.recentTransactions,
      }));
    } catch (error) {
      console.error('Error fetching global data:', error);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [app.id, enhancedApp.globalStats]);

  // Fetch global data when switching to global view
  useEffect(() => {
    if (isGlobalView && !enhancedApp.globalStats) {
      fetchGlobalData();
    }
  }, [isGlobalView, app.id, enhancedApp.globalStats, fetchGlobalData]);

  // Get current stats based on view
  const currentStats = isGlobalView
    ? enhancedApp.globalStats || app.stats
    : app.stats;
  const currentActivityData = isGlobalView
    ? enhancedApp.globalActivityData || app.activityData
    : app.activityData;
  const currentRecentTransactions = isGlobalView
    ? enhancedApp.globalRecentTransactions || app.recentTransactions
    : app.recentTransactions;

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
            {app.user?.name || app.user?.email || 'Unknown'}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isGlobalView ? 'Total Requests' : 'Your Requests'}
          </p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingGlobal && isGlobalView
              ? '...'
              : formatNumber(currentStats?.totalTransactions)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isGlobalView ? 'Total Tokens' : 'Your Tokens'}
          </p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingGlobal && isGlobalView
              ? '...'
              : formatNumber(currentStats?.totalTokens)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isGlobalView ? 'Total Revenue' : 'Your Revenue'}
          </p>
          <p className="text-lg font-bold text-foreground">
            {isLoadingGlobal && isGlobalView
              ? '...'
              : formatCurrency(currentStats?.totalCost)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Your API Keys
          </p>
          <p className="text-lg font-bold text-foreground">
            {app.apiKeys?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );

  const enhancedActions = (
    <div className="flex items-center gap-3">
      <Link href={`/owner/${app.id}/settings`}>
        <Button size="default" variant="outline">
          <Settings className="h-4 w-4" />
          Settings
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
          userRole={AppRole.OWNER}
          roleLabel="Owner Access"
          actions={enhancedActions}
        >
          {enhancedStats}
        </AppProfile>
      </div>

      {/* Tokens Over Time Chart - Full Width */}
      <div className="px-6 mb-32 relative z-10">
        <div className="h-64">
          <ActivityChart
            app={{
              ...app,
              activityData: currentActivityData,
            }}
            title={
              isGlobalView ? 'Global Tokens Over Time' : 'Your Tokens Over Time'
            }
          />
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="px-6 mt-8 mb-8 relative z-10">
        {/* First Row - Homepage and API Keys */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Homepage Card */}
          <AppHomepageCard app={app} />

          {/* API Keys Card */}
          <ApiKeysCard
            app={app}
            hasCreatePermission={hasPermission(Permission.CREATE_API_KEYS)}
            hasManagePermission={hasPermission(Permission.MANAGE_ALL_API_KEYS)}
            onCreateApiKey={onCreateApiKey}
            onArchiveApiKey={onArchiveApiKey}
            deletingKeyId={deletingKeyId}
          />
        </div>

        {/* Second Row - Activity and Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity Card */}
          <RecentActivityCard
            app={{
              ...app,
              recentTransactions: currentRecentTransactions,
            }}
            title={
              isGlobalView ? 'Global Recent Activity' : 'Your Recent Activity'
            }
          />

          {/* Models Usage Card */}
          <TopModelsCard
            app={{
              ...app,
              stats: currentStats,
            }}
            title={isGlobalView ? 'Global Model Usage' : 'Your Model Usage'}
          />
        </div>
      </div>
    </AppDetailLayout>
  );
}
