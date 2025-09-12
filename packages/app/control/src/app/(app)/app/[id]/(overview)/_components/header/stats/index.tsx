import { cn } from '@/lib/utils';
import { LoadingStatsCards, StatsCards } from './stat-cards';

interface Props {
  appId: string;
}

export const OverallAppStats: React.FC<Props> = ({ appId }) => {
  return (
    <OverallStatsContainer>
      <StatsCards appId={appId} />
    </OverallStatsContainer>
  );
};

export const LoadingOverallAppStats = () => {
  return (
    <OverallStatsContainer>
      <LoadingStatsCards />
    </OverallStatsContainer>
  );
};

const OverallStatsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-1 border-t md:border-l md:border-t-0 overflow-hidden md:rounded-tr-lg h-full',
        '[&>*:nth-child(odd)]:border-r md:[&>*:nth-child(odd)]:border-r-0',
        '[&>*:nth-child(-n+2)]:border-b md:[&>*:not(:last-child)]:border-b'
      )}
    >
      {children}
    </div>
  );
};
