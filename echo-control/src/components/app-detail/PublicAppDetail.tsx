import { AppRole } from '@/lib/permissions/types';
import { DetailedEchoApp } from '@/hooks/useEchoAppDetail';
import { formatCurrency } from '@/lib/balance';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserPlus } from 'lucide-react';
import {
  AppDetailLayout,
  AppBanner,
  AppProfile,
  ActivityChart,
  formatNumber,
  TopModelsCard,
  RecentActivityCard,
} from './AppDetailShared';
import { UserCountCard } from './UserCountCard';
import { GlobalModelsCard } from './GlobalModelsCard';
import { AppHomepageCard } from './AppHomepageCard';
import JoinAppModal from '../JoinAppModal';

// Enhanced interfaces for global data
interface EnhancedAppData extends DetailedEchoApp {
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

interface PublicAppDetailProps {
  app: DetailedEchoApp;
}

export function PublicAppDetail({ app }: PublicAppDetailProps) {
  const [enhancedApp, setEnhancedApp] = useState<EnhancedAppData>(app);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const { user, isLoaded } = useUser();

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

  // Fetch global data on component mount
  useEffect(() => {
    fetchGlobalData();
  }, [app.id, fetchGlobalData]);

  // Function to handle joining the app as a customer
  const handleJoinApp = async () => {
    setJoining(true);
    try {
      const response = await fetch(`/api/owner/apps/${app.id}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body for self-enrollment
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join app');
      }

      // Success - redirect to refresh the page and show customer view
      window.location.reload();
    } catch (error) {
      console.error('Error joining app:', error);
      throw error;
    } finally {
      setJoining(false);
    }
  };

  // Show join button only for authenticated users who are not already customers
  const joinActions =
    isLoaded && user ? (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowJoinModal(true)}
          disabled={joining}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {joining ? 'Joining...' : 'Join'}
        </button>
      </div>
    ) : (
      <></>
    );

  // Always use global stats for public view
  const currentStats = enhancedApp.globalStats || app.stats;
  const currentActivityData =
    enhancedApp.globalActivityData || app.activityData;
  const currentRecentTransactions =
    enhancedApp.globalRecentTransactions || app.recentTransactions;

  const enhancedStats = (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      {/* Owner Information */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">Owner</p>
        <p className="text-sm text-foreground font-medium truncate">
          {app.user?.name || app.user?.email || 'Unknown'}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total Requests
        </p>
        <p className="text-lg font-bold text-foreground">
          {isLoadingGlobal
            ? '...'
            : formatNumber(currentStats?.totalTransactions)}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total Tokens
        </p>
        <p className="text-lg font-bold text-foreground">
          {isLoadingGlobal ? '...' : formatNumber(currentStats?.totalTokens)}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total Spending
        </p>
        <p className="text-lg font-bold text-foreground">
          {isLoadingGlobal ? '...' : formatCurrency(currentStats?.totalCost)}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Join App
        </p>
        <div className="text-sm text-foreground font-bold mt-2">
          {joinActions}
        </div>
      </div>
    </div>
  );

  return (
    <AppDetailLayout>
      <div className="relative z-10">
        <AppBanner app={app} />

        <AppProfile app={app} userRole={AppRole.PUBLIC} roleLabel="Public App">
          {enhancedStats}
        </AppProfile>
      </div>

      {/* Global Activity Chart - Full Width */}
      <div className="px-6 mb-32 relative z-10">
        <div className="h-64">
          <ActivityChart
            app={{
              ...app,
              activityData: currentActivityData,
            }}
            title="Global Tokens Over Time"
          />
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="px-6 mt-8 mb-8 relative z-10">
        {/* First Row - Homepage and User Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <AppHomepageCard app={app} />
          <UserCountCard app={app} />
          <GlobalModelsCard app={app} />
        </div>

        {/* Second Row - Activity and Model Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity Card */}
          <RecentActivityCard
            app={{
              ...app,
              recentTransactions: currentRecentTransactions,
            }}
            title="Global Recent Activity"
          />

          {/* Models Usage Card */}
          <TopModelsCard
            app={{
              ...app,
              stats: currentStats,
            }}
            title="Global Model Usage"
          />
        </div>
      </div>

      {/* Join App Modal */}
      {showJoinModal && (
        <JoinAppModal
          app={app}
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinApp}
        />
      )}
    </AppDetailLayout>
  );
}
