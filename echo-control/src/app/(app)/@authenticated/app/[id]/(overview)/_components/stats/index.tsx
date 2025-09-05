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
    <div className="w-full flex flex-col gap-4 md:gap-6">
      <h3 className="text-2xl font-bold">All-Time Stats</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
};
