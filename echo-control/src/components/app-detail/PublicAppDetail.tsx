import { AppRole } from '@/lib/permissions/types';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
} from '@/lib/echo-apps/types';
import { formatCurrency } from '@/lib/balance';
import { useUser } from '@clerk/nextjs';
import { UserPlus } from 'lucide-react';
import {
  AppDetailLayout,
  AppBanner,
  AppProfile,
  ActivityChart,
  formatNumber,
  TopModelsCard,
} from './AppDetailShared';
import { GlobalModelsCard } from './GlobalModelsCard';
import { AppHomepageCard } from './AppHomepageCard';
import JoinAppModal from '../JoinAppModal';
import { useJoinApp } from '@/hooks/useJoinApp';

interface PublicAppDetailProps {
  app: PublicEchoApp | CustomerEchoApp | OwnerEchoApp;
}

export function PublicAppDetail({ app }: PublicAppDetailProps) {
  const { user, isLoaded } = useUser();
  const {
    joining,
    showJoinModal,
    setShowJoinModal,
    handleJoinApp: joinApp,
  } = useJoinApp();

  const handleJoinApp = async () => {
    await joinApp(app.id);
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

  // Extract global stats - prioritize global stats if they exist, otherwise use available stats
  // Since all app types now have globalActivityData, we can safely access it
  // For PublicEchoApp, all stats are global by default
  const publicApp = app as PublicEchoApp;

  const enhancedStats = (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
      {/* Owner Information */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">Owner</p>
        <p className="text-sm text-foreground font-medium truncate">
          {app.owner?.name || app.owner?.email || 'Unknown'}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total Requests
        </p>
        <p className="text-lg font-bold text-foreground">
          {formatNumber(publicApp.stats.globalTotalTransactions)}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total Tokens
        </p>
        <p className="text-lg font-bold text-foreground">
          {formatNumber(publicApp.stats.globalTotalTokens)}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total Revenue
        </p>
        <p className="text-lg font-bold text-foreground">
          {formatCurrency(publicApp.stats.globalTotalRevenue)}
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
            app={app}
            activityData={app.stats.globalActivityData}
            title="Global Tokens Over Time"
          />
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="px-6 mt-8 mb-8 relative z-10">
        {/* First Row - Homepage and User Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <AppHomepageCard app={app} />
          <GlobalModelsCard app={app} />
        </div>

        {/* Second Row - Activity and Model Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Models Usage Card */}
          <TopModelsCard
            app={app}
            modelUsage={app.stats.globalModelUsage}
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
