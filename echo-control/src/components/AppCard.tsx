'use client';

import React from 'react';
import { Users, Zap, DollarSign } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ProfileAvatar } from './ui/profile-avatar';
import { CommitChart } from './activity-chart/chart';
import { useRouter } from 'next/navigation';
import {
  PublicEchoApp,
  CustomerEchoApp,
  OwnerEchoApp,
} from '@/lib/echo-apps/types';
import { transformActivityData } from '@/lib/echo-apps/activity/activity';

type AppUnion = PublicEchoApp | CustomerEchoApp | OwnerEchoApp;

interface AppCardProps {
  app: AppUnion;
  size?: 'small' | 'medium' | 'large';
  showChart?: boolean;
  href?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  size = 'medium',
  showChart = true,
  href,
}) => {
  const router = useRouter();
  const isSmall = size === 'small';
  const isMedium = size === 'medium';

  // Get creator info from owner property
  const creator = {
    name: app.owner?.name || app.owner?.email || 'App Owner',
    avatar: app.owner?.profilePictureUrl || null,
  };

  // Helper function to extract stats based on app type
  const getStats = (app: AppUnion) => {
    const stats = app.stats;

    // Extract stats from the guaranteed type structure
    const transactions = stats.globalTotalTransactions || 0;
    const revenue = stats.globalTotalRevenue || 0;
    const tokens = stats.globalTotalTokens || 0;
    const modelCost = stats.globalTotalModelCost || 0;

    return {
      transactions,
      revenue,
      tokens,
      modelCost,
      // Format revenue for display
      revenueFormatted: `$${revenue.toFixed(2)}`,
      tokensFormatted: tokens.toLocaleString(),
      transactionsFormatted: transactions.toLocaleString(),
    };
  };

  const stats = getStats(app);

  // Set consistent minimum heights based on size
  const getCardHeight = () => {
    if (isSmall) return 'min-h-[180px]';
    if (isMedium) return 'min-h-[220px]';
    return 'min-h-[260px]';
  };

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.push(`/apps/${app.id}`);
    }
  };

  return (
    <Card
      className={`p-3 hover:border-secondary cursor-pointer flex flex-col gap-3 justify-between transition-all duration-300 h-full ${getCardHeight()}`}
      onClick={handleClick}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ProfileAvatar
            name={app.name || 'Untitled App'}
            src={app.profilePictureUrl}
            size={isSmall ? 'sm' : 'md'}
          />
          <div className="flex flex-col gap-0 items-start flex-1 overflow-hidden">
            <h3
              className={`${isSmall ? 'text-lg' : isMedium ? 'text-xl' : 'text-2xl'} font-bold hover:text-foreground/80 transition-colors w-full truncate`}
            >
              {app.name || 'Untitled App'}
            </h3>
            <div className="flex items-center gap-1">
              <ProfileAvatar
                name={creator.name}
                src={creator.avatar}
                size="xs"
              />
              <span
                className={`${isSmall ? 'text-sm' : 'text-base'} font-medium text-secondary`}
              >
                {creator.name}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Chart - Hide on small size unless explicitly shown */}
        {showChart && !isSmall && app.stats.globalActivityData?.length > 0 && (
          <div className="flex flex-col items-center shrink-0">
            <div className={`${isMedium ? 'w-32 h-20' : 'w-40 h-24'}`}>
              <CommitChart
                data={{
                  data: transformActivityData(app.stats.globalActivityData),
                  isLoading: false,
                }}
                numPoints={app.stats.globalActivityData.length}
                timeWindowOption={{ value: '7d' }}
                startDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                endDate={new Date()}
                chartHeight={isMedium ? 80 : 96}
                shouldAnimate={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Description - Fixed height container */}
      <div className={`${isSmall ? 'h-10' : 'h-12'} flex items-start`}>
        <p
          className={`${isSmall ? 'text-sm' : 'text-base'} text-muted-foreground line-clamp-2 text-ellipsis overflow-hidden`}
        >
          {app.description || 'No description available'}
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 ${isSmall ? 'text-sm' : 'text-base'} text-muted-foreground`}
            title="Total Transactions"
          >
            <Zap className={`${isSmall ? 'h-4 w-4' : 'h-5 w-5'}`} />
            <span>{stats.transactionsFormatted}</span>
          </div>
          <div
            className={`flex items-center gap-1 ${isSmall ? 'text-sm' : 'text-base'} text-muted-foreground`}
            title="Total Tokens"
          >
            <Users className={`${isSmall ? 'h-4 w-4' : 'h-5 w-5'}`} />
            <span>{stats.tokensFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={`shrink-0 text-black dark:text-white border-[1px] bg-transparent shadow-none w-fit ${isSmall ? 'text-xs' : 'text-sm'}`}
            title="Total Revenue"
          >
            <DollarSign className={`${isSmall ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
            {stats.revenueFormatted}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default AppCard;
