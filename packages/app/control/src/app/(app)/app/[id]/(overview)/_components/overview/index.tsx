import { Activity, LoadingActivity } from './activity';
import { LoadingTransactions, Transactions } from './transactions';
import { LoadingUsers, Users } from './users';

interface Props {
  appId: string;
}

export const Overview = ({ appId }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Activity appId={appId} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Users appId={appId} />
        <Transactions appId={appId} />
      </div>
    </div>
  );
};

export const LoadingOverview = () => {
  return (
    <div className="flex flex-col gap-4">
      <LoadingActivity />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LoadingUsers />
        <LoadingTransactions />
      </div>
    </div>
  );
};
